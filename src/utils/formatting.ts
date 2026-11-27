export type ChangeTypeKey = 'api-change' | 'feature' | 'enhancement' | 'bugfix';

export interface ChangeTypeMeta {
    key: ChangeTypeKey;
    label: string;
    badgeClass: string;
    dotClass: string;
}

const CHANGE_TYPE_META: Record<ChangeTypeKey, ChangeTypeMeta> = {
    'api-change': {
        key: 'api-change',
        label: 'API Change',
        badgeClass: 'text-teal-700 dark:text-teal-300 bg-teal-500/12',
        dotClass: 'bg-teal-500'
    },
    feature: {
        key: 'feature',
        label: 'Feature',
        badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/12',
        dotClass: 'bg-emerald-500'
    },
    enhancement: {
        key: 'enhancement',
        label: 'Enhancement',
        badgeClass: 'text-sky-700 dark:text-sky-300 bg-sky-500/12',
        dotClass: 'bg-sky-500'
    },
    bugfix: {
        key: 'bugfix',
        label: 'Bugfix',
        badgeClass: 'text-rose-700 dark:text-rose-300 bg-rose-500/12',
        dotClass: 'bg-rose-500'
    }
};

export function slugifyService(serviceName: string): string {
    if (!serviceName) return '';
    return String(serviceName)
        .toLowerCase()
        .trim()
        .replace(/[\._\s]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export function getServiceColorClass(serviceName: string): string {
    if (!serviceName) return 'bg-slate-500/10 text-slate-700 dark:text-slate-300';
    const classes = [
        'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/20',
        'bg-violet-500/12 text-violet-700 dark:text-violet-300 hover:bg-violet-500/20',
        'bg-cyan-500/12 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20',
        'bg-teal-500/12 text-teal-700 dark:text-teal-300 hover:bg-teal-500/20',
        'bg-slate-500/12 text-slate-700 dark:text-slate-300 hover:bg-slate-500/20'
    ];
    let hash = 0;
    for (let i = 0; i < serviceName.length; i++) {
        hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return classes[Math.abs(hash) % classes.length];
}

export function normalizeChangeType(rawType?: string, description?: string): ChangeTypeMeta {
    const raw = (rawType || '').toLowerCase().trim();
    if (raw) {
        if (raw.includes('fix')) return CHANGE_TYPE_META.bugfix;
        if (raw.includes('enhan') || raw.includes('enchan')) return CHANGE_TYPE_META.enhancement;
        if (raw.includes('feature')) return CHANGE_TYPE_META.feature;
        if (raw.includes('api')) return CHANGE_TYPE_META['api-change'];
    }

    const text = (description || '').toLowerCase();
    if (text) {
        if (/\bfix(ed|es|ing)?\b|\bbug\b|\bissue\b|\bresolv(e|ed|ing)\b|\bcorrect(ed|s)?\b/.test(text)) {
            return CHANGE_TYPE_META.bugfix;
        }
        if (/\bdocumentation\b|\bdocstring\b|\benhanc(e|ed|ement)\b|\bendpoint[- ]rules\b/.test(text)) {
            return CHANGE_TYPE_META.enhancement;
        }
        if (/\binitial release\b|\bintroduc(e|es|ed|ing)\b|\bnew feature\b/.test(text)) {
            return CHANGE_TYPE_META.feature;
        }
    }

    return CHANGE_TYPE_META['api-change'];
}

export function escapeHtml(str: string): string {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function highlightText(text: string, search?: string): string {
    const escaped = escapeHtml(text);
    if (!search || !search.trim()) return escaped;
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearch})`, 'gi');
    return escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
}

export function formatDescription(text: string, search?: string): string {
    if (!text) return '';
    let formatted = escapeHtml(text);

    formatted = formatted.replace(
        /`([^`]+?)\s*&lt;(https?:\/\/[^&>]+?)&gt;`_+/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold underline decoration-indigo-400/40 hover:decoration-indigo-500 transition-colors">$1</a>'
    );

    formatted = formatted.replace(
        /``([^`]+?)``/g,
        '<code class="inline-code">$1</code>'
    );

    formatted = formatted.replace(
        /`([^`]+?)`/g,
        '<code class="inline-code">$1</code>'
    );

    formatted = formatted.replace(
        /(^|[^"'])(https?:\/\/[a-zA-Z0-9\-\._~:\/\?#\[\]@!$&'()*+,;=%]+)/g,
        '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium break-all">$2</a>'
    );

    if (search && search.trim()) {
        const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?![^<]*>)(${escapedSearch})`, 'gi');
        formatted = formatted.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    return formatted;
}

export function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

export function getRelativeDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const dateUtc = Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const now = new Date();
    const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const diffDays = Math.max(0, Math.floor((todayUtc - dateUtc) / (1000 * 60 * 60 * 24)));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
}

export function getMonthYear(dateStr: string): string {
    if (!dateStr) return 'Unknown Date';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    }
    return 'Unknown Date';
}

export function makeEntryAnchorId(prefix: string, index: number): string {
    const clean = slugifyService(prefix) || 'core';
    return `entry-${clean}-${index}`;
}

export function trimDescription(text: string, maxLength = 155): string {
    if (!text || text.length <= maxLength) return text;
    const sliced = text.slice(0, maxLength - 1);
    const lastSpace = sliced.lastIndexOf(' ');
    const base = lastSpace > maxLength * 0.6 ? sliced.slice(0, lastSpace) : sliced;
    return `${base.replace(/[,:;.\s]+$/, '')}.`;
}
