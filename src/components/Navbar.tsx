import Link from 'next/link';
import { Search, Menu } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group mr-6">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md">
                        M
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground hidden sm:inline-block">
                        Manga<span className="text-primary">Cleaner</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground">
                        Home
                    </Link>
                    <Link href="/history" className="text-foreground/60 transition-colors hover:text-foreground">
                        History
                    </Link>
                </div>

                <div className="flex-1"></div>

                {/* Search & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block w-full max-w-sm ml-auto">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="flex h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                            />
                        </div>
                    </div>

                    <button className="md:hidden p-2 text-foreground/60 hover:text-foreground">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
