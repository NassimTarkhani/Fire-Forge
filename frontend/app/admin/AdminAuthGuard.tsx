"use client";

import { useEffect, useState } from "react";
import { FireForgeAPI } from "@/lib/api/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
    const { adminKey, setAdminKey, adminLogout } = useAuth();
    const isAdmin = !!adminKey;
    const [loading, setLoading] = useState(false);
    const [adminKeyInput, setAdminKeyInput] = useState("");
    const [validating, setValidating] = useState(false);

    const handleLogin = async () => {
        if (!adminKeyInput) {
            toast.error("Enter the Admin Master Key");
            return;
        }

        setValidating(true);
        try {
            const api = new FireForgeAPI(undefined, adminKeyInput);
            await api.getAdminUsers(); // Quick validation call

            setAdminKey(adminKeyInput);
            toast.success("Admin Authentication Successful");
        } catch (error: any) {
            toast.error("Invalid Admin Key or Unauthorized.");
        } finally {
            setValidating(false);
        }
    };

    const handleLogout = () => {
        adminLogout();
        toast.success("Disconnected from Admin Console");
    };

    if (loading) {
        return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-rose-500" /></div>;
    }

    if (!isAdmin) {
        return (
            <div className="max-w-md mx-auto mt-20 animate-in fade-in slide-in-from-bottom-4">
                <Card className="border-rose-900/50 bg-black/40 backdrop-blur shadow-2xl overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-rose-500"></div>
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto bg-rose-500/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                            <ShieldAlert className="h-10 w-10 text-rose-500" />
                        </div>
                        <CardTitle className="text-2xl text-slate-100">Admin Restricted Area</CardTitle>
                        <CardDescription className="text-slate-400">Master authentication required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    type="password"
                                    autoFocus
                                    placeholder="Enter Master Key"
                                    value={adminKeyInput}
                                    onChange={(e) => setAdminKeyInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                                    className="pl-10 bg-black/50 border-rose-900/50 text-slate-200 focus-visible:ring-rose-500 font-mono"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleLogin}
                            disabled={validating}
                            className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/20"
                        >
                            {validating ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authenticate"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                >
                    <ShieldAlert className="mr-2 h-4 w-4" /> Disconnect Admin
                </Button>
            </div>
            {children}
        </div>
    );
}
