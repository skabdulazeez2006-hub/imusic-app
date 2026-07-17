import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { PlayerBar } from "./PlayerBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Link } from "wouter";
import { QueuePanel } from "./QueuePanel";
import { LyricsPanel } from "./LyricsPanel";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-14 sticky top-0 bg-background/80 backdrop-blur border-b border-border/30 flex items-center px-6 justify-between z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="text-muted-foreground hover:text-foreground transition bg-secondary/50 rounded-full p-1.5">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => window.history.forward()} className="text-muted-foreground hover:text-foreground transition bg-secondary/50 rounded-full p-1.5">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition">
              <Search className="w-5 h-5" />
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center border border-primary/30">
              U
            </div>
          </div>
        </header>

        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          <ScrollArea className="flex-1 relative">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
            <div className="pb-32">
              {children}
            </div>
          </ScrollArea>
          
          <QueuePanel />
          <LyricsPanel />
        </div>
      </div>
      <PlayerBar />
    </div>
  );
}