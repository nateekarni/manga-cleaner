import Link from "next/link";
import { cn } from "@/lib/utils";
import MangaList, { RawManga } from "@/components/MangaList";

export const dynamic = 'force-dynamic';
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getMangaList(source: string): Promise<RawManga[]> {
  const url = `${API_URL}/manga?source=${source}`;
  console.log(`[Server] Fetching URL: ${url}`);
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`[Server] Fetch failed for ${source}: ${res.status}`);
      return [];
    }
    const data = await res.json();
    console.log(`[Server] Fetched ${data.length} items for ${source}`);
    if (data.length > 0) {
      console.log(`[Server] First title for ${source}:`, data[0].title);
    }
    return data;
  } catch (error) {
    console.error(`[Server] Error fetching ${source}:`, error);
    return [];
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const params = await searchParams;
  const currentSource = params.source || "up-manga";

  // We'll trust the client component to fetch data to ensure consistency and avoid SSR/Env mismatches
  // appearing as blank pages.
  const mangaList: RawManga[] = [];

  // Sources definition
  const sources = [
    { id: "up-manga", label: "Up-Manga" },
    { id: "reapertrans", label: "ReaperTrans" },
    { id: "slow-manga", label: "Slow-Manga" },
  ];

  return (
    <div key={currentSource} className="min-h-screen pb-24 space-y-6 px-4 pt-0">

      {/* Header & Tabs */}
      <div className="sticky top-0 z-50 space-y-4 bg-background/95 backdrop-blur-xl pt-6 pb-4 -mx-4 px-4 border-b border-white/5 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-black italic tracking-tighter text-foreground font-sans">NOW</h1>
            <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono">
            {currentSource} ({mangaList.length})
          </div>
        </div>

        {/* Source Tabs */}
        <div className="flex p-1 bg-secondary/30 rounded-xl backdrop-blur-sm border border-white/5">
          {sources.map(source => (
            <a
              key={source.id}
              href={`/?source=${source.id}`}
              className={cn(
                "flex-1 text-center py-2 text-sm font-bold rounded-lg transition-all",
                currentSource === source.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {source.label}
            </a>
          ))}
        </div>
      </div>

      {/* Manga Grid with Pagination */}
      <MangaList initialItems={mangaList} source={currentSource} />

    </div>
  );
}
