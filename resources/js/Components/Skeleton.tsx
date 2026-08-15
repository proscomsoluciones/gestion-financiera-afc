export function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function SkeletonPage() {
    return (
        <div className="py-8">
            <div className="mx-auto max-w-7xl px-4 space-y-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-56" />
                        <Skeleton className="h-3 w-72" />
                    </div>
                    <Skeleton className="h-10 w-44 rounded-xl" />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function SkeletonTableRows({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, r) => (
                <tr key={r} className="border-b border-slate-100 last:border-0">
                    {Array.from({ length: cols }).map((_, c) => (
                        <td key={c} className="py-3.5 px-4">
                            <Skeleton className="h-4 w-full max-w-[140px]" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                </div>
            ))}
        </div>
    );
}
