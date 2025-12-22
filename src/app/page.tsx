import MangaCard from "@/components/MangaCard";
import Pagination from "@/components/Pagination";
import { API_URL } from "@/lib/utils";

async function getMangaList(page: number) {
  try {
    const res = await fetch(`${API_URL}/manga?page=${page}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const mangaList = await getMangaList(currentPage);

  // Sort by updated_at if available, otherwise rely on API order
  // We assume the user wants the latest updates first. 
  // If updated_at is a string ISO date:
  const sortedList = [...mangaList]
    .filter((m: any) => m.id)
    .sort((a: any, b: any) => {
      if (a.updated_at && b.updated_at) {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      return 0;
    });

  return (
    <div className="min-h-screen pb-24 space-y-6 px-4 py-6">

      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-4 px-1">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-black italic tracking-tighter text-foreground font-sans">NOW</h1>
          <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
        </div>
      </div>

      {/* Manga List */}
      <section className="space-y-4 px-1">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {sortedList.map((manga: any, index: number) => (
            <MangaCard
              key={`${manga.id}-${index}`}
              id={manga.id}
              title={manga.title}
              coverUrl={manga.cover_url}
              latestChapter={manga.latest_chapter}
              rating={manga.rating}
            />
          ))}
        </div>

        {sortedList.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No manga found on this page.
          </div>
        )}
      </section>

      {/* Pagination */}
      <Pagination currentPage={currentPage} />
    </div>
  );
}
