"use client";

import { useState, useEffect } from "react";
import MangaCard from "./MangaCard";
import { Loader2 } from "lucide-react";

export interface RawManga {
    id: string;
    title: string;
    cover_url: string;
    latest_chapter: string;
    rating: string;
    url: string;
}

interface MangaListProps {
    initialItems: RawManga[];
    source: string;
}

export default function MangaList({ initialItems, source }: MangaListProps) {
    const [items, setItems] = useState<RawManga[]>(initialItems);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // If we start with 0 items, fetch immediately
    useEffect(() => {
        if (initialItems.length === 0) {
            loadMore();
        } else {
            // Reset if source changed but we used initialItems (which we disabled in parent, but good practice)
            setItems(initialItems);
            setPage(1);
            setHasMore(true);
        }
    }, [source, initialItems]);

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
        // If items is empty, it's page 1, else it's next page
        const nextPage = items.length === 0 ? 1 : page + 1;

        try {
            // Use relative path since it's client-side, requests will go through same origin if proxy set up?
            // No, Next.js dev server is 3000, API is 8000. Need full URL.
            // We can use the NEXT_PUBLIC_API_URL env var.
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${apiUrl}/manga?source=${source}&page=${nextPage}`);

            if (!res.ok) {
                console.error("Failed to fetch more items");
                setLoading(false);
                return;
            }

            const newItems: RawManga[] = await res.json();

            if (newItems.length === 0) {
                setHasMore(false);
            } else {
                // Filter out duplicates if any, though "deduplication" logic is removed, 
                // we might still get same items if pages overlap? 
                // User said "don't care about duplicates", but strictly from same source same page?
                // Let's just append.
                if (nextPage === 1) {
                    setItems(newItems);
                } else {
                    setItems(prev => {
                        const existingIds = new Set(prev.map(i => i.id));
                        const uniqueNew = newItems.filter(i => !existingIds.has(i.id));
                        return [...prev, ...uniqueNew];
                    });
                }
                setPage(nextPage);
            }
        } catch (error) {
            console.error("Error fetching more manga:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {items.map((manga, index) => (
                    <MangaCard
                        key={`${manga.id}-${source}-${index}`} // Fallback uniqueness
                        id={manga.id}
                        title={manga.title}
                        coverUrl={manga.cover_url}
                        latestChapter={manga.latest_chapter}
                        rating={manga.rating}
                        source={source}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            "Load More"
                        )}
                    </button>
                </div>
            )}

            {!hasMore && items.length > 0 && (
                <div className="text-center text-muted-foreground text-sm py-4">
                    No more items to load.
                </div>
            )}
        </div>
    );
}
