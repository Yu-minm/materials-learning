import { e, icon, qs } from '../lib/dom.js';
import { heading, categoryOptions, pageCard, figureCard, questionCard, emptyState } from '../components/common.js';
import { normalize } from '../lib/search.js';
import { imageDialog } from '../components/viewer.js';
import { readLink } from '../lib/router.js';
export function renderTerms(root, ctx, params) {
    const selected = ctx.catalog.terms.find(t => t.id === params.get('term'));
    root.innerHTML = heading('TECHNICAL GLOSSARY', '用語辞典', '専門用語を、原文・図表・演習とのつながりから理解します。') + `<div class="filter-bar"><label class="search-field">${icon('search', 18)}<input type="search" id="term-search" aria-label="用語を検索" placeholder="用語・略語・説明から検索" value="${e(params.get('q') ?? '')}"/></label><select id="term-category" aria-label="用語カテゴリ">${categoryOptions(ctx)}</select><span class="small muted">${ctx.catalog.terms.length}用語</span></div><div class="glossary-layout"><nav class="term-list panel" id="term-list" aria-label="用語一覧"></nav><section id="term-detail"></section></div>`;
    function update() { const q = normalize(qs('#term-search', root).value); const category = qs('#term-category', root).value; const terms = ctx.catalog.terms.filter(t => (!q || normalize(t.name + t.aliases.join(' ') + t.definition).includes(q)) && (!category || t.pages.some(n => ctx.catalog.pages.some(p => p.number === n && p.category === category)))); qs('#term-list', root).innerHTML = terms.length ? terms.map(t => `<a class="${t.id === selected?.id ? 'active' : ''}" href="#/terms?term=${encodeURIComponent(t.id)}&q=${encodeURIComponent(qs('#term-search', root).value)}"><strong>${e(t.name)}</strong>${t.aliases.length ? `<small>${e(t.aliases.join(' / '))}</small>` : ''}</a>`).join('') : '<p class="muted">該当する用語がありません。</p>'; }
    update();
    qs('#term-search', root).addEventListener('input', update);
    qs('#term-category', root).addEventListener('change', update);
    const area = qs('#term-detail', root);
    if (!selected) {
        area.innerHTML = emptyState('用語を選択してください', '略語・日本語表記・説明から検索できます。', '<a class="button secondary" href="#/terms?term=fish-eye">フィッシュアイを読む</a>');
        return;
    }
    const terms = [selected.name, ...selected.aliases].map(normalize);
    const questions = ctx.catalog.questions.filter(q => q.tags.some(tag => terms.some(t => normalize(tag).includes(t))) || terms.some(t => normalize(q.prompt).includes(t)));
    const figures = ctx.catalog.figures.filter(f => selected.pages.includes(f.page));
    area.innerHTML = `<article class="panel term-definition"><span class="eyebrow">TERM / ${e(selected.id)}</span><h2>${e(selected.name)}</h2><p class="term-aliases muted">${e(selected.aliases.join(' / '))}</p><p class="definition">${e(selected.definition)}</p><div class="tags">${selected.pages.map(n => `<a class="tag" href="${readLink(n, undefined, selected.name)}">根拠 p${n}</a>`).join('')}</div></article><section class="panel"><h2>関連ページ</h2>${selected.pages.flatMap(n => { const p = ctx.catalog.pages.find(p => p.number === n); return p ? [pageCard(ctx, p)] : []; }).join('')}</section>${figures.length ? `<section><h2>関連ページの図表</h2><div class="figure-grid">${figures.slice(0, 6).map(figureCard).join('')}</div></section>` : ''}${questions.length ? `<section class="panel"><h2>関連問題 <span class="muted small">${questions.length}問</span></h2>${questions.slice(0, 6).map(questionCard).join('')}</section>` : ''}`;
    root.querySelectorAll('[data-figure]').forEach(b => b.addEventListener('click', () => { const f = figures.find(f => f.id === b.dataset.figure); imageDialog(f.image, f.title, f.description, readLink(f.page, f.section)); }));
}
