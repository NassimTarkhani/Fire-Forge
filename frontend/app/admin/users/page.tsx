"use client";

import { useEffect, useState } from "react";
import { AdminUserRecord, FireForgeAPI } from "@/lib/api/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Users, Edit } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function AdminUsersPage() {
    const { adminKey } = useAuth();
    const [users, setUsers] = useState<Array<AdminUserRecord & { credits: number }>>([]);
    const [loading, setLoading] = useState(true);

    // Create User State
    const [createOpen, setCreateOpen] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newName, setNewName] = useState("");
    const [initialCredits, setInitialCredits] = useState(50);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [adminKey]);

    const getErrorMessage = (error: unknown, fallback: string) => {
        if (error instanceof Error && error.message) return error.message;
        return fallback;
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const api = new FireForgeAPI(undefined, adminKey || "");
            const userList = await api.getAdminUsers();

            const creditResults = await Promise.all(
                userList.map(async (user) => {
                    try {
                        const balance = await api.getAdminCredits(user.id);
                        return [user.id, balance.balance] as const;
                    } catch {
                        return [user.id, 0] as const;
                    }
                })
            );
            const creditsByUserId = Object.fromEntries(creditResults);

            const hydratedUsers = userList.map((user) => ({
                ...user,
                credits: creditsByUserId[user.id] ?? 0,
            }));

            setUsers(hydratedUsers);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to fetch users"));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        setCreating(true);
        try {
            const api = new FireForgeAPI(undefined, adminKey || "");
            await api.createAdminUser(newEmail, newName, initialCredits);
            toast.success("User created successfully");
            setCreateOpen(false);
            fetchUsers();
        } catch (error: unknown) {
            toast.error("Failed to create user: " + getErrorMessage(error, "Unknown error"));
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Users className="h-8 w-8 text-rose-500" />
                    User Management
                </h1>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-rose-600 hover:bg-rose-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> New User
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-[#0A0A0A] border-rose-900/50 text-white">
                        <DialogHeader>
                            <DialogTitle>Add New User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" value={newName} onChange={e => setNewName(e.target.value)} className="bg-black/50 border-rose-900/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-black/50 border-rose-900/50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="credits">Initial Credits</Label>
                                <Input id="credits" type="number" value={initialCredits} onChange={e => setInitialCredits(parseInt(e.target.value) || 0)} className="bg-black/50 border-rose-900/50" />
                            </div>
                            <Button onClick={handleCreateUser} disabled={creating} className="w-full bg-rose-600 hover:bg-rose-700 mt-4">
                                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Create User
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="bg-black/40 border-rose-900/30 text-slate-300">
                <CardHeader>
                    <CardTitle className="text-xl">All Users</CardTitle>
                    <CardDescription className="text-slate-500">Manage registered users and their credits.</CardDescription>
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
                                        <TableHead className="text-slate-400">Email</TableHead>
                                        <TableHead className="text-slate-400">Credits</TableHead>
                                        <TableHead className="text-slate-400">Status</TableHead>
                                        <TableHead className="text-right text-slate-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow className="border-rose-900/30 hover:bg-rose-950/10">
                                            <TableCell colSpan={5} className="text-center py-6 text-slate-500">No users found</TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => (
                                            <TableRow key={user.id} className="border-rose-900/30 hover:bg-rose-950/10 transition-colors">
                                                <TableCell className="font-medium text-slate-200">{user.name || "Unknown"}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/20">
                                                        {user.credits}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.is_active !== false ? (
                                                        <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20">Active</Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20">Disabled</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-rose-900/50">
                                                        <Edit className="h-4 w-4" />
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
