import { Badge } from "@/components/ui/badge";
import { Key, ShieldCheck, AlertCircle, Copy, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthenticationPage() {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
                <Badge variant="outline" className="text-orange-600 border-orange-500/20 bg-orange-500/5 px-3 py-1 text-sm font-semibold tracking-wide">
                    Security
                </Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Authentication</h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                    FireForge uses API Keys to authenticate requests. You must include your key in the `Authorization` header of every API request.
                </p>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
                    <Key className="h-6 w-6 text-orange-500" />
                    How to Authenticate
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                    To authenticate, use the <code>fg_</code> prefixed API key you received upon registration. Send this key in the <code>Authorization</code> header using the <code>Bearer</code> scheme.
                </p>

                <Card className="border-border bg-slate-950 text-slate-50 overflow-hidden shadow-xl">
                    <CardHeader className="bg-slate-900/50 border-b border-white/5 py-3 px-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-slate-400">Example HTTP Header</span>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 font-mono text-sm leading-6">
                        <div className="flex gap-4">
                            <span className="text-pink-400">Authorization:</span>
                            <span className="text-green-400">Bearer fg_your_api_key_here</span>
                        </div>
                        <div className="flex gap-4">
                            <span className="text-pink-400">Content-Type:</span>
                            <span className="text-green-400">application/json</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-orange-500" />
                    Key Guidelines
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border bg-muted/30 border-border space-y-2">
                        <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Secret Keys</h4>
                        <p className="text-sm">Your API secret key should be kept confidential. Never share it or expose it in client-side code (browsers/apps).</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-muted/30 border-border space-y-2">
                        <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wider">Prefix FG_</h4>
                        <p className="text-sm">All FireForge API keys are prefixed with <code>fg_</code> to help you easily identify them in your configuration.</p>
                    </div>
                </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 flex gap-4 items-start">
                <AlertCircle className="h-6 w-6 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                    <h4 className="font-bold text-orange-700 dark:text-orange-400">Wait, I don't have a key!</h4>
                    <p className="text-sm text-orange-600/90 dark:text-orange-400/90">
                        No worries. You can get a free API key by clicking the <strong>Get Started Free</strong> button in the Navbar.
                        You'll receive 50 free credits instantly to test our endpoints.
                    </p>
                </div>
            </div>

            <div className="space-y-8 pt-6 border-t border-border">
                <h2 className="text-2xl font-bold font-sans flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-orange-500" />
                    Quick Proof of Concept
                </h2>

                <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-muted w-full justify-start p-1 mb-4 h-11 border">
                        <TabsTrigger value="curl" className="rounded-md px-6 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            cURL
                        </TabsTrigger>
                        <TabsTrigger value="python" className="rounded-md px-6 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Python
                        </TabsTrigger>
                        <TabsTrigger value="js" className="rounded-md px-6 flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            JavaScript
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="curl">
                        <Card className="border-border bg-slate-950 text-slate-50 overflow-hidden font-mono text-sm">
                            <CardContent className="p-6 overflow-x-auto whitespace-pre leading-relaxed">
                                <span className="text-slate-500"># Check API Health</span><br />
                                <span className="text-slate-400">curl</span><span className="text-sky-400"> -X</span> GET <span className="text-green-400">"https://fireforge.kapturo.online/health"</span> \<br />
                                <span className="text-sky-400">     -H</span> <span className="text-green-400">"Authorization: Bearer YOUR_API_KEY"</span>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="python">
                        <Card className="border-border bg-slate-950 text-slate-50 overflow-hidden font-mono text-sm">
                            <CardContent className="p-6 overflow-x-auto whitespace-pre leading-relaxed">
                                <span className="text-purple-400">import</span> requests<br /><br />
                                url = <span className="text-green-400">"https://fireforge.kapturo.online/v1/scrape"</span><br />
                                headers = {"{"}<br />
                                <span className="text-green-400">"Authorization"</span>: <span className="text-green-400">"Bearer YOUR_API_KEY"</span>,<br />
                                <span className="text-green-400">"Content-Type"</span>: <span className="text-green-400">"application/json"</span><br />
                                {"}"}<br />
                                payload = {"{"} <span className="text-green-400">"url"</span>: <span className="text-green-400">"https://example.com"</span> {"}"}<br /><br />
                                response = requests.post(url, headers=headers, json=payload)<br />
                                <span className="text-orange-400">print</span>(response.json())
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="js">
                        <Card className="border-border bg-slate-950 text-slate-50 overflow-hidden font-mono text-sm">
                            <CardContent className="p-6 overflow-x-auto whitespace-pre leading-relaxed">
                                <span className="text-sky-400">const</span> response = <span className="text-sky-400">await</span> <span className="text-orange-400">fetch</span>(<span className="text-green-400">'https://fireforge.kapturo.online/v1/scrape'</span>, {"{"}<br />
                                method: <span className="text-green-400">'POST'</span>,<br />
                                headers: {"{"}<br />
                                <span className="text-green-400">'Authorization'</span>: <span className="text-green-400">'Bearer YOUR_API_KEY'</span>,<br />
                                <span className="text-green-400">'Content-Type'</span>: <span className="text-green-400">'application/json'</span><br />
                                {"}"},<br />
                                body: <span className="text-orange-400">JSON</span>.<span className="text-orange-400">stringify</span>({"{"} url: <span className="text-green-400">'https://example.com'</span> {"}"})<br />
                                {"}"});<br /><br />
                                <span className="text-sky-400">const</span> data = <span className="text-sky-400">await</span> response.<span className="text-orange-400">json</span>();<br />
                                <span className="text-slate-500">// Your structured data</span>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
