"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage }: { currentPage: number }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const renderPageNumbers = () => {
        const pages = [];
        const windowSize = 2; // How many pages to show on each side of current page
        let startPage = Math.max(1, currentPage - windowSize);
        // Since we don't know total pages, we just show a few ahead
        let endPage = currentPage + windowSize;

        // Adjust if near start
        if (currentPage <= windowSize) {
            endPage = 1 + (windowSize * 2);
        }

        // Safety check if we ever knew total pages, but we don't right now. 
        // Just ensuring start is at least 1
        if (startPage < 1) startPage = 1;

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    variant={i === currentPage ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(i)}
                    className={`h-10 w-10 rounded-lg ${i === currentPage
                            ? "bg-primary text-primary-foreground font-bold"
                            : "border-white/10 hover:bg-white/10 text-muted-foreground"
                        }`}
                >
                    {i}
                </Button>
            );
        }
        return pages;
    };

    return (
        <div className="flex justify-center items-center gap-2 py-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="h-10 w-10 rounded-lg border-white/10 hover:bg-white/10 text-muted-foreground"
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            {renderPageNumbers()}

            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-10 w-10 rounded-lg border-white/10 hover:bg-white/10 text-muted-foreground"
            >
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
    );
}
