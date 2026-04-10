import { SovereignRouter } from './nexus/SovereignRouter';
import { Login } from './pages/Login';
import { useNexusHeartbeat } from './hooks/useNexusHeartbeat';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { isAuthenticated, isLoading } = useNexusHeartbeat();

  // If we're still checking auth, show a loader
  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? <SovereignRouter /> : <Login />;
}
