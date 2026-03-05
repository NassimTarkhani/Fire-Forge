"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FireForgeAPI, BatchScrapeRequest } from "@/lib/api/client";
import { ResponseViewer } from "@/components/shared/ResponseViewer";
import { useAuth } from "@/components/providers/AuthProvider";
import { Play, Settings2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function BatchScrapePlayground() {
    const { apiKey, deductCredits, getCost } = useAuth();
    const [urlsText, setUrlsText] = useState("https://example.com/page1\nhttps://example.com/page2");
    const [onlyMainContent, setOnlyMainContent] = useState(true);

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

    const handleBatchScrape = async () => {
        const urls = urlsText.split("\n").map(u => u.trim()).filter(u => u.length > 0);

        if (urls.length === 0) {
            toast.error("Please enter at least one URL");
            return;
        }

        setLoading(true);
        setResponse(null);
        setStatusCode(undefined);

        try {
            const api = new FireForgeAPI(apiKey || undefined);
            const payload: BatchScrapeRequest = {
                urls,
                onlyMainContent,
                formats: ["markdown"] // Simplified for batch
            };

            const res = await api.batchScrape(payload);
            setResponse(res);
            const unitCost = getCost("/v1/batch/scrape");
            const totalCost = urls.length * unitCost;
            setStatusCode(200);
            toast.success(`Batch job started with ${urls.length} URLs! Cost: ${totalCost} Credit${totalCost !== 1 ? "s" : ""}.`);

            deductCredits(totalCost);
        } catch (error: any) {
            setResponse({ error: error.message });
            setStatusCode(400);
            toast.error("Batch scrape failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ListChecks className="h-8 w-8 text-orange-500" /> Batch Scrape
                </h1>
                <p className="text-muted-foreground">
                    Extract structured data from multiple independent websites concurrently.
                    <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        Cost: {getCost("/v1/batch/scrape")} Credit{getCost("/v1/batch/scrape") !== 1 ? "s" : ""} / URL
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-5 space-y-6">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Multi-URL Configuration</CardTitle>
                            <CardDescription>Enter URLs to scrape simultaneously (one per line).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="urls">Target URLs</Label>
                                <Textarea
                                    id="urls"
                                    value={urlsText}
                                    onChange={e => setUrlsText(e.target.value)}
                                    placeholder="https://example.com/one&#10;https://example.com/two"
                                    className="font-mono text-sm h-32 resize-none"
                                />
                            </div>

                            <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
                                <AccordionItem value="options" className="border-b-0">
                                    <AccordionTrigger className="hover:no-underline py-3">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Settings2 className="h-4 w-4" />
                                            Batch Options
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2 pb-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="onlyMainContent"
                                                checked={onlyMainContent}
                                                onCheckedChange={(c) => setOnlyMainContent(!!c)}
                                            />
                                            <Label htmlFor="onlyMainContent" className="font-normal cursor-pointer text-sm">
                                                Only Main Content (Applies to all)
                                            </Label>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Button
                                onClick={handleBatchScrape}
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                {loading ? "Starting Batch Job..." : "Queue URLs"}
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
