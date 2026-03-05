import { PlaygroundSidebar } from "@/components/playground/Sidebar";

export default function PlaygroundLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <PlaygroundSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="container p-6 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
