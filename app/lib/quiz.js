export function shuffle(values, random = Math.random) { const a = [...values]; for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
} return a; }
export function createSession(questions, count) { const items = shuffle(questions).slice(0, count); return { ids: items.map(q => q.id), index: 0, orders: Object.fromEntries(items.map(q => [q.id, shuffle(q.choices.map(c => c.id))])), responses: {}, startedAt: Date.now() }; }
export function questionStats(id, attempts) { const rows = attempts.filter(a => a.questionId === id).sort((a, b) => a.at - b.at); const wrong = rows.filter(a => !a.correct).length; let streak = 0; for (let i = rows.length - 1; i >= 0 && rows[i]?.correct; i--)
    streak++; const last = rows.at(-1); const mastered = wrong > 0 && streak >= 2; return { total: rows.length, correct: rows.length - wrong, wrong, streak, mastered, weak: wrong > 0 && !mastered, last: last?.at ?? 0, due: last ? (last.at + [1, 1, 3, 7, 14][Math.min(streak, 4)] * 86400000) : 0, rows }; }
export const typeLabels = { single: '単一選択', case: 'ケーススタディ', figure: '図表読解', method: '分析手法選択' };
