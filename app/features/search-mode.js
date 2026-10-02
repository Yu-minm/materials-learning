import { e, icon, qs } from '../lib/dom.js';
import { searchPages, queryTerms, normalize, matchingTerms } from '../lib/search.js';
import { richText, findRanges } from '../components/text.js';
import { heading, categoryOptions, figureCard, questionCard, emptyState } from '../components/common.js';
import { readLink, navigate } from '../lib/router.js';
import { imageDialog } from '../components/viewer.js';
export function renderSearch(root, ctx, params) {
    const query = params.get('q') ?? '';
    const category = params.get('category');
    const terms = queryTerms(query, ctx.catalog);
    const hits = searchPages(ctx.catalog, query, category ?? undefined);
    const pageNos = new Set(hits.map(h => h.page.number));
    const termHits = matchingTerms(ctx.catalog, query).filter(t => !category || t.pages.some(n => ctx.catalog.pages.some(p => p.number === n && p.category === category)));
    const figures = ctx.catalog.figures.filter(f => (!category || f.category === category) && (pageNos.has(f.page) || terms.some(t => normalize(f.title + ' ' + f.description).includes(t))));
    const questions = ctx.catalog.questions.filter(q => (!category || q.category === category) && (q.sources.some(s => pageNos.has(s.page)) || terms.some(t => normalize(q.prompt).includes(t))));
    root.innerHTML = heading('FIND THE EVIDENCE', '教材内検索', '全文テキストを検索し、関連する図表・用語・演習へ案内します。') + `<section class="search-panel panel"><form id="search-form" class="search-form"><label class="search-field large">${icon('search', 22)}<input type="search" name="q" id="material-search" aria-label="教材内検索" placeholder="例：フィッシュアイとゲルの違い" value="${e(query)}"/></label><select name="category" aria-label="検索カテゴリ">${categoryOptions(ctx, category ?? '')}</select><button class="button primary" type="submit">検索</button></form><p class="small muted">教材ナビ：専門用語と同義語を使うローカル検索です。生成AIによる回答作成や外部送信は行いません。</p>${terms.length ? `<div class="tags"><span class="small muted">検索語</span>${terms.map(t => `<span class="tag">${e(t)}</span>`).join('')}</div>` : ''}</section>`;
    if (!query.trim()) {
        root.innerHTML += `<div class="search-examples">${['フィッシュアイとゲルの違い', 'ブリード解析でFTIRを使う理由', 'ATR 表面', 'チャージアップ', '光学系 明視野 暗視野'].map(q => `<a class="suggestion" href="#/search?q=${encodeURIComponent(q)}">${e(q)} ${icon('arrow', 16)}</a>`).join('')}</div>`;
    }
    else {
        root.innerHTML += `<div class="search-counts"><button data-scroll="search-pages">本文 ${hits.length}</button><button data-scroll="search-terms">用語 ${termHits.length}</button><button data-scroll="search-figures">図表 ${figures.length}</button><button data-scroll="search-questions">問題 ${questions.length}</button></div><section id="search-pages"><div class="section-title compact"><h2>関連ページ</h2><span class="muted small">全文テキストからの一致</span></div>${hits.length ? hits.map(hit => { const match = findRanges(hit.block.text, terms)[0]; const start = Math.max(0, (match?.start ?? 0) - 70); const text = hit.block.text.slice(start, start + 240); return `<a class="search-result panel" href="${readLink(hit.page.number, hit.block.id, query)}"><span class="page-number">p${hit.page.number}</span><div><h3>${richText(hit.page.title, terms)}</h3><p>${start ? '…' : ''}${richText(text, terms)}${hit.block.text.length > start + 240 ? '…' : ''}</p><span class="text-link">参照箇所へ ${icon('arrow', 15)}</span></div></a>`; }).join('') : emptyState('該当する本文が見つかりません', '教材外の内容は補完しません。専門用語を短く入力して再検索してください。')}</section><section id="search-terms"><h2>関連用語 <span class="muted small">${termHits.length}件</span></h2><div class="term-results">${termHits.slice(0, 16).map(t => `<a class="panel term-result" href="#/terms?term=${encodeURIComponent(t.id)}"><h3>${richText(t.name, terms)}</h3><p>${richText(t.definition, terms)}</p><span class="text-link">用語辞典で読む ${icon('arrow', 15)}</span></a>`).join('')}</div></section><section id="search-figures"><h2>関連図表 <span class="muted small">${figures.length}件</span></h2><div class="figure-grid">${figures.slice(0, 12).map(figureCard).join('')}</div>${figures.length > 12 ? '<p class="small muted">先頭12件を表示しています。図表一覧で全件を確認できます。</p>' : ''}</section><section id="search-questions" class="panel"><h2>関連問題 <span class="muted small">${questions.length}件</span></h2>${questions.slice(0, 8).map(questionCard).join('')}${questions.length > 8 ? '<p class="small muted">関連する問題の先頭8件を表示しています。</p>' : ''}</section>`;
    }
    qs('#search-form', root).addEventListener('submit', ev => { ev.preventDefault(); const form = new FormData(ev.currentTarget); navigate('/search?' + new URLSearchParams({ q: String(form.get('q') ?? ''), category: String(form.get('category') ?? '') })); });
    root.querySelectorAll('[data-scroll]').forEach(a => a.addEventListener('click', () => document.getElementById(a.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' })));
    root.querySelectorAll('[data-figure]').forEach(b => b.addEventListener('click', () => { const f = ctx.catalog.figures.find(f => f.id === b.dataset.figure); imageDialog(f.image, f.title, f.description, readLink(f.page, f.section)); }));
}
