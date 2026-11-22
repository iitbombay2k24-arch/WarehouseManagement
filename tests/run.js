'use strict';
// Zero-dependency test runner:  node tests/run.js
const assert = require('assert');
const { load, asAdmin } = require('./harness');

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const throwsMsg = (fn, re) => assert.throws(fn, e => re.test(e.message), 'expected error matching ' + re);
const stock = (env, sku) => env.run(`DataManager.getProducts().find(p => p.id === ${JSON.stringify(sku)}).stock`);
const co = env => env.run('DataManager.getCompanyProfile()');

// ---------------------------------------------------------------- escaping
test('escapeHtml neutralises markup', () => {
    const { run } = load();
    assert.strictEqual(run(`escapeHtml('<img src=x onerror="a()">')`), '&lt;img src=x onerror=&quot;a()&quot;&gt;');
    assert.strictEqual(run('escapeHtml(null)'), '');
});
test('escJs output cannot break out of a quoted JS string or HTML attribute', () => {
    const { run } = load();
    const hostile = `');alert(1);//"><script>x</script>\\\n&`;
    const out = run(`escJs(${JSON.stringify(hostile)})`);
    assert.ok(!/['"<>&\n\\](?!x)/.test(out.replace(/\\x[0-9a-f]{2}/g, '')), 'unsafe char left: ' + out);
    assert.strictEqual(run(`eval("'" + escJs(${JSON.stringify(hostile)}) + "'")`), hostile, 'must round-trip to the original value');
});

// ---------------------------------------------------------------- auth
test('auth: default admin must change password; bad passwords rejected; lockout after 5 failures', async () => {
    const env = load(), A = env.A;
    await assert.rejects(A.login('admin', 'nope'), /Invalid/);
    const s = await A.login('admin', 'admin123');
    assert.strictEqual(s.mustChange, true);
    await assert.rejects(A.changePassword('admin123', 'short'), /8 characters/);
    await assert.rejects(A.changePassword('admin123', 'admin123'), /different/);
    await A.changePassword('admin123', 'Warehouse2026');
    assert.strictEqual(A.session().mustChange, false);
    env.ctx.sessionStorage.removeItem('wms_session');
    await assert.rejects(A.login('admin', 'admin123'), /Invalid/, 'old password must stop working');
    for (let i = 0; i < 5; i++) await A.login('admin', 'bad').catch(() => {});
    await assert.rejects(A.login('admin', 'Warehouse2026'), /locked/i);
});
test('auth: passwords are stored hashed, roles gate modules', async () => {
    const env = await asAdmin(load()), A = env.A;
    await A.addUser('op1', 'Op', 'operator', 'Passw0rdOK');
    assert.ok(!env.ctx.localStorage.getItem('wms_users').includes('Passw0rdOK'));
    env.ctx.sessionStorage.removeItem('wms_session');
    await A.login('op1', 'Passw0rdOK');
    assert.ok(A.can('inventory') && A.can('ledger'));
    assert.ok(!A.can('settings') && !A.can('purchase') && !A.can('finance'));
    assert.throws(() => A.removeUser('admin'), /Admin only/);
});

// ---------------------------------------------------------------- ledger + alerts
test('ledger: movements update stock; overdraw, bad qty, missing reason and duplicates are rejected', async () => {
    const env = await asAdmin(load()), { run } = env;
    const before = stock(env, 'SKU-002');
    run(`StockLedger.post({sku:'SKU-002',type:'DISPATCH',qty:20,ref:'T1',idempotent:true})`);
    assert.strictEqual(stock(env, 'SKU-002'), before - 20);
    throwsMsg(() => run(`StockLedger.post({sku:'SKU-002',type:'DISPATCH',qty:99999})`), /Insufficient stock/);
    throwsMsg(() => run(`StockLedger.post({sku:'SKU-002',type:'DISPATCH',qty:-1})`), /positive/);
    throwsMsg(() => run(`StockLedger.post({sku:'SKU-002',type:'ADJUST',qty:-1})`), /reason/);
    throwsMsg(() => run(`StockLedger.post({sku:'SKU-002',type:'DISPATCH',qty:1,ref:'T1',idempotent:true})`), /already been posted/);
    throwsMsg(() => run(`StockLedger.post({sku:'NOPE',type:'RECEIPT',qty:1})`), /Unknown SKU/);
    assert.strictEqual(run('StockLedger.reconcile().length'), 0);
});
test('ledger: reconcile detects out-of-ledger edits and fixes them', async () => {
    const env = await asAdmin(load()), { run } = env;
    run(`DataManager.updateProduct('SKU-001', {stock: 1})`);
    assert.strictEqual(run('StockLedger.reconcile().length'), 1);
    run('StockLedger.fixDrift()');
    assert.strictEqual(run('StockLedger.reconcile().length'), 0);
});
test('alerts: low stock raises an alert and clears itself after restock', async () => {
    const env = await asAdmin(load()), { run } = env;
    run(`StockLedger.post({sku:'SKU-002',type:'DISPATCH',qty:${stock(env, 'SKU-002') - 50}})`);
    assert.ok(run(`DataManager.getAlerts().some(a => a.auto && a.type === 'Low Stock')`));
    run(`StockLedger.post({sku:'SKU-002',type:'RECEIPT',qty:500})`);
    assert.ok(!run(`DataManager.getAlerts().some(a => a.auto && a.type === 'Low Stock' && a.key === 'LOW:SKU-002')`));
});

// ---------------------------------------------------------------- invoices
function draftInvoice(env, custIdx, lines, id = 'T1', date = '2026-11-22') {
    return env.run(`(function(){var c=DataManager.getCustomers()[${custIdx}],co=DataManager.getCompanyProfile();
        return {id:${JSON.stringify(id)},date:${JSON.stringify(date)},dueDate:'2026-12-10',orderId:'',seller:{name:co.name,gstin:co.gst},buyer:{name:c.name,gstin:c.gst},lines:${JSON.stringify(lines)},notes:'',payments:[]};})()`);
}
const L = (sku, qty, rate, gst = 12, discount = 0) => ({ sku, desc: sku, hsn: '2106', qty, rate, discount, gst });

test('invoice: intra-state splits CGST/SGST, inter-state uses IGST, totals round to whole rupees', async () => {
    const env = await asAdmin(load()), { run } = env;
    const a = draftInvoice(env, 0, [L('SKU-001', 10, 120.55, 12, 5)]);          // buyer state 27 = seller 27
    const b = draftInvoice(env, 1, [L('SKU-001', 10, 120.55, 12, 5)], 'T2');    // buyer state 29
    run(`globalThis.__a = ${JSON.stringify(a)}; globalThis.__b = ${JSON.stringify(b)};`);
    const ca = run('InvoiceStore.calc(__a)'), cb = run('InvoiceStore.calc(__b)');
    assert.strictEqual(ca.inter, false); assert.strictEqual(cb.inter, true);
    assert.strictEqual(ca.totals.taxable, 114522);                       // 1205.50 - 5% = 1145.225 -> 1145.22 (paise)
    assert.strictEqual(ca.totals.cgst + ca.totals.sgst, cb.totals.igst);
    assert.strictEqual(ca.total % 100, 0);
    assert.strictEqual(ca.total, 128300);
});
test('invoice: gapless numbering, immutability after issue, payments, credit notes, cancel guards', async () => {
    const env = await asAdmin(load()), { run } = env;
    run(`InvoiceStore.save(${JSON.stringify(draftInvoice(env, 0, [L('SKU-001', 10, 100)], 'D1'))})`);
    run(`InvoiceStore.save(${JSON.stringify(draftInvoice(env, 0, [L('SKU-001', 5, 100)], 'D2'))})`);
    assert.strictEqual(run(`InvoiceStore.issue('D1').number`), 'INV/2026-27/0001');
    assert.strictEqual(run(`InvoiceStore.issue('D2').number`), 'INV/2026-27/0002');
    throwsMsg(() => run(`InvoiceStore.save(Object.assign({}, InvoiceStore.get('D1')))`), /cannot be edited/);
    throwsMsg(() => run(`InvoiceStore.remove('D1')`), /cannot be deleted/);
    throwsMsg(() => run(`InvoiceStore.pay('D1', 999999)`), /exceeds the balance/);
    run(`InvoiceStore.pay('D1', 500)`);
    assert.strictEqual(run(`InvoiceStore.status(InvoiceStore.get('D1'))`), 'Partially Paid');
    throwsMsg(() => run(`InvoiceStore.cancel('D1','x')`), /has payments/);
    const cn = run(`InvoiceStore.creditNote({invoiceId:'D2', sku:'SKU-001', qty:2, reason:'r'})`);
    assert.strictEqual(cn.number, 'CN/2026-27/0001');
    assert.strictEqual(run(`InvoiceStore.calc(InvoiceStore.creditNotes()[0]).total`), 22400);   // 2 x 100 + 12%
    throwsMsg(() => run(`InvoiceStore.creditNote({invoiceId:'D2', sku:'SKU-001', qty:4, reason:'r'})`), /remain creditable/);
    throwsMsg(() => run(`InvoiceStore.cancel('D2','x')`), /credit notes/);
    throwsMsg(() => run(`InvoiceStore.save(${JSON.stringify(draftInvoice(env, 0, [L('SKU-001', 1, 1, 7)], 'D3'))})`), /GST rate/);
});

// ---------------------------------------------------------------- production
test('production: BOM requirements, atomic shortage check, consume on start, yield on complete', async () => {
    const env = await asAdmin(load()), { run } = env;
    const bes = stock(env, 'RM-001'), fg = stock(env, 'SKU-001');
    const wo = run(`ProductionStore.create('SKU-001', 200)`);
    assert.deepStrictEqual(wo.materials.map(m => [m.sku, m.qty]), [['RM-001', 60], ['RM-002', 24], ['RM-003', 6], ['PK-001', 200]]);
    const big = run(`ProductionStore.create('SKU-001', 100000)`);
    throwsMsg(() => run(`ProductionStore.start(${JSON.stringify(big.id)})`), /Shortage/);
    assert.strictEqual(stock(env, 'RM-001'), bes, 'a failed start must not move any stock');
    run(`ProductionStore.start(${JSON.stringify(wo.id)})`);
    assert.strictEqual(bes - stock(env, 'RM-001'), 60);
    throwsMsg(() => run(`ProductionStore.start(${JSON.stringify(wo.id)})`), /planned/);
    const done = run(`ProductionStore.complete(${JSON.stringify(wo.id)}, 190, 10)`);
    assert.strictEqual(done.yield, 95); assert.strictEqual(stock(env, 'SKU-001') - fg, 190);
    throwsMsg(() => run(`ProductionStore.complete(${JSON.stringify(wo.id)}, 1, 0)`), /in-progress/);
    assert.strictEqual(run('StockLedger.reconcile().length'), 0);
});

// ---------------------------------------------------------------- returns
test('returns: caps, restock rules, scrap, credit notes', async () => {
    const env = await asAdmin(load()), { run } = env;
    run(`InvoiceStore.save(${JSON.stringify(draftInvoice(env, 0, [L('SKU-001', 10, 100)], 'R1'))}); InvoiceStore.issue('R1');`);
    const cust = run('DataManager.getCustomers()[0].name'), base = stock(env, 'SKU-001');
    const mk = (qty, reason) => `ReturnsStore.create({customer:${JSON.stringify(cust)},invoiceId:'R1',sku:'SKU-001',qty:${qty},reason:${JSON.stringify(reason)}})`;
    throwsMsg(() => run(mk(11, 'Overstock Return')), /Only 10/);
    const r1 = run(mk(4, 'Overstock Return'));
    throwsMsg(() => run(`ReturnsStore.dispose(${JSON.stringify(r1.id)}, 'restock')`), /Receive the goods/);
    run(`ReturnsStore.receive(${JSON.stringify(r1.id)})`);
    const d1 = run(`ReturnsStore.dispose(${JSON.stringify(r1.id)}, 'restock', true)`);
    assert.strictEqual(stock(env, 'SKU-001') - base, 4); assert.strictEqual(d1.credit.number, 'CN/2026-27/0001');
    throwsMsg(() => run(mk(7, 'Overstock Return')), /Only 6/);
    const r2 = run(mk(2, 'Damaged Packaging')); run(`ReturnsStore.receive(${JSON.stringify(r2.id)})`);
    throwsMsg(() => run(`ReturnsStore.dispose(${JSON.stringify(r2.id)}, 'restock')`), /cannot go back to saleable stock/);
    run(`ReturnsStore.dispose(${JSON.stringify(r2.id)}, 'scrap', true)`);
    assert.strictEqual(stock(env, 'SKU-001') - base, 4, 'scrap must not add stock');
    assert.strictEqual(run('InvoiceStore.creditsOf("R1")'), 67200);
});

// ---------------------------------------------------------------- purchasing
test('purchasing: approval, partial receipts into stock, tolerance, supplier stats', async () => {
    const env = await asAdmin(load()), { run } = env;
    const s = run(`PurchaseStore.saveSupplier({name:'Test Mills',category:'Raw Materials',gstin:'29AABCU9603R1ZX',paymentTerms:30,leadDays:4,rating:4})`);
    throwsMsg(() => run(`PurchaseStore.saveSupplier({name:'Bad',gstin:'123'})`), /GSTIN/);
    throwsMsg(() => run(`PurchaseStore.saveSupplier({name:'test mills'})`), /already exists/);
    const today = new Date().toISOString().slice(0, 10), exp = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
    const id = run('PurchaseStore.newId("' + today + '")');
    run(`PurchaseStore.save({id:${JSON.stringify(id)},supplierId:${JSON.stringify(s.id)},supplier:'Test Mills',date:'${today}',expected:'${exp}',status:'Draft',receipts:[],notes:'',lines:[{sku:'RM-001',qty:100,rate:70,gst:5,received:0},{sku:'PK-001',qty:1000,rate:2,gst:12,received:0}]})`);
    const t = run(`PurchaseStore.totals(PurchaseStore.get(${JSON.stringify(id)}))`);
    assert.deepStrictEqual([t.taxable, t.tax, t.total, t.inter], [900000, 59000, 959000, true]);
    throwsMsg(() => run(`PurchaseStore.receive(${JSON.stringify(id)}, [{sku:'RM-001',qty:1}])`), /approved/);
    run(`PurchaseStore.approve(${JSON.stringify(id)})`);
    throwsMsg(() => run(`PurchaseStore.receive(${JSON.stringify(id)}, [{sku:'RM-001',qty:200}])`), /outstanding/);
    const b = stock(env, 'RM-001');
    const r1 = run(`PurchaseStore.receive(${JSON.stringify(id)}, [{sku:'RM-001',qty:60,rejected:5},{sku:'PK-001',qty:1000}])`);
    assert.strictEqual(r1.po.status, 'Partially Received'); assert.strictEqual(stock(env, 'RM-001') - b, 60);
    throwsMsg(() => run(`PurchaseStore.cancel(${JSON.stringify(id)}, 'x')`), /already received/);
    assert.strictEqual(run(`PurchaseStore.receive(${JSON.stringify(id)}, [{sku:'RM-001',qty:35}]).po.status`), 'Received');
    assert.strictEqual(stock(env, 'RM-001') - b, 95);
    const st = run(`PurchaseStore.stats(${JSON.stringify(s.id)})`);
    assert.deepStrictEqual([st.real, st.onTime, st.defect, st.priceVar], [true, 100, 0.5, -5.3]);
    assert.strictEqual(run('StockLedger.reconcile().length'), 0);
});

// ---------------------------------------------------------------- analytics
test('analytics: net sales = invoices minus credit notes; receivables net of payments and credits', async () => {
    const env = await asAdmin(load()), { run } = env;
    const today = new Date().toISOString().slice(0, 10), due = new Date(Date.now() + 10 * 864e5).toISOString().slice(0, 10);
    const inv = draftInvoice(env, 0, [L('SKU-001', 20, 120)], 'AN1', today); inv.dueDate = due;
    run(`InvoiceStore.save(${JSON.stringify(inv)}); InvoiceStore.issue('AN1'); InvoiceStore.creditNote({invoiceId:'AN1',sku:'SKU-001',qty:2,reason:'r'}); InvoiceStore.pay('AN1', 100);`);
    const s = run('Analytics.sales(Analytics.range(30))');
    assert.strictEqual(s.taxable, 216000);          // (20 - 2) x 120 = 2160.00
    assert.strictEqual(s.units, 18);
    const rec = run('Analytics.receivables()');
    // invoice ₹2,688.00 − payment ₹100 − credit note ₹269 (₹268.80 rounded to whole rupees), in paise
    assert.strictEqual(rec.total, 268800 - 10000 - 26900);
});

// ---------------------------------------------------------------- runner
(async () => {
    let failed = 0;
    for (const t of tests) {
        try { await t.fn(); console.log('  ✓ ' + t.name); }
        catch (e) { failed++; console.log('  ✗ ' + t.name + '\n      ' + (e.stack || e).toString().split('\n').slice(0, 4).join('\n      ')); }
    }
    console.log(`\n${tests.length - failed}/${tests.length} passed`);
    process.exit(failed ? 1 : 0);
})();
