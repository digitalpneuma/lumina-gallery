import { useState } from "react";
import { Photo, useGallery } from "@/lib/gallery-context";
import { Lightbox } from "@/components/lightbox";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoGridProps {
  photos: Photo[];
  allowDelete?: boolean;
  albumId?: string;
}

export function PhotoGrid({ photos, allowDelete = false, albumId }: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const { deletePhoto, setAlbumCover } = useGallery();
  const { toast } = useToast();

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
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pastel-overlay transition-opacity duration-300" />
            
            {allowDelete && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2" onClick={(e) => e.stopPropagation()}>
                {albumId && (
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-md bg-blush hover:bg-blush/80"
                    onClick={async () => {
                      try {
                        await setAlbumCover(albumId, photo.id);
                        toast({ title: "Album Cover Updated", description: "This photo is now the album cover." });
                      } catch (error) {
                        toast({ title: "Error", description: "Failed to set album cover.", variant: "destructive" });
                      }
                    }}
                    title="Set as album cover"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full shadow-md"
                  onClick={async () => {
                    if (confirm("Are you sure you want to delete this photo?")) {
                      await deletePhoto(photo.id);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
