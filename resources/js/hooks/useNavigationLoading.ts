import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * True while a GET Inertia visit (page navigation, filter, pagination) is
 * in flight for longer than `delay` ms. POST/PUT/DELETE visits are excluded
 * on purpose — those already get button-level "processing" feedback, and
 * flashing a full-page skeleton behind an open modal looks broken.
 */
export default function useNavigationLoading(delay = 150) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | null = null;

        const removeStart = router.on('start', (event) => {
            if (event.detail.visit.method !== 'get') return;
            timer = setTimeout(() => setIsLoading(true), delay);
        });

        const removeFinish = router.on('finish', (event) => {
            if (event.detail.visit.method !== 'get') return;
            if (timer) clearTimeout(timer);
            setIsLoading(false);
        });

        return () => {
            removeStart();
            removeFinish();
            if (timer) clearTimeout(timer);
        };
    }, [delay]);

    return isLoading;
}
