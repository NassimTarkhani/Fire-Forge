"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Terminal, Brackets, Table as TableIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Parameter {
    name: string;
    type: string;
    required: boolean;
    description: string;
}

interface EndpointDocProps {
    title: string;
    description: string;
    endpoint: string;
    method: "GET" | "POST" | "DELETE" | "PUT";
    cost: string;
    parameters: Parameter[];
    examples: {
        curl: string;
        js: string;
        python: string;
        response: string;
    };
}

export function EndpointDoc({
    title,
    description,
    endpoint,
    method,
    cost,
    parameters,
    examples
}: EndpointDocProps) {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge className={cn(
                        "font-bold px-3 py-1",
                        method === "POST" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                            method === "GET" ? "bg-green-500/10 text-green-600 border-green-500/20" :
                                "bg-red-500/10 text-red-600 border-red-500/20"
                    )} variant="outline">
                        {method}
                    </Badge>
                    <code className="text-muted-foreground font-mono text-sm">{endpoint}</code>
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">{title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>

                <div className="flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-500/5 border border-orange-500/10 w-fit px-3 py-1.5 rounded-full">
                    <Coins className="h-4 w-4" />
                    Cost: {cost}
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <TableIcon className="h-6 w-6 text-orange-500" />
                    Parameters
                </h2>
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[150px]">Parameter</TableHead>
                                <TableHead className="w-[100px]">Type</TableHead>
                                <TableHead className="w-[100px]">Required</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {parameters.map((param) => (
                                <TableRow key={param.name}>
                                    <TableCell className="font-mono font-bold text-orange-600 dark:text-orange-400">{param.name}</TableCell>
                                    <TableCell><code className="text-xs">{param.type}</code></TableCell>
                                    <TableCell>
                                        {param.required ? (
                                            <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Required</Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Optional</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{param.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="space-y-6 pt-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-orange-500" />
                    Example Requests
                </h2>
                <Tabs defaultValue="curl" className="w-full">
                    <TabsList className="bg-muted w-full justify-start p-1 mb-4 h-11 border">
                        <TabsTrigger value="curl" className="rounded-md px-6 flex items-center gap-2 data-[state=active]:bg-background">cURL</TabsTrigger>
                        <TabsTrigger value="js" className="rounded-md px-6 flex items-center gap-2 data-[state=active]:bg-background">JavaScript</TabsTrigger>
                        <TabsTrigger value="python" className="rounded-md px-6 flex items-center gap-2 data-[state=active]:bg-background">Python</TabsTrigger>
                    </TabsList>

                    <TabsContent value="curl">
                        <pre className="p-6 rounded-xl bg-slate-950 text-slate-300 font-mono text-sm overflow-x-auto border border-white/5 leading-relaxed">
                            {examples.curl}
                        </pre>
                    </TabsContent>
                    <TabsContent value="js">
                        <pre className="p-6 rounded-xl bg-slate-950 text-slate-300 font-mono text-sm overflow-x-auto border border-white/5 leading-relaxed">
                            {examples.js}
                        </pre>
                    </TabsContent>
                    <TabsContent value="python">
                        <pre className="p-6 rounded-xl bg-slate-950 text-slate-300 font-mono text-sm overflow-x-auto border border-white/5 leading-relaxed">
                            {examples.python}
                        </pre>
                    </TabsContent>
                </Tabs>
            </div>

            <div className="space-y-6 pt-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Brackets className="h-6 w-6 text-orange-500" />
                    Example Response
                </h2>
                <pre className="p-6 rounded-xl bg-slate-950 text-green-400 font-mono text-sm overflow-x-auto border border-white/5 leading-relaxed">
                    {examples.response}
                </pre>
            </div>
        </div>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}
