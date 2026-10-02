import { e, icon, qs, toast, uid } from '../lib/dom.js';
import { readLink, navigate } from '../lib/router.js';
import { viewerHTML, mountViewer, imageDialog } from '../components/viewer.js';
import { pageTextHTML, selectedText } from '../components/text.js';
import { figureCard, pageCard, questionCard, emptyState } from '../components/common.js';
import { queryTerms } from '../lib/search.js';
export function renderReader(root, ctx, id, params) {
    const { catalog, store } = ctx;
    const page = catalog.pages.find(p => p.id === id);
    if (!page) {
        root.innerHTML = emptyState('ページが見つかりません', '教材一覧からページを選択してください。', '<a class="button" href="#/">ホーム</a>');
        return () => { };
    }
    const category = catalog.categories.find(c => c.id === page.category);
    const pages = catalog.pages.filter(p => p.category === page.category);
    const index = pages.indexOf(page);
    const previous = pages[index - 1];
    const next = pages[index + 1];
    const progress = store.getPage(page.number);
    const wanted = params.get('view');
    const view = ['image', 'summary', 'text', 'split'].includes(wanted ?? '') ? wanted : store.preferences.readerView;
    let query = params.get('q') ?? '';
    const figures = catalog.figures.filter(f => f.page === page.number);
    const questions = catalog.questions.filter(q => q.sources.some(s => s.page === page.number));
    root.innerHTML = `<div class="reader-layout"><aside class="page-outline"><a class="back-link" href="#/">← 学習テーマ</a><span class="eyebrow">${e(category.short)}</span><h2>教材一覧</h2><p class="muted small">${pages.length}ページ · ${questions.length}問がこのページに関連</p><nav aria-label="教材のページ">${pages.map(p => `<a class="outline-page ${p.id === page.id ? 'active' : ''}" href="${readLink(p.number, undefined, undefined, view)}" ${p.id === page.id ? 'aria-current="page"' : ''}><span>p${p.number}</span><strong>${e(p.title)}</strong>${store.getPage(p.number).learned ? icon('check', 14) : ''}</a>`).join('')}</nav></aside><div class="reader-main"><header class="reader-header"><div class="breadcrumb"><a href="#/">学習ホーム</a><span>/</span>${e(category.short)}</div><div class="reader-title-row"><div><span class="eyebrow">PAGE ${page.number}</span><h1>${e(page.title)}</h1></div><div class="page-nav">${previous ? `<a class="icon-button" href="${readLink(previous.number, undefined, undefined, view)}" aria-label="前のページ">←</a>` : ''}<span>${index + 1} / ${pages.length}</span>${next ? `<a class="icon-button" href="${readLink(next.number, undefined, undefined, view)}" aria-label="次のページ">→</a>` : ''}</div></div><div class="reader-meta"><div class="tags">${page.tags.map(t => `<a class="tag" href="#/search?q=${encodeURIComponent(t)}">${e(t)}</a>`).join('')}</div><div class="button-row"><button class="button small ${progress.bookmark ? 'selected' : ''}" id="bookmark-toggle" aria-pressed="${progress.bookmark}">${icon('bookmark', 16)} ${progress.bookmark ? '保存済み' : 'しおり'}</button><button class="button small ${progress.learned ? 'selected' : ''}" id="learned-toggle" aria-pressed="${progress.learned}">${icon('check', 16)} ${progress.learned ? '学習済み' : '学習済みにする'}</button></div></div></header>
 <div class="reader-controls"><div class="view-tabs" role="tablist" aria-label="教材の表示方法">${[['image', '原本画像'], ['summary', '要約'], ['text', '全文テキスト'], ['split', '画像＋全文']].map(([v, label]) => `<button role="tab" aria-selected="${view === v}" class="${view === v ? 'active' : ''}" data-view="${v}">${label}</button>`).join('')}</div><div class="reader-search"><label class="search-field compact">${icon('search', 16)}<input type="search" id="page-search" aria-label="ページ内検索" placeholder="ページ内を検索" value="${e(query)}"/></label><span id="match-count" class="small muted"></span><button class="icon-button" id="next-match" aria-label="次の検索結果">↓</button></div></div>
 <div class="transcription-status ${page.transcription === 'partial' ? 'review-needed' : ''}">${icon('book', 15)}<span>${page.transcription === 'reviewed' ? '本文転記済み。原本画像と照合できます。' : '本文転記済み。一部の微小文字・図中の数値は原本確認が必要です。'}${page.reviewNotes.length ? ` <details><summary>転記について</summary><p>${e(page.reviewNotes.join(' '))}</p></details>` : ''}</span><button class="text-link" id="open-original">スキャン原本を拡大 ${icon('expand', 14)}</button></div>
 <div class="reading-area ${view === 'split' ? 'split-view' : ''}" data-reader-view="${view}">
 ${view === 'image' || view === 'split' ? `<div class="image-pane">${viewerHTML(page.image, `p${page.number} ${page.title}`)}</div>` : ''}
 ${view === 'text' || view === 'split' ? `<div class="text-pane"><div class="text-tools"><span>全文テキスト</span><div class="marker-tools" aria-label="マーカー"><span class="small muted">本文を選択</span>${['yellow', 'blue', 'red'].map(c => `<button class="marker-color ${c}" data-marker-color="${c}" aria-label="${{ yellow: '黄', blue: '青', red: '赤' }[c]}のマーカー"></button>`).join('')}<button class="icon-button" id="font-down" aria-label="文字を小さく">A−</button><button class="icon-button" id="font-up" aria-label="文字を大きく">A＋</button></div></div><div id="transcript-content" style="--reading-size:${store.preferences.fontSize}px">${pageTextHTML(page, queryTerms(query, catalog), progress.markers)}</div></div>` : ''}
 ${view === 'summary' ? `<article class="summary-pane"><span class="eyebrow">LEARNING NOTES · p${page.number}</span><h2>このページの要約</h2><section><h3>要点</h3><p>${e(page.summary.points)}</p></section><section><h3>注意点</h3><p>${e(page.summary.caution)}</p></section><section><h3>実務上の重要事項</h3><p>${e(page.summary.practice)}</p></section><div class="notice">この欄は学習用の要約です。全文は「全文テキスト」または「画像＋全文」で確認してください。</div><button class="button secondary" id="summary-to-text">全文テキストで確認 ${icon('arrow', 16)}</button></article>` : ''}
 </div>
 ${figures.length ? `<section class="reader-figures"><div class="section-title compact"><h2>このページの図表</h2><a class="text-link" href="#/figures?category=${page.category}">図表一覧 ${icon('arrow', 15)}</a></div><div class="figure-grid">${figures.map(figureCard).join('')}</div></section>` : ''}
 <div class="reader-study-grid"><section class="panel"><div class="section-title compact"><h2>学習メモ</h2><span class="small muted" id="note-status">端末内に自動保存</span></div><label class="sr-only" for="page-note">このページのメモ</label><textarea id="page-note" rows="5" maxlength="100000" placeholder="現場とのつながり、疑問、確認したいことを記録…">${e(progress.note)}</textarea><div class="marker-list" id="marker-list"></div></section><section class="panel"><h2>関連ページ</h2>${page.related.flatMap(n => { const p = catalog.pages.find(p => p.number === n); return p ? [pageCard(ctx, p)] : []; }).join('')}</section></div>
 ${questions.length ? `<section class="panel related-questions"><div class="section-title compact"><h2>このページを使った演習</h2><a class="text-link" href="#/quiz?page=${page.number}">${questions.length}問を練習 ${icon('arrow', 15)}</a></div>${questions.slice(0, 3).map(questionCard).join('')}</section>` : ''}
 <div class="reader-bottom-nav">${previous ? `<a class="button secondary" href="${readLink(previous.number, undefined, undefined, view)}">← p${previous.number}</a>` : '<span></span>'}${next ? `<a class="button primary" href="${readLink(next.number, undefined, undefined, view)}">次のページ · p${next.number} ${icon('arrow', 16)}</a>` : '<a class="button primary" href="#/quiz?category=' + page.category + '">このテーマを演習</a>'}</div></div></div>`;
    const viewers = [...root.querySelectorAll('.image-viewer')].map(mountViewer);
    let matchIndex = -1;
    let searchTimer;
    const navigateView = (v) => { void store.setPreferences({ readerView: v }).catch(err => toast(String(err), true)); navigate(readLink(page.number, params.get('section') ?? undefined, query, v).slice(1)); };
    root.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => navigateView(b.dataset.view)));
    root.querySelector('#summary-to-text')?.addEventListener('click', () => navigateView('text'));
    qs('#open-original', root).addEventListener('click', () => imageDialog(page.original, `p${page.number}を含むスキャン原本`, 'スキャンPDFから抽出した原本画像です。p50はp51、p283はp282を除外し、対象ページだけを表示します。'));
    qs('#bookmark-toggle', root).addEventListener('click', async (ev) => { const button = ev.currentTarget; const value = !store.getPage(page.number).bookmark; try {
        await store.updatePage(page.number, { bookmark: value });
        button.classList.toggle('selected', value);
        button.setAttribute('aria-pressed', String(value));
        button.innerHTML = `${icon('bookmark', 16)} ${value ? '保存済み' : 'しおり'}`;
        toast(value ? 'しおりを保存しました。' : 'しおりを解除しました。');
    }
    catch (err) {
        toast(String(err), true);
    } });
    qs('#learned-toggle', root).addEventListener('click', async (ev) => { const button = ev.currentTarget; const value = !store.getPage(page.number).learned; try {
        await store.updatePage(page.number, { learned: value });
        button.classList.toggle('selected', value);
        button.setAttribute('aria-pressed', String(value));
        button.innerHTML = `${icon('check', 16)} ${value ? '学習済み' : '学習済みにする'}`;
        toast(value ? '学習済みとして記録しました。' : '学習済みを解除しました。');
    }
    catch (err) {
        toast(String(err), true);
    } });
    qs('#page-note', root).addEventListener('input', ev => { const note = ev.target.value; const status = qs('#note-status', root); status.textContent = '保存中…'; void store.updatePage(page.number, { note }).then(() => { status.textContent = '保存済み（この端末）'; }).catch(() => { status.textContent = '保存できません。バックアップを保存してください。'; }); });
    function redrawText() { const el = root.querySelector('#transcript-content'); if (el)
        el.innerHTML = pageTextHTML(page, queryTerms(query, catalog), store.getPage(page.number).markers); const count = root.querySelectorAll('.search-match').length; qs('#match-count', root).textContent = query ? `${count}箇所` : ''; }
    function markerList() { const current = store.getPage(page.number).markers; const area = qs('#marker-list', root); area.innerHTML = current.length ? `<h3>マーカー <span class="small muted">${current.length}件</span></h3>${current.map(m => `<div class="saved-marker"><button class="marker-quote marker-${m.color}" data-marker-jump="${e(m.blockId)}">${e(m.text)}</button><button class="icon-button" aria-label="マーカーを削除" data-marker-delete="${e(m.id)}">${icon('close', 15)}</button></div>`).join('')}` : '<p class="small muted">全文テキストを選択し、黄・青・赤のマーカーで記録できます。</p>'; area.querySelectorAll('[data-marker-delete]').forEach(b => b.addEventListener('click', () => { void store.updatePage(page.number, { markers: store.getPage(page.number).markers.filter(m => m.id !== b.dataset.markerDelete) }).then(() => { redrawText(); markerList(); }).catch(err => toast(String(err), true)); })); area.querySelectorAll('[data-marker-jump]').forEach(b => b.addEventListener('click', () => { const target = document.getElementById(b.dataset.markerJump); if (target)
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    else
        navigate(readLink(page.number, b.dataset.markerJump, undefined, 'text').slice(1)); })); }
    markerList();
    redrawText();
    root.querySelectorAll('[data-marker-color]').forEach(b => { b.addEventListener('pointerdown', ev => ev.preventDefault()); b.addEventListener('click', () => { const selection = selectedText(root); if (!selection) {
        toast('全文テキストの同じ段落内を選択してから、色を選んでください。');
        return;
    } const marker = { ...selection, id: uid(), color: b.dataset.markerColor, createdAt: Date.now() }; void store.updatePage(page.number, { markers: [...store.getPage(page.number).markers, marker] }).then(() => { window.getSelection()?.removeAllRanges(); redrawText(); markerList(); toast('マーカーを保存しました。'); }).catch(err => toast(String(err), true)); }); });
    for (const [selector, delta] of [['#font-down', -1], ['#font-up', 1]])
        root.querySelector(selector)?.addEventListener('click', () => { const fontSize = Math.max(14, Math.min(24, store.preferences.fontSize + delta)); qs('#transcript-content', root).style.setProperty('--reading-size', `${fontSize}px`); void store.setPreferences({ fontSize }).catch(err => toast(String(err), true)); });
    qs('#page-search', root).addEventListener('input', ev => { query = ev.target.value; clearTimeout(searchTimer); searchTimer = setTimeout(() => { if (view === 'summary' || view === 'image') {
        qs('#match-count', root).textContent = '全文表示で検索';
        return;
    } redrawText(); matchIndex = -1; }, 120); });
    qs('#next-match', root).addEventListener('click', () => { if (view === 'summary' || view === 'image') {
        navigateView('text');
        return;
    } const matches = root.querySelectorAll('.search-match'); if (!matches.length)
        return; matchIndex = (matchIndex + 1) % matches.length; matches[matchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    root.querySelectorAll('[data-figure]').forEach(b => b.addEventListener('click', () => { const f = figures.find(f => f.id === b.dataset.figure); imageDialog(f.image, f.title, f.description, readLink(f.page, f.section)); }));
    const section = params.get('section');
    const jumpTimer = setTimeout(() => { if (section) {
        const target = document.getElementById(section);
        target?.classList.add('target-flash');
        target?.scrollIntoView({ block: 'center' });
    } }, 100);
    return () => { clearTimeout(searchTimer); clearTimeout(jumpTimer); viewers.forEach(v => v.destroy()); };
}
