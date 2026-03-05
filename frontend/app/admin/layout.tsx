import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { AdminAuthGuard } from "./AdminAuthGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-[#0A0A0A] text-slate-200">
            {/* Admin header */}
            <div className="h-12 border-b border-rose-900/30 bg-rose-950/20 px-6 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-wider text-sm">
                    <ShieldAlert className="h-4 w-4" />
                    FireForge Admin Control Center
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                    <Link href="/admin/users" className="hover:text-rose-400 transition-colors">Users</Link>
                    <Link href="/admin/keys" className="hover:text-rose-400 transition-colors">API Keys</Link>
                    <Link href="/admin/payments" className="hover:text-rose-400 transition-colors">Payments</Link>
                </div>
            </div>

            {/* Auth Barrier & Content */}
            <main className="flex-1 p-6 lg:p-12 relative overflow-hidden backdrop-blur-3xl">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full point-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 blur-[120px] rounded-full point-events-none" />
                <AdminAuthGuard>
                    {children}
                </AdminAuthGuard>
            </main>
        </div>
    );
}
