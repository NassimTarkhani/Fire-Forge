"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FireForgeAPI, CrawlRequest } from "@/lib/api/client";
import { ResponseViewer } from "@/components/shared/ResponseViewer";
import { useAuth } from "@/components/providers/AuthProvider";
import { Play, Settings2, Route } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function CrawlPlayground() {
    const { apiKey, deductCredits, getCost } = useAuth();
    const [url, setUrl] = useState("https://example.com");
    const [maxDepth, setMaxDepth] = useState<number>(2);
    const [limit, setLimit] = useState<number>(10);
    const [allowBackwardLinks, setAllowBackwardLinks] = useState(false);
    const [allowExternalLinks, setAllowExternalLinks] = useState(false);
    const [ignoreSitemap, setIgnoreSitemap] = useState(false);

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

    const handleCrawl = async () => {
        if (!url) {
            toast.error("URL is required");
            return;
        }

        setLoading(true);
        setResponse(null);
        setStatusCode(undefined);

        try {
            const api = new FireForgeAPI(apiKey || undefined);
            const payload: CrawlRequest = {
                url,
                maxDepth,
                limit,
                allowBackwardLinks,
                allowExternalLinks,
                ignoreSitemap
            };

            const res = await api.crawl(payload);
            setResponse(res);
            const cost = getCost("/v1/crawl");
            setStatusCode(200);
            toast.success(`Crawl job started! Cost: ${cost} Credit${cost !== 1 ? "s" : ""}/page.`);

            deductCredits(cost);
        } catch (error: any) {
            setResponse({ error: error.message });
            setStatusCode(400); // Approximation
            toast.error("Crawl failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Route className="h-8 w-8 text-orange-500" /> Crawl Website
                </h1>
                <p className="text-muted-foreground">
                    Start a crawl job to navigate through links and extract data across an entire domain.
                    <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        Cost: {getCost("/v1/crawl")} Credit{getCost("/v1/crawl") !== 1 ? "s" : ""} / Page
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-5 space-y-6">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Request Configuration</CardTitle>
                            <CardDescription>Setup your target URL and crawling parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="url">Base Target URL</Label>
                                <Input
                                    id="url"
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxDepth">Max Depth</Label>
                                    <Input
                                        id="maxDepth"
                                        type="number"
                                        value={maxDepth}
                                        onChange={e => setMaxDepth(parseInt(e.target.value) || 2)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="limit">Page Limit</Label>
                                    <Input
                                        id="limit"
                                        type="number"
                                        value={limit}
                                        onChange={e => setLimit(parseInt(e.target.value) || 10)}
                                    />
                                </div>
                            </div>

                            <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
                                <AccordionItem value="options" className="border-b-0">
                                    <AccordionTrigger className="hover:no-underline py-3">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Settings2 className="h-4 w-4" />
                                            Traversal Options
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2 pb-4">

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="bw-links" checked={allowBackwardLinks} onCheckedChange={(c) => setAllowBackwardLinks(!!c)} />
                                            <Label htmlFor="bw-links" className="font-normal cursor-pointer">Allow Backward Links (Up the tree)</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="ext-links" checked={allowExternalLinks} onCheckedChange={(c) => setAllowExternalLinks(!!c)} />
                                            <Label htmlFor="ext-links" className="font-normal cursor-pointer">Allow External Links (Off-domain)</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="ign-sitemap" checked={ignoreSitemap} onCheckedChange={(c) => setIgnoreSitemap(!!c)} />
                                            <Label htmlFor="ign-sitemap" className="font-normal cursor-pointer">Ignore robots.txt / Sitemap</Label>
                                        </div>

                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Button
                                onClick={handleCrawl}
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                {loading ? "Starting Job..." : "Start Crawl Job"}
                            </Button>

                        </CardContent>
                    </Card>
                </div>

                <div className="xl:col-span-7">
                    <ResponseViewer data={response} statusCode={statusCode} loading={loading} />
                </div>
            </div>
        </div>
    );
}
