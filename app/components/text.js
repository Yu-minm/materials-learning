import { e } from '../lib/dom.js';
import { normalize } from '../lib/search.js';
export function findRanges(text, terms) { let n = ''; const starts = []; const ends = []; let offset = 0; for (const char of text) {
    const folded = normalize(char);
    for (let j = 0; j < folded.length; j++) {
        starts.push(offset);
        ends.push(offset + char.length);
    }
    n += folded;
    offset += char.length;
} const matches = []; for (const query of terms) {
    const q = normalize(query);
    if (!q)
        continue;
    let pos = n.indexOf(q);
    while (pos >= 0) {
        const start = starts[pos];
        const end = ends[pos + q.length - 1];
        if (start !== undefined && end !== undefined)
            matches.push({ start, end });
        pos = n.indexOf(q, pos + Math.max(1, q.length));
    }
} return matches; }
export function richText(text, terms = [], markers = []) { const hits = findRanges(text, terms); const endpoints = new Set([0, text.length]); for (const r of [...hits, ...markers]) {
    endpoints.add(Math.max(0, r.start));
    endpoints.add(Math.min(text.length, r.end));
} const points = [...endpoints].sort((a, b) => a - b); let html = ''; for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    if (start >= end)
        continue;
    const hit = hits.some(h => h.start <= start && h.end >= end);
    const marker = markers.filter(m => m.start <= start && m.end >= end).at(-1);
    const classes = [hit ? 'search-match' : '', marker ? `marker marker-${marker.color}` : ''].filter(Boolean).join(' ');
    const chunk = e(text.slice(start, end));
    html += classes ? `<span class="${classes}">${chunk}</span>` : chunk;
} return html; }
export function pageTextHTML(page, terms, markers) { return `<article class="transcript" aria-label="全文テキスト">${page.blocks.map(b => { const tag = b.kind === 'heading' ? `h${Math.min(b.level ?? 2, 4)}` : 'p'; return `<section class="text-block" id="${e(b.id)}" data-block-id="${e(b.id)}"><${tag} class="text-content">${richText(b.text, terms, markers.filter(m => m.blockId === b.id))}</${tag}></section>`; }).join('')}</article>`; }
export function selectedText(root) { const selection = window.getSelection(); if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
    return null; const range = selection.getRangeAt(0); const node = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement; const content = node?.closest('.text-content'); if (!content || !root.contains(content) || !content.contains(range.endContainer))
    return null; const before = document.createRange(); before.selectNodeContents(content); before.setEnd(range.startContainer, range.startOffset); const start = before.toString().length; const end = start + range.toString().length; const blockId = content.parentElement?.dataset.blockId; if (!blockId || end <= start)
    return null; return { blockId, start, end, text: range.toString() }; }
