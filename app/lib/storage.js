import { localDay } from './dom.js';
const DEFAULT_PREFERENCES = { theme: 'system', readerView: 'split', fontSize: 17 };
export function emptyPage(page) { return { page, bookmark: false, learned: false, note: '', markers: [], lastViewed: 0, visits: 0, seconds: 0 }; }
function request(r) { return new Promise((resolve, reject) => { r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error ?? new Error('保存処理に失敗しました')); }); }
function transactionDone(tx) { return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error ?? new Error('保存処理に失敗しました')); tx.onabort = () => reject(tx.error ?? new Error('保存処理が中止されました')); }); }
function isRecord(x) { return typeof x === 'object' && x !== null && !Array.isArray(x); }
function finite(x) { return typeof x === 'number' && Number.isFinite(x) && x >= 0; }
export function validateBackup(input, catalog) {
    if (!isRecord(input) || input.schema !== 1 || input.catalogVersion !== catalog.version || typeof input.exportedAt !== 'string' || !Array.isArray(input.pages) || !Array.isArray(input.attempts) || !Array.isArray(input.days) || !isRecord(input.preferences))
        throw new Error('バックアップの形式または教材バージョンが一致しません。');
    if (input.pages.length > catalog.pages.length || input.attempts.length > 100000 || input.days.length > 20000)
        throw new Error('バックアップの件数が上限を超えています。');
    for (const p of input.pages) {
        if (!isRecord(p) || !finite(p.page) || !catalog.pages.some(x => x.number === p.page) || typeof p.bookmark !== 'boolean' || typeof p.learned !== 'boolean' || typeof p.note !== 'string' || p.note.length > 100000 || !Array.isArray(p.markers) || !finite(p.seconds) || !finite(p.lastViewed) || !finite(p.visits))
            throw new Error('ページ記録が不正です。');
        const page = catalog.pages.find(x => x.number === p.page);
        for (const m of p.markers) {
            if (!isRecord(m) || typeof m.id !== 'string' || typeof m.blockId !== 'string' || !finite(m.start) || !finite(m.end) || !Number.isInteger(m.start) || !Number.isInteger(m.end) || m.end <= m.start || typeof m.text !== 'string' || !['yellow', 'blue', 'red'].includes(String(m.color)) || !finite(m.createdAt))
                throw new Error('マーカーが不正です。');
            const b = page.blocks.find(b => b.id === m.blockId);
            if (!b || m.end > b.text.length || b.text.slice(m.start, m.end) !== m.text)
                throw new Error('マーカーと原文が一致しません。');
        }
    }
    for (const a of input.attempts) {
        if (!isRecord(a) || typeof a.id !== 'string' || typeof a.questionId !== 'string' || typeof a.choiceId !== 'string' || typeof a.correct !== 'boolean' || !finite(a.at) || !finite(a.durationSeconds))
            throw new Error('解答記録が不正です。');
        const q = catalog.questions.find(q => q.id === a.questionId);
        if (!q || !q.choices.some(c => c.id === a.choiceId) || a.correct !== (q.answer === a.choiceId))
            throw new Error('問題と解答記録が一致しません。');
    }
    for (const d of input.days) {
        if (!isRecord(d) || typeof d.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.day) || !finite(d.seconds))
            throw new Error('学習時間の記録が不正です。');
    }
    const prefs = input.preferences;
    if (!['light', 'dark', 'system'].includes(String(prefs.theme)) || !['image', 'summary', 'text', 'split'].includes(String(prefs.readerView)) || !finite(prefs.fontSize) || prefs.fontSize < 14 || prefs.fontSize > 24)
        throw new Error('表示設定が不正です。');
    return input;
}
// Each GitHub project gets independent records. This is not authentication.
export function databaseName(baseHref) {
    const path = new URL('./', baseHref).pathname;
    return path === '/' ? 'materials-learning-v1' : 'materials-learning-v1:' + encodeURIComponent(path);
}
export class LearningStore {
    pages = new Map();
    attempts = [];
    days = new Map();
    preferences = { ...DEFAULT_PREFERENCES };
    session = null;
    persistent = true;
    db = null;
    queue = Promise.resolve();
    async init() {
        try {
            this.db = await new Promise((resolve, reject) => { const r = indexedDB.open(databaseName(document.baseURI), 1); r.onupgradeneeded = () => { const db = r.result; db.createObjectStore('pages', { keyPath: 'page' }); db.createObjectStore('attempts', { keyPath: 'id' }); db.createObjectStore('days', { keyPath: 'day' }); db.createObjectStore('settings', { keyPath: 'key' }); }; r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); r.onblocked = () => reject(new Error('別タブのデータベース接続を閉じてください。')); });
            this.db.onversionchange = () => { this.db?.close(); this.fail(); };
            this.db.onclose = () => this.fail();
            const tx = this.db.transaction(['pages', 'attempts', 'days', 'settings'], 'readonly');
            const done = transactionDone(tx);
            const [pages, attempts, days, settings] = await Promise.all([request(tx.objectStore('pages').getAll()), request(tx.objectStore('attempts').getAll()), request(tx.objectStore('days').getAll()), request(tx.objectStore('settings').getAll())]);
            await done;
            this.pages = new Map(pages.map(p => [p.page, p]));
            this.attempts = attempts;
            this.days = new Map(days.map(d => [d.day, d]));
            const prefs = settings.find(s => s.key === 'preferences')?.value;
            if (prefs && isRecord(prefs))
                this.preferences = { ...DEFAULT_PREFERENCES, ...prefs };
            const session = settings.find(s => s.key === 'session')?.value;
            if (session && isRecord(session) && Array.isArray(session.ids))
                this.session = session;
        }
        catch (error) {
            console.error(error);
            this.fail();
        }
    }
    fail() { this.persistent = false; window.dispatchEvent(new CustomEvent('persistence-error')); }
    persist(stores, write) {
        const job = this.queue.then(async () => { if (!this.db || !this.persistent)
            throw new Error('端末への保存が利用できません。バックアップを保存してください。'); const tx = this.db.transaction(stores, 'readwrite'); const done = transactionDone(tx); write(tx); await done; });
        this.queue = job.catch(() => { this.fail(); });
        return job;
    }
    getPage(number) { return this.pages.get(number) ?? emptyPage(number); }
    async updatePage(number, patch) { const p = { ...this.getPage(number), ...patch, page: number }; this.pages.set(number, p); await this.persist(['pages'], tx => { tx.objectStore('pages').put(p); }); }
    async visit(number) { const p = this.getPage(number); await this.updatePage(number, { lastViewed: Date.now(), visits: p.visits + 1 }); }
    async recordTime(seconds, page) { const day = localDay(); const d = { day, seconds: (this.days.get(day)?.seconds ?? 0) + seconds }; this.days.set(day, d); let p; if (page !== undefined) {
        p = { ...this.getPage(page), seconds: this.getPage(page).seconds + seconds };
        this.pages.set(page, p);
    } await this.persist(p ? ['days', 'pages'] : ['days'], tx => { tx.objectStore('days').put(d); if (p)
        tx.objectStore('pages').put(p); }); }
    async addAttempt(a) { if (this.attempts.some(x => x.id === a.id))
        return; this.attempts.push(a); await this.persist(['attempts'], tx => { tx.objectStore('attempts').put(a); }); }
    async setPreferences(patch) { this.preferences = { ...this.preferences, ...patch }; await this.persist(['settings'], tx => { tx.objectStore('settings').put({ key: 'preferences', value: this.preferences }); }); }
    async saveSession(s) { this.session = s; await this.persist(['settings'], tx => { tx.objectStore('settings').put({ key: 'session', value: s }); }); }
    backup(catalogVersion) { return { schema: 1, catalogVersion, exportedAt: new Date().toISOString(), pages: [...this.pages.values()], attempts: [...this.attempts], days: [...this.days.values()], preferences: { ...this.preferences } }; }
    async importBackup(raw, catalog) {
        const b = validateBackup(raw, catalog);
        const pages = new Map(this.pages);
        for (const incoming of b.pages) {
            const existing = pages.get(incoming.page);
            pages.set(incoming.page, existing ? { ...incoming, lastViewed: Math.max(existing.lastViewed, incoming.lastViewed), visits: Math.max(existing.visits, incoming.visits), seconds: Math.max(existing.seconds, incoming.seconds), markers: [...new Map([...existing.markers, ...incoming.markers].map(m => [m.id, m])).values()] } : incoming);
        }
        const attempts = [...new Map([...this.attempts, ...b.attempts].map(a => [a.id, a])).values()];
        const days = new Map(this.days);
        for (const d of b.days)
            days.set(d.day, { day: d.day, seconds: Math.max(d.seconds, days.get(d.day)?.seconds ?? 0) });
        await this.persist(['pages', 'attempts', 'days', 'settings'], tx => { for (const p of pages.values())
            tx.objectStore('pages').put(p); for (const a of attempts)
            tx.objectStore('attempts').put(a); for (const d of days.values())
            tx.objectStore('days').put(d); tx.objectStore('settings').put({ key: 'preferences', value: b.preferences }); });
        this.pages = pages;
        this.attempts = attempts;
        this.days = days;
        this.preferences = b.preferences;
    }
    async flush() { await this.queue; }
}
