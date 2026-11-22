// GST Invoicing: drafts, gapless numbering at issue, CGST/SGST vs IGST,
// payments, cancellation and print / save-as-PDF.
(function () {
    'use strict';
    var KEY = 'wms_invoices', SEQ = 'wms_invoice_seq', CN_KEY = 'wms_credit_notes';
    var esc = window.escapeHtml;
    var GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
    var GST_RATES = [0, 5, 12, 18, 28];
    var DEFAULT_GST = 12, DEFAULT_HSN = '21069099';

    // ---- money in integer paise (avoids floating-point drift) ----
    function P(rupees) { return Math.round((Number(rupees) || 0) * 100); }
    function R(p) { return p / 100; }
    function inr(p) { return '₹' + R(p).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

    function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
    function write(l) { localStorage.setItem(KEY, JSON.stringify(l)); }
    function actor() { var s = window.WMSAuth && WMSAuth.session(); return s ? s.username : 'system'; }
    function today() { return new Date().toISOString().slice(0, 10); }
    function addDays(iso, n) { var d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
    function fmtDate(iso) { return iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''; }
    function fyOf(iso) { var d = new Date(iso + 'T00:00:00'), y = d.getFullYear(); if (d.getMonth() < 3) y--; return y + '-' + String(y + 1).slice(2); }
    function stateCode(gstin) { return GSTIN_RE.test(gstin || '') ? gstin.slice(0, 2) : ''; }

    // ---- calculation ----
    function calc(inv) {
        var seller = stateCode(inv.seller.gstin), buyer = stateCode(inv.buyer.gstin);
        var inter = !!(seller && buyer && seller !== buyer);
        var t = { taxable: 0, cgst: 0, sgst: 0, igst: 0, discount: 0 };
        var lines = inv.lines.map(function (l) {
            var gross = Math.round(Number(l.qty) * P(l.rate)), disc = Math.round(gross * (Number(l.discount) || 0) / 100);
            var taxable = gross - disc, tax = Math.round(taxable * (Number(l.gst) || 0) / 100);
            var c = 0, s = 0, i = 0;
            if (inter) i = tax; else { c = Math.floor(tax / 2); s = tax - c; }
            t.taxable += taxable; t.cgst += c; t.sgst += s; t.igst += i; t.discount += disc;
            return { gross: gross, disc: disc, taxable: taxable, cgst: c, sgst: s, igst: i, total: taxable + tax };
        });
        var grand = t.taxable + t.cgst + t.sgst + t.igst;
        var total = Math.round(grand / 100) * 100;
        return { inter: inter, lines: lines, totals: t, grand: grand, roundOff: total - grand, total: total };
    }

    // ---- amount in words (Indian numbering) ----
    var ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    var TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    function below1000(n) {
        var s = '';
        if (n >= 100) { s += ONES[Math.floor(n / 100)] + ' Hundred '; n %= 100; }
        if (n >= 20) { s += TENS[Math.floor(n / 10)] + ' ' + ONES[n % 10]; } else s += ONES[n];
        return s.trim();
    }
    function words(paise) {
        var rup = Math.floor(paise / 100), ps = paise % 100;
        if (rup === 0 && ps === 0) return 'Zero Rupees Only';
        var parts = [], cr = Math.floor(rup / 10000000); rup %= 10000000;
        var lk = Math.floor(rup / 100000); rup %= 100000;
        var th = Math.floor(rup / 1000); rup %= 1000;
        if (cr) parts.push(below1000(cr) + ' Crore'); if (lk) parts.push(below1000(lk) + ' Lakh');
        if (th) parts.push(below1000(th) + ' Thousand'); if (rup) parts.push(below1000(rup));
        var out = parts.join(' ');
        return (out ? out + (Math.floor(paise / 100) === 1 ? ' Rupee' : ' Rupees') : '') + (ps ? (out ? ' and ' : '') + below1000(ps) + ' Paise' : '') + ' Only';
    }

    // ---- store ----
    function readCN() { try { return JSON.parse(localStorage.getItem(CN_KEY)) || []; } catch (e) { return []; } }
    function creditsOf(invId) { return readCN().filter(function (c) { return c.invoiceId === invId; }).reduce(function (t, c) { return t + calc(c).total; }, 0); }
    function paidOf(inv) { return (inv.payments || []).reduce(function (s, p) { return s + p.amount; }, 0); }
    function statusOf(inv) {
        if (inv.cancelled) return 'Cancelled';
        if (!inv.number) return 'Draft';
        var bal = calc(inv).total - paidOf(inv) - creditsOf(inv.id);
        if (bal <= 0) return 'Paid';
        if (inv.dueDate && inv.dueDate < today()) return 'Overdue';
        return paidOf(inv) > 0 ? 'Partially Paid' : 'Issued';
    }

    function validate(inv) {
        if (!inv.buyer || !inv.buyer.name) throw new Error('Choose a customer.');
        if (inv.buyer.gstin && !GSTIN_RE.test(inv.buyer.gstin)) throw new Error('Customer GSTIN is not valid.');
        if (!GSTIN_RE.test(inv.seller.gstin || '')) throw new Error('Company GSTIN is missing or invalid (Settings → Company Profile).');
        if (!inv.lines.length) throw new Error('Add at least one line item.');
        inv.lines.forEach(function (l, i) {
            if (!l.desc) throw new Error('Line ' + (i + 1) + ': description is required.');
            if (!(Number(l.qty) > 0)) throw new Error('Line ' + (i + 1) + ': quantity must be greater than 0.');
            if (!(Number(l.rate) >= 0)) throw new Error('Line ' + (i + 1) + ': rate is invalid.');
            if (!(Number(l.discount) >= 0 && Number(l.discount) <= 100)) throw new Error('Line ' + (i + 1) + ': discount must be 0–100%.');
            if (GST_RATES.indexOf(Number(l.gst)) < 0) throw new Error('Line ' + (i + 1) + ': GST rate must be one of ' + GST_RATES.join(', ') + '%.');
        });
    }

    var Inv = {
        list: read, calc: calc, words: words, status: statusOf, paid: paidOf,
        get: function (id) { return read().filter(function (i) { return i.id === id; })[0]; },
        save: function (draft) {
            validate(draft);
            var l = read(), idx = l.findIndex(function (i) { return i.id === draft.id; });
            if (idx > -1) {
                if (l[idx].number) throw new Error('Issued invoices cannot be edited.');
                l[idx] = draft;
            } else l.unshift(draft);
            write(l); return draft;
        },
        issue: function (id) {
            var l = read(), inv = l.filter(function (i) { return i.id === id; })[0];
            if (!inv) throw new Error('Invoice not found.');
            if (inv.number) throw new Error('Already issued.');
            validate(inv);
            var seq = {}; try { seq = JSON.parse(localStorage.getItem(SEQ)) || {}; } catch (e) {}
            var fy = fyOf(inv.date); seq[fy] = (seq[fy] || 0) + 1;
            inv.number = 'INV/' + fy + '/' + String(seq[fy]).padStart(4, '0');
            inv.issuedAt = new Date().toISOString(); inv.issuedBy = actor();
            localStorage.setItem(SEQ, JSON.stringify(seq)); write(l);
            if (inv.orderId) {
                try { DataManager.updateDispatchOrder(inv.orderId, { invoice: esc(inv.number) }); } catch (e) {}
            }
            DataManager.logAction('Invoice Issued', inv.number + ' to ' + inv.buyer.name + ' for ' + inr(calc(inv).total));
            return inv;
        },
        pay: function (id, amount, mode, ref, date) {
            var l = read(), inv = l.filter(function (i) { return i.id === id; })[0];
            if (!inv || !inv.number || inv.cancelled) throw new Error('Only issued invoices can receive payments.');
            var amt = P(amount), bal = calc(inv).total - paidOf(inv) - creditsOf(inv.id);
            if (!(amt > 0)) throw new Error('Enter a valid amount.');
            if (amt > bal) throw new Error('Payment exceeds the balance of ' + inr(bal) + '.');
            inv.payments = (inv.payments || []).concat([{ date: date || today(), amount: amt, mode: mode || 'Bank', ref: String(ref || '').slice(0, 60), by: actor() }]);
            write(l);
            DataManager.logAction('Payment Received', inr(amt) + ' against ' + inv.number);
        },
        cancel: function (id, reason) {
            var l = read(), inv = l.filter(function (i) { return i.id === id; })[0];
            if (!inv || !inv.number) throw new Error('Only issued invoices can be cancelled; delete drafts instead.');
            if (inv.cancelled) throw new Error('Already cancelled.');
            if (paidOf(inv) > 0) throw new Error('Invoice has payments; refund them before cancelling.');
            if (creditsOf(inv.id) > 0) throw new Error('Invoice has credit notes and cannot be cancelled.');
            if (!String(reason || '').trim()) throw new Error('A cancellation reason is required.');
            inv.cancelled = { at: new Date().toISOString(), by: actor(), reason: String(reason).trim().slice(0, 200) };
            write(l); DataManager.logAction('Invoice Cancelled', inv.number + ': ' + inv.cancelled.reason);
        },
        remove: function (id) {
            var l = read(), inv = l.filter(function (i) { return i.id === id; })[0];
            if (!inv) return;
            if (inv.number) throw new Error('Issued invoices cannot be deleted; cancel them instead.');
            write(l.filter(function (i) { return i.id !== id; }));
        }
    };
    // ---- credit notes (issued for returns against an invoice line) ----
    Inv.creditNotes = readCN;
    Inv.creditsOf = creditsOf;
    Inv.creditNote = function (o) {
        var inv = Inv.get(o.invoiceId);
        if (!inv || !inv.number || inv.cancelled) throw new Error('Credit notes need an issued, active invoice.');
        var ln = inv.lines.filter(function (l) { return l.sku === o.sku; })[0];
        if (!ln) throw new Error(o.sku + ' is not on invoice ' + inv.number + '.');
        var qty = Number(o.qty);
        if (!(qty > 0)) throw new Error('Enter a valid quantity.');
        var credited = 0; readCN().forEach(function (c) { if (c.invoiceId === inv.id) c.lines.forEach(function (l) { if (l.sku === o.sku) credited += Number(l.qty); }); });
        if (qty + credited > Number(ln.qty)) throw new Error('Only ' + (Number(ln.qty) - credited) + ' of ' + o.sku + ' remain creditable on ' + inv.number + '.');
        var cn = { id: 'CN-' + Date.now(), invoiceId: inv.id, againstNumber: inv.number, date: today(), seller: inv.seller, buyer: inv.buyer, rmaId: o.rmaId || '',
            reason: String(o.reason || '').slice(0, 200), lines: [{ sku: ln.sku, desc: ln.desc, hsn: ln.hsn, qty: qty, rate: ln.rate, discount: ln.discount, gst: ln.gst }], createdBy: actor() };
        if (calc(cn).total + creditsOf(inv.id) > calc(inv).total) throw new Error('Credits would exceed the invoice total.');
        var seq = {}; try { seq = JSON.parse(localStorage.getItem(SEQ)) || {}; } catch (e) {}
        var key = 'CN:' + fyOf(cn.date); seq[key] = (seq[key] || 0) + 1;
        cn.number = 'CN/' + fyOf(cn.date) + '/' + String(seq[key]).padStart(4, '0');
        localStorage.setItem(SEQ, JSON.stringify(seq));
        var l = readCN(); l.unshift(cn); localStorage.setItem(CN_KEY, JSON.stringify(l));
        DataManager.logAction('Credit Note Issued', cn.number + ' against ' + inv.number + ' for ' + inr(calc(cn).total));
        return cn;
    };
    window.printCreditNote = function (id) {
        var cn = readCN().filter(function (c) { return c.id === id; })[0]; if (!cn) return;
        var old = document.getElementById('invPrintFrame'); if (old) old.remove();
        var f = document.createElement('iframe'); f.id = 'invPrintFrame'; f.setAttribute('sandbox', 'allow-modals allow-same-origin');
        f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;'; f.srcdoc = printHtml(cn, 'CREDIT NOTE');
        f.onload = function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { showToast('Could not open the print dialog', 'danger'); } };
        document.body.appendChild(f);
    };
    window.InvoiceStore = Inv;

    // ---- blank invoice factory ----
    function blank(customer, order) {
        var c = DataManager.getCompanyProfile() || {}, d = today();
        var inv = { id: 'DRAFT-' + Date.now(), date: d, dueDate: addDays(d, 15), orderId: order ? order.id : '',
            seller: { name: c.name || '', gstin: c.gst || '', fssai: c.fssai || '', address: c.address || '', phone: c.phone || '', email: c.email || '' },
            buyer: { name: customer ? customer.name : '', gstin: customer ? customer.gst : '', address: '' },
            lines: [], notes: '', createdBy: actor(), payments: [] };
        if (order && order.sku && Number(order.qty) > 0) {
            var p = DataManager.getProducts().filter(function (x) { return x.id === order.sku; })[0];
            if (p) inv.lines.push(lineFromProduct(p, order.qty));
        }
        return inv;
    }
    function lineFromProduct(p, qty) {
        return { sku: p.id, desc: p.name, hsn: p.hsn || DEFAULT_HSN, qty: Number(qty) || 1, rate: Number(p.price) || 0, discount: 0, gst: p.gst != null ? Number(p.gst) : DEFAULT_GST };
    }

    // ---- editor modal ----
    var cur = null;
    function modal(html) {
        var keep = cur; closeModal(); cur = keep;
        var o = document.createElement('div'); o.id = 'invModal';
        o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:9000;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;';
        o.innerHTML = '<div role="dialog" aria-modal="true" style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;width:min(1000px,100%);padding:22px;">' + html + '</div>';
        o.addEventListener('mousedown', function (e) { if (e.target === o) closeModal(); });
        document.body.appendChild(o); return o;
    }
    function closeModal() { var m = document.getElementById('invModal'); if (m) m.remove(); cur = null; }
    window.closeInvModal = closeModal;

    function lineRow(l, i) {
        var prods = DataManager.getProducts().filter(function (p) { return !/^(Raw Material|Packaging)$/.test(p.category); });
        var sel = '<select onchange="invPick(' + i + ',this.value)" style="width:100%;" class="form-control"><option value="">Custom item</option>' +
            prods.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === l.sku ? ' selected' : '') + '>' + esc(p.id) + '</option>'; }).join('') + '</select>';
        function inp(f, w, type, extra) { return '<input class="form-control" style="width:' + w + ';" type="' + (type || 'text') + '" value="' + esc(l[f]) + '" ' + (extra || '') + ' oninput="invSet(' + i + ',\'' + f + '\',this.value)">'; }
        var g = '<select class="form-control" onchange="invSet(' + i + ',\'gst\',this.value)">' + GST_RATES.map(function (r) { return '<option' + (Number(l.gst) === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>';
        return '<tr><td style="min-width:120px;">' + sel + '</td><td>' + inp('desc', '100%', 'text', 'maxlength="120"') + '</td><td>' + inp('hsn', '90px', 'text', 'maxlength="8"') + '</td>' +
            '<td>' + inp('qty', '70px', 'number', 'min="0" step="any"') + '</td><td>' + inp('rate', '90px', 'number', 'min="0" step="0.01"') + '</td>' +
            '<td>' + inp('discount', '60px', 'number', 'min="0" max="100" step="any"') + '</td><td>' + g + '</td>' +
            '<td id="invLT' + i + '" style="text-align:right;white-space:nowrap;"></td>' +
            '<td><button class="icon-btn" style="color:var(--danger-color);" title="Remove line" onclick="invDel(' + i + ')"><i class="bx bx-trash"></i></button></td></tr>';
    }
    function totalsHtml(c) {
        function row(k, v, b) { return '<div style="display:flex;justify-content:space-between;gap:24px;' + (b ? 'font-weight:700;font-size:1.05rem;border-top:1px solid var(--border-color);padding-top:6px;margin-top:4px;' : '') + '"><span>' + k + '</span><span>' + v + '</span></div>'; }
        var h = row('Taxable value', inr(c.totals.taxable));
        if (c.totals.discount) h = row('Discount given', inr(c.totals.discount)) + h;
        if (c.inter) h += row('IGST', inr(c.totals.igst)); else h += row('CGST', inr(c.totals.cgst)) + row('SGST', inr(c.totals.sgst));
        if (c.roundOff) h += row('Round off', (c.roundOff > 0 ? '+' : '−') + inr(Math.abs(c.roundOff)));
        return h + row('Total', inr(c.total), true) + '<div style="font-size:.75rem;color:var(--text-muted);margin-top:6px;">' + esc(words(c.total)) + '</div>';
    }
    function paintLines() {
        var tb = document.getElementById('invLines'); if (!tb) return;
        tb.innerHTML = cur.lines.map(lineRow).join('') || '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:14px;">No lines yet — add an item.</td></tr>';
        paintTotals();
    }
    function paintTotals() {
        var c = calc(cur);
        c.lines.forEach(function (l, i) { var e = document.getElementById('invLT' + i); if (e) e.textContent = inr(l.total); });
        var t = document.getElementById('invTotals'); if (t) t.innerHTML = totalsHtml(c);
        var b = document.getElementById('invTaxKind'); if (b) b.textContent = c.inter ? 'Inter-state supply → IGST' : 'Intra-state supply → CGST + SGST';
    }

    window.invSet = function (i, f, v) {
        if (!cur || !cur.lines[i]) return;
        cur.lines[i][f] = (f === 'desc' || f === 'hsn') ? v : v;
        paintTotals();
    };
    window.invPick = function (i, sku) {
        if (!sku) { cur.lines[i].sku = ''; return; }
        var p = DataManager.getProducts().filter(function (x) { return x.id === sku; })[0];
        if (p) { cur.lines[i] = lineFromProduct(p, cur.lines[i].qty || 1); paintLines(); }
    };
    window.invAdd = function () { cur.lines.push({ sku: '', desc: '', hsn: DEFAULT_HSN, qty: 1, rate: 0, discount: 0, gst: DEFAULT_GST }); paintLines(); };
    window.invDel = function (i) { cur.lines.splice(i, 1); paintLines(); };
    window.invBuyer = function (id) {
        var c = DataManager.getCustomers().filter(function (x) { return x.id === id; })[0];
        cur.buyer = { name: c ? c.name : '', gstin: c ? c.gst : '', address: cur.buyer.address || '' }; paintTotals();
        var g = document.getElementById('invBuyerGst'); if (g) g.textContent = cur.buyer.gstin || 'Unregistered';
    };
    window.invField = function (f, v) {
        if (f === 'date') { cur.date = v; var due = document.getElementById('invDue'); if (due) { cur.dueDate = addDays(v, 15); due.value = cur.dueDate; } }
        else cur[f] = v;
    };

    function openEditor(inv) {
        cur = JSON.parse(JSON.stringify(inv));
        var custs = DataManager.getCustomers();
        var selId = (custs.filter(function (c) { return c.name === cur.buyer.name; })[0] || {}).id || '';
        var s = cur.seller;
        modal('<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;"><h2 style="margin:0;">' + (Inv.get(cur.id) ? 'Edit draft invoice' : 'New invoice') + '</h2>' +
            '<button class="icon-btn" onclick="closeInvModal()" aria-label="Close"><i class="bx bx-x" style="font-size:1.5rem;"></i></button></div>' +
            (GSTIN_RE.test(s.gstin) ? '' : '<div style="background:rgba(239,68,68,.12);color:var(--danger-color);padding:10px;border-radius:8px;margin-bottom:12px;font-size:.85rem;">Your company GSTIN is missing or invalid. Fix it in Settings → Company Profile before issuing.</div>') +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:14px;">' +
            '<div><label style="font-size:.75rem;">Customer</label><select class="form-control" style="width:100%;" onchange="invBuyer(this.value)"><option value="">Select customer…</option>' +
            custs.map(function (c) { return '<option value="' + esc(c.id) + '"' + (c.id === selId ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select>' +
            '<div style="font-size:.72rem;color:var(--text-muted);margin-top:4px;">GSTIN: <span id="invBuyerGst" style="font-family:monospace;">' + esc(cur.buyer.gstin || 'Unregistered') + '</span></div></div>' +
            '<div><label style="font-size:.75rem;">Invoice date</label><input type="date" class="form-control" style="width:100%;" value="' + esc(cur.date) + '" onchange="invField(\'date\',this.value)"></div>' +
            '<div><label style="font-size:.75rem;">Due date</label><input id="invDue" type="date" class="form-control" style="width:100%;" value="' + esc(cur.dueDate) + '" onchange="invField(\'dueDate\',this.value)"></div>' +
            '<div><label style="font-size:.75rem;">Sales order (optional)</label><input class="form-control" style="width:100%;" maxlength="40" value="' + esc(cur.orderId) + '" readonly></div></div>' +
            '<div id="invTaxKind" style="font-size:.78rem;color:var(--primary-color);margin-bottom:8px;"></div>' +
            '<div style="overflow-x:auto;"><table class="table" style="min-width:820px;"><thead><tr><th>SKU</th><th>Description</th><th>HSN</th><th>Qty</th><th>Rate ₹</th><th>Disc %</th><th>GST %</th><th>Amount</th><th></th></tr></thead><tbody id="invLines"></tbody></table></div>' +
            '<button class="btn btn-outline" style="margin:10px 0;" onclick="invAdd()"><i class="bx bx-plus"></i> Add line</button>' +
            '<div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;">' +
            '<div style="flex:1;min-width:240px;"><label style="font-size:.75rem;">Notes / terms (printed on invoice)</label><textarea class="form-control" style="width:100%;" rows="3" maxlength="300" oninput="invField(\'notes\',this.value)">' + esc(cur.notes) + '</textarea></div>' +
            '<div id="invTotals" style="min-width:280px;font-size:.9rem;"></div></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap;">' +
            '<button class="btn btn-outline" onclick="closeInvModal()">Cancel</button>' +
            '<button class="btn btn-outline" onclick="invSave(false)">Save draft</button>' +
            '<button class="btn btn-primary" onclick="invSave(true)"><i class="bx bx-check-double"></i> Issue invoice</button></div>');
        paintLines();
    }
    window.invSave = function (issue) {
        try {
            cur.lines.forEach(function (l) { l.qty = Number(l.qty); l.rate = Number(l.rate); l.discount = Number(l.discount) || 0; l.gst = Number(l.gst); l.desc = String(l.desc).trim(); l.hsn = String(l.hsn).trim(); });
            if (!/^\d{4}-\d{2}-\d{2}$/.test(cur.date) || !/^\d{4}-\d{2}-\d{2}$/.test(cur.dueDate)) throw new Error('Enter valid dates.');
            if (cur.dueDate < cur.date) throw new Error('Due date cannot be before the invoice date.');
            if (issue && !confirm('Issue this invoice? It gets a permanent number and can no longer be edited.')) return;
            Inv.save(cur);
            var id = cur.id, num = '';
            if (issue) num = Inv.issue(id).number;
            closeModal(); showToast(issue ? 'Invoice ' + num + ' issued' : 'Draft saved', 'success');
            window.refreshInvoices();
            if (issue) window.printInvoice(id);
        } catch (e) { showToast(e.message, 'danger'); }
    };

    // ---- print / PDF ----
    function printHtml(inv, title) {
        title = title || 'TAX INVOICE';
        var c = calc(inv), s = inv.seller, b = inv.buyer, st = title === 'TAX INVOICE' ? statusOf(inv) : '';
        var rows = inv.lines.map(function (l, i) {
            var x = c.lines[i];
            return '<tr><td>' + (i + 1) + '</td><td>' + esc(l.desc) + '</td><td>' + esc(l.hsn) + '</td><td class="r">' + esc(l.qty) + '</td><td class="r">' + esc(Number(l.rate).toFixed(2)) + '</td>' +
                '<td class="r">' + (Number(l.discount) ? esc(l.discount) + '%' : '–') + '</td><td class="r">' + inr(x.taxable) + '</td><td class="r">' + esc(l.gst) + '%</td><td class="r">' + inr(x.total) + '</td></tr>';
        }).join('');
        var taxRows = c.inter ? '<tr><td>IGST</td><td class="r">' + inr(c.totals.igst) + '</td></tr>' :
            '<tr><td>CGST</td><td class="r">' + inr(c.totals.cgst) + '</td></tr><tr><td>SGST</td><td class="r">' + inr(c.totals.sgst) + '</td></tr>';
        var paid = paidOf(inv), bal = c.total - paid;
        var mark = inv.cancelled ? 'CANCELLED' : (!inv.number ? 'DRAFT' : (title === 'TAX INVOICE' && st === 'Paid' ? 'PAID' : ''));
        return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(inv.number || 'Draft invoice') + '</title><style>' +
            '@page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#111;margin:0;position:relative}' +
            'h1{font-size:20px;margin:0}table{width:100%;border-collapse:collapse}th,td{border:1px solid #999;padding:5px 6px;text-align:left;vertical-align:top}th{background:#f0f0f0}' +
            '.r{text-align:right}.noborder td{border:none;padding:2px 0}.box{border:1px solid #999;padding:8px;margin-bottom:10px}.flex{display:flex;gap:12px}.flex>div{flex:1}' +
            '.mark{position:fixed;top:40%;left:12%;font-size:90px;color:rgba(200,0,0,.14);transform:rotate(-25deg);font-weight:700;pointer-events:none}' +
            '.tot td{border:none;padding:3px 6px}.tot tr:last-child td{border-top:2px solid #111;font-weight:700;font-size:14px}</style></head><body>' +
            (mark ? '<div class="mark">' + mark + '</div>' : '') +
            '<div class="flex box"><div><h1>' + esc(s.name) + '</h1><div>' + esc(s.address) + '</div><div>GSTIN: <b>' + esc(s.gstin) + '</b></div>' +
            (s.fssai ? '<div>FSSAI Lic. No.: ' + esc(s.fssai) + '</div>' : '') + '<div>' + esc(s.phone) + (s.email ? ' · ' + esc(s.email) : '') + '</div></div>' +
            '<div style="text-align:right"><h1>' + esc(title) + '</h1><div>' + (title === 'CREDIT NOTE' ? 'Credit Note No' : 'Invoice No') + ': <b>' + esc(inv.number || '(draft)') + '</b></div><div>Date: ' + esc(fmtDate(inv.date)) + '</div>' +
            '<div>Due: ' + esc(fmtDate(inv.dueDate)) + '</div>' + (inv.orderId ? '<div>Order Ref: ' + esc(inv.orderId) + '</div>' : '') + (inv.againstNumber ? '<div>Against Invoice: <b>' + esc(inv.againstNumber) + '</b></div>' : '') + '</div></div>' +
            '<div class="box"><b>Bill To</b><div style="font-size:14px;font-weight:700;">' + esc(b.name) + '</div>' +
            '<div>GSTIN: ' + esc(b.gstin || 'Unregistered') + (stateCode(b.gstin) ? ' · State code ' + esc(stateCode(b.gstin)) : '') + '</div>' +
            '<div>Place of supply: ' + (stateCode(b.gstin) ? esc(stateCode(b.gstin)) : esc(stateCode(s.gstin))) + ' (' + (c.inter ? 'Inter-state' : 'Intra-state') + ')</div></div>' +
            '<table><thead><tr><th>#</th><th>Description</th><th>HSN</th><th class="r">Qty</th><th class="r">Rate</th><th class="r">Disc</th><th class="r">Taxable</th><th class="r">GST</th><th class="r">Amount</th></tr></thead><tbody>' + rows + '</tbody></table>' +
            '<div class="flex" style="margin-top:10px;"><div><div class="box"><b>Amount in words</b><div>' + esc(words(c.total)) + '</div></div>' +
            (inv.notes ? '<div class="box"><b>Notes</b><div>' + esc(inv.notes).replace(/\n/g, '<br>') + '</div></div>' : '') +
            (inv.cancelled ? '<div class="box" style="color:#b00;"><b>Cancelled:</b> ' + esc(inv.cancelled.reason) + '</div>' : '') + '</div>' +
            '<div><table class="tot"><tr><td>Taxable value</td><td class="r">' + inr(c.totals.taxable) + '</td></tr>' + taxRows +
            (c.roundOff ? '<tr><td>Round off</td><td class="r">' + (c.roundOff > 0 ? '+' : '−') + inr(Math.abs(c.roundOff)) + '</td></tr>' : '') +
            '<tr><td>Total</td><td class="r">' + inr(c.total) + '</td></tr>' +
            (paid ? '<tr><td style="font-weight:400;font-size:12px;">Paid</td><td class="r" style="font-weight:400;font-size:12px;">' + inr(paid) + '</td></tr><tr><td style="font-size:12px;">Balance due</td><td class="r" style="font-size:12px;">' + inr(bal) + '</td></tr>' : '') +
            '</table></div></div>' +
            '<div style="margin-top:40px;display:flex;justify-content:space-between;"><div style="font-size:11px;color:#555;">Goods once sold will not be taken back. Subject to local jurisdiction.<br>This is a computer-generated invoice.</div>' +
            '<div style="text-align:center;"><div style="height:46px;"></div>For ' + esc(s.name) + '<br><b>Authorised Signatory</b></div></div></body></html>';
    }
    window.printInvoice = function (id) {
        var inv = Inv.get(id); if (!inv) return;
        var old = document.getElementById('invPrintFrame'); if (old) old.remove();
        var f = document.createElement('iframe'); f.id = 'invPrintFrame';
        f.setAttribute('sandbox', 'allow-modals allow-same-origin');
        f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
        f.srcdoc = printHtml(inv);
        f.onload = function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { showToast('Could not open the print dialog', 'danger'); } };
        document.body.appendChild(f);
        showToast('Choose "Save as PDF" in the print dialog to download', 'info');
    };
    window.InvoiceStore.printHtml = printHtml;

    // ---- page ----
    var filter = '';
    window.renderInvoices = function () {
        setTimeout(window.refreshInvoices, 40);
        return '<div class="fade-in"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:10px;flex-wrap:wrap;">' +
            '<h1 class="page-title" style="margin:0;">Invoices</h1><div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            '<button class="btn btn-outline" onclick="invFromOrder()"><i class="bx bx-package"></i> From dispatch order</button>' +
            '<button class="btn btn-primary" onclick="invNew()"><i class="bx bx-plus"></i> New invoice</button></div></div>' +
            '<div class="dashboard-grid" id="invKpis"></div>' +
            '<div class="card"><div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;flex-wrap:wrap;"><h2 class="section-title" style="margin:0;">All invoices</h2>' +
            '<select class="form-control" style="max-width:180px;margin-left:auto;" onchange="invFilter(this.value)"><option value="">All statuses</option>' +
            ['Draft', 'Issued', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'].map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select></div>' +
            '<div class="table-container"><table class="table" id="invoiceTable"><thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead><tbody id="invoiceBody"></tbody></table></div></div></div>';
    };
    window.invFilter = function (v) { filter = v; window.refreshInvoices(); };
    window.invNew = function () { openEditor(blank()); };
    window.invFromOrder = function () {
        var orders = DataManager.getDispatchOrders();
        if (!orders.length) return showToast('No dispatch orders found', 'warning');
        var done = {}; read().forEach(function (i) { if (i.orderId && !i.cancelled) done[i.orderId] = true; });
        var avail = orders.filter(function (o) { return !done[o.id]; });
        if (!avail.length) return showToast('Every dispatch order already has an invoice', 'info');
        modal('<h2 style="margin-top:0;">Create invoice from dispatch order</h2><div style="display:flex;flex-direction:column;gap:8px;">' +
            avail.map(function (o) {
                return '<button class="btn btn-outline" style="text-align:left;display:flex;justify-content:space-between;" onclick="invFromOrderGo(\'' + escJs(o.id) + '\')"><span><b>' + esc(o.id) + '</b> — ' + esc(o.customer) +
                    '</span><span style="color:var(--text-muted);">' + (o.sku ? esc(o.sku) + ' × ' + esc(o.qty) : 'no product linked') + ' · ' + esc(o.status) + '</span></button>';
            }).join('') + '</div><div style="text-align:right;margin-top:14px;"><button class="btn btn-outline" onclick="closeInvModal()">Close</button></div>');
    };
    window.invFromOrderGo = function (oid) {
        var o = DataManager.getDispatchOrders().filter(function (x) { return x.id === oid; })[0]; if (!o) return;
        var c = DataManager.getCustomers().filter(function (x) { return x.name === o.customer; })[0];
        openEditor(blank(c || { name: o.customer, gst: '' }, o));
    };
    window.invEdit = function (id) { var i = Inv.get(id); if (i && !i.number) openEditor(i); };
    window.invIssue = function (id) {
        if (!confirm('Issue this invoice? It gets a permanent number and can no longer be edited.')) return;
        try { var n = Inv.issue(id).number; showToast('Issued ' + n, 'success'); window.refreshInvoices(); window.printInvoice(id); } catch (e) { showToast(e.message, 'danger'); }
    };
    window.invPay = function (id) {
        var inv = Inv.get(id), bal = calc(inv).total - paidOf(inv) - creditsOf(inv.id);
        modal('<h2 style="margin-top:0;">Record payment — ' + esc(inv.number) + '</h2><p style="color:var(--text-muted);">Balance due: <b>' + inr(bal) + '</b></p>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">' +
            '<input id="payAmt" type="number" class="form-control" min="0" step="0.01" value="' + R(bal) + '" placeholder="Amount ₹">' +
            '<select id="payMode" class="form-control"><option>Bank transfer</option><option>UPI</option><option>Cash</option><option>Cheque</option></select>' +
            '<input id="payRef" class="form-control" maxlength="60" placeholder="Reference / UTR / cheque no.">' +
            '<input id="payDate" type="date" class="form-control" value="' + today() + '" max="' + today() + '"></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:16px;"><button class="btn btn-outline" onclick="closeInvModal()">Cancel</button>' +
            '<button class="btn btn-primary" onclick="invPayGo(\'' + escJs(id) + '\')">Record payment</button></div>');
    };
    window.invPayGo = function (id) {
        try {
            Inv.pay(id, payAmt.value, payMode.value, payRef.value, payDate.value);
            closeModal(); showToast('Payment recorded', 'success'); window.refreshInvoices();
        } catch (e) { showToast(e.message, 'danger'); }
    };
    window.invCancel = function (id) {
        var r = prompt('Reason for cancelling this invoice:'); if (r === null) return;
        try { Inv.cancel(id, r); showToast('Invoice cancelled', 'warning'); window.refreshInvoices(); } catch (e) { showToast(e.message, 'danger'); }
    };
    window.invDelete = function (id) {
        if (!confirm('Delete this draft?')) return;
        try { Inv.remove(id); window.refreshInvoices(); } catch (e) { showToast(e.message, 'danger'); }
    };

    window.refreshInvoices = function () {
        var body = document.getElementById('invoiceBody'); if (!body) return;
        var all = read(), tot = 0, out = 0, over = 0;
        all.forEach(function (i) {
            var s = statusOf(i); if (!i.number || i.cancelled) return;
            var t = calc(i).total, b = t - paidOf(i) - creditsOf(i.id); tot += t; out += b; if (s === 'Overdue') over++;
        });
        var k = document.getElementById('invKpis');
        if (k) k.innerHTML = [['blue', 'bx-receipt', inr(tot), 'Total invoiced'], ['red', 'bx-wallet', inr(out), 'Outstanding'], ['red', 'bx-time-five', over, 'Overdue invoices'], ['green', 'bx-file', all.length, 'Invoices & drafts']].map(function (x) {
            return '<div class="card dashboard-widget"><div class="widget-icon ' + x[0] + '"><i class="bx ' + x[1] + '"></i></div><div class="widget-value">' + x[2] + '</div><div class="widget-title">' + x[3] + '</div></div>';
        }).join('');
        var colors = { Draft: 'status-info', Issued: 'status-warning', 'Partially Paid': 'status-warning', Paid: 'status-success', Overdue: 'status-danger', Cancelled: 'status-danger' };
        var rows = all.filter(function (i) { return !filter || statusOf(i) === filter; });
        body.innerHTML = rows.length ? rows.map(function (i) {
            var c = calc(i), s = statusOf(i), paid = paidOf(i), cred = creditsOf(i.id), id = esc(i.id), jid = escJs(i.id), btn = 'style="padding:3px 8px;font-size:.75rem;"';
            var act = '<button class="btn btn-outline" ' + btn + ' onclick="printInvoice(\'' + jid + '\')" title="Print / Save as PDF"><i class="bx bx-printer"></i></button> ';
            if (!i.number) act += '<button class="btn btn-outline" ' + btn + ' onclick="invEdit(\'' + jid + '\')">Edit</button> <button class="btn btn-primary" ' + btn + ' onclick="invIssue(\'' + jid + '\')">Issue</button> <button class="icon-btn" style="color:var(--danger-color);" onclick="invDelete(\'' + jid + '\')"><i class="bx bx-trash"></i></button>';
            else if (!i.cancelled) { if (c.total - paid - cred > 0) act += '<button class="btn btn-primary" ' + btn + ' onclick="invPay(\'' + jid + '\')">Pay</button> '; if (!paid) act += '<button class="btn btn-outline" ' + btn + ' style="color:var(--danger-color)" onclick="invCancel(\'' + jid + '\')">Cancel</button>'; }
            return '<tr><td><b style="font-family:monospace;">' + esc(i.number || 'Draft') + '</b></td><td>' + esc(fmtDate(i.date)) + '</td><td>' + esc(i.buyer.name) + '</td><td>' + inr(c.total) + '</td><td>' + inr(paid) + '</td><td>' + inr(i.cancelled ? 0 : c.total - paid - cred) + '</td>' +
                '<td><span class="status ' + colors[s] + '">' + s + '</span></td><td style="white-space:nowrap;">' + act + '</td></tr>';
        }).join('') : '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px;">No invoices yet. Create one with “New invoice”.</td></tr>';
    };
})();
