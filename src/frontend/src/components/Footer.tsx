import { SiFacebook, SiX, SiInstagram } from 'react-icons/si';
import { Heart, Phone, MapPin, Globe } from 'lucide-react';
import { useGetSingleRestaurant } from '../hooks/useQueries';

export default function Footer() {
  const { data: restaurant } = useGetSingleRestaurant();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-lg mb-3">SNR Food Court</h3>
            <p className="text-sm text-muted-foreground">
              Your favorite restaurants, delivered to your doorstep. Fresh, fast, and delicious.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {restaurant?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{restaurant.phone}</span>
                </li>
              )}
              {restaurant?.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{restaurant.address}</span>
                </li>
              )}
              {restaurant?.website && (
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{restaurant.website}</span>
                </li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-3">Follow Us</h3>
            <div className="flex gap-4">
              <SiFacebook className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <SiX className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <SiInstagram className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © 2025. Built with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> using{' '}
            <a href="https://caffeine.ai" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
