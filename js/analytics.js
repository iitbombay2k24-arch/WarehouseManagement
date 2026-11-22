// Analytics engine: derives every report/dashboard figure from the real stores
// (stock ledger, invoices, credit notes, returns, work orders, products).
(function () {
    'use strict';
    var DAY = 86400000;
    function rd(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
    function iso(d) { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }
    function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
    function fyStart(d) { var y = d.getFullYear(); if (d.getMonth() < 3) y--; return new Date(y, 3, 1); }
    function products() { return DataManager.getProducts(); }
    function isComponent(p) { return /^(Raw Material|Packaging)$/.test(p.category); }
    function calc(inv) { return window.InvoiceStore ? InvoiceStore.calc(inv) : { total: 0, totals: { taxable: 0, cgst: 0, sgst: 0, igst: 0 }, lines: [] }; }
    function pct(a, b) { return b > 0 ? Math.round(a / b * 1000) / 10 : 0; }

    // Date range: {from: Date(00:00), to: Date(end of day)}
    function range(preset, customFrom, customTo) {
        var now = new Date(), to = new Date(now), from;
        to.setHours(23, 59, 59, 999);
        if (preset === 'custom' && customFrom && customTo) { from = startOfDay(new Date(customFrom + 'T00:00:00')); to = new Date(customTo + 'T23:59:59.999'); }
        else if (preset === 'fy') from = fyStart(now);
        else if (preset === 'mtd') from = new Date(now.getFullYear(), now.getMonth(), 1);
        else { var n = Number(preset) || 30; from = startOfDay(new Date(now.getTime() - (n - 1) * DAY)); }
        if (from > to) { var t = from; from = startOfDay(to); to = new Date(t); }
        return { from: from, to: to, days: Math.max(1, Math.round((startOfDay(to) - from) / DAY) + 1) };
    }
    function inRange(ts, r) { var t = new Date(ts).getTime(); return t >= r.from.getTime() && t <= r.to.getTime(); }
    function inRangeDate(isoDate, r) { return isoDate && inRange(isoDate + 'T12:00:00', r); }

    // Time buckets sized to the range: daily, weekly or monthly.
    function buckets(r) {
        var out = [], step = r.days <= 31 ? 'd' : (r.days <= 120 ? 'w' : 'm'), cur = new Date(r.from);
        while (cur <= r.to && out.length < 200) {
            var next = new Date(cur);
            if (step === 'd') next.setDate(next.getDate() + 1); else if (step === 'w') next.setDate(next.getDate() + 7); else { next.setMonth(next.getMonth() + 1); next.setDate(1); }
            var label = step === 'm' ? cur.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : cur.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            out.push({ label: label, from: new Date(cur), to: new Date(Math.min(next.getTime() - 1, r.to.getTime())) });
            cur = next;
        }
        return out;
    }
    function bucketOf(bs, ts) { var t = new Date(ts).getTime(); for (var i = 0; i < bs.length; i++) if (t >= bs[i].from.getTime() && t <= bs[i].to.getTime()) return i; return -1; }

    var A = {
        range: range, buckets: buckets, pct: pct,

        // ---- sales (issued invoices net of credit notes) ----
        sales: function (r) {
            var invs = rd('wms_invoices').filter(function (i) { return i.number && !i.cancelled && inRangeDate(i.date, r); });
            var cns = rd('wms_credit_notes').filter(function (c) { return inRangeDate(c.date, r); });
            var s = { taxable: 0, tax: 0, total: 0, units: 0, count: invs.length, byProduct: {}, byCustomer: {}, invoices: invs, creditNotes: cns, creditTotal: 0 };
            function add(inv, sign) {
                var c = calc(inv);
                s.taxable += sign * c.totals.taxable; s.tax += sign * (c.totals.cgst + c.totals.sgst + c.totals.igst); s.total += sign * c.total;
                inv.lines.forEach(function (l, i) {
                    var k = l.sku || l.desc, row = s.byProduct[k] || (s.byProduct[k] = { sku: l.sku, name: l.desc, units: 0, revenue: 0 });
                    row.units += sign * Number(l.qty); row.revenue += sign * c.lines[i].taxable; s.units += sign * Number(l.qty);
                });
                var cu = s.byCustomer[inv.buyer.name] || (s.byCustomer[inv.buyer.name] = { name: inv.buyer.name, invoices: 0, revenue: 0 });
                cu.revenue += sign * c.totals.taxable; if (sign > 0) cu.invoices++;
            }
            invs.forEach(function (i) { add(i, 1); });
            cns.forEach(function (c) { add(c, -1); s.creditTotal += calc(c).total; });
            return s;
        },
        salesSeries: function (r) {
            var bs = buckets(r), vals = bs.map(function () { return 0; });
            rd('wms_invoices').forEach(function (i) { if (i.number && !i.cancelled && inRangeDate(i.date, r)) { var b = bucketOf(bs, i.date + 'T12:00:00'); if (b > -1) vals[b] += calc(i).totals.taxable / 100; } });
            rd('wms_credit_notes').forEach(function (c) { if (inRangeDate(c.date, r)) { var b = bucketOf(bs, c.date + 'T12:00:00'); if (b > -1) vals[b] -= calc(c).totals.taxable / 100; } });
            return { labels: bs.map(function (b) { return b.label; }), values: vals };
        },

        // ---- stock movement from the ledger ----
        movement: function (r) {
            var bs = buckets(r), inw = bs.map(function () { return 0; }), out = bs.map(function () { return 0; });
            var prodById = {}; products().forEach(function (p) { prodById[p.id] = p; });
            var totals = { inward: 0, outward: 0 };
            rd('wms_stock_ledger').forEach(function (e) {
                var p = prodById[e.sku]; if (!p || isComponent(p) || e.type === 'OPENING' || !inRange(e.ts, r)) return;
                var b = bucketOf(bs, e.ts); if (b < 0) return;
                if (e.qty > 0) { inw[b] += e.qty; totals.inward += e.qty; } else { out[b] += -e.qty; totals.outward += -e.qty; }
            });
            return { labels: bs.map(function (b) { return b.label; }), inward: inw, outward: out, totals: totals };
        },
        todayMovement: function () { var r = range(1), m = A.movement(r); return m.totals; },
        byHour: function (r) {
            var h = []; for (var i = 0; i < 24; i++) h.push(0);
            rd('wms_stock_ledger').forEach(function (e) { if (e.type !== 'OPENING' && inRange(e.ts, r)) h[new Date(e.ts).getHours()]++; });
            return h;
        },

        // ---- inventory ----
        inventory: function (r) {
            var last = {}, outUnits = {};
            rd('wms_stock_ledger').forEach(function (e) {
                if (e.qty < 0 && e.type !== 'ADJUST') { var t = new Date(e.ts).getTime(); if (!last[e.sku] || t > last[e.sku]) last[e.sku] = t; if (inRange(e.ts, r)) outUnits[e.sku] = (outUnits[e.sku] || 0) + -e.qty; }
            });
            var now = Date.now(), rows = products().map(function (p) {
                var stock = Number(p.stock) || 0, price = Number(p.price) || 0, min = Number(p.minStock) || (window.StockLedger ? StockLedger.DEFAULT_MIN : 100);
                return { sku: p.id, name: p.name, category: p.category || '–', component: isComponent(p), stock: stock, price: price, value: stock * price, min: min, low: stock < min,
                    out: outUnits[p.id] || 0, daysSince: last[p.id] ? Math.floor((now - last[p.id]) / DAY) : null };
            });
            var fg = rows.filter(function (x) { return !x.component; });
            var totalValue = rows.reduce(function (s, x) { return s + x.value; }, 0), fgUnits = fg.reduce(function (s, x) { return s + x.stock; }, 0);
            var outFG = fg.reduce(function (s, x) { return s + x.out; }, 0), annualOut = outFG / r.days * 365;
            var cats = {}; rows.forEach(function (x) { cats[x.category] = (cats[x.category] || 0) + x.value; });
            var drift = window.StockLedger ? StockLedger.reconcile().length : 0;
            var deadDays = Math.max(30, r.days);
            return { rows: rows, totalValue: totalValue, fgUnits: fgUnits, lowCount: rows.filter(function (x) { return x.low; }).length, cats: cats,
                turnover: fgUnits > 0 ? Math.round(annualOut / fgUnits * 10) / 10 : 0, cover: outFG > 0 ? Math.round(fgUnits / (outFG / r.days)) : null,
                dead: rows.filter(function (x) { return x.stock > 0 && (x.daysSince === null || x.daysSince >= deadDays); }).sort(function (a, b) { return b.value - a.value; }), deadDays: deadDays,
                accuracy: rows.length ? Math.round((rows.length - drift) / rows.length * 1000) / 10 : 100,
                shrinkUnits: rd('wms_stock_ledger').filter(function (e) { return inRange(e.ts, r) && (e.type === 'DAMAGE' || (e.type === 'ADJUST' && e.qty < 0)); }).reduce(function (s, e) { return s + -e.qty; }, 0) };
        },

        // ---- receivables ----
        receivables: function () {
            var now = startOfDay(new Date()).getTime(), b = { 'Not yet due': 0, '1–30 days': 0, '31–60 days': 0, '60+ days': 0 }, rows = [], total = 0;
            rd('wms_invoices').forEach(function (i) {
                if (!i.number || i.cancelled) return;
                var paid = (i.payments || []).reduce(function (s, p) { return s + p.amount; }, 0);
                var cr = rd('wms_credit_notes').filter(function (c) { return c.invoiceId === i.id; }).reduce(function (s, c) { return s + calc(c).total; }, 0);
                var bal = calc(i).total - paid - cr; if (bal <= 0) return;
                var over = Math.floor((now - new Date(i.dueDate + 'T00:00:00').getTime()) / DAY), k = over <= 0 ? 'Not yet due' : over <= 30 ? '1–30 days' : over <= 60 ? '31–60 days' : '60+ days';
                b[k] += bal; total += bal; rows.push({ number: i.number, customer: i.buyer.name, due: i.dueDate, balance: bal, overdue: Math.max(0, over) });
            });
            return { buckets: b, total: total, rows: rows.sort(function (a, c) { return c.overdue - a.overdue; }) };
        },

        // ---- operations ----
        fulfilment: function () {
            var o = DataManager.getDispatchOrders(), done = o.filter(function (x) { return x.status === 'Dispatched'; }).length;
            return { done: done, total: o.length, rate: pct(done, o.length) };
        },
        returns: function (r) {
            var rs = DataManager.getReturns().filter(function (x) { return x.created && inRange(x.created, r); });
            var units = rs.reduce(function (s, x) { return s + (Number(x.qty) || 0); }, 0), sold = A.sales(r).units;
            var reasons = {}; rs.forEach(function (x) { reasons[x.reason] = (reasons[x.reason] || 0) + 1; });
            return { count: rs.length, units: units, rate: sold > 0 ? Math.round(units / (sold + units) * 1000) / 10 : 0, reasons: reasons, rows: rs };
        },
        returnRateMonthly: function (n) {
            var out = [], now = new Date();
            for (var i = n - 1; i >= 0; i--) {
                var from = new Date(now.getFullYear(), now.getMonth() - i, 1), to = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
                var r = { from: from, to: to, days: 30 };
                out.push({ label: from.toLocaleDateString('en-IN', { month: 'short' }), rate: A.returns(r).rate });
            }
            return out;
        },
        production: function (r) {
            var wos = rd('wms_work_orders'), done = wos.filter(function (w) { return w.status === 'Completed' && w.completed && inRange(w.completed, r); });
            return { completed: done.length, good: done.reduce(function (s, w) { return s + w.good; }, 0), rejected: done.reduce(function (s, w) { return s + (w.rejected || 0); }, 0),
                yield: done.length ? Math.round(done.reduce(function (s, w) { return s + w.yield; }, 0) / done.length * 10) / 10 : 0, rows: done,
                open: wos.filter(function (w) { return w.status === 'Planned' || w.status === 'In Progress'; }).length };
        },
        revenueTarget: function () { var t = Number(localStorage.getItem('wms_revenue_target')); return t > 0 ? t : 600000; },

        upcoming: function () {
            var t = [], now = Date.now();
            DataManager.getPurchaseOrders().forEach(function (po) {
                var d = Date.parse(po.expected); if (!isNaN(d) && !/^(Delivered|Received|Cancelled|Rejected|Draft)/.test(po.status)) t.push({ when: d, icon: 'bx-cart', color: 'var(--primary-color)', text: po.id + ' from ' + po.supplier + (d < now ? ' is overdue' : ' due') });
            });
            rd('wms_work_orders').forEach(function (w) { if (w.status === 'Planned' || w.status === 'In Progress') t.push({ when: now, icon: 'bx-cog', color: 'var(--warning-color)', text: w.id + ' ' + w.status.toLowerCase() + ' (' + w.qty + ' units)' }); });
            DataManager.getReturns().forEach(function (x) { if (x.status === 'Pending Receipt' || x.status === 'Inspection Required') t.push({ when: now, icon: 'bx-revision', color: 'var(--danger-color)', text: x.id + ': ' + x.status.toLowerCase() }); });
            rd('wms_invoices').forEach(function (i) { if (i.number && !i.cancelled && i.dueDate) { var d = Date.parse(i.dueDate); if (d > now && d < now + 7 * DAY && InvoiceStore.status(i) !== 'Paid') t.push({ when: d, icon: 'bx-receipt', color: 'var(--secondary-color)', text: i.number + ' payment due' }); } });
            return t.sort(function (a, b) { return a.when - b.when; }).slice(0, 6);
        }
    };
    window.Analytics = A;
})();
