// Platform layer: role-based access, forced password change, table tools
// (filter + CSV export), data backup/restore/reset, and global error handling.
(function () {
    'use strict';
    var A = window.WMSAuth;

    // ---------- Global error handling ----------
    window.addEventListener('error', function (e) {
        console.error(e.error || e.message);
        if (window.showToast) window.showToast('Something went wrong. Your data is safe.', 'danger');
    });
    window.addEventListener('unhandledrejection', function (e) {
        console.error(e.reason);
        if (window.showToast) window.showToast('An operation failed. Please retry.', 'danger');
    });

    // ---------- CSV export (formula-injection safe) ----------
    function csvCell(v) {
        var t = String(v == null ? '' : v).replace(/\s+/g, ' ').trim();
        if (/^[=+\-@]/.test(t)) t = "'" + t;
        return '"' + t.replace(/"/g, '""') + '"';
    }
    window.downloadFile = function (name, text, mime) {
        var blob = new Blob([text], { type: mime || 'text/plain' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    };
    window.exportTableCSV = function (tableId, filename) {
        var t = document.getElementById(tableId); if (!t) return;
        var rows = [].slice.call(t.querySelectorAll('tr')).filter(function (r) { return r.style.display !== 'none'; });
        var csv = rows.map(function (r) {
            return [].slice.call(r.cells).map(function (c) { return csvCell(c.innerText); }).join(',');
        }).join('\r\n');
        window.downloadFile((filename || tableId) + '-' + new Date().toISOString().slice(0, 10) + '.csv', '﻿' + csv, 'text/csv;charset=utf-8');
        if (window.showToast) window.showToast('Exported ' + (rows.length - 1) + ' rows to CSV', 'success');
    };

    // ---------- Table toolbar: live filter + CSV export ----------
    function decorateTables(root) {
        [].forEach.call(root.querySelectorAll('table'), function (table, i) {
            if (table.dataset.wmsTools || !table.tBodies.length || table.tBodies[0].rows.length < 2) return;
            table.dataset.wmsTools = '1';
            if (!table.id) table.id = 'wms-tbl-' + Date.now() + '-' + i;
            var bar = document.createElement('div');
            bar.className = 'wms-table-tools';
            bar.style.cssText = 'display:flex;gap:8px;align-items:center;margin:8px 0;flex-wrap:wrap;';
            bar.innerHTML = '<input type="search" placeholder="Filter rows…" aria-label="Filter table rows" ' +
                'style="flex:1;min-width:160px;max-width:280px;padding:6px 10px;border:1px solid var(--border-color);border-radius:6px;background:var(--bg-card);color:inherit;font-size:.8rem;">' +
                '<span class="wms-count" style="font-size:.75rem;color:var(--text-muted);"></span>' +
                '<button type="button" class="btn btn-outline" style="padding:5px 10px;font-size:.75rem;margin-left:auto;"><i class="bx bx-download"></i> CSV</button>';
            var input = bar.querySelector('input'), count = bar.querySelector('.wms-count');
            function update() {
                var q = input.value.trim().toLowerCase(), shown = 0;
                [].forEach.call(table.tBodies[0].rows, function (r) {
                    var m = !q || r.textContent.toLowerCase().indexOf(q) > -1;
                    r.style.display = m ? '' : 'none'; if (m) shown++;
                });
                count.textContent = shown + ' / ' + table.tBodies[0].rows.length + ' rows';
            }
            input.addEventListener('input', update); update();
            bar.querySelector('button').addEventListener('click', function () { window.exportTableCSV(table.id, location.hash.replace('#', '') || 'export'); });
            (table.parentElement.classList.contains('table-container') ? table.parentElement : table).insertAdjacentElement('beforebegin', bar);
        });
    }

    // ---------- Backup / restore / reset ----------
    var PREFIX = 'wms_';
    window.backupData = function () {
        var out = { app: 'namkeen-wms', version: 1, exported: new Date().toISOString(), data: {} };
        Object.keys(localStorage).forEach(function (k) {
            if (k.indexOf(PREFIX) === 0 && k !== 'wms_users') out.data[k] = localStorage.getItem(k);
        });
        window.downloadFile('wms-backup-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(out, null, 2), 'application/json');
        window.showToast('Backup downloaded (user accounts are not included)', 'success');
    };
    window.restoreData = function () {
        if (!A.session() || A.session().role !== 'admin') return window.showToast('Admin only', 'danger');
        var f = document.createElement('input'); f.type = 'file'; f.accept = 'application/json';
        f.onchange = function () {
            var file = f.files[0]; if (!file) return;
            if (file.size > 10 * 1024 * 1024) return window.showToast('File too large (max 10 MB)', 'danger');
            var r = new FileReader();
            r.onload = function () {
                try {
                    var b = JSON.parse(r.result);
                    if (b.app !== 'namkeen-wms' || !b.data || typeof b.data !== 'object') throw new Error('bad');
                    var keys = Object.keys(b.data).filter(function (k) { return k.indexOf(PREFIX) === 0 && k !== 'wms_users' && typeof b.data[k] === 'string'; });
                    keys.forEach(function (k) { JSON.parse(b.data[k]); });   // each value must itself be valid JSON (or plain string)
                    if (!confirm('Restore ' + keys.length + ' data sets? Current data will be overwritten.')) return;
                    keys.forEach(function (k) { localStorage.setItem(k, b.data[k]); });
                    window.showToast('Restore complete. Reloading…', 'success');
                    setTimeout(function () { location.reload(); }, 800);
                } catch (e) { window.showToast('Invalid backup file', 'danger'); }
            };
            r.readAsText(file);
        };
        f.click();
    };
    window.resetDemoData = function () {
        if (!A.session() || A.session().role !== 'admin') return window.showToast('Admin only', 'danger');
        if (!confirm('Reset ALL warehouse data to the demo set? This cannot be undone (download a backup first).')) return;
        Object.keys(localStorage).forEach(function (k) { if (k.indexOf(PREFIX) === 0 && k !== 'wms_users' && k !== 'wms_theme') localStorage.removeItem(k); });
        location.reload();
    };

    function dataCard() {
        var c = document.createElement('div');
        c.className = 'card fade-in'; c.dataset.wmsData = '1'; c.style.marginBottom = '20px';
        c.innerHTML = '<h3 class="section-title" style="margin-bottom:8px;">Data &amp; Backup</h3>' +
            '<p style="font-size:.85rem;color:var(--text-muted);margin-bottom:12px;">Data is stored in this browser. Download regular backups.</p>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" onclick="backupData()"><i class="bx bx-download"></i> Download Backup</button>' +
            '<button class="btn btn-outline" onclick="restoreData()"><i class="bx bx-upload"></i> Restore Backup</button>' +
            '<button class="btn btn-outline" style="color:var(--danger-color);border-color:var(--danger-color);" onclick="resetDemoData()"><i class="bx bx-reset"></i> Reset to Demo Data</button></div>';
        return c;
    }

    // ---------- Forced password change ----------
    function passwordModal() {
        if (document.getElementById('wmsPwModal')) return;
        var o = document.createElement('div'); o.id = 'wmsPwModal';
        o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:10000;display:flex;align-items:center;justify-content:center;';
        o.innerHTML = '<form style="background:var(--bg-card,#1e293b);padding:28px;border-radius:12px;width:min(92vw,380px);display:flex;flex-direction:column;gap:12px;" autocomplete="off">' +
            '<h3 style="margin:0;">Set a new password</h3>' +
            '<p style="margin:0;font-size:.85rem;color:var(--text-muted);">You are using a default password. Choose a new one (8+ chars, letters and numbers).</p>' +
            '<input type="password" name="old" placeholder="Current password" required style="padding:10px;border-radius:6px;border:1px solid var(--border-color);background:transparent;color:inherit;">' +
            '<input type="password" name="n1" placeholder="New password" required style="padding:10px;border-radius:6px;border:1px solid var(--border-color);background:transparent;color:inherit;">' +
            '<input type="password" name="n2" placeholder="Confirm new password" required style="padding:10px;border-radius:6px;border:1px solid var(--border-color);background:transparent;color:inherit;">' +
            '<div class="err" style="color:var(--danger-color);font-size:.8rem;min-height:1em;"></div>' +
            '<button class="btn btn-primary" type="submit">Update password</button></form>';
        document.body.appendChild(o);
        var form = o.querySelector('form');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var err = form.querySelector('.err');
            if (form.n1.value !== form.n2.value) { err.textContent = 'Passwords do not match.'; return; }
            A.changePassword(form.old.value, form.n1.value).then(function () {
                o.remove(); window.showToast('Password updated', 'success');
            }).catch(function (x) { err.textContent = x.message; });
        });
    }

    // ---------- Role-based nav + routing ----------
    function applyRoles() {
        var s = A.session(); if (!s) return;
        [].forEach.call(document.querySelectorAll('.nav-link[data-target]'), function (l) {
            if (!A.can(l.dataset.target)) { var li = l.closest('.nav-item') || l; li.style.display = 'none'; }
        });
        var name = document.querySelector('.user-details h4, .user-details .user-name, .user-details span');
        if (name) name.textContent = s.name + ' (' + s.role + ')';
        document.body.dataset.role = s.role;
    }
    function enforceRoute() {
        var t = location.hash.replace('#', '') || 'dashboard';
        if (!A.can(t)) { window.showToast('Your role cannot open this module', 'warning'); location.hash = '#dashboard'; return false; }
        return true;
    }

    function onContent(content) {
        decorateTables(content);
        labelButtons(content);
        var t = location.hash.replace('#', '');
        if (t === 'settings' && !content.querySelector('[data-wms-data]') && A.session() && A.session().role === 'admin') {
            var h = content.querySelector('.fade-in') || content;
            h.insertBefore(dataCard(), h.children[1] || null);
        }
    }

    // ---------- Company profile (feeds invoices, purchase orders and licence alerts) ----------
    var GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
    window.showCompanyProfile = function () {
        var p = DataManager.getCompanyProfile() || {}, esc = window.escapeHtml;
        function f(id, label, val, extra, span) {
            return '<div' + (span ? ' style="grid-column:1/-1;"' : '') + '><label for="cp' + id + '" style="font-size:.78rem;color:var(--text-muted);">' + label + '</label>' +
                '<input id="cp' + id + '" class="form-control" style="width:100%;margin-top:4px;" value="' + esc(val || '') + '" ' + (extra || '') + '></div>';
        }
        var o = document.createElement('div'); o.id = 'cpModal'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
        o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9000;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px;';
        o.innerHTML = '<div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:12px;width:min(620px,100%);padding:24px;">' +
            '<h2 style="margin:0 0 16px;"><i class="bx bx-building"></i> Company profile</h2>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;">' +
            f('Name', 'Company name', p.name, 'maxlength="100"', true) + f('Gst', 'GSTIN', p.gst, 'maxlength="15" style="width:100%;margin-top:4px;text-transform:uppercase;"') +
            f('Fssai', 'FSSAI licence no.', p.fssai, 'maxlength="14" inputmode="numeric"') + f('Expiry', 'Licence expiry', p.licenseExpiry, 'type="date"') +
            f('Phone', 'Phone', p.phone, 'maxlength="20"') + f('Email', 'Email', p.email, 'maxlength="80"') + f('Address', 'Address', p.address, 'maxlength="200"', true) + '</div>' +
            '<div id="cpErr" style="color:var(--danger-color);font-size:.82rem;min-height:1.2em;margin-top:10px;"></div>' +
            '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px;"><button class="btn btn-outline" id="cpCancel">Cancel</button><button class="btn btn-primary" id="cpSave">Save profile</button></div></div>';
        document.body.appendChild(o);
        function close() { o.remove(); }
        o.addEventListener('mousedown', function (e) { if (e.target === o) close(); });
        o.querySelector('#cpCancel').onclick = close;
        o.querySelector('#cpSave').onclick = function () {
            var v = function (id) { return o.querySelector('#cp' + id).value.trim(); }, err = o.querySelector('#cpErr');
            var gst = v('Gst').toUpperCase(), email = v('Email'), fssai = v('Fssai'), phone = v('Phone');
            if (!v('Name')) { err.textContent = 'Company name is required.'; return; }
            if (gst && !GSTIN_RE.test(gst)) { err.textContent = 'GSTIN is not valid (15 characters, e.g. 27AABCU9603R1ZX).'; return; }
            if (fssai && !/^\d{14}$/.test(fssai)) { err.textContent = 'FSSAI licence number must be 14 digits.'; return; }
            if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'Email is not valid.'; return; }
            if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) { err.textContent = 'Phone is not valid.'; return; }
            DataManager.saveCompanyProfile(Object.assign({}, p, { name: v('Name'), gst: gst, fssai: fssai, licenseExpiry: v('Expiry'), phone: phone, email: email, address: v('Address') }));
            DataManager.logAction('Company Profile Updated', 'Company profile saved by ' + (A.session() ? A.session().username : 'user'));
            if (window.AlertEngine) AlertEngine.scan();
            close(); window.showToast('Company profile saved', 'success');
        };
        o.querySelector('#cpName').focus();
    };

    // ---------- Accessibility: Escape closes dialogs; icon-only buttons get names ----------
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var dlg = ['invModal', 'purModal', 'prodModal', 'retModal', 'cpModal'].map(function (id) { return document.getElementById(id); }).filter(Boolean).pop();
        if (dlg) dlg.remove();
    });
    function labelButtons(root) {
        [].forEach.call(root.querySelectorAll('button:not([aria-label])'), function (b) {
            if (b.textContent.trim()) return;
            var t = b.getAttribute('title'); if (t) b.setAttribute('aria-label', t.replace(/\s*\(F\d+\)/, ''));
        });
    }

    // ---------- Storage safety: tell the user instead of failing silently when the browser quota is full ----------
    (function () {
        var orig = Storage.prototype.setItem, warned = 0;
        Storage.prototype.setItem = function (k, v) {
            try { return orig.call(this, k, v); }
            catch (e) {
                if (e && (e.name === 'QuotaExceededError' || e.code === 22) && Date.now() - warned > 5000) {
                    warned = Date.now();
                    if (window.showToast) window.showToast('Browser storage is full. Download a backup (Settings) and clear old data.', 'danger');
                }
                throw e;
            }
        };
    })();

    document.addEventListener('DOMContentLoaded', function () {
        if (!A || !A.session()) return;
        labelButtons(document);
        applyRoles();
        enforceRoute();
        window.addEventListener('hashchange', enforceRoute);
        var content = document.getElementById('app-content');
        if (content) {
            var pending = false;
            new MutationObserver(function () {
                if (pending) return; pending = true;
                setTimeout(function () { pending = false; onContent(content); }, 300);
            }).observe(content, { childList: true });
        }
        if (A.session().mustChange) passwordModal();
    });
})();
