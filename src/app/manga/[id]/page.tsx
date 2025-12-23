"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { ArrowLeft, Play, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { API_URL } from '@/lib/utils';

interface MangaDetail {
    title: string;
    cover_url: string;
    author: string;
    status: string;
    genres: string[];
    description: string;
    chapters: { id: string; title: string }[];
}

export default function MangaDetailPage() {
    const [manga, setManga] = useState<MangaDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    // Safety check just in case, though usually id is present for this route
    const mangaId = typeof params?.id === 'string' ? params.id : "";

    const router = useRouter();
    const searchParams = useSearchParams();
    const source = searchParams.get("source") || "up-manga";

    const [history, setHistory] = useState<{ chapter_id: string } | null>(null);

    useEffect(() => {
        const fetchManga = async () => {
            if (!mangaId) return;

            try {
                // 1. Fetch Manga Details
                const res = await fetch(`${API_URL}/manga/${mangaId}?source=${source}`);
                if (res.ok) {
                    const data = await res.json();
                    setManga(data);
                } else {
                    console.error("Fetch manga failed", res.status);
                    setManga(null);
                }
            } catch (error) {
                console.error("Failed to fetch manga details", error);
            }

            try {
                // 2. Fetch History (Independent check)
                const historyRes = await fetch(`${API_URL}/history/${mangaId}?source=${source}`);
                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    if (historyData) setHistory(historyData);
                }
            } catch (error) {
                // History fetch failure should not break the page, just disable 'Continue'
                console.warn("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchManga();
    }, [mangaId, source]);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
    if (!manga) return <div className="text-center py-20">Manga not found</div>;

    const firstChapter = manga.chapters.length > 0 ? manga.chapters[manga.chapters.length - 1] : null;
    // Mock existing history check - normally would fetch from backend
    // For now, we'll assume "Continue" is disabled if no local history logic (or just link to latest for demo)


    return (
        <div className="pb-24 bg-background min-h-screen">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center border-b border-border/40">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="ml-2 text-lg font-bold line-clamp-1">{manga.title}</h1>
            </div>

            <div className="px-4 py-6 space-y-6">
                {/* Hero Section */}
                <div className="flex flex-col items-center gap-6">
                    <div className="w-40 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative">
                        <img
                            src={(source === 'reapertrans' || source === 'slow-manga')
                                ? `${API_URL}/proxy-image?url=${encodeURIComponent(manga.cover_url)}&source=${source}`
                                : manga.cover_url}
                            alt={manga.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="text-center space-y-2 max-w-sm">
                        <h2 className="text-2xl font-black leading-tight">{manga.title}</h2>
                        <div className="flex flex-wrap justify-center gap-2">
                            {manga.genres?.map(g => (
                                <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full max-w-sm">
                        {firstChapter && (
                            <Button asChild className="flex-1 rounded-xl bg-primary text-primary-foreground font-bold" size="lg">
                                <Link href={`/read/${firstChapter.id}?source=${source}`}>
                                    <Play className="mr-2 h-4 w-4 fill-current" /> Read First
                                </Link>
                            </Button>
                        )}

                        {history ? (
                            <Button asChild className="flex-1 rounded-xl font-bold border-primary/20 bg-secondary/50 text-foreground hover:bg-secondary/70" variant="outline" size="lg">
                                <Link href={`/read/${history.chapter_id}?source=${source}`}>
                                    <BookOpen className="mr-2 h-4 w-4" /> Continue
                                </Link>
                            </Button>
                        ) : (
                            <Button disabled variant="outline" className="flex-1 rounded-xl font-bold border-primary/20 bg-secondary/50" size="lg">
                                <BookOpen className="mr-2 h-4 w-4" /> Continue
                            </Button>
                        )}
                    </div>
                </div>

                {/* Description */}
                <Card className="bg-secondary/20 border-0">
                    <CardContent className="p-4 space-y-2">
                        <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Synopsis</h3>
                        <p className="text-sm leading-relaxed text-foreground/80">
                            {manga.description || "No description available."}
                        </p>
                    </CardContent>
                </Card>

                {/* Chapter List */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-lg">Chapters</h3>
                        <span className="text-xs font-bold text-muted-foreground">{manga.chapters.length} total</span>
                    </div>

                    <div className="grid gap-2">
                        {manga.chapters.map((chapter) => (
                            <Link key={chapter.id} href={`/read/${chapter.id}?source=${source}`}>
                                <div className="p-4 rounded-xl bg-card border border-border/50 hover:bg-secondary/40 active:bg-secondary/60 transition-colors flex justify-between items-center group">
                                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">{chapter.title}</span>
                                    <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
