"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    BookOpen,
    Key,
    Globe,
    Route,
    Layers,
    Search,
    ListChecks,
    Coins,
    Code2,
    Info
} from "lucide-react";

const docLinks = [
    {
        title: "Getting Started",
        items: [
            {
                title: "Introduction",
                href: "/docs/introduction",
                icon: Info,
            },
            {
                title: "Authentication",
                href: "/docs/auth",
                icon: Key,
            },
        ],
    },
    {
        title: "API Reference",
        items: [
            {
                title: "Scrape URL",
                href: "/docs/endpoints/scrape",
                icon: Globe,
            },
            {
                title: "Crawl Job",
                href: "/docs/endpoints/crawl",
                icon: Route,
            },
            {
                title: "Map Structure",
                href: "/docs/endpoints/map",
                icon: Layers,
            },
            {
                title: "Search Content",
                href: "/docs/endpoints/search",
                icon: Search,
            },
            {
                title: "Batch Scrape",
                href: "/docs/endpoints/batch-scrape",
                icon: ListChecks,
            },
        ],
    },
    {
        title: "Guides & Resources",
        items: [
            {
                title: "Pricing & Credits",
                href: "/docs/pricing",
                icon: Coins,
            },
            {
                title: "SDKs & Examples",
                href: "/docs/sdks",
                icon: Code2,
            },
        ],
    },
];

export function DocsSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 border-r bg-muted/20 h-[calc(100vh-4rem)] flex-shrink-0 sticky top-16 hidden md:block">
            <ScrollArea className="h-full py-6 pr-4 pl-6">
                <div className="flex items-center gap-2 mb-6 text-orange-600 dark:text-orange-400">
                    <BookOpen className="h-5 w-5" />
                    <h2 className="font-bold text-lg tracking-tight">Documentation</h2>
                </div>

                <div className="space-y-6">
                    {docLinks.map((section, i) => (
                        <div key={i} className="space-y-3">
                            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">{section.title}</h4>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200",
                                            pathname === item.href
                                                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium border-l-2 border-orange-500 rounded-l-none"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground translate-x-0 hover:translate-x-1"
                                        )}
                                    >
                                        <item.icon className={cn("h-4 w-4",
                                            pathname === item.href
                                                ? "text-orange-600 dark:text-orange-400"
                                                : "text-muted-foreground/70"
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
