"use client";

import { useEffect, useState } from "react";
import { FireForgeAPI } from "@/lib/api/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Key, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminKeysPage() {
    const { adminKey } = useAuth();
    const [keys, setKeys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [createOpen, setCreateOpen] = useState(false);
    const [userId, setUserId] = useState("");
    const [keyName, setKeyName] = useState("");
    const [creating, setCreating] = useState(false);

    // For showing the newly created key once
    const [newKey, setNewKey] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        setLoading(true);
        try {
            const api = new FireForgeAPI(undefined, adminKey || "");
            const res = await api.getAdminApiKeys();
            setKeys(Array.isArray(res) ? res : res.keys || []);
        } catch (error: any) {
            toast.error("Failed to fetch API keys");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateKey = async () => {
        if (!userId || !keyName) {
            toast.error("User ID and Key Name are required");
            return;
        }

        setCreating(true);
        try {
            const api = new FireForgeAPI(undefined, adminKey || "");
            const res = await api.createAdminApiKey(userId, keyName);
            setNewKey(res.key);
            toast.success("API key created successfully");
            fetchKeys(); // refresh list behind the modal
        } catch (error: any) {
            toast.error("Failed to create key: " + error.message);
        } finally {
            setCreating(false);
        }
    };

    const handleRevoke = async (keyId: string) => {
        if (!confirm("Are you sure you want to revoke this key? This action cannot be undone.")) return;

        try {
            const api = new FireForgeAPI(undefined, adminKey || "");
            await api.revokeAdminApiKey(keyId);
            toast.success("API Key Revoked");
            fetchKeys();
        } catch (error: any) {
            toast.error("Revoke failed: " + error.message);
        }
    };

    const resetForm = () => {
        setNewKey(null);
        setUserId("");
        setKeyName("");
        setCreateOpen(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Key className="h-8 w-8 text-rose-500" />
                    API Key Management
                </h1>

                <Dialog open={createOpen} onOpenChange={(open) => {
                    if (!open) resetForm();
                    else setCreateOpen(true);
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20">
                            <Plus className="mr-2 h-4 w-4" /> Generate Key
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] bg-[#0A0A0A] border-rose-900/50 text-slate-200">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-slate-100">
                                {newKey ? "Important: Copy the New Key" : "Generate API Key"}
                            </DialogTitle>
                        </DialogHeader>

                        {newKey ? (
                            <div className="space-y-4 pt-4">
                                <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-md text-orange-400 text-sm">
                                    ⚠️ This key will only be shown once. Please provide it to the user.
                                </div>
                                <div className="flex gap-2">
                                    <Input readOnly value={newKey} className="font-mono bg-black/50 border-rose-900/50" />
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(newKey);
                                            toast.success("Copied to clipboard");
                                        }}
                                        className="border-rose-900/50 hover:bg-rose-950/20"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button onClick={resetForm} className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white">
                                    Done
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="userId">User ID (UUID)</Label>
                                    <Input
                                        id="userId"
                                        value={userId}
                                        onChange={e => setUserId(e.target.value)}
                                        placeholder="Enter strict user UUID"
                                        className="font-mono text-sm bg-black/50 border-rose-900/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="keyName">Key Name</Label>
                                    <Input
                                        id="keyName"
                                        value={keyName}
                                        onChange={e => setKeyName(e.target.value)}
                                        placeholder="e.g. Production Backend"
                                        className="bg-black/50 border-rose-900/50"
                                    />
                                </div>
                                <Button onClick={handleCreateKey} disabled={creating} className="w-full bg-rose-600 hover:bg-rose-700 text-white mt-4">
                                    {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Generate Key
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-black/40 border-rose-900/30 text-slate-300">
                <CardHeader>
                    <CardTitle className="text-xl">Active API Keys</CardTitle>
                    <CardDescription className="text-slate-500">View and revoke authentication keys across your platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-rose-500" /></div>
                    ) : (
                        <div className="rounded-md border border-rose-900/30">
                            <Table>
                                <TableHeader className="bg-rose-950/20">
                                    <TableRow className="border-rose-900/30">
                                        <TableHead className="text-slate-400">Name</TableHead>
                                        <TableHead className="text-slate-400">Key Identifier</TableHead>
                                        <TableHead className="text-slate-400">User ID</TableHead>
                                        <TableHead className="text-slate-400">Created</TableHead>
                                        <TableHead className="text-right text-slate-400">Revoke</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {keys.length === 0 ? (
                                        <TableRow className="border-rose-900/30 hover:bg-rose-950/10">
                                            <TableCell colSpan={5} className="text-center py-6 text-slate-500">No active keys found</TableCell>
                                        </TableRow>
                                    ) : (
                                        keys.map((k) => (
                                            <TableRow key={k.key_id || k.id} className="border-rose-900/30 hover:bg-rose-950/10 transition-colors">
                                                <TableCell className="font-medium text-slate-200">{k.name || "Default"}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono bg-slate-900/50 border-slate-800 text-slate-400">
                                                        {k.key_preview || `${(k.key || "fireforge_...").substring(0, 15)}...`}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-slate-500">{k.user_id}</TableCell>
                                                <TableCell className="text-slate-400">{new Date(k.created_at || Date.now()).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRevoke(k.key_id || k.id)}
                                                        className="h-8 w-8 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
