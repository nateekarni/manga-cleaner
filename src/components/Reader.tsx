'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/utils';

interface ReaderProps {
    chapterId: string;
    images: string[];
    nextChapterId: string | null;
    prevChapterId: string | null;
    mangaId: string;
    mangaTitle: string;
}

export default function Reader({ chapterId, images, nextChapterId, prevChapterId, mangaId, mangaTitle }: ReaderProps) {
    const [showNav, setShowNav] = useState(true);
    const lastScrollY = useRef(0);
    const router = useRouter();

    // Handle scroll for nav visibility
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setShowNav(false);
            } else {
                setShowNav(true);
            }
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Save progress
    useEffect(() => {
        const saveProgress = async () => {
            try {
                await fetch(`${API_URL}/history`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        manga_id: mangaId,
                        manga_title: mangaTitle,
                        cover_url: '', // We could fetch this if we really wanted, but optional
                        chapter_id: chapterId,
                        chapter_title: `Chapter ${chapterId}`,
                        page: 1,
                        scroll_position: 0
                    })
                });
            } catch (e) {
                console.error("Failed to save progress", e);
            }
        };

        if (chapterId && mangaId) {
            saveProgress();
        }
    }, [chapterId, mangaId, mangaTitle]);

    return (
        <div className="min-h-screen bg-black relative">
            {/* Floating Header */}
            <div className={`fixed top-0 left-0 right-0 p-4 transition-transform duration-300 z-50 ${showNav ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="glass-header bg-black/80 p-4 max-w-4xl mx-auto flex justify-between items-center rounded-xl">
                    <Link href="/" className="text-white hover:text-primary transition-colors">
                        ← Back
                    </Link>
                    <span className="text-gray-400 text-sm">Chapter {chapterId}</span>
                    <div className="flex gap-2">
                        {prevChapterId && (
                            <Link href={`/read/${prevChapterId}`} className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20">
                                Prev
                            </Link>
                        )}
                        {nextChapterId && (
                            <Link href={`/read/${nextChapterId}`} className="text-sm px-3 py-1 rounded bg-primary hover:bg-primary/80">
                                Next
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Reader Content */}
            <div className="max-w-3xl mx-auto py-20 px-0 md:px-4">
                <div className="flex flex-col gap-0 md:gap-2">
                    {images.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`Page ${index + 1}`}
                            loading="lazy"
                            className="w-full h-auto block select-none"
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Nav Area */}
            <div className="max-w-3xl mx-auto p-8 flex justify-between items-center bg-[#0f0f11] rounded-t-xl mt-4">
                {prevChapterId ? (
                    <Link href={`/read/${prevChapterId}`} className="flex-1 py-4 text-center bg-white/5 hover:bg-white/10 rounded-l-lg transition-colors">
                        ← Previous Chapter
                    </Link>
                ) : <div className="flex-1"></div>}

                {nextChapterId ? (
                    <Link href={`/read/${nextChapterId}`} className="flex-1 py-4 text-center bg-primary hover:bg-primary/90 text-white rounded-r-lg transition-colors">
                        Next Chapter →
                    </Link>
                ) : <div className="flex-1"></div>}
            </div>
        </div>
    );
}
