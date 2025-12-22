import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export function getApiUrl(path: string) {
    if (path.startsWith("/")) {
        return `${API_URL}${path}`;
    }
    return `${API_URL}/${path}`;
}