"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, BookOpen } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { API_URL, cn } from "@/lib/utils";

interface HistoryItem {
    id: number;
    manga_id: string;
    chapter_id: string;
    manga_title: string;
    chapter_title: string;
    cover_url: string;
    last_read_at: string;
    source?: string;
}

interface EnrichedHistory extends HistoryItem {
    new_chapters_count: number;
    latest_chapter_title_online: string;
    fresh_cover: string;
    total_chapters: number;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<EnrichedHistory[]>([]);
    const [loading, setLoading] = useState(true);

    const formatChapterTitle = (title: string) => {
        try {
            const decoded = decodeURIComponent(title);
            // Match the number at the end, often preceded by -, _, or space
            const match = decoded.match(/[-_ ]?(\d+(\.\d+)?)$/);

            if (match) {
                return `ตอนที่ ${match[1]}`;
            }
            // Fallback: search for any number sequence if exact end match fails
            const anyNum = decoded.match(/(\d+(\.\d+)?)/);
            if (anyNum) return `ตอนที่ ${anyNum[1]}`;

            return decoded;
        } catch (e) {
            return title;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch History
                const res = await fetch(`${API_URL}/history`);
                if (!res.ok) throw new Error("Failed to fetch history");
                const historyData: HistoryItem[] = await res.json();

                // 2. Fetch fresh details for each manga to check for updates & get cover
                const enriched = await Promise.all(historyData.map(async (item) => {
                    const source = item.source || "up-manga";
                    try {
                        const mRes = await fetch(`${API_URL}/manga/${item.manga_id}?source=${source}`);
                        if (!mRes.ok) return {
                            ...item,
                            new_chapters_count: 0,
                            latest_chapter_title_online: "",
                            fresh_cover: item.cover_url,
                            total_chapters: 0
                        };

                        const manga = await mRes.json();

                        // Calculate fresh cover (backend sometimes has empty cover in history)
                        const cover = manga.cover_url || item.cover_url;

                        // Calculate new chapters
                        // Assuming manga.chapters is ordered Newest -> Oldest
                        const chapters = manga.chapters || [];
                        const totalChapters = chapters.length;
                        const readIndex = chapters.findIndex((c: any) => c.id === item.chapter_id);

                        let newCount = 0;
                        if (readIndex > 0) {
                            newCount = readIndex;
                        } else if (readIndex === -1 && chapters.length > 0) {
                            newCount = 0;
                        }

                        return {
                            ...item,
                            new_chapters_count: newCount,
                            latest_chapter_title_online: chapters[0]?.title || "",
                            fresh_cover: cover,
                            total_chapters: totalChapters
                        };
                    } catch (e) {
                        return {
                            ...item,
                            new_chapters_count: 0,
                            latest_chapter_title_online: "",
                            fresh_cover: item.cover_url,
                            total_chapters: 0
                        };
                    }
                }));

                setHistory(enriched);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Checking for updates...</p>
            </div>
        );
    }

    return (
        <div className="pb-24 px-4 py-8 space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="text-primary" />
                Library
            </h1>

            {history.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No reading history yet.</p>
                    <p className="text-sm">Start reading some manga!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {history.map((item) => (
                        <Link
                            href={`/read/${item.chapter_id}?source=${item.source || "up-manga"}`}
                            key={item.id}
                            className="bg-card border border-border/50 rounded-xl p-3 flex gap-4 hover:bg-white/5 transition-colors relative overflow-hidden group"
                        >
                            <div className="w-16 aspect-[3/4] flex-shrink-0 bg-secondary/50 rounded-lg overflow-hidden relative">
                                {item.fresh_cover && (
                                    <img
                                        src={(item.source === 'reapertrans' || item.source === 'slow-manga')
                                            ? `${API_URL}/proxy-image?url=${encodeURIComponent(item.fresh_cover)}&source=${item.source}`
                                            : item.fresh_cover}
                                        alt={item.manga_title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                                    {item.manga_title}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate">
                                    อ่านล่าสุด: <span className="text-foreground font-medium">{formatChapterTitle(item.chapter_title)}</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground/60">
                                    จากทั้งหมด {item.total_chapters} ตอน
                                </p>
                            </div>


                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
