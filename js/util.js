// Shared helpers. Load before any view script.
(function () {
    'use strict';
    var MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };
    // Escape any untrusted value before interpolating it into an innerHTML template.
    window.escapeHtml = function (value) {
        return String(value == null ? '' : value).replace(/[&<>"'`]/g, function (c) { return MAP[c]; });
    };
    window.esc = window.escapeHtml;

    // Escape a value for a single-quoted JS string inside an HTML attribute, e.g.
    // onclick="fn('${escJs(x)}')". Anything outside a safe whitelist becomes \xHH
    // (or \uHHHH), so it can close neither the JS string nor the attribute.
    window.escJs = function (value) {
        return String(value == null ? '' : value).replace(/[^A-Za-z0-9 _.,:;\-\/@#()+=*%!?~|]/g, function (c) {
            var code = c.charCodeAt(0);
            if (code < 256) return '\\x' + (code < 16 ? '0' : '') + code.toString(16);
            return '\\u' + ('0000' + code.toString(16)).slice(-4);
        });
    };
})();
