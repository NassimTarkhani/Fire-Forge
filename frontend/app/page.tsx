"use client";

import { Button } from "@/components/ui/button";
import { RegisterDialog } from "@/components/auth/RegisterDialog";
import { useState } from "react";
import { Flame, ArrowRight, Code2, Cpu, Zap, Database } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col items-center justify-center pt-24 pb-32 overflow-hidden text-center px-4">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-background to-background"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/20 blur-[120px] rounded-full -z-10"></div>

        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-600 dark:text-orange-400 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Flame className="mr-2 h-4 w-4" />
            FireForge API v1 is now live
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Web scraping & crawling <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              made simple.
            </span>
          </h1>

          <p className="max-w-[42rem] mx-auto text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Extract data, map structures, and search crawled content instantly.
            Get 50 free credits instantly. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button
              size="lg"
              onClick={() => setIsRegisterOpen(true)}
              className="w-full sm:w-auto text-lg h-14 px-8 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02]"
            >
              Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link href="/docs" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg border-2">
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/50 py-24 border-t">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-2xl p-8 border shadow-sm transition-all hover:shadow-md hover:border-orange-500/30 group">
              <div className="h-12 w-12 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Powerful APIs</h3>
              <p className="text-muted-foreground">Access sophisticated scraping, crawling, and mapping capabilities through our beautifully designed REST APIs.</p>
            </div>

            <div className="bg-background rounded-2xl p-8 border shadow-sm transition-all hover:shadow-md hover:border-orange-500/30 group">
              <div className="h-12 w-12 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Execution</h3>
              <p className="text-muted-foreground">Built on top of Firecrawl for maximum performance. Get your data back in milliseconds, not minutes.</p>
            </div>

            <div className="bg-background rounded-2xl p-8 border shadow-sm transition-all hover:shadow-md hover:border-orange-500/30 group">
              <div className="h-12 w-12 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Developer First</h3>
              <p className="text-muted-foreground">Interactive playground, clear documentation, and code generation for multiple languages included out of the box.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto bg-background text-center text-sm text-muted-foreground">
        <div className="container mx-auto flex items-center justify-center gap-1.5">
          <Database className="h-4 w-4" /> Built with FireForge API
        </div>
      </footer>

      <RegisterDialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen} />
    </div>
  );
}
