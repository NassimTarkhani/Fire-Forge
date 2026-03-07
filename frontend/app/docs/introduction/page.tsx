import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Rocket, Globe, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IntroductionPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <Badge variant="outline" className="text-orange-600 border-orange-500/20 bg-orange-500/5 px-3 py-1 text-sm font-semibold tracking-wide">
                    Getting Started
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Introduction</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    FireForge is a powerful, low-latency web scraping and crawling API designed for developers who need structured data from any website at scale.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Card className="border-border bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                    <CardContent className="pt-6 space-y-3">
                        <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600">
                            <Rocket className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold font-sans">Fast & Efficient</h3>
                        <p className="text-muted-foreground text-sm">
                            Built on top of Firecrawl, we deliver structured markdown or HTML in milliseconds.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                    <CardContent className="pt-6 space-y-3">
                        <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600">
                            <Globe className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold font-sans">Global Coverage</h3>
                        <p className="text-muted-foreground text-sm">
                            Scrape any website globally, bypassing common anti-bot protections effortlessly.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                    <CardContent className="pt-6 space-y-3">
                        <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600">
                            <Zap className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold font-sans">Credit-Based</h3>
                        <p className="text-muted-foreground text-sm">
                            Simple, transparent pricing. Pay for exactly what you scrape with zero monthly commitment.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-muted/30 hover:bg-muted/50 transition-colors duration-300">
                    <CardContent className="pt-6 space-y-3">
                        <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center text-orange-600">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold font-sans">Developer First</h3>
                        <p className="text-muted-foreground text-sm">
                            Comprehensive API documentation and simple SDKs to get you up and running in minutes.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6 pt-4 border-t border-border">
                <h2 className="text-2xl font-bold font-sans">Key Capabilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Single URL Scraping
                        </h4>
                        <p className="text-sm text-muted-foreground pl-3.5">
                            Extract high-quality markdown or clean HTML from any page.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Domain-Wide Crawling
                        </h4>
                        <p className="text-sm text-muted-foreground pl-3.5">
                            Automatically traverse multiple levels of a domain to map and scrape data.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Site Mapping
                        </h4>
                        <p className="text-sm text-muted-foreground pl-3.5">
                            Generate a full sitemap of a domain to understand its structure instantly.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Search Integration
                        </h4>
                        <p className="text-sm text-muted-foreground pl-3.5">
                            Search for content directly and scrape the best results in one go.
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <Link href="/docs/auth">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                        Setup Authentication &rarr;
                    </Button>
                </Link>
            </div>

            <footer className="pt-12 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>FireForge API v1.0.0 &copy; 2026</span>
            </footer>
        </div>
    );
}
