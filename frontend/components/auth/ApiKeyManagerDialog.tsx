"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FireForgeAPI, UserApiKeyListItem } from "@/lib/api/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { CheckCircle2, Copy, KeyRound, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

function getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
}

export function ApiKeyManagerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const { authToken, apiKey, setApiKey, clearApiKey } = useAuth();

    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

    const [keys, setKeys] = useState<UserApiKeyListItem[]>([]);
    const [freshlyCreatedKey, setFreshlyCreatedKey] = useState<string | null>(null);

    const activePrefix = useMemo(() => (apiKey ? apiKey.slice(0, 12) : null), [apiKey]);

    const fetchKeys = useCallback(async () => {
        if (!authToken) {
            setKeys([]);
            return;
        }

        setLoading(true);
        try {
            const api = new FireForgeAPI(undefined, undefined, authToken);
            const list = await api.listUserApiKeys(true);
            setKeys(Array.isArray(list) ? list : []);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to load API keys"));
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        if (!open) return;
        setFreshlyCreatedKey(null);
        fetchKeys();
    }, [open, fetchKeys]);

    const handleCreateKey = async () => {
        if (!authToken) {
            toast.error("Please login first.");
            return;
        }

        setCreating(true);
        try {
            const api = new FireForgeAPI(undefined, undefined, authToken);
            const res = await api.createUserApiKey();
            setFreshlyCreatedKey(res.api_key);
            setApiKey(res.api_key);
            toast.success("API key generated successfully");
            await fetchKeys();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to create API key"));
        } finally {
            setCreating(false);
        }
    };

    const handleRevoke = async (keyId: string, keyPrefix: string) => {
        if (!authToken) {
            toast.error("Please login first.");
            return;
        }

        const confirmed = confirm("Revoke this API key? This action cannot be undone.");
        if (!confirmed) return;

        setRevokingKeyId(keyId);
        try {
            const api = new FireForgeAPI(undefined, undefined, authToken);
            await api.revokeUserApiKey(keyId);

            if (activePrefix && keyPrefix === activePrefix) {
                clearApiKey();
            }

            toast.success("API key revoked");
            await fetchKeys();
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to revoke API key"));
        } finally {
            setRevokingKeyId(null);
        }
    };

    const handleCopyCreated = () => {
        if (!freshlyCreatedKey) return;
        navigator.clipboard.writeText(freshlyCreatedKey);
        toast.success("API key copied to clipboard");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-orange-500" />
                        Manage API Keys
                    </DialogTitle>
                    <DialogDescription>
                        Create, review, and revoke your personal API keys.
                    </DialogDescription>
                </DialogHeader>

                {freshlyCreatedKey && (
                    <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 space-y-3">
                        <div className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            New API key created. Save it now, it is shown only once.
                        </div>
                        <div className="flex gap-2">
                            <Input value={freshlyCreatedKey} readOnly className="font-mono text-xs" />
                            <Button type="button" variant="outline" size="icon" onClick={handleCopyCreated}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Your account keys</p>
                    <Button onClick={handleCreateKey} disabled={creating || !authToken}>
                        {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                        Create Key
                    </Button>
                </div>

                <div className="rounded-md border max-h-[320px] overflow-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : keys.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            No API keys found yet.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {keys.map((k) => {
                                const isCurrent = !!activePrefix && activePrefix === k.key_prefix;
                                return (
                                    <div key={k.id} className="flex items-center justify-between gap-4 p-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs">{k.key_prefix}...</span>
                                                {isCurrent && <Badge variant="secondary">Current</Badge>}
                                                {k.revoked ? (
                                                    <Badge variant="outline" className="text-red-500 border-red-500/40">Revoked</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-600 border-green-600/40">Active</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Created {new Date(k.created_at || Date.now()).toLocaleString()}
                                            </p>
                                        </div>

                                        {!k.revoked && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRevoke(k.id, k.key_prefix)}
                                                disabled={revokingKeyId === k.id}
                                                className="text-red-500 hover:text-red-500"
                                            >
                                                {revokingKeyId === k.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                                Revoke
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
