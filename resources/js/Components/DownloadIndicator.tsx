import { useEffect, useState } from 'react';
import Spinner from '@/Components/Spinner';

// Routes for PDF/report/export generation all share these URL fragments
// (see routes/web.php: transactions.pdf, reports.*-pdf, reports.export-csv).
// Matching by href avoids having to instrument every download link/button
// individually across Transactions, Reports and Clubs.
const DOWNLOAD_URL_PATTERN = /(-pdf(\?|$)|\/pdf(\?|$)|export-csv)/;

const MAX_VISIBLE_MS = 15000;

export default function DownloadIndicator() {
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        let safetyTimer: ReturnType<typeof setTimeout> | null = null;

        const clear = () => {
            setIsGenerating(false);
            if (safetyTimer) clearTimeout(safetyTimer);
            window.removeEventListener('focus', clear);
        };

        const onClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement)?.closest('a');
            if (!anchor || !anchor.href) return;
            if (!DOWNLOAD_URL_PATTERN.test(anchor.href)) return;

            setIsGenerating(true);
            window.addEventListener('focus', clear);
            safetyTimer = setTimeout(clear, MAX_VISIBLE_MS);
        };

        document.addEventListener('click', onClick);

        return () => {
            document.removeEventListener('click', onClick);
            window.removeEventListener('focus', clear);
            if (safetyTimer) clearTimeout(safetyTimer);
        };
    }, []);

    if (!isGenerating) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-xl shadow-slate-900/20">
            <Spinner className="h-4 w-4 text-white" />
            <span>Generando documento...</span>
        </div>
    );
}
