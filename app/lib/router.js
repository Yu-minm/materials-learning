export function currentRoute() { const [path, query] = location.hash.slice(1).split('?'); return { path: path || '/', params: new URLSearchParams(query ?? '') }; }
export function navigate(path) { const hash = `#${path}`; if (location.hash === hash)
    window.dispatchEvent(new HashChangeEvent('hashchange'));
else
    location.hash = hash; }
export function readLink(page, section, query, view = 'split') { const params = new URLSearchParams({ view }); if (section)
    params.set('section', section); if (query)
    params.set('q', query); return `#/read/p${page}?${params}`; }
