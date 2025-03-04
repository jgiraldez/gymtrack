import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null

  // Handle regular YouTube URLs
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)

  if (match && match[2].length === 11) {
    return match[2]
  }

  // Handle YouTube Shorts
  const shortsRegExp = /^.*(youtube.com\/shorts\/)([^#&?]*).*/
  const shortsMatch = url.match(shortsRegExp)

  if (shortsMatch && shortsMatch[2].length === 11) {
    return shortsMatch[2]
  }

  return null
}

export function getYoutubeThumbnailUrl(url: string): string {
  const videoId = getYoutubeVideoId(url)
  if (!videoId) return "/placeholder.svg?height=180&width=320"

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

