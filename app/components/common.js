import { e, icon, materialImageURL } from '../lib/dom.js';
import { readLink } from '../lib/router.js';
import { typeLabels } from '../lib/quiz.js';
export function pageCard(ctx, p) { const progress = ctx.store.getPage(p.number); return `<a class="page-card" href="${readLink(p.number)}"><span class="page-number">p${p.number}</span><span class="page-card-text"><strong>${e(p.title)}</strong><small>${e(p.tags.slice(0, 3).join(' · '))}</small></span><span class="page-card-state">${progress.learned ? icon('check', 17) : progress.bookmark ? icon('bookmark', 17) : icon('arrow', 17)}</span></a>`; }
export function figureCard(f) { return `<button class="figure-card" data-figure="${e(f.id)}"><span class="figure-thumb"><img src="${e(materialImageURL(f.image))}" alt="${e(f.title)}" loading="lazy"/></span><span class="figure-card-info"><small>p${f.page} · 図表</small><strong>${e(f.title)}</strong></span></button>`; }
export function questionCard(q) { return `<a class="question-link" href="#/quiz?question=${encodeURIComponent(q.id)}"><span class="badge">${typeLabels[q.type]}</span><strong>${e(q.prompt)}</strong><span>${icon('arrow', 16)}</span></a>`; }
export function emptyState(title, description, action = '') { return `<div class="empty-state">${icon('book', 32)}<h3>${e(title)}</h3><p>${e(description)}</p>${action}</div>`; }
export function heading(kicker, title, description, action = '') { return `<header class="section-heading"><div><p class="eyebrow">${e(kicker)}</p><h1>${e(title)}</h1><p class="muted">${e(description)}</p></div>${action}</header>`; }
export function categoryOptions(ctx, selected = '') { return `<option value="">すべてのカテゴリ</option>${ctx.catalog.categories.map(c => `<option value="${c.id}" ${selected === c.id ? 'selected' : ''}>${e(c.short)}</option>`).join('')}`; }
