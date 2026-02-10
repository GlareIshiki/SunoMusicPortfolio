/* Design Philosophy: Aurora Dreamscape - smooth routing with player integration */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PlayerProvider } from "./contexts/PlayerContext";
import { AdminProvider } from "./contexts/AdminContext";
import { AdminLoginDialog } from "./components/AdminLoginDialog";
import { MusicPlayer } from "./components/MusicPlayer";
import { Header } from "./components/Header";
import { ParticleEffects } from "./components/ParticleEffects";
import Home from "./pages/Home";
import SongDetail from "./pages/SongDetail";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/song/:id"} component={SongDetail} />
        <Route path="/playlists" component={Playlists} />
        <Route path="/playlist/:id" component={PlaylistDetail} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AdminProvider>
        <ThemeProvider defaultTheme="dark" switchable>
          <PlayerProvider>
            <TooltipProvider>
              <Toaster />
              <AdminLoginDialog />
              <ParticleEffects />
              <Router />
              <MusicPlayer />
            </TooltipProvider>
          </PlayerProvider>
        </ThemeProvider>
      </AdminProvider>
    </ErrorBoundary>
  );
}

export default App;
