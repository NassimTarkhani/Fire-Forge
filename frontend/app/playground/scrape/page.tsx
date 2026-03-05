"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FireForgeAPI, ScrapeRequest } from "@/lib/api/client";
import { ResponseViewer } from "@/components/shared/ResponseViewer";
import { useAuth } from "@/components/providers/AuthProvider";
import { Play, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function ScrapePlayground() {
    const { apiKey, deductCredits, getCost } = useAuth();
    const [url, setUrl] = useState("https://example.com");
    const [onlyMainContent, setOnlyMainContent] = useState(true);
    const [formats, setFormats] = useState<string[]>(["markdown"]);
    const [waitFor, setWaitFor] = useState<number>(0);

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

    const handleScrape = async () => {
        if (!url) {
            toast.error("URL is required");
            return;
        }

        setLoading(true);
        setResponse(null);
        setStatusCode(undefined);

        try {
            const api = new FireForgeAPI(apiKey || undefined);
            const payload: ScrapeRequest = {
                url,
                onlyMainContent,
                formats,
                waitFor: waitFor > 0 ? waitFor : undefined,
            };

            const res = await api.scrape(payload);
            setResponse(res);
            const cost = getCost("/v1/scrape");
            setStatusCode(200);
            toast.success(`Scrape successful! Cost: ${cost} Credit${cost !== 1 ? "s" : ""}.`);

            deductCredits(cost);
        } catch (error: any) {
            setResponse({ error: error.message });
            setStatusCode(400); // Approximation
            toast.error("Scrape failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleFormat = (format: string) => {
        setFormats(prev =>
            prev.includes(format)
                ? prev.filter(f => f !== format)
                : [...prev, format]
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Scrape URL</h1>
                <p className="text-muted-foreground">
                    Extract structured data from any website. Returns clean markdown or HTML.
                    <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        Cost: {getCost("/v1/scrape")} Credit{getCost("/v1/scrape") !== 1 ? "s" : ""}
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Request Setup */}
                <div className="xl:col-span-5 space-y-6">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Request Configuration</CardTitle>
                            <CardDescription>Setup your target URL and scraping parameters.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="url">Target URL</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="url"
                                        value={url}
                                        onChange={e => setUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="flex-1 font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
                                <AccordionItem value="options" className="border-b-0">
                                    <AccordionTrigger className="hover:no-underline py-3">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Settings2 className="h-4 w-4" />
                                            Advanced Options
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2 pb-4">

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="onlyMainContent"
                                                checked={onlyMainContent}
                                                onCheckedChange={(c) => setOnlyMainContent(!!c)}
                                            />
                                            <Label htmlFor="onlyMainContent" className="font-normal cursor-pointer leading-snug">
                                                Only Main Content<br />
                                                <span className="text-xs text-muted-foreground">Excludes navbars, footers, and sidebars</span>
                                            </Label>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-muted-foreground uppercase">Response Formats</Label>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="fmt-markdown" checked={formats.includes("markdown")} onCheckedChange={() => toggleFormat("markdown")} />
                                                    <Label htmlFor="fmt-markdown" className="font-normal cursor-pointer text-sm">Markdown</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="fmt-html" checked={formats.includes("html")} onCheckedChange={() => toggleFormat("html")} />
                                                    <Label htmlFor="fmt-html" className="font-normal cursor-pointer text-sm">HTML</Label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pt-2">
                                            <Label htmlFor="waitFor" className="text-xs font-medium text-muted-foreground uppercase">Wait For (ms)</Label>
                                            <Input
                                                id="waitFor"
                                                type="number"
                                                value={waitFor}
                                                onChange={e => setWaitFor(parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className="h-8"
                                            />
                                            <p className="text-[10px] text-muted-foreground">Time to wait after page load before scraping.</p>
                                        </div>

                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Button
                                onClick={handleScrape}
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {loading ? (
                                    <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                                ) : (
                                    <Play className="h-4 w-4 mr-2" />
                                )}
                                {loading ? "Scraping..." : "Send Request"}
                            </Button>

                        </CardContent>
                    </Card>
                </div>

                {/* Response Viewer */}
                <div className="xl:col-span-7">
                    <ResponseViewer data={response} statusCode={statusCode} loading={loading} />
                </div>
            </div>
        </div>
    );
}
