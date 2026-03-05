"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FireForgeAPI, MapRequest } from "@/lib/api/client";
import { ResponseViewer } from "@/components/shared/ResponseViewer";
import { useAuth } from "@/components/providers/AuthProvider";
import { Play, Settings2, Layers } from "lucide-react";
import { toast } from "sonner";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function MapPlayground() {
    const { apiKey, deductCredits, getCost } = useAuth();
    const [url, setUrl] = useState("https://example.com");
    const [search, setSearch] = useState("");
    const [limit, setLimit] = useState<number>(100);
    const [includeSubdomains, setIncludeSubdomains] = useState(false);
    const [ignoreSitemap, setIgnoreSitemap] = useState(false);

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

    const handleMap = async () => {
        if (!url) {
            toast.error("URL is required");
            return;
        }

        setLoading(true);
        setResponse(null);
        setStatusCode(undefined);

        try {
            const api = new FireForgeAPI(apiKey || undefined);
            const payload: MapRequest = {
                url,
                search: search || undefined,
                limit,
                includeSubdomains,
                ignoreSitemap
            };

            const res = await api.map(payload);
            setResponse(res);
            const cost = getCost("/v1/map");
            setStatusCode(200);
            toast.success(`Mapping successful! Cost: ${cost} Credit${cost !== 1 ? "s" : ""}.`);

            deductCredits(cost);
        } catch (error: any) {
            setResponse({ error: error.message });
            setStatusCode(400);
            toast.error("Map failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Layers className="h-8 w-8 text-orange-500" /> Map Website Structure
                </h1>
                <p className="text-muted-foreground">
                    Discover all reachable URLs and structure on a domain without crawling content.
                    <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        Cost: {getCost("/v1/map")} Credit{getCost("/v1/map") !== 1 ? "s" : ""}
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-5 space-y-6">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Mapping Configuration</CardTitle>
                            <CardDescription>Setup your target URL to extract the sitemap and structure.</CardDescription>
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

                            <div className="space-y-2">
                                <Label htmlFor="search">Search Filter (Optional)</Label>
                                <Input
                                    id="search"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="e.g. docs, pricing, blog"
                                />
                                <p className="text-[10px] text-muted-foreground">Only map URLs containing this semantic term.</p>
                            </div>

                            <Accordion type="single" collapsible className="w-full border rounded-lg px-4">
                                <AccordionItem value="options" className="border-b-0">
                                    <AccordionTrigger className="hover:no-underline py-3">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Settings2 className="h-4 w-4" />
                                            Advanced Map Options
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-2 pb-4">
                                        <div className="space-y-2 pb-2">
                                            <Label htmlFor="limit">Result Limit</Label>
                                            <Input
                                                id="limit"
                                                type="number"
                                                value={limit}
                                                onChange={e => setLimit(parseInt(e.target.value) || 100)}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="subdomains" checked={includeSubdomains} onCheckedChange={(c) => setIncludeSubdomains(!!c)} />
                                            <Label htmlFor="subdomains" className="font-normal cursor-pointer">Include Subdomains</Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="ign-sitemap" checked={ignoreSitemap} onCheckedChange={(c) => setIgnoreSitemap(!!c)} />
                                            <Label htmlFor="ign-sitemap" className="font-normal cursor-pointer">Ignore Website Sitemap</Label>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <Button
                                onClick={handleMap}
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                {loading ? "Mapping..." : "Extract Structure"}
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
