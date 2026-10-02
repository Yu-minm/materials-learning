import { e, icon, qs, toast, formatTime, materialImageURL } from '../lib/dom.js';
import { createSession, typeLabels } from '../lib/quiz.js';
import { heading, categoryOptions, emptyState } from '../components/common.js';
import { readLink } from '../lib/router.js';
import { imageDialog } from '../components/viewer.js';
export function renderQuiz(root, ctx, params) {
    const { catalog, store } = ctx;
    let session = null;
    let selected = '';
    let started = performance.now();
    let grading = false;
    function setup() {
        const page = Number(params.get('page'));
        const category = params.get('category') ?? '';
        const count = catalog.questions.filter(q => (!category || q.category === category) && (!page || q.sources.some(s => s.page === page))).length;
        root.innerHTML = heading('PRACTICE & UNDERSTAND', 'クイズモード', '原理理解・現場判断・分析手法選択・原因推定・データ解釈を、教材の根拠と一緒に確認します。') + `<div class="quiz-start-grid"><section class="panel quiz-setup"><h2>今回の学習を設定</h2><p class="muted">${page ? `p${page}を根拠にした問題を練習します。` : '正解だけでなく、誤答の理由も確認しましょう。'}</p><label class="field-label" for="quiz-category">学習テーマ</label><select id="quiz-category">${categoryOptions(ctx, category)}</select><label class="field-label" for="quiz-type">問題形式</label><select id="quiz-type"><option value="">すべての形式</option>${Object.entries(typeLabels).map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select><label class="field-label" for="quiz-count">出題数</label><div class="count-options">${[5, 10, 20].map(n => `<label><input type="radio" name="count" value="${n}" ${n === 10 ? 'checked' : ''}/><span>${n}問</span></label>`).join('')}<label><input type="radio" name="count" value="9999"/><span>すべて</span></label></div><p class="small muted" id="available-count">対象 ${count}問。問題と選択肢は開始時に並べ替えます。</p><button class="button primary full-width" id="start-quiz">演習を始める ${icon('arrow', 18)}</button>${store.session && store.session.index < store.session.ids.length ? '<button class="button secondary full-width" id="resume-quiz">中断した演習に戻る</button>' : ''}</section><section class="quiz-guide"><div class="guide-number">01</div><h3>条件を読み、判断する</h3><p>ケーススタディの条件は演習用に設定しています。教材の分析事例そのものと区別してください。</p><div class="guide-number">02</div><h3>正解と誤答の理由を確認する</h3><p>各選択肢に解説があります。なぜ別の手法では判断しきれないかまで確認します。</p><div class="guide-number">03</div><h3>根拠をたどり、原文へ戻る</h3><p>すべての問題に根拠ページと参照箇所があります。原文を読んだ後も演習を続けられます。</p><div class="notice">p40〜50のEDXは蛍光X線分析装置です。SEM-EDXと同じ装置として扱わないでください。<a href="${readLink(42)}">p42を確認</a></div></section></div>`;
        const pool = () => catalog.questions.filter(q => (!qs('#quiz-category', root).value || q.category === qs('#quiz-category', root).value) && (!qs('#quiz-type', root).value || q.type === qs('#quiz-type', root).value) && (!page || q.sources.some(s => s.page === page)));
        const update = () => { qs('#available-count', root).textContent = `対象 ${pool().length}問。出題数は対象問題数を上限とします。`; qs('#start-quiz', root).disabled = !pool().length; };
        root.querySelectorAll('select').forEach(s => s.addEventListener('change', update));
        qs('#start-quiz', root).addEventListener('click', () => { const count = Number(qs('input[name="count"]:checked', root).value); session = createSession(pool(), count); void store.saveSession(session).catch(err => toast(String(err), true)); drawQuestion(); });
        root.querySelector('#resume-quiz')?.addEventListener('click', () => { session = store.session; drawQuestion(); });
    }
    function result() {
        if (!session)
            return;
        const correct = session.ids.filter(id => { const q = catalog.questions.find(q => q.id === id); return q?.answer === session.responses[id]; }).length;
        root.innerHTML = heading('SESSION COMPLETE', '今回の演習結果', '解答記録は学習履歴に保存されます。間違えた問題は苦手問題モードで復習できます。') + `<section class="result-hero panel"><div class="score-ring" style="--score:${correct / session.ids.length * 100}%"><strong>${correct}<small> / ${session.ids.length}</small></strong><span>正解</span></div><div><h2>${correct === session.ids.length ? 'すべての問いを確認しました' : '根拠を確認して、理解をもう一歩'}</h2><p>正答率 ${Math.round(correct / session.ids.length * 100)}% · セッション経過 ${formatTime((Date.now() - session.startedAt) / 1000)}</p><div class="button-row"><a class="button primary" href="#/weak">苦手問題を復習</a><button class="button secondary" id="another-session">別の問題を解く</button></div></div></section><section class="panel"><h2>問題ごとの確認</h2>${session.ids.map(id => { const q = catalog.questions.find(q => q.id === id); const ok = session.responses[id] === q.answer; return `<div class="result-row"><span class="result-icon ${ok ? 'correct' : 'incorrect'}">${ok ? '✓' : '×'}</span><div><strong>${e(q.prompt)}</strong><p class="small muted">${e(q.explanation)}</p><div class="button-row">${q.sources.map(s => `<a class="text-link" href="${readLink(s.page, s.section)}">p${s.page}の根拠</a>`).join('')}<a class="text-link" href="#/quiz?question=${encodeURIComponent(q.id)}">もう一度解く</a></div></div></div>`; }).join('')}</section>`;
        qs('#another-session', root).addEventListener('click', () => { session = null; params.delete('question'); params.delete('resume'); setup(); });
    }
    function drawQuestion() {
        if (!session || !session.ids.length) {
            root.innerHTML = emptyState('対象問題がありません', 'カテゴリまたは問題形式を変更してください。', '<a class="button" href="#/quiz">出題設定へ</a>');
            return;
        }
        if (session.index >= session.ids.length) {
            result();
            return;
        }
        const q = catalog.questions.find(q => q.id === session.ids[session.index]);
        if (!q) {
            setup();
            return;
        }
        selected = session.responses[q.id] ?? '';
        started = performance.now();
        grading = false;
        const answered = Boolean(session.responses[q.id]);
        const category = catalog.categories.find(c => c.id === q.category);
        const order = session.orders[q.id] ?? q.choices.map(c => c.id);
        const figure = q.figureId ? catalog.figures.find(f => f.id === q.figureId) : null;
        root.innerHTML = `<header class="quiz-header"><div><p class="eyebrow">${e(category.short)} · ${e(q.skill)}</p><h1>理解を確かめる</h1></div><a class="text-link" href="#/quiz">設定に戻る</a></header><div class="quiz-progress"><span>QUESTION <strong>${String(session.index + 1).padStart(2, '0')}</strong> / ${session.ids.length}</span><progress value="${session.index + (answered ? 1 : 0)}" max="${session.ids.length}" aria-label="演習の進捗"></progress></div><section class="question-panel panel"><div class="question-meta"><span class="badge">${typeLabels[q.type]}</span><span class="small muted">${q.type === 'case' ? '教材をもとにした演習事例' : '教材に基づく理解度確認'}</span></div><h2 class="question-prompt">${e(q.prompt)}</h2>${figure ? `<button class="quiz-figure" id="quiz-figure"><img src="${e(materialImageURL(figure.image))}" alt="${e(figure.title)}"/><span>${e(figure.title)} · p${figure.page} · クリックで拡大</span></button>` : ''}<div class="choices" role="radiogroup" aria-label="解答の選択肢">${order.map((id, i) => { const c = q.choices.find(c => c.id === id); const state = answered ? (c.id === q.answer ? 'correct' : c.id === selected ? 'incorrect' : '') : ''; return `<button class="choice ${selected === c.id ? 'selected' : ''} ${state}" role="radio" aria-checked="${selected === c.id}" data-choice="${e(c.id)}" ${answered ? 'disabled' : ''}><span class="choice-letter">${String.fromCharCode(65 + i)}</span><span>${e(c.text)}</span>${answered && c.id === q.answer ? icon('check', 18) : ''}</button>`; }).join('')}</div><div id="answer-area">${answered ? explanation(q, order) : `<div class="answer-controls"><p class="small muted">選択肢を選んでから解答してください。</p><button class="button primary" id="grade-answer" disabled>解答する ${icon('arrow', 17)}</button></div>`}</div></section>`;
        root.querySelectorAll('[data-choice]').forEach(b => b.addEventListener('click', () => { if (answered)
            return; selected = b.dataset.choice; root.querySelectorAll('[data-choice]').forEach(x => { const checked = x.dataset.choice === selected; x.classList.toggle('selected', checked); x.setAttribute('aria-checked', String(checked)); }); qs('#grade-answer', root).disabled = false; }));
        root.querySelector('#grade-answer')?.addEventListener('click', async () => { if (grading || !selected || !session || session.responses[q.id])
            return; grading = true; qs('#grade-answer', root).disabled = true; session.responses[q.id] = selected; try {
            await store.addAttempt({ id: `${session.startedAt}:${session.index}:${q.id}`, questionId: q.id, choiceId: selected, correct: selected === q.answer, at: Date.now(), durationSeconds: Math.max(0, Math.round((performance.now() - started) / 1000)) });
            await store.saveSession(session);
        }
        catch (err) {
            toast(String(err), true);
        } drawQuestion(); root.querySelector('#answer-area')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
        if (figure)
            root.querySelector('#quiz-figure')?.addEventListener('click', () => imageDialog(figure.image, figure.title, figure.description));
        root.querySelector('#next-question')?.addEventListener('click', () => { if (!session)
            return; session.index++; void store.saveSession(session).catch(err => toast(String(err), true)); drawQuestion(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
    function explanation(q, order) { const correct = selected === q.answer; return `<div class="answer-feedback ${correct ? 'correct' : 'incorrect'}" role="status"><strong>${correct ? '正解です' : '今回の解答は不正解です'}</strong><p>${e(q.explanation)}</p></div><section class="choice-explanations"><h3>選択肢ごとの解説</h3>${order.map((id, i) => { const c = q.choices.find(c => c.id === id); return `<div><span class="choice-letter ${c.id === q.answer ? 'correct' : ''}">${String.fromCharCode(65 + i)}</span><p><strong>${c.id === q.answer ? '正解' : '誤答'}：${e(c.text)}</strong><br/>${e(c.explanation)}</p></div>`; }).join('')}</section><section class="evidence-box"><h3>${icon('book', 18)} 教材の根拠</h3>${q.sources.map(s => `<div><a class="source-link" href="${readLink(s.page, s.section)}">p${s.page} · 参照箇所を開く ${icon('arrow', 16)}</a><blockquote>${e(s.quote)}</blockquote></div>`).join('')}<p class="small muted">原文を確認した後は、上部の「演習に戻る」から再開できます。</p></section><div class="answer-controls"><span class="small muted">${correct ? '解答を記録しました。' : '苦手問題にも記録しました。'}</span><button class="button primary" id="next-question">${session && session.index === session.ids.length - 1 ? '結果を見る' : '次の問題へ'} ${icon('arrow', 17)}</button></div>`; }
    if (params.get('question')) {
        const q = catalog.questions.find(q => q.id === params.get('question'));
        if (q) {
            session = createSession([q], 1);
            void store.saveSession(session).catch(err => toast(String(err), true));
            drawQuestion();
        }
        else
            setup();
    }
    else if (params.get('resume') === '1' && store.session) {
        session = store.session;
        drawQuestion();
    }
    else
        setup();
    return () => { };
}
