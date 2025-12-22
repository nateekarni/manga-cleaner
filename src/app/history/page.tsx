"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, BookOpen } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
}

export default function HistoryPage() {
    const [history, setHistory] = useState<EnrichedHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch History
                const res = await fetch('http://127.0.0.1:8000/history');
                if (!res.ok) throw new Error("Failed to fetch history");
                const historyData: HistoryItem[] = await res.json();

                // 2. Fetch fresh details for each manga to check for updates & get cover
                const enriched = await Promise.all(historyData.map(async (item) => {
                    try {
                        const mRes = await fetch(`http://127.0.0.1:8000/manga/${item.manga_id}`);
                        if (!mRes.ok) return { ...item, new_chapters_count: 0, latest_chapter_title_online: "", fresh_cover: item.cover_url };

                        const manga = await mRes.json();

                        // Calculate fresh cover (backend sometimes has empty cover in history)
                        const cover = manga.cover_url || item.cover_url;

                        // Calculate new chapters
                        // Assuming manga.chapters is ordered Newest -> Oldest
                        const chapters = manga.chapters || [];
                        const readIndex = chapters.findIndex((c: any) => c.id === item.chapter_id);

                        let newCount = 0;
                        if (readIndex > 0) {
                            newCount = readIndex;
                        } else if (readIndex === -1 && chapters.length > 0) {
                            // Read chapter not found? Maybe ID changed or it's very old.
                            // For safety, assume 0 or handle logic differently. 
                            // Let's assume 0 to avoid false positives unless we are sure.
                            newCount = 0;
                        }

                        return {
                            ...item,
                            new_chapters_count: newCount,
                            latest_chapter_title_online: chapters[0]?.title || "",
                            fresh_cover: cover
                        };
                    } catch (e) {
                        return { ...item, new_chapters_count: 0, latest_chapter_title_online: "", fresh_cover: item.cover_url };
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
                                    Last read: <span className="text-foreground">{item.chapter_title}</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground/60">
                                    {new Date(item.last_read_at).toLocaleDateString()}
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
