export function normalize(text) { return text.normalize('NFKC').toLocaleLowerCase('ja-JP').replace(/[\s・\-‐－]/g, ''); }
export function queryTerms(query, catalog) {
    const input = normalize(query);
    const found = [];
    for (const term of catalog.terms) {
        const names = [term.name, ...term.aliases];
        if (names.some(n => input.includes(normalize(n))))
            found.push(...names);
    }
    const words = query.trim().split(/[\s、,]+/).filter(s => s.length > 1);
    const source = found.length ? found : words;
    return [...new Set(source.map(normalize).filter(Boolean))];
}
export function searchPages(catalog, query, category) {
    const terms = queryTerms(query, catalog);
    if (!terms.length)
        return [];
    return catalog.pages.filter(p => !category || p.category === category).flatMap(page => {
        let score = 0;
        let best;
        let bestScore = 0;
        for (const block of page.blocks) {
            const hay = normalize(block.text);
            const bs = terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
            if (bs > bestScore) {
                bestScore = bs;
                best = block;
            }
            score += Math.min(bs, 3);
        }
        score += terms.filter(t => normalize(page.title).includes(t)).length * 8;
        score += terms.filter(t => page.tags.some(tag => normalize(tag).includes(t))).length * 4;
        return score && best ? [{ page, score, block: best, terms }] : [];
    }).sort((a, b) => b.score - a.score || a.page.number - b.page.number);
}
export function highlight(text, query) { return text; }
export function matchingTerms(catalog, query) { const terms = queryTerms(query, catalog); return catalog.terms.filter(t => terms.some(q => normalize(t.name + ' ' + t.aliases.join(' ') + ' ' + t.definition).includes(q))); }
