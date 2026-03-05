"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Globe, Route, FolderSearch, Layers, ListChecks } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const playgroundLinks = [
    {
        title: "FireForge Operations",
        items: [
            {
                title: "Scrape URL",
                href: "/playground/scrape",
                icon: Globe,
                description: "Scrape a single URL with advanced options",
            },
            {
                title: "Crawl Job",
                href: "/playground/crawl",
                icon: Route,
                description: "Start a crawl job across a domain",
            },
            {
                title: "Map Structure",
                href: "/playground/map",
                icon: Layers,
                description: "Map website structure and links",
            },
            {
                title: "Search Content",
                href: "/playground/search",
                icon: Search,
                description: "Search across crawled content",
            },
            {
                title: "Batch Scrape",
                href: "/playground/batch-scrape",
                icon: ListChecks,
                description: "Scrape multiple URLs at once",
            },
        ],
    },
    {
        title: "Health & Tools",
        items: [
            {
                title: "API Status",
                href: "/playground/health",
                icon: FolderSearch,
                description: "Check FireForge API health",
            },
        ],
    },
];

export function PlaygroundSidebar() {
    const pathname = usePathname();
    const { apiKey } = useAuth();
    const hasApiKey = !!apiKey;

    return (
        <div className="w-64 border-r bg-muted/20 h-[calc(100vh-4rem)] flex-shrink-0">
            <ScrollArea className="h-full py-6 pr-4 pl-6">
                <h2 className="font-semibold text-lg tracking-tight mb-4">API Endpoints</h2>

                {!hasApiKey && (
                    <div className="mb-6 p-3 bg-orange-500/10 border border-orange-500/20 rounded-md text-sm text-orange-600 dark:text-orange-400">
                        ⚠️ You need an API Key to execute requests. Login or Register in the top right.
                    </div>
                )}

                <div className="space-y-6">
                    {playgroundLinks.map((section, i) => (
                        <div key={i} className="space-y-3">
                            <h4 className="font-medium text-sm text-foreground/60">{section.title}</h4>
                            <div className="space-y-1 relative">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors relative group",
                                            pathname === item.href || (pathname === "/playground" && item.href === "/playground/scrape")
                                                ? "bg-orange-500/15 text-orange-600 dark:text-orange-400 font-medium"
                                                : "text-foreground/70 hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4",
                                            pathname === item.href || (pathname === "/playground" && item.href === "/playground/scrape")
                                                ? "text-orange-600 dark:text-orange-400"
                                                : "text-muted-foreground"
                                        )} />
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
