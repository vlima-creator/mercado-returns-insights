import { AppProvider, useAppData } from '@/context/AppContext';
import { UploadSidebar } from '@/components/UploadSidebar';
import { Dashboard } from '@/components/Dashboard';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { GuidePanel } from '@/components/GuidePanel';
import { useState } from 'react';

function AppContent() {
  const { data } = useAppData();
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <UploadSidebar onOpenGuide={() => setShowGuide(true)} />
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          {showGuide ? (
            <GuidePanel onClose={() => setShowGuide(false)} />
          ) : data ? (
            <Dashboard />
          ) : (
            <WelcomeScreen />
          )}
        </div>
        <footer className="border-t border-border px-6 py-3 text-center">
          <p className="text-[10px] text-muted-foreground">
            © 2026 Desenvolvido por Vinicius Lima | CNPJ: 47.192.694/0001-70 · Todos os direitos reservados
          </p>
        </footer>
      </div>
    </div>
  );
}

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
