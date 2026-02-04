import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Header from './components/Header';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import AdminDashboard from './pages/AdminDashboard';
import { useState } from 'react';

export type Page = 'home' | 'cart' | 'orders' | 'admin';

function App() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const navigateToPage = (page: Page) => {
    setCurrentPage(page);
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="min-h-screen flex flex-col bg-background">
        <Header currentPage={currentPage} onNavigate={navigateToPage} />
        
        <main className="flex-1">
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'cart' && <CartPage onNavigate={navigateToPage} />}
          {currentPage === 'orders' && <OrdersPage />}
          {currentPage === 'admin' && <AdminDashboard />}
        </main>

        <Footer />
        
        {showProfileSetup && <ProfileSetupModal />}
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
