import { e, qs, formatTime, formatDate, localDay, downloadJSON, toast } from '../lib/dom.js';
import { heading, pageCard, emptyState } from '../components/common.js';
import { accuracyTrend } from '../components/trend.js';
import { validateBackup } from '../lib/storage.js';
export function renderHistory(root, ctx) {
    const { catalog, store } = ctx;
    const learned = catalog.pages.filter(p => store.getPage(p.number).learned).length;
    const visited = catalog.pages.filter(p => store.getPage(p.number).visits > 0).sort((a, b) => store.getPage(b.number).lastViewed - store.getPage(a.number).lastViewed);
    const bookmarks = catalog.pages.filter(p => store.getPage(p.number).bookmark);
    const notes = catalog.pages.filter(p => store.getPage(p.number).note || store.getPage(p.number).markers.length);
    const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 13 + i); const day = localDay(d.getTime()); return { day, seconds: store.days.get(day)?.seconds ?? 0 }; });
    const max = Math.max(60, ...days.map(d => d.seconds));
    const total = [...store.days.values()].reduce((n, d) => n + d.seconds, 0);
    root.innerHTML = heading('YOUR LEARNING RECORD', '学習履歴', '閲覧・演習・しおり・メモを、この端末のIndexedDBに保存しています。') + `<div class="history-overview"><section class="panel"><h2>ページの学習状況</h2><div class="large-stat">${learned}<small> / ${catalog.pages.length}ページ</small></div><progress max="${catalog.pages.length}" value="${learned}" aria-label="学習済みページの進捗"></progress><p class="small muted">学習済み ${Math.round(learned / catalog.pages.length * 100)}% · 閲覧済み ${visited.length}ページ</p><p class="small muted">「学習済み」は閲覧画面のボタンで記録します。閲覧だけでは学習済みにしません。</p></section><section class="panel"><h2>演習の正答率推移</h2>${accuracyTrend(store.attempts)}<p class="small muted">全解答の累計正答率。未解答の問題は含みません。</p></section><section class="panel"><h2>学習時間</h2><div class="large-stat">${formatTime(total)}</div><p>今日 ${formatTime(store.days.get(localDay())?.seconds ?? 0)}</p><p class="small muted">画面が表示され、操作後90秒以内の学習時間を集計します。バックグラウンドの時間は含みません。</p></section></div><section class="panel"><div class="section-title compact"><h2>直近14日間</h2><span class="small muted">実際に操作した学習時間</span></div><div class="activity-chart" role="img" aria-label="日別の学習時間">${days.map(d => `<div class="activity-day" title="${d.day}: ${formatTime(d.seconds)}"><span>${d.seconds ? formatTime(d.seconds) : ''}</span><div class="activity-column"><i style="height:${Math.max(d.seconds ? 3 : 0, d.seconds / max * 100)}%"></i></div><small>${d.day.slice(5).replace('-', '/')}</small></div>`).join('')}</div></section><div class="history-lists"><section class="panel"><h2>最近見たページ</h2>${visited.length ? visited.slice(0, 8).map(p => pageCard(ctx, p)).join('') : emptyState('閲覧履歴はまだありません', '教材を開くと記録されます。')}</section><section class="panel"><h2>しおり <span class="small muted">${bookmarks.length}件</span></h2>${bookmarks.length ? bookmarks.map(p => pageCard(ctx, p)).join('') : emptyState('しおりはまだありません', '閲覧画面の「しおり」で保存できます。')}</section></div><section class="panel"><h2>メモ・マーカーがあるページ</h2>${notes.length ? notes.map(p => `<div class="note-record">${pageCard(ctx, p)}<p>${e(store.getPage(p.number).note.slice(0, 220))}</p><span class="small muted">マーカー ${store.getPage(p.number).markers.length}件</span></div>`).join('') : '<p class="muted">記録したページがここに表示されます。</p>'}</section><section class="panel"><h2>最近の解答</h2>${store.attempts.length ? `<div class="table-wrap"><table><thead><tr><th>日時</th><th>結果</th><th>問題</th><th>解答時間</th></tr></thead><tbody>${[...store.attempts].sort((a, b) => b.at - a.at).slice(0, 30).map(a => { const q = catalog.questions.find(q => q.id === a.questionId); return `<tr><td>${formatDate(a.at)}</td><td><span class="badge ${a.correct ? 'success' : 'warning'}">${a.correct ? '正解' : '不正解'}</span></td><td><a href="#/quiz?question=${encodeURIComponent(a.questionId)}">${e(q?.prompt ?? a.questionId)}</a></td><td>${formatTime(a.durationSeconds)}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="muted">演習を解くと記録されます。</p>'}</section><section class="panel data-settings"><h2>データとオフライン利用</h2><p>ブラウザーのデータ削除で学習記録も消えます。定期的にバックアップを保存してください。別の端末へはバックアップを読み込んで移行できます。</p><div class="button-row"><button class="button secondary" id="export-backup">バックアップを保存</button><button class="button secondary" id="import-backup">バックアップを読み込む</button><input class="sr-only" type="file" id="backup-file" accept="application/json,.json"/><button class="button secondary" id="cache-materials">教材をオフライン保存</button></div><p id="offline-status" class="small muted">オフライン保存の対象はアプリ・全文・ページ画像・図表です。高解像度のスキャン原本は含みません。</p><div class="notice">記録は端末・ブラウザー・配信URLごとに分かれます。クラウド同期や共有アカウント機能はありません。</div></section>`;
    qs('#export-backup', root).addEventListener('click', () => { downloadJSON(`materials-learning-backup-${localDay()}.json`, store.backup(catalog.version)); toast('バックアップを書き出しました。'); });
    const file = qs('#backup-file', root);
    qs('#import-backup', root).addEventListener('click', () => file.click());
    file.addEventListener('change', async () => { const f = file.files?.[0]; if (!f)
        return; try {
        if (f.size > 15000000)
            throw new Error('15MBを超えるファイルは読み込めません。');
        const raw = JSON.parse(await f.text());
        validateBackup(raw, catalog);
        if (!confirm('同じページのしおり・学習済み・メモはバックアップの内容で更新します。解答履歴とマーカーは重複を除いて統合します。続けますか？'))
            return;
        await store.importBackup(raw, catalog);
        toast('バックアップを読み込みました。');
        ctx.refresh();
    }
    catch (err) {
        toast(String(err), true);
    }
    finally {
        file.value = '';
    } });
    qs('#cache-materials', root).addEventListener('click', async () => { const button = qs('#cache-materials', root); const status = qs('#offline-status', root); if (!('serviceWorker' in navigator)) {
        toast('この環境ではオフライン保存を利用できません。', true);
        return;
    } button.disabled = true; status.textContent = '保存を準備しています…'; try {
        const registration = await navigator.serviceWorker.ready;
        const channel = new MessageChannel();
        channel.port1.onmessage = ev => { const d = ev.data; if (d.error) {
            status.textContent = d.error;
            button.disabled = false;
        }
        else if (d.done) {
            status.textContent = '教材のオフライン保存が完了しました。スキャン原本はオンラインで確認してください。';
            button.disabled = false;
        }
        else
            status.textContent = `教材を保存中 ${d.current ?? 0} / ${d.total ?? 0}`; };
        registration.active?.postMessage({ type: 'CACHE_MATERIALS' }, [channel.port2]);
    }
    catch (err) {
        button.disabled = false;
        status.textContent = String(err);
    } });
}
