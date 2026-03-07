import { DocsSidebar } from "@/components/docs/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">

            <div className="flex-1 flex overflow-hidden">
                <DocsSidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <div className="container mx-auto py-10 px-4 md:px-8 max-w-5xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
