import { Badge } from "@/components/ui/badge";
import { Code2, Terminal, Library, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SDKsPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
            <div className="space-y-4">
                <Badge variant="outline" className="text-orange-600 border-orange-500/20 bg-orange-500/5 px-3 py-1 text-sm font-semibold tracking-wide">
                    Resources
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">SDKs & Examples</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    FireForge is compatible with most standard HTTP clients. We provide native integrations and patterns to help you build faster.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-all hover:scale-[1.02]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="bg-blue-500/10 p-2 rounded-lg">
                                <Code2 className="h-5 w-5 text-blue-500" />
                            </div>
                            Python SDK
                        </CardTitle>
                        <CardDescription>Coming Soon &bull; Open Source</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground italic">
                        The official Python library for FireForge. Includes full type hinting and async support.
                    </CardContent>
                </Card>

                <Card className="border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-all hover:scale-[1.02]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="bg-yellow-500/10 p-2 rounded-lg">
                                <Library className="h-5 w-5 text-yellow-500" />
                            </div>
                            JavaScript SDK
                        </CardTitle>
                        <CardDescription>Coming Soon &bull; NPM Ready</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground italic">
                        Type-safe TypeScript SDK for Node.js and browser environments. Seamless integration with Next.js.
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6 pt-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-orange-500" />
                    Community Patterns
                </h2>
                <div className="space-y-4">
                    <p className="text-muted-foreground">
                        While we prepare our official SDKs, you can use these proven patterns to integrate FireForge into your applications today.
                    </p>

                    <Tabs defaultValue="node" className="w-full">
                        <TabsList className="bg-muted w-fit h-11 border p-1 rounded-lg">
                            <TabsTrigger value="node" className="px-6 rounded-md">Node.js (Fetch)</TabsTrigger>
                            <TabsTrigger value="python-sync" className="px-6 rounded-md">Python (Requests)</TabsTrigger>
                            <TabsTrigger value="go" className="px-6 rounded-md">Go</TabsTrigger>
                        </TabsList>

                        <TabsContent value="node" className="mt-4">
                            <Card className="bg-slate-950 border-white/5 font-mono text-sm overflow-hidden">
                                <CardContent className="p-6 overflow-x-auto leading-relaxed">
                                    <pre className="text-slate-300">
                                        {`async function fireforgeScrape(targetUrl) {
  const API_KEY = 'fg_your_api_key';
  
  const res = await fetch('https://fireforge.kapturo.online/v1/scrape', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: targetUrl,
      formats: ['markdown'],
      onlyMainContent: true
    })
  });
  
  if (!res.ok) throw new Error(\`Failed: \${res.status}\`);
  return await res.json();
}`}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="python-sync" className="mt-4">
                            <Card className="bg-slate-950 border-white/5 font-mono text-sm overflow-hidden">
                                <CardContent className="p-6 overflow-x-auto leading-relaxed">
                                    <pre className="text-slate-300">
                                        {`import requests

def fireforge_scrape(url):
    api_key = "fg_your_api_key"
    endpoint = "https://fireforge.kapturo.online/v1/scrape"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "url": url,
        "formats": ["markdown"]
    }
    
    response = requests.post(endpoint, headers=headers, json=payload)
    response.raise_for_status()
    return response.json()`}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="go" className="mt-4">
                            <Card className="bg-slate-950 border-white/5 font-mono text-sm overflow-hidden">
                                <CardContent className="p-6 overflow-x-auto leading-relaxed text-slate-300">
                                    <pre>
                                        {`package main

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func main() {
	url := "https://fireforge.kapturo.online/v1/scrape"
	payload := map[string]string{"url": "https://example.com"}
	jsonBody, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer fg_your_api_key")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, _ := client.Do(req)
	defer resp.Body.Close()
}`}
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                        ?
                    </div>
                    <div>
                        <h4 className="font-bold">Need help integrating?</h4>
                        <p className="text-sm text-muted-foreground">Reach out to our developer support team.</p>
                    </div>
                </div>
                <button className="px-6 py-2 rounded-lg border border-border bg-background hover:bg-muted font-medium transition-colors">
                    Join Discord
                </button>
            </div>
        </div>
    );
}
