import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlayerProvider } from "@/context/PlayerContext";
import { PlaylistProvider } from "@/context/PlaylistContext";
import { setBaseUrl } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Search from "@/pages/search";
import Album from "@/pages/album";
import Artist from "@/pages/artist";
import Charts from "@/pages/charts";
import Playlist from "@/pages/playlist";

// Set base URL for API requests
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/album/:id" component={Album} />
      <Route path="/artist/:id" component={Artist} />
      <Route path="/charts" component={Charts} />
      <Route path="/playlist/:id" component={Playlist} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlaylistProvider>
          <PlayerProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </PlayerProvider>
        </PlaylistProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;