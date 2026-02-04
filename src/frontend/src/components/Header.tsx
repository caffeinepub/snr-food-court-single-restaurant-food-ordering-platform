import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCartItems, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Home, Package, Shield } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Page } from '../App';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: cartItems = [] } = useGetCartItems();
  const { data: isAdmin = false } = useIsCallerAdmin();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const cartCount = cartItems.length;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      onNavigate('home');
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <img src="/assets/generated/snr-logo.dim_200x200.png" alt="SNR Food Court" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">SNR Food Court</h1>
              <p className="text-xs text-muted-foreground">Delicious food delivered</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <Button
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('home')}
            >
              <Home className="h-4 w-4 mr-2" />
              Menu
            </Button>
            {isAuthenticated && (
              <>
                <Button
                  variant={currentPage === 'orders' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('orders')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Orders
                </Button>
                {isAdmin && (
                  <Button
                    variant={currentPage === 'admin' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onNavigate('admin')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                variant={currentPage === 'cart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onNavigate('cart')}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            )}
            <Button
              onClick={handleAuth}
              disabled={disabled}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
            >
              <User className="h-4 w-4 mr-2" />
              {disabled ? 'Loading...' : isAuthenticated ? 'Logout' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
