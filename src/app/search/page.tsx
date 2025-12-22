"use client";

import { useState } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import MangaCard from '@/components/MangaCard';
import { API_URL } from '@/lib/utils';

interface Manga {
    id: string;
    title: string;
    cover_url: string;
    latest_chapter: string;
    rating: string;
    url: string;
}

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Manga[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pb-24 min-h-screen bg-background">
            <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md px-4 py-4 border-b border-border/40">
                <form onSubmit={handleSearch} className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search manga..."
                        className="pl-9 bg-secondary/50 border-none rounded-xl"
                    />
                </form>
            </div>

            <div className="px-4 py-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mb-2" />
                        <p>Searching...</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="space-y-4">
                        <h2 className="font-bold text-lg">Results ({results.length})</h2>
                        <div className="grid gap-3">
                            {results.map((manga) => (
                                /* แก้ไขตรงนี้: ส่งค่าแยกทีละตัวให้ตรงกับที่ MangaCard ต้องการ */
                                <MangaCard
                                    key={manga.id}
                                    id={manga.id}
                                    title={manga.title}
                                    coverUrl={manga.cover_url}
                                    latestChapter={manga.latest_chapter}
                                    rating={manga.rating}
                                />
                            ))}
                        </div>
                    </div>
                ) : searched ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>No results found for "{query}"</p>
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground/50">
                        <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Type to search manga</p>
                    </div>
                )}
            </div>
        </div>
    );
}