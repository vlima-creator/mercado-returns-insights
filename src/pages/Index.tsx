import { AppProvider, useAppData } from '@/context/AppContext';
import { UploadSidebar } from '@/components/UploadSidebar';
import { Dashboard } from '@/components/Dashboard';
import { WelcomeScreen } from '@/components/WelcomeScreen';

function AppContent() {
  const { data } = useAppData();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <UploadSidebar />
      {data ? <Dashboard /> : <WelcomeScreen />}
    </div>
  );
}

const Index = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default Index;
