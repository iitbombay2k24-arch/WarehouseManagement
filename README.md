# Namkeen WMS

A warehouse management system for a namkeen (snacks) manufacturer. It runs **entirely in the browser**
(plain HTML/CSS/JS, no build step, no backend); all data lives in `localStorage`.

## Features

| Area | What it does |
|---|---|
| **Stock ledger** | Append-only movements (receipt, dispatch, production, returns, damage, stock-take). Stock can never go negative; reconcile detects out-of-ledger edits. |
| **Alerts** | Low / out-of-stock, overdue purchase orders and licence expiry are raised and cleared automatically. |
| **Purchasing** | Suppliers, purchase orders with approval, partial receiving straight into stock, reorder suggestions, price comparison. |
| **Production** | Bills of materials, work orders that consume raw material and packaging, yield tracking. |
| **Invoicing** | GST tax invoices (CGST/SGST vs IGST), gapless numbering per financial year, payments, credit notes, print / save as PDF. |
| **Returns** | RMA flow with restock or scrap, and credit notes against the original invoice. |
| **Reports & dashboard** | Live figures from the data above: sales, receivables ageing, stock value, turnover, yield, returns. CSV export and print. |
| **Access control** | Local login with hashed passwords, roles (admin, manager, operator, viewer), idle timeout, lockout. |
| **Backup** | Download / restore all data from Settings (admin). |

## Run it

Requires Node 18+ (only to serve static files and run tests; there are no dependencies).

```bash
npm start        # http://localhost:5173 , served with the production security headers
npm test         # unit tests for the business logic (stock, invoices, production, returns, purchasing, auth)
npm run check    # syntax-check every script
npm run verify   # check + test
```

**First login:** user `admin`, password `admin123`. You are forced to choose a new password immediately.
Create further users under Settings, and set your GSTIN, FSSAI number and address under
Settings → Company Profile (invoices and purchase orders need a valid GSTIN).

## Project layout

```
index.html            admin app shell
landing-page/         public site + sign-in
js/app.js             DataManager (storage), router, global search
js/auth.js            login, roles, sessions
js/platform.js        role gating, table filter/CSV, backup/restore, company profile
js/analytics.js       figures used by reports and the dashboard
js/util.js            escapeHtml / escJs (use these for ANY user text put into HTML)
js/views/*.js         one file per module
tests/                node tests/run.js (zero-dependency runner, VM-based harness)
scripts/serve.js      dev server that applies vercel.json headers
vercel.json           security headers (CSP etc.) and caching
```

## Deploying (Vercel or any static host)

It is a static site: publish the folder. `vercel.json` sets the security headers and `.vercelignore`
keeps `tests/`, `scripts/`, env files and `node_modules` out of the deployment. Always serve over HTTPS
(the login relies on the browser's Web Crypto API).

## Security model — read this before going live

- **Everything runs in the user's browser.** Data is per-browser, not shared between people or devices,
  and anyone with access to the browser profile can read it. The login deters casual access but is **not**
  server-side security. Use this for a single trusted workstation, or add a backend before multi-user use.
- Back up regularly (Settings → Download Backup). Clearing site data deletes everything.
- Any user text rendered into HTML must go through `escapeHtml()`; values placed in inline `onclick`
  strings must go through `escJs()`. Tests cover both.
- The CSP still allows inline scripts (`'unsafe-inline'`) because the pages use inline handlers.
  Moving those to `addEventListener` would let you remove it.

## Known limitations / next steps

- No backend, so no multi-user sync, server-side auth or real audit guarantees.
- Batch / expiry tracking (first-expired-first-out) is not implemented.
- Stock value uses list price, not costing (FIFO / weighted average).
- No e-invoice (IRN/QR) or e-way bill generation; the e-way bill and Tally buttons are placeholders.
- Several secondary screens (maintenance, logistics, AI automation, integrations) are still demonstrations
  with sample data.
