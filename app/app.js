import { LearningStore } from './lib/storage.js';
import { e, icon, qs, toast } from './lib/dom.js';
import { currentRoute, navigate } from './lib/router.js';
import { renderHome } from './features/home.js';
import { renderReader } from './features/reader.js';
import { renderQuiz } from './features/quiz-mode.js';
import { renderSearch } from './features/search-mode.js';
import { renderFigures } from './features/figures.js';
import { renderTerms } from './features/terms.js';
import { renderHistory } from './features/history.js';
import { renderWeak } from './features/weak.js';
const store = new LearningStore();
let catalog;
let cleanup = () => { };
let activePage;
let lastActivity = Date.now();
let lastTick = Date.now();
let unflushed = 0;
let focused = document.hasFocus();
function applyTheme() { const theme = store.preferences.theme; const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches); document.documentElement.dataset.theme = dark ? 'dark' : 'light'; const button = document.getElementById('theme-toggle'); if (button) {
    button.innerHTML = icon(dark ? 'sun' : 'moon', 18);
    button.setAttribute('aria-label', dark ? 'ライトモードに切り替え' : 'ダークモードに切り替え');
} }
function flushTime() { if (unflushed > 0) {
    const seconds = unflushed;
    unflushed = 0;
    void store.recordTime(seconds, activePage).catch(() => { });
} }
function frame() {
    const nav = [['/', 'home', '学習ホーム'], ['/read', 'book', '閲覧モード'], ['/quiz', 'quiz', 'クイズモード'], ['/figures', 'figure', '図表一覧'], ['/terms', 'terms', '用語辞典'], ['/weak', 'weak', '苦手問題'], ['/history', 'history', '学習履歴']];
    document.getElementById('app').innerHTML = `<a class="skip-link" href="#main">本文へ移動</a><aside class="sidebar" id="sidebar"><a class="brand" href="#/"><span class="brand-symbol">${icon('layers', 24)}</span><span>MATERIALS<span>LEARNING LAB</span></span></a><p class="sidebar-label">LEARN & EXPLORE</p><nav aria-label="メインナビゲーション">${nav.map(([path, i, title]) => `<a data-nav="${path}" href="#${path === '/read' ? '/read/p40' : path}">${icon(i, 19)}<span>${title}</span></a>`).join('')}</nav><div class="sidebar-bottom"><div class="local-badge">${icon('lock', 16)}<span>LOCAL WORKSPACE<small>学習記録は端末内に保存</small></span></div><a href="#/history" class="sidebar-help">バックアップとオフライン利用</a><p>TECHNICAL MATERIALS · 3 THEMES</p></div></aside><button class="nav-backdrop" id="nav-backdrop" aria-label="メニューを閉じる"></button><div class="workspace"><header class="topbar"><button class="icon-button mobile-menu" id="menu-toggle" aria-label="メニューを開く" aria-expanded="false">${icon('menu')}</button><span class="workspace-label">技術資料の学習ワークスペース</span><form id="global-search" class="global-search"><label class="search-field">${icon('search', 17)}<input type="search" name="q" aria-label="全教材を検索" placeholder="教材・用語を検索"/><kbd>/</kbd></label></form><a class="resume-link" href="#/quiz?resume=1">演習に戻る</a><button id="theme-toggle" class="icon-button" aria-label="ダークモードに切り替え">${icon('moon', 18)}</button></header><div id="storage-warning" class="storage-warning" role="alert" hidden>この環境では学習記録を保存できません。学習履歴からバックアップを保存してください。</div><main id="main" tabindex="-1"></main><footer class="site-footer"><span>MATERIALS LEARNING LAB · 画像：スキャン版</span><span>原文を確認する。判断の根拠を残す。</span><span><a href="#/history">データ管理</a> / <a href="./check.html">配置チェック</a></span></footer></div><div id="toasts" class="toasts" aria-live="polite"></div>`;
    qs('#global-search').addEventListener('submit', ev => { ev.preventDefault(); const q = new FormData(ev.currentTarget).get('q'); navigate('/search?q=' + encodeURIComponent(String(q ?? ''))); });
    qs('#theme-toggle').addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; void store.setPreferences({ theme }).catch(err => toast(String(err), true)); applyTheme(); });
    qs('#menu-toggle').addEventListener('click', () => { document.body.classList.toggle('nav-open'); qs('#menu-toggle').setAttribute('aria-expanded', String(document.body.classList.contains('nav-open'))); });
    qs('#nav-backdrop').addEventListener('click', () => document.body.classList.remove('nav-open'));
    qs('.skip-link').addEventListener('click', ev => { ev.preventDefault(); qs('#main').focus(); });
}
const ctx = { get catalog() { return catalog; }, store, refresh: () => render() };
function render() {
    cleanup();
    cleanup = () => { };
    flushTime();
    const route = currentRoute();
    const pageMatch = route.path.match(/^\/read\/p(\d+)$/);
    const nextPage = pageMatch && catalog.pages.some(p => p.number === Number(pageMatch[1])) ? Number(pageMatch[1]) : undefined;
    if (nextPage !== undefined && nextPage !== activePage)
        void store.visit(nextPage).catch(() => { });
    activePage = nextPage;
    const root = qs('#main');
    root.className = route.path.startsWith('/read') ? 'reader-content' : 'main-content';
    document.body.classList.remove('nav-open');
    qs('#menu-toggle').setAttribute('aria-expanded', 'false');
    document.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === '/' ? route.path === '/' : route.path.startsWith(a.dataset.nav)));
    try {
        if (route.path === '/')
            renderHome(root, ctx);
        else if (pageMatch)
            cleanup = renderReader(root, ctx, `p${nextPage}`, route.params);
        else if (route.path === '/quiz')
            cleanup = renderQuiz(root, ctx, route.params);
        else if (route.path === '/search')
            renderSearch(root, ctx, route.params);
        else if (route.path === '/figures')
            renderFigures(root, ctx, route.params);
        else if (route.path === '/terms')
            renderTerms(root, ctx, route.params);
        else if (route.path === '/history')
            renderHistory(root, ctx);
        else if (route.path === '/weak')
            renderWeak(root, ctx);
        else
            root.innerHTML = '<section class="empty-state"><h1>ページが見つかりません</h1><a class="button primary" href="#/">学習ホームへ</a></section>';
    }
    catch (error) {
        console.error(error);
        root.innerHTML = `<section class="empty-state"><h1>画面を表示できませんでした</h1><p>${e(String(error))}</p><a class="button primary" href="#/">学習ホームへ</a></section>`;
    }
    applyTheme();
    qs('#storage-warning').hidden = store.persistent;
    document.title = `${root.querySelector('h1')?.textContent ?? '技術資料学習'} | MATERIALS LEARNING LAB`;
    window.scrollTo(0, 0);
}
async function boot() {
    try {
        const response = await fetch('./data/catalog.json');
        if (!response.ok)
            throw new Error('教材データを読み込めません。');
        const raw = await response.json();
        if (typeof raw !== 'object' || !raw || !Array.isArray(raw.pages) || !Array.isArray(raw.questions))
            throw new Error('教材データの形式が不正です。');
        catalog = raw;
        await store.init();
        frame();
        render();
        window.addEventListener('hashchange', render);
        window.addEventListener('persistence-error', () => { const alert = document.getElementById('storage-warning'); if (alert)
            alert.hidden = false; });
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
        for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart'])
            document.addEventListener(type, () => { lastActivity = Date.now(); }, { passive: true });
        window.addEventListener('focus', () => { focused = true; lastTick = Date.now(); });
        window.addEventListener('blur', () => { focused = false; flushTime(); });
        document.addEventListener('visibilitychange', () => { lastTick = Date.now(); if (document.hidden)
            flushTime(); });
        window.addEventListener('pagehide', flushTime);
        document.addEventListener('keydown', ev => { const target = ev.target; if (ev.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
            ev.preventDefault();
            qs('#global-search input').focus();
        } if (ev.key === 'Escape')
            document.body.classList.remove('nav-open'); });
        setInterval(() => { const now = Date.now(); const elapsed = Math.min(2, (now - lastTick) / 1000); lastTick = now; const learning = !['/', '/history'].includes(currentRoute().path); if (learning && focused && !document.hidden && now - lastActivity < 90000)
            unflushed += elapsed; if (unflushed >= 5)
            flushTime(); }, 1000);
        if ('serviceWorker' in navigator)
            void navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(error => console.warn('Offline registration unavailable', error));
    }
    catch (error) {
        document.getElementById('app').innerHTML = `<main class="empty-state"><h1>教材を読み込めませんでした</h1><p>${e(String(error))}</p><p>ブラウザーでGitHub PagesのサイトURLを開いてください。リポジトリのファイル画面とHTMLのダブルクリック起動では動作しません。</p><p><a href="./check.html">配置チェックを開く</a></p><button onclick="location.reload()">再読み込み</button></main>`;
    }
}
void boot();
