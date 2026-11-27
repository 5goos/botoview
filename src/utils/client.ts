import {
    escapeHtml,
    formatDate,
    formatDescription,
    getMonthYear,
    getRelativeDate,
    getServiceColorClass,
    highlightText,
    makeEntryAnchorId,
    normalizeChangeType,
    slugifyService
} from './formatting';

export {
    escapeHtml,
    formatDate,
    formatDescription,
    getMonthYear,
    getRelativeDate,
    getServiceColorClass,
    highlightText,
    makeEntryAnchorId,
    normalizeChangeType,
    slugifyService
};

export interface TrackPayload {
    versions: Array<{ id: string; date: string }>;
    allServices: string[];
    serviceCounts: Record<string, number>;
}

const DARK_BG = '#090B10';
const LIGHT_BG = '#F4F6FA';

export function readPageData<T>(elementId: string, fallback: T): T {
    try {
        const el = document.getElementById(elementId);
        if (!el || !el.textContent) return fallback;
        return JSON.parse(el.textContent) as T;
    } catch {
        return fallback;
    }
}

export function syncThemeMeta(isDark: boolean): void {
    const color = isDark ? DARK_BG : LIGHT_BG;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
        meta.setAttribute('content', color);
    });
}

export function toggleThemeState(): boolean {
    const nextDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextDark);
    try {
        localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    } catch {}
    syncThemeMeta(nextDark);
    window.dispatchEvent(new CustomEvent('boto:theme-changed', { detail: { isDark: nextDark } }));
    return nextDark;
}

export async function copyToClipboardText(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {}

    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus({ preventScroll: true });
        textarea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textarea);
        return ok;
    } catch {
        return false;
    }
}

export function emitToast(message: string): void {
    window.dispatchEvent(new CustomEvent('boto:toast', { detail: { message } }));
}

let trackPromise: Promise<TrackPayload> | null = null;

export async function loadTrackIndex(): Promise<TrackPayload> {
    const win = window as unknown as { __BOTO_TRACK_DATA__?: TrackPayload };
    if (win.__BOTO_TRACK_DATA__) return win.__BOTO_TRACK_DATA__;
    if (!trackPromise) {
        trackPromise = fetch('/data/track.json')
            .then((res) => {
                if (!res.ok) throw new Error('Unable to load Boto3 index');
                return res.json();
            })
            .then((data: TrackPayload) => {
                win.__BOTO_TRACK_DATA__ = data;
                return data;
            });
    }
    return trackPromise;
}

export function openCommandPalette(initialQuery = ''): void {
    window.dispatchEvent(new CustomEvent('boto:open-palette', { detail: { query: initialQuery } }));
}

export function registerAlpineComponent(name: string, factory: () => Record<string, unknown>): void {
    const win = window as unknown as {
        Alpine?: { data: (n: string, fn: () => Record<string, unknown>) => void };
        __botoRegisteredAlpine?: Set<string>;
    };
    win.__botoRegisteredAlpine = win.__botoRegisteredAlpine || new Set();
    if (win.__botoRegisteredAlpine.has(name)) return;
    win.__botoRegisteredAlpine.add(name);

    if (win.Alpine) {
        win.Alpine.data(name, factory);
    } else {
        document.addEventListener('alpine:init', () => {
            win.Alpine?.data(name, factory);
        });
    }
}

export function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
}

export function isCmdOrCtrlK(event: KeyboardEvent): boolean {
    return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
}
