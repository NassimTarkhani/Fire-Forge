"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FireForgeAPI, SearchRequest } from "@/lib/api/client";
import { ResponseViewer } from "@/components/shared/ResponseViewer";
import { useAuth } from "@/components/providers/AuthProvider";
import { Play, Search } from "lucide-react";
import { toast } from "sonner";

export default function SearchPlayground() {
    const { apiKey, deductCredits, getCost } = useAuth();
    const [query, setQuery] = useState("");
    const [limit, setLimit] = useState<number>(10);

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

    const handleSearch = async () => {
        if (!query) {
            toast.error("Search query is required");
            return;
        }

        setLoading(true);
        setResponse(null);
        setStatusCode(undefined);

        try {
            const api = new FireForgeAPI(apiKey || undefined);
            const payload: SearchRequest = {
                query,
                limit,
            };

            const res = await api.search(payload);
            setResponse(res);
            const cost = getCost("/v1/search");
            setStatusCode(200);
            toast.success(`Search successful! Cost: ${cost} Credit${cost !== 1 ? "s" : ""}/result.`);

            deductCredits(cost);
        } catch (error: any) {
            setResponse({ error: error.message });
            setStatusCode(400);
            toast.error("Search failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Search className="h-8 w-8 text-orange-500" /> Search Content
                </h1>
                <p className="text-muted-foreground">
                    Find specific information across all your crawled and scraped data.
                    <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                        Cost: {getCost("/v1/search")} Credit{getCost("/v1/search") !== 1 ? "s" : ""} / Result
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-5 space-y-6">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Query Setup</CardTitle>
                            <CardDescription>Enter semantic terms to find in your web data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="query">Search Query</Label>
                                <Input
                                    id="query"
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    placeholder="e.g. Acme corp pricing details"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="limit">Result Limit</Label>
                                <Input
                                    id="limit"
                                    type="number"
                                    value={limit}
                                    onChange={e => setLimit(parseInt(e.target.value) || 10)}
                                />
                            </div>

                            <Button
                                onClick={handleSearch}
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                {loading ? "Searching..." : "Execute Search"}
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
