import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Star, Bookmark } from "lucide-react";

interface MangaCardProps {
    id: string;
    title: string;
    coverUrl: string;
    latestChapter: string;
    rating: string;
}

export default function MangaCard({ id, title, coverUrl, latestChapter, rating }: MangaCardProps) {
    if (!id) return null;

    return (
        <Link href={`/manga/${id}`} className="flex gap-4 p-2.5 rounded-2xl hover:bg-secondary/40 active:bg-secondary/60 transition-colors group border border-transparent hover:border-border/50">
            {/* Cover Image - Left Side */}
            <div className="relative w-20 h-28 flex-shrink-0 overflow-hidden rounded-lg shadow-sm">
                <img
                    src={coverUrl}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
            </div>

            {/* Content - Right Side */}
            <div className="flex-1 flex flex-col justify-between py-0.5">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                </div>

                {/* Chapter & Status */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="px-2 h-6 text-[10px] font-semibold text-primary/90 bg-primary/10 hover:bg-primary/20 border-0">
                            {latestChapter}
                        </Badge>
                        <div className="flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            {rating || "N/A"}
                        </div>
                    </div>

                    <Bookmark className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                </div>
            </div>
        </Link>
    );
}
