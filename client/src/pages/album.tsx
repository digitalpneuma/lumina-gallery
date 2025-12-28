import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useGallery } from "@/lib/gallery-context";
import { PhotoGrid } from "@/components/photo-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export function AlbumView() {
  const [, params] = useRoute("/album/:id");
  const { albums, getAlbumPhotos } = useGallery();
  const id = params?.id;

  const album = albums.find((a) => a.id === id);
  const photos = id ? getAlbumPhotos(id) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!album) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif mb-4">Album not found</h2>
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-4">
        <Link href="/">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Gallery
          </Button>
        </Link>
        
        <div className="space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-serif font-medium"
          >
            {album.title}
          </motion.h1>
          {album.description && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground font-light"
            >
              {album.description}
            </motion.p>
          )}
        </div>
      </div>

      <PhotoGrid photos={photos} />
    </div>
  );
}
