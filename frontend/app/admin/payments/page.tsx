"use client";

import { useEffect, useState } from "react";
import { FireForgeAPI } from "@/lib/api/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminPaymentsPage() {
    const { adminKey } = useAuth();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const api = new FireForgeAPI(undefined, adminKey || "");
            const res = await api.getAdminPayments();
            setPayments(Array.isArray(res) ? res : res.payments || []);
        } catch (error: any) {
            toast.error("Failed to fetch payments");
            // Fallback data if endpoint is not fully ready
            if (!payments.length) {
                setPayments([]);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Zap className="h-8 w-8 text-rose-500" />
                    Polar Payments
                </h1>

                <Button onClick={fetchPayments} variant="outline" className="border-rose-900/50 bg-black/50 text-slate-300 hover:text-white hover:bg-rose-950/20">
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
                </Button>
            </div>

            <Card className="bg-black/40 border-rose-900/30 text-slate-300">
                <CardHeader>
                    <CardTitle className="text-xl">Recent Transactions</CardTitle>
                    <CardDescription className="text-slate-500">Monitor credit purchases via Polar checkout.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-rose-500" /></div>
                    ) : (
                        <div className="rounded-md border border-rose-900/30">
                            <Table>
                                <TableHeader className="bg-rose-950/20">
                                    <TableRow className="border-rose-900/30">
                                        <TableHead className="text-slate-400">Order ID</TableHead>
                                        <TableHead className="text-slate-400">User ID</TableHead>
                                        <TableHead className="text-slate-400">Amount / Credits</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-right text-slate-400">Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments.length === 0 ? (
                                        <TableRow className="border-rose-900/30 hover:bg-rose-950/10">
                                            <TableCell colSpan={5} className="text-center py-12 text-slate-500 flex flex-col items-center justify-center gap-2">
                                                <Zap className="h-6 w-6 text-slate-600 mb-2" />
                                                No payment data available at this time
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        payments.map((p) => (
                                            <TableRow key={p.id || p.order_id} className="border-rose-900/30 hover:bg-rose-950/10 transition-colors">
                                                <TableCell className="font-mono text-xs text-slate-400">{p.order_id || p.id}</TableCell>
                                                <TableCell className="font-mono text-xs text-slate-500">{p.user_id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-slate-200">${(p.amount / 100).toFixed(2)}</span>
                                                        <span className="text-xs text-slate-500">➔ {p.credits_added} cr</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={
                                                        p.status === "succeeded" || p.status === "completed"
                                                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                    }>
                                                        {p.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-slate-400 text-sm">
                                                    {new Date(p.created_at).toLocaleString()}
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
