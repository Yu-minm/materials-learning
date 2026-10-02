import { e, icon, qs, toast, materialImageURL } from '../lib/dom.js';
export function viewerHTML(src, alt) { return `<div class="image-viewer"><div class="viewer-toolbar"><span>${icon('figure', 16)} 原本画像</span><div><button type="button" data-zoom="out" aria-label="画像を縮小">−</button><button type="button" data-zoom="reset" title="表示位置をリセット">全体</button><button type="button" data-zoom="in" aria-label="画像を拡大">＋</button><button type="button" data-zoom="fullscreen" aria-label="全画面表示">${icon('expand', 17)}</button></div></div><div class="viewer-stage" tabindex="0" role="region" aria-label="拡大画像。プラスとマイナスで拡大縮小、ドラッグで移動"><img src="${e(materialImageURL(src))}" alt="${e(alt)}" draggable="false" decoding="async"/></div><p class="viewer-hint">ドラッグで移動 · 2本指で拡大 · ＋ / − キー</p></div>`; }
export function mountViewer(root) {
    const stage = qs('.viewer-stage', root);
    const image = qs('img', stage);
    let scale = 1, x = 0, y = 0;
    const pointers = new Map();
    let lastDistance = 0;
    const abort = new AbortController();
    const opts = { signal: abort.signal };
    function paint() { image.style.transform = `translate(${x}px,${y}px) scale(${scale})`; }
    function zoom(f) { scale = Math.max(1, Math.min(8, scale * f)); if (scale === 1) {
        x = 0;
        y = 0;
    } paint(); }
    root.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => { switch (button.dataset.zoom) {
        case 'in':
            zoom(1.3);
            break;
        case 'out':
            zoom(1 / 1.3);
            break;
        case 'reset':
            scale = 1;
            x = 0;
            y = 0;
            paint();
            break;
        case 'fullscreen': if (!document.fullscreenElement) {
            if (root.requestFullscreen)
                void root.requestFullscreen().catch(() => toast('この端末では全画面表示を利用できません。'));
            else
                toast('画像拡大ボタンをご利用ください。');
        }
        else
            void document.exitFullscreen();
    } }, opts));
    stage.addEventListener('pointerdown', ev => { pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); stage.setPointerCapture(ev.pointerId); stage.classList.add('dragging'); if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        lastDistance = Math.hypot(a.x - b.x, a.y - b.y);
    } }, opts);
    stage.addEventListener('pointermove', ev => { const prev = pointers.get(ev.pointerId); if (!prev)
        return; pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY }); if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastDistance > 0)
            zoom(d / lastDistance);
        lastDistance = d;
    }
    else {
        x += ev.clientX - prev.x;
        y += ev.clientY - prev.y;
        paint();
    } }, opts);
    const up = (ev) => { pointers.delete(ev.pointerId); lastDistance = 0; if (!pointers.size)
        stage.classList.remove('dragging'); };
    stage.addEventListener('pointerup', up, opts);
    stage.addEventListener('pointercancel', up, opts);
    stage.addEventListener('wheel', ev => { if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault();
        zoom(ev.deltaY < 0 ? 1.12 : 1 / 1.12);
    } }, { passive: false, signal: abort.signal });
    stage.addEventListener('keydown', ev => { if (ev.key === '+' || ev.key === '=') {
        ev.preventDefault();
        zoom(1.3);
    } if (ev.key === '-') {
        ev.preventDefault();
        zoom(1 / 1.3);
    } if (ev.key === '0') {
        scale = 1;
        x = 0;
        y = 0;
        paint();
    } }, opts);
    image.addEventListener('error', () => { const error = document.createElement('p'); error.className = 'notice danger'; error.textContent = '画像を読み込めませんでした。オンライン時は画面下部の「配置チェック」でアップロード漏れを確認してください。スキャン原本はオフライン保存の対象外です。'; stage.append(error); }, opts);
    return { destroy: () => abort.abort() };
}
export function imageDialog(src, title, description = '', link = '') { const dialog = document.createElement('dialog'); dialog.className = 'image-dialog'; dialog.innerHTML = `<div class="dialog-head"><h2>${e(title)}</h2><button class="icon-button close-dialog" aria-label="閉じる">${icon('close')}</button></div>${viewerHTML(src, title)}<div class="dialog-description"><p>${e(description)}</p>${link ? `<a class="button small" href="${e(link)}">根拠ページを開く ${icon('arrow', 16)}</a>` : ''}</div>`; document.body.append(dialog); const handle = mountViewer(qs('.image-viewer', dialog)); qs('.close-dialog', dialog).addEventListener('click', () => dialog.close()); dialog.querySelector('a')?.addEventListener('click', () => dialog.close()); dialog.addEventListener('click', ev => { if (ev.target === dialog)
    dialog.close(); }); dialog.addEventListener('close', () => { handle.destroy(); dialog.remove(); }); dialog.showModal(); }
