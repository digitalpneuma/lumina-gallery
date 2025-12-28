import { useState } from "react";
import { Photo, useGallery } from "@/lib/gallery-context";
import { Lightbox } from "@/components/lightbox";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PhotoGridProps {
  photos: Photo[];
  allowDelete?: boolean;
}

export function PhotoGrid({ photos, allowDelete = false }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { deletePhoto } = useGallery();

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const nextPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex < photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="py-20 text-center text-muted-foreground font-light">
        <p>No photos in this album yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative group aspect-square bg-muted overflow-hidden rounded-sm cursor-zoom-in"
            onClick={() => openLightbox(index)}
          >
            <img
              src={photo.url}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            
            {allowDelete && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8 rounded-full shadow-md"
                  onClick={() => deletePhoto(photo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-xs font-medium truncate">{photo.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photo={photos[lightboxIndex]}
          onClose={closeLightbox}
          onNext={lightboxIndex < photos.length - 1 ? nextPhoto : undefined}
          onPrev={lightboxIndex > 0 ? prevPhoto : undefined}
        />
      )}
    </>
  );
}
