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
}

interface EnrichedHistory extends HistoryItem {
    new_chapters_count: number;
    latest_chapter_title_online: string;
    fresh_cover: string;
    read_chapter_title: string;
    total_chapters: number;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<EnrichedHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch History
                const res = await fetch(`${API_URL}/history`);
                if (!res.ok) throw new Error("Failed to fetch history");
                const historyData: HistoryItem[] = await res.json();

                // 2. Fetch fresh details for each manga to check for updates & get cover
                const enriched = await Promise.all(historyData.map(async (item) => {
                    try {
                        const mRes = await fetch(`${API_URL}/manga/${item.manga_id}`);
                        if (!mRes.ok) return {
                            ...item,
                            new_chapters_count: 0,
                            latest_chapter_title_online: "",
                            fresh_cover: item.cover_url,
                            read_chapter_title: item.chapter_title, // Fallback
                            total_chapters: 0
                        };

                        const manga = await mRes.json();

                        // Calculate fresh cover
                        const cover = manga.cover_url || item.cover_url;

                        // Calculate new chapters
                        const chapters = manga.chapters || [];
                        const readIndex = chapters.findIndex((c: any) => c.id === item.chapter_id);

                        let newCount = 0;
                        if (readIndex > 0) {
                            newCount = readIndex;
                        }

                        // Get cleaner title for the read chapter
                        const currentChapterObj = chapters.find((c: any) => c.id === item.chapter_id);
                        let cleanTitle = currentChapterObj ? currentChapterObj.title : item.chapter_title;

                        // Format title if it looks like a URL/slug
                        try {
                            // Decode if it's encoded
                            cleanTitle = decodeURIComponent(cleanTitle);

                            // Extract number if it follows common patterns like "ตอนที่-1", "chapter-1", or just "-1" at the end
                            // Matches "ตอนที่-" or "ch-" or "chapter-" followed by number, case insensitive
                            // Or just any number at the end if we can't find a prefix
                            const match = cleanTitle.match(/(?:ตอนที่|ch|chapter)[-_\s.]*(\d+(\.\d+)?)/i) || cleanTitle.match(/[-_](\d+(\.\d+)?)$/);

                            if (match && match[1]) {
                                cleanTitle = `Chapter ${match[1]}`;
                            }
                        } catch (e) {
                            // Fallback
                        }

                        return {
                            ...item,
                            new_chapters_count: newCount,
                            latest_chapter_title_online: chapters[0]?.title || "",
                            fresh_cover: cover,
                            read_chapter_title: cleanTitle,
                            total_chapters: chapters.length
                        };
                    } catch (e) {
                        return {
                            ...item,
                            new_chapters_count: 0,
                            latest_chapter_title_online: "",
                            fresh_cover: item.cover_url,
                            read_chapter_title: item.chapter_title,
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
                            href={`/read/${item.chapter_id}`}
                            key={item.id}
                            className="bg-card border border-border/50 rounded-xl p-3 flex gap-4 hover:bg-white/5 transition-colors relative overflow-hidden group"
                        >
                            <div className="w-16 aspect-[3/4] flex-shrink-0 bg-secondary/50 rounded-lg overflow-hidden relative">
                                {item.fresh_cover && (
                                    <img
                                        src={item.fresh_cover}
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
                                    อ่านล่าสุด: <span className="text-foreground">{item.read_chapter_title}</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground/60">
                                    จากทั้งหมด {item.total_chapters} ตอน
                                </p>
                            </div>

                            {item.new_chapters_count > 0 && (
                                <div className="absolute top-3 right-3">
                                    <Badge variant="destructive" className="animate-pulse shadow-lg shadow-red-500/20">
                                        +{item.new_chapters_count}
                                    </Badge>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
