"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { API_URL } from '@/lib/utils';

interface ReaderData {
    id: string;
    images: string[];
    prev_chapter_id: string | null;
    next_chapter_id: string | null;
    manga_id: string;
    manga_title: string;
}

interface Chapter {
    id: string;
    title: string;
}

export default function ReadPage({ params }: { params: Promise<{ chapterId: string }> }) {
    const [data, setData] = useState<ReaderData | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUI, setShowUI] = useState(true);
    const router = useRouter();
    const [currentChapterId, setCurrentChapterId] = useState("");

    // Scroll Restoration State
    const [targetScroll, setTargetScroll] = useState<number>(0);
    const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
    const [isRestoringScroll, setIsRestoringScroll] = useState(false);

    // Disable browser auto-restoration
    useEffect(() => {
        if (typeof window !== 'undefined' && window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    // Fetch Chapter Data & History
    useEffect(() => {
        const loadChapter = async () => {
            const { chapterId } = await params;
            setCurrentChapterId(chapterId);
            setImagesLoadedCount(0);
            setIsRestoringScroll(true);

            try {
                // 1. Fetch Chapter Content
                const res = await fetch(`${API_URL}/chapter/${chapterId}`);
                if (res.ok) {
                    const json = await res.json();

                    // 2. Fetch History for scroll target
                    let scrollPos = 0;
                    if (json.manga_id) {
                        try {
                            const hRes = await fetch(`${API_URL}/history`);
                            if (hRes.ok) {
                                const historyList: any[] = await hRes.json();
                                const entry = historyList.find((h: any) => h.manga_id === json.manga_id);
                                if (entry && entry.chapter_id === chapterId) {
                                    scrollPos = entry.scroll_position || 0;
                                }
                            }
                        } catch (e) { console.error(e); }
                    }

                    setTargetScroll(scrollPos);
                    setData(json);

                    // Fetch chapters for dropdown
                    if (json.manga_id) {
                        const mangaRes = await fetch(`${API_URL}/manga/${json.manga_id}`);
                        if (mangaRes.ok) {
                            const mangaData = await mangaRes.json();
                            setChapters(mangaData.chapters);
                        }
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadChapter();
    }, [params]);

    // Trigger Scroll when ALL images are loaded
    useEffect(() => {
        if (!data || !isRestoringScroll || targetScroll === 0) {
            if (targetScroll === 0 && !loading && data) {
                // If no history, we are "done" restoring immediately
                setIsRestoringScroll(false);
            }
            return;
        }

        const totalImages = data.images.length;

        // If all images loaded (or if we timed out and want to force it)
        if (imagesLoadedCount >= totalImages && totalImages > 0) {
            console.log("All images loaded, scrolling to", targetScroll);
            // Small delay to ensure layout is final
            setTimeout(() => {
                window.scrollTo({ top: targetScroll, behavior: 'instant' });
                setIsRestoringScroll(false);
            }, 100);
        }
    }, [imagesLoadedCount, data, targetScroll, isRestoringScroll, loading]);

    // Force scroll fallback after 5 seconds
    useEffect(() => {
        if (isRestoringScroll && targetScroll > 0) {
            const timer = setTimeout(() => {
                console.warn("Force scrolling timeout");
                window.scrollTo({ top: targetScroll, behavior: 'instant' });
                setIsRestoringScroll(false);
            }, 5000); // 5 seconds max wait
            return () => clearTimeout(timer);
        }
    }, [isRestoringScroll, targetScroll]);


    // Save Scroll Logic
    useEffect(() => {
        if (!data || isRestoringScroll) return; // Don't save while we are still trying to restore

        const saveHistory = async (scrollPos: number) => {
            if (scrollPos < 100) return; // Don't save top of page
            try {
                await fetch(`${API_URL}/history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        manga_id: data.manga_id,
                        manga_title: data.manga_title,
                        cover_url: "",
                        chapter_id: currentChapterId,
                        chapter_title: currentChapterId,
                        page: 1,
                        scroll_position: scrollPos
                    })
                });
            } catch (e) { console.error("Save error", e); }
        };

        let timeoutId: NodeJS.Timeout;
        const onScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                saveHistory(window.scrollY);
            }, 1000);
        };

        window.addEventListener('scroll', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            clearTimeout(timeoutId);
        };
    }, [data, currentChapterId, isRestoringScroll]);

    const handleNavigation = (id: string | null) => {
        if (id) {
            setLoading(true);
            router.push(`/read/${id}`);
        }
    };

    const toggleUI = () => setShowUI(!showUI);

    if (loading && !data) return (
        <div className="flex flex-col h-screen items-center justify-center text-white gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p>Loading Chapter...</p>
        </div>
    );

    if (!data) return <div className="flex h-screen items-center justify-center text-white">Chapter not found</div>;

    return (
        <div className="min-h-screen bg-black relative">

            {/* Top Bar */}
            <div className={`fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md transition-transform duration-300 ${showUI ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="flex items-center px-4 h-16 gap-4">
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-white text-sm font-bold truncate">{data.manga_title}</h1>
                        <p className="text-white/60 text-xs truncate">{currentChapterId}</p>
                    </div>
                </div>
            </div>

            {/* Main Content (Images) */}
            <div className="w-full max-w-2xl mx-auto min-h-screen pb-20 pt-16" onClick={toggleUI}>

                {/* Scroll Restoration Indicator */}
                {isRestoringScroll && targetScroll > 0 && (
                    <div className="fixed inset-0 z-40 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm pointer-events-none">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
                        <p>Restoring position...</p>
                        <p className="text-xs text-white/50 mt-2">{imagesLoadedCount} / {data.images.length} images loaded</p>
                    </div>
                )}

                {data.images.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt={`Page ${index + 1}`}
                        className="w-full h-auto block"
                        loading="eager"
                        onLoad={() => setImagesLoadedCount(prev => prev + 1)}
                    />
                ))}

                {/* End of Chapter Navigation Area */}
                <div className="p-8 flex flex-col items-center gap-4 text-white/50">
                    <p>End of Chapter</p>
                    {data.next_chapter_id && (
                        <Button
                            className="w-full max-w-xs bg-primary hover:bg-primary/90 text-black font-bold"
                            onClick={(e) => { e.stopPropagation(); handleNavigation(data.next_chapter_id); }}
                        >
                            Next Chapter
                        </Button>
                    )}
                </div>
            </div>

            {/* Bottom Bar Controls */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 transition-transform duration-300 pb-safe ${showUI ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="flex items-center justify-between px-4 h-16 max-w-2xl mx-auto w-full gap-2">

                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!data.prev_chapter_id}
                        className="text-white hover:bg-white/10"
                        onClick={() => handleNavigation(data.prev_chapter_id)}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>

                    {/* Chapter Select */}
                    <div className="flex-1 max-w-[200px]">
                        <select
                            value={currentChapterId}
                            onChange={(e) => handleNavigation(e.target.value)}
                            className="w-full bg-white/10 text-white text-sm rounded-lg border-none px-3 py-2 text-center appearance-none focus:ring-2 focus:ring-primary"
                        >
                            {chapters.map(ch => (
                                <option key={ch.id} value={ch.id} className="text-black">
                                    {ch.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!data.next_chapter_id}
                        className="text-white hover:bg-white/10"
                        onClick={() => handleNavigation(data.next_chapter_id)}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>
            </div>

        </div>
    );
}
