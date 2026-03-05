"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FireForgeAPI } from "@/lib/api/client";
import { ResponseViewer } from "@/components/shared/ResponseViewer";
import { Play, FolderSearch } from "lucide-react";
import { toast } from "sonner";

export default function HealthPlayground() {
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [statusCode, setStatusCode] = useState<number | undefined>(undefined);

    const handleHealthCheck = async () => {
        setLoading(true);
        setResponse(null);
        setStatusCode(undefined);

        try {
            const api = new FireForgeAPI();
            const res = await api.health();
            setResponse(res);
            setStatusCode(200);
            toast.success("Health check succeeded!");
        } catch (error: any) {
            setResponse({ error: error.message });
            setStatusCode(503);
            toast.error("Health check failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <FolderSearch className="h-8 w-8 text-orange-500" /> API Health
                </h1>
                <p className="text-muted-foreground">
                    Check if the FireForge API and its downstream dependencies (like Firecrawl) are operational.
                    <span className="inline-flex items-center ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                        Cost: Free
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-4 space-y-6">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Health Status</CardTitle>
                            <CardDescription>Ping the server to verify connectivity.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Button
                                onClick={handleHealthCheck}
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                                {loading ? "Pinging..." : "Check Status"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="xl:col-span-8">
                    <ResponseViewer data={response} statusCode={statusCode} loading={loading} />
                </div>
            </div>
        </div>
    );
}
