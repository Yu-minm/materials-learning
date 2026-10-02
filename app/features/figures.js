import { e, qs } from '../lib/dom.js';
import { heading, categoryOptions, figureCard, emptyState } from '../components/common.js';
import { normalize } from '../lib/search.js';
import { imageDialog } from '../components/viewer.js';
import { readLink } from '../lib/router.js';
export function renderFigures(root, ctx, params) {
    root.innerHTML = heading('VISUAL LIBRARY', '図表から学ぶ', '解析フロー、スペクトル、欠点形状、光学系を原本から確認します。') + `<div class="filter-bar"><label class="search-field"><input type="search" id="figure-search" aria-label="図表を検索" placeholder="図表名・キーワードで検索"/></label><select id="figure-category" aria-label="図表カテゴリ">${categoryOptions(ctx, params.get('category') ?? '')}</select><span id="figure-count" class="small muted"></span></div><div id="figure-results"></div>`;
    function update() { const category = qs('#figure-category', root).value; const q = normalize(qs('#figure-search', root).value); const figures = ctx.catalog.figures.filter(f => (!category || f.category === category) && (!q || normalize(f.title + ' ' + f.description).includes(q))); qs('#figure-count', root).textContent = `${figures.length}図表`; qs('#figure-results', root).innerHTML = figures.length ? ctx.catalog.categories.filter(c => !category || c.id === category).map(c => { const items = figures.filter(f => f.category === c.id); return items.length ? `<section class="figure-section"><div class="section-title compact"><h2>${e(c.short)}</h2><span class="small muted">${items.length}図表</span></div><div class="figure-grid">${items.map(figureCard).join('')}</div></section>` : ''; }).join('') : emptyState('該当する図表がありません', 'カテゴリまたはキーワードを変更してください。'); root.querySelectorAll('[data-figure]').forEach(b => b.addEventListener('click', () => { const f = figures.find(f => f.id === b.dataset.figure); imageDialog(f.image, f.title, f.description, readLink(f.page, f.section)); })); }
    qs('#figure-category', root).addEventListener('change', update);
    qs('#figure-search', root).addEventListener('input', update);
    update();
}
