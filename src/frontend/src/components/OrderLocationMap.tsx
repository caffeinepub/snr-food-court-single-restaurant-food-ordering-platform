import { useEffect, useRef } from 'react';

interface OrderLocationMapProps {
  latitude: number;
  longitude: number;
}

export default function OrderLocationMap({ latitude, longitude }: OrderLocationMapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Update iframe src when coordinates change
    if (iframeRef.current) {
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;
      iframeRef.current.src = mapUrl;
    }
  }, [latitude, longitude]);

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="border rounded-lg overflow-hidden bg-muted/30">
      <iframe
        ref={iframeRef}
        src={mapUrl}
        className="w-full h-[300px] border-0"
        title="Customer Location Map"
        loading="lazy"
        allowFullScreen
      />
      <div className="p-2 bg-muted/50 text-xs text-muted-foreground text-center">
        Interactive map powered by OpenStreetMap
      </div>
    </div>
  );
}
