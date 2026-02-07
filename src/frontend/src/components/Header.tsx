import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCartItems, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Home, Package, Shield, Menu } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Page } from '../App';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function Header({ currentPage, onNavigate }: HeaderProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: cartItems = [] } = useGetCartItems();
  const { data: isAdmin = false, isError, error } = useIsCallerAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasShownAdminError, setHasShownAdminError] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const cartCount = cartItems.length;

  // Show toast when admin verification fails
  useEffect(() => {
    if (isAuthenticated && isError && !hasShownAdminError) {
      toast.error('Could not verify admin access. Try again.');
      setHasShownAdminError(true);
    }
  }, [isAuthenticated, isError, hasShownAdminError]);

  // Reset error flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setHasShownAdminError(false);
    }
  }, [isAuthenticated]);

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

  const handleAdminClick = async () => {
    if (!isAuthenticated) {
      try {
        await login();
        // After successful login, navigate to admin
        onNavigate('admin');
      } catch (error: any) {
        console.error('Login error:', error);
        toast.error('Please log in to access the admin dashboard');
      }
    } else {
      onNavigate('admin');
    }
  };

  const handleMobileNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const handleMobileAdminClick = async () => {
    setMobileMenuOpen(false);
    if (!isAuthenticated) {
      try {
        await login();
        onNavigate('admin');
      } catch (error: any) {
        console.error('Login error:', error);
        toast.error('Please log in to access the admin dashboard');
      }
    } else {
      onNavigate('admin');
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

          {/* Desktop Navigation */}
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
              <Button
                variant={currentPage === 'orders' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('orders')}
              >
                <Package className="h-4 w-4 mr-2" />
                Orders
              </Button>
            )}
            <Button
              variant={currentPage === 'admin' ? 'default' : 'ghost'}
              size="sm"
              onClick={handleAdminClick}
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </nav>

          <div className="flex items-center gap-2">
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6">
                  <Button
                    variant={currentPage === 'home' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => handleMobileNavigate('home')}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Menu
                  </Button>
                  {isAuthenticated && (
                    <Button
                      variant={currentPage === 'orders' ? 'default' : 'ghost'}
                      className="justify-start"
                      onClick={() => handleMobileNavigate('orders')}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Orders
                    </Button>
                  )}
                  <Button
                    variant={currentPage === 'admin' ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={handleMobileAdminClick}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>

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
