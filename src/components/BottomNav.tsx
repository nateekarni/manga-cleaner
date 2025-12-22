"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, BookOpen, User } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    // Don't show bottom nav on reader page
    if (pathname.startsWith('/read/')) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border">
            <div className="flex justify-around items-center h-16 pb-safe">
                <Link
                    href="/"
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200",
                        isActive('/') ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                    )}
                >
                    <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
                    <span className="text-[10px] font-semibold">Home</span>
                </Link>

                <Link
                    href="/search"
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200",
                        isActive('/search') ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                    )}
                >
                    <Search size={22} strokeWidth={isActive('/search') ? 2.5 : 2} />
                    <span className="text-[10px] font-semibold">Search</span>
                </Link>

                <Link
                    href="/history"
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 w-16 h-full transition-all duration-200",
                        isActive('/history') ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                    )}
                >
                    <BookOpen size={22} strokeWidth={isActive('/history') ? 2.5 : 2} />
                    <span className="text-[10px] font-semibold">Library</span>
                </Link>

            </div>
        </div>
    );
}
