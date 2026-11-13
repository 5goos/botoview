export function getServiceColorClass(serviceName: string): string {
    if (!serviceName) return 'bg-slate-500/10 text-slate-700 dark:text-slate-300';
    const classes = [
        'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/15',
        'bg-sky-500/10 text-sky-700 dark:text-sky-300 hover:bg-sky-500/15',
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15',
        'bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/15',
        'bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/15',
        'bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15',
        'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/15',
        'bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-500/15'
    ];
    let hash = 0;
    for (let i = 0; i < serviceName.length; i++) {
        hash = serviceName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return classes[Math.abs(hash) % classes.length];
}

export function formatDescription(text: string): string {
    if (!text) return '';
    let formatted = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    formatted = formatted.replace(
        /`([^`]+?)\s*&lt;(https?:\/\/[^&>]+?)&gt;`_+/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold underline decoration-indigo-400/40 hover:decoration-indigo-500 transition-colors">$1</a>'
    );

    formatted = formatted.replace(
        /``([^`]+?)``/g,
        '<code class="px-1.5 py-0.5 rounded-md bg-slate-200/50 dark:bg-white/10 text-[11px] mono text-indigo-700 dark:text-indigo-300 font-medium">$1</code>'
    );

    formatted = formatted.replace(
        /`([^`]+?)`/g,
        '<code class="px-1.5 py-0.5 rounded-md bg-slate-200/50 dark:bg-white/10 text-[11px] mono text-indigo-700 dark:text-indigo-300 font-medium">$1</code>'
    );

    formatted = formatted.replace(
        /(^|[^"'])(https?:\/\/[a-zA-Z0-9\-\._~:\/\?#\[\]@!$&'()*+,;=%]+)/g,
        '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium break-all">$2</a>'
    );

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
    } catch (e) {
        return dateStr;
    }
}
