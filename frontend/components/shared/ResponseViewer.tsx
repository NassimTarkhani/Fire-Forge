"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Download } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

interface ResponseViewerProps {
    data: any | null;
    statusCode?: number;
    loading?: boolean;
    endpoint?: string;
    method?: string;
    requestBody?: any;
}

export function ResponseViewer({ data, statusCode, loading, endpoint = "/v1/scrape", method = "POST", requestBody = {} }: ResponseViewerProps) {
    const [copied, setCopied] = useState(false);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20 animate-pulse">
                <div className="h-8 w-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Executing request...</p>
            </div>
        );
    }

    if (!data && !statusCode) {
        return (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">Hit "Send Request" to see the response</p>
            </div>
        );
    }

    const jsonString = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
    const markdownContent = data?.data?.markdown || data?.markdown || "";

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        toast.success("Response copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `response-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Downloaded response data");
    };

    const isSuccess = statusCode ? statusCode >= 200 && statusCode < 300 : true;

    return (
        <div className="border rounded-lg overflow-hidden bg-background shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Status</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${isSuccess ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-red-500/20 text-red-600 dark:text-red-400"
                        }`}>
                        {statusCode || 200}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleCopy}>
                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="json" className="w-full">
                <div className="px-4 py-2 border-b bg-muted/20">
                    <TabsList className="h-8">
                        <TabsTrigger value="json" className="text-xs px-3 h-6">Response JSON</TabsTrigger>
                        {markdownContent && <TabsTrigger value="markdown" className="text-xs px-3 h-6">Markdown Preview</TabsTrigger>}
                        <TabsTrigger value="code" className="text-xs px-3 h-6">Show Code</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="json" className="m-0 border-0 p-0">
                    <ScrollArea className="h-[500px] w-full bg-[#1E1E1E]">
                        <SyntaxHighlighter
                            language="json"
                            style={vscDarkPlus}
                            customStyle={{
                                margin: 0,
                                padding: "1rem",
                                background: "transparent",
                                fontSize: "14px",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {jsonString}
                        </SyntaxHighlighter>
                    </ScrollArea>
                </TabsContent>

                {markdownContent && (
                    <TabsContent value="markdown" className="m-0 border-0 p-0">
                        <ScrollArea className="h-[500px] w-full bg-background p-6">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>{markdownContent}</ReactMarkdown>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                )}

                <TabsContent value="code" className="m-0 border-0 p-0">
                    <ScrollArea className="h-[500px] w-full bg-[#1E1E1E]">
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">cURL</div>
                                <SyntaxHighlighter language="bash" style={vscDarkPlus} customStyle={{ margin: 0, padding: "1rem", borderRadius: "0.5rem" }}>
                                    {`curl -X ${method} https://fireforge.kapturo.online${endpoint} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(requestBody, null, 2)}'`}
                                </SyntaxHighlighter>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Python</div>
                                <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ margin: 0, padding: "1rem", borderRadius: "0.5rem" }}>
                                    {`import requests

url = "https://fireforge.kapturo.online${endpoint}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = ${JSON.stringify(requestBody, null, 4)}

response = requests.request("${method}", url, json=data, headers=headers)
print(response.json())`}
                                </SyntaxHighlighter>
                            </div>

                            <div className="space-y-2">
                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">JavaScript (Fetch)</div>
                                <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: "1rem", borderRadius: "0.5rem" }}>
                                    {`fetch("https://fireforge.kapturo.online${endpoint}", {
  method: "${method}",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${JSON.stringify(requestBody, null, 2)})
})
.then(response => response.json())
.then(result => console.log(result))
.catch(error => console.error('error', error));`}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
