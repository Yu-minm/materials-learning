export function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c)); }
export const e = escapeHtml;
export function qs(selector, root = document) { const node = root.querySelector(selector); if (!node)
    throw new Error(`Missing UI element: ${selector}`); return node; }
export function listen(root, selector, event, handler) { root.querySelectorAll(selector).forEach(el => el.addEventListener(event, ev => handler(ev, el))); }
export function toast(message, error = false) { const area = document.getElementById('toasts'); if (!area)
    return; const item = document.createElement('div'); item.className = `toast ${error ? 'error' : ''}`; item.textContent = message; item.setAttribute('role', error ? 'alert' : 'status'); area.append(item); setTimeout(() => item.remove(), 5500); }
export function formatTime(seconds) { const n = Math.floor(seconds); return n < 60 ? `${n}秒` : n < 3600 ? `${Math.floor(n / 60)}分` : `${Math.floor(n / 3600)}時間${Math.floor(n % 3600 / 60)}分`; }
export function localDay(at = Date.now()) { const d = new Date(at); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
export function formatDate(at) { return new Date(at).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
export function uid() { return crypto.randomUUID(); }
export function downloadJSON(name, data) { const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export function icon(name, size = 20) { const paths = { home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>', book: '<path d="M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z"/><path d="M12 5v15"/>', quiz: '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 9 2 2 5-5M8 16h8"/>', search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>', figure: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m3 18 6-6 4 4 4-6 4 4"/>', terms: '<path d="M3 19 9 4l6 15M5 14h8M17 8h5M19 8v11"/>', history: '<path d="M3 5v5h5M3 10a9 9 0 1 1 1 8M12 7v5l3 2"/>', weak: '<path d="m12 3 9 17H3Z"/><path d="M12 9v4M12 16v1"/>', bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>', arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>', check: '<path d="m4 12 5 5L20 6"/>', close: '<path d="m5 5 14 14M5 19 19 5"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>', moon: '<path d="M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11Z"/>', expand: '<path d="M3 9V3h6m6 0h6v6M3 15v6h6m6 0h6v-6"/>', flask: '<path d="M9 3h6M10 3v7L4 20h16l-6-10V3M7 15h10"/>', layers: '<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>', spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>', lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>' }; return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.book}</svg>`; }
/** Cache identity for the replacement scan images; learning record IDs stay unchanged. */
export function materialImageURL(path) {
    if (!/^(pages|figures|originals)\/[^?#]+\.jpg(?:[?#]|$)/i.test(path))
        return path;
    const [base, fragment] = path.split('#', 2);
    const [pathname, query] = (base ?? '').split('?', 2);
    const params = new URLSearchParams(query);
    params.set('scan', '2026-10-02.scan.1');
    return `${pathname}?${params.toString()}${fragment === undefined ? '' : '#' + fragment}`;
}
