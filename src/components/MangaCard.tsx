import Link from 'next/link';
import { API_URL } from '@/lib/utils';


interface MangaCardProps {
    id: string;
    title: string;
    coverUrl: string;
    latestChapter: string;
    rating: string;
    source?: string;
}

export default function MangaCard({ id, title, coverUrl, latestChapter, rating, source = "up-manga" }: MangaCardProps) {
    if (!id) return null;

    const finalCoverUrl = (source === 'reapertrans' || source === 'slow-manga')
        ? `${API_URL}/proxy-image?url=${encodeURIComponent(coverUrl)}&source=${source}`
        : coverUrl;

    return (
        <Link href={`/manga/${id}?source=${source}`} className="flex flex-col gap-2 group">
            {/* Cover Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl shadow-md border border-white/5 bg-secondary/20">
                <img
                    src={finalCoverUrl}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                />
            </div>

            {/* Content */}
            <div className="space-y-1 text-center">
                <h3 className="text-sm font-bold text-white leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {title}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                    {latestChapter}
                </p>
            </div>
        </Link>
    );
}
