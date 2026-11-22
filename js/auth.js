// Local (browser-only) authentication with salted PBKDF2 password hashes, roles,
// and expiring sessions. NOTE: with no server, this deters casual access but is
// not a substitute for real server-side auth (planned for a later phase).
(function () {
    'use strict';
    var USERS_KEY = 'wms_users';
    var SESSION_KEY = 'wms_session';
    var SESSION_MS = 8 * 60 * 60 * 1000;      // 8h absolute
    var IDLE_MS = 30 * 60 * 1000;             // 30m idle
    var MAX_FAILS = 5, LOCK_MS = 5 * 60 * 1000;
    var ITER = 100000;

    // Modules each role may open. '*' = everything.
    var ROLE_ACCESS = {
        admin: '*',
        manager: ['dashboard', 'products', 'barcode', 'batch', 'inventory', 'purchase', 'receiving', 'production',
            'dispatch', 'returns', 'quality', 'reports', 'logistics', 'maintenance', 'distributor', 'supplier_scorecard',
            'customers', 'alerts', 'ledger', 'invoices', 'intelligence', 'ai_automation', 'expenses', 'finance'],
        operator: ['dashboard', 'products', 'barcode', 'batch', 'inventory', 'receiving', 'production', 'dispatch',
            'returns', 'quality', 'alerts', 'ledger'],
        viewer: ['dashboard', 'products', 'inventory', 'reports', 'alerts', 'ledger']
    };

    function b64(buf) { return btoa(String.fromCharCode.apply(null, new Uint8Array(buf))); }
    function unb64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }

    function hash(password, saltB64) {
        var enc = new TextEncoder();
        return crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
            .then(function (key) {
                return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: unb64(saltB64), iterations: ITER }, key, 256);
            }).then(b64);
    }
    function newSalt() { return b64(crypto.getRandomValues(new Uint8Array(16))); }

    function loadUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; } }
    function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

    function ensureSeed() {
        if (loadUsers().length) return Promise.resolve();
        var salt = newSalt();
        return hash('admin123', salt).then(function (h) {
            saveUsers([{ username: 'admin', name: 'Administrator', role: 'admin', salt: salt, hash: h,
                mustChange: true, fails: 0, lockUntil: 0 }]);
        });
    }

    function getSession() {
        try {
            var s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
            if (!s) return null;
            var now = Date.now();
            if (now > s.exp || now - s.last > IDLE_MS) { sessionStorage.removeItem(SESSION_KEY); return null; }
            return s;
        } catch (e) { return null; }
    }
    function touch() {
        var s = getSession();
        if (s) { s.last = Date.now(); sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
    }

    var Auth = {
        ROLE_ACCESS: ROLE_ACCESS,
        session: getSession,

        login: function (username, password) {
            return ensureSeed().then(function () {
                var users = loadUsers();
                var u = users.filter(function (x) { return x.username === String(username).trim().toLowerCase(); })[0];
                var generic = new Error('Invalid User ID or Password.');
                if (!u) return hash(password, newSalt()).then(function () { throw generic; }); // equalise timing
                if (u.lockUntil && Date.now() < u.lockUntil) {
                    throw new Error('Account locked. Try again in ' + Math.ceil((u.lockUntil - Date.now()) / 60000) + ' min.');
                }
                return hash(password, u.salt).then(function (h) {
                    if (h !== u.hash) {
                        u.fails = (u.fails || 0) + 1;
                        if (u.fails >= MAX_FAILS) { u.lockUntil = Date.now() + LOCK_MS; u.fails = 0; }
                        saveUsers(users);
                        throw generic;
                    }
                    u.fails = 0; u.lockUntil = 0; saveUsers(users);
                    var now = Date.now();
                    var s = { username: u.username, name: u.name, role: u.role, mustChange: !!u.mustChange, exp: now + SESSION_MS, last: now };
                    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
                    return s;
                });
            });
        },

        logout: function (landing) {
            sessionStorage.removeItem(SESSION_KEY);
            localStorage.removeItem('isLoggedIn');
            window.location.replace(landing || 'landing-page/index.html');
        },

        // Call from the app's <head>: redirect unless a valid session exists.
        guard: function (landing) {
            if (!getSession()) { window.location.replace(landing || 'landing-page/index.html'); return false; }
            return true;
        },

        can: function (module) {
            var s = getSession(); if (!s) return false;
            var a = ROLE_ACCESS[s.role];
            return a === '*' || (a && a.indexOf(module) > -1);
        },

        changePassword: function (oldPw, newPw) {
            var s = getSession(); if (!s) return Promise.reject(new Error('Not signed in.'));
            if (!newPw || newPw.length < 8 || !/[a-zA-Z]/.test(newPw) || !/\d/.test(newPw)) {
                return Promise.reject(new Error('Use at least 8 characters with letters and numbers.'));
            }
            if (newPw === 'admin123') return Promise.reject(new Error('Choose a different password.'));
            var users = loadUsers();
            var u = users.filter(function (x) { return x.username === s.username; })[0];
            return hash(oldPw, u.salt).then(function (h) {
                if (h !== u.hash) throw new Error('Current password is incorrect.');
                var salt = newSalt();
                return hash(newPw, salt).then(function (nh) {
                    u.salt = salt; u.hash = nh; u.mustChange = false; saveUsers(users);
                    s.mustChange = false; sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
                });
            });
        },

        // Admin: user management
        listUsers: function () {
            return loadUsers().map(function (u) { return { username: u.username, name: u.name, role: u.role }; });
        },
        addUser: function (username, name, role, password) {
            var s = getSession();
            if (!s || s.role !== 'admin') return Promise.reject(new Error('Admin only.'));
            username = String(username).trim().toLowerCase();
            if (!/^[a-z0-9._-]{3,32}$/.test(username)) return Promise.reject(new Error('Username: 3-32 chars (a-z, 0-9, . _ -).'));
            if (!ROLE_ACCESS[role]) return Promise.reject(new Error('Unknown role.'));
            if (!password || password.length < 8) return Promise.reject(new Error('Password must be 8+ characters.'));
            var users = loadUsers();
            if (users.some(function (x) { return x.username === username; })) return Promise.reject(new Error('Username already exists.'));
            var salt = newSalt();
            return hash(password, salt).then(function (h) {
                users.push({ username: username, name: name || username, role: role, salt: salt, hash: h, mustChange: true, fails: 0, lockUntil: 0 });
                saveUsers(users);
            });
        },
        removeUser: function (username) {
            var s = getSession();
            if (!s || s.role !== 'admin') throw new Error('Admin only.');
            if (username === s.username) throw new Error('You cannot delete your own account.');
            saveUsers(loadUsers().filter(function (u) { return u.username !== username; }));
        }
    };

    ['click', 'keydown', 'mousemove'].forEach(function (ev) {
        window.addEventListener(ev, function () { if (window.__wmsT && Date.now() - window.__wmsT < 5000) return; window.__wmsT = Date.now(); touch(); }, { passive: true });
    });

    window.WMSAuth = Auth;
    window.logoutUser = function () { Auth.logout(); };
})();
