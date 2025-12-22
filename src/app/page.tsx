import MangaCard from "@/components/MangaCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

async function getMangaList() {
  try {
    const res = await fetch('http://127.0.0.1:8000/manga', { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Home() {
  const mangaList = await getMangaList();
  const featuredManga = mangaList.length > 0 ? mangaList[0] : null;

  return (
    <div className="min-h-screen pb-24 space-y-6 px-4 py-6">

      {/* Header / Tabs */}
      <div className="flex items-center justify-between pt-2 pb-4 px-1">
        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-black italic tracking-tighter text-foreground font-sans">NOW</h1>
          <div className="h-2 w-2 rounded-full bg-primary mt-1.5"></div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-primary text-primary rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Reading
          </Badge>
          <Badge variant="ghost" className="text-muted-foreground hover:text-foreground rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
            Finite
          </Badge>
        </div>
      </div>

      {/* Featured Hero */}
      {featuredManga && (
        <Card className="relative overflow-hidden rounded-[2rem] border-0 shadow-2xl bg-card">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <img
              src={featuredManga.cover_url}
              className="w-full h-full object-cover opacity-20 blur-xl scale-125 saturate-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent" />
          </div>

          <CardContent className="relative z-10 flex gap-5 items-center p-5">
            {/* Portrait Cover */}
            <div className="w-28 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 flex-shrink-0">
              <img
                src={featuredManga.cover_url}
                alt={featuredManga.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info & Button */}
            <div className="flex-1 flex flex-col justify-center gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold leading-tight text-foreground line-clamp-2">
                  {featuredManga.title}
                </h2>
                <p className="text-sm font-medium text-muted-foreground">
                  {featuredManga.latest_chapter}
                </p>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>Progress</span>
                  <span className="text-primary">78%</span>
                </div>
                <Progress value={78} className="h-1.5 bg-secondary/50" indicatorClassName="bg-primary" />
              </div>

              <Button asChild className="w-full font-black uppercase tracking-wide rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href={`/manga/${featuredManga.id}`}>Continue Reading</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* For You List */}
      <section className="space-y-4 pt-4 px-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black italic tracking-wider text-foreground font-sans">FOR YOU</h2>
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-secondary">
            <Link href="/search"><ChevronRight className="h-5 w-5 text-muted-foreground" /></Link>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {mangaList.filter((m: any) => m.id).map((manga: any, index: number) => (
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
      </section>
    </div>
  );
}
