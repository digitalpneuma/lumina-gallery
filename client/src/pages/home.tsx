import { useGallery } from "@/lib/gallery-context";
import { AlbumCard } from "@/components/album-card";
import { motion } from "framer-motion";

export function Home() {
  const { albums, getAlbumCover, getAlbumPhotos } = useGallery();

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 py-8 md:py-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight"
        >
          Captured Moments
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground max-w-2xl mx-auto font-light text-lg"
        >
          A collection of visual stories exploring architecture, nature, and the abstract.
        </motion.p>
      </section>

      <section>
        {albums.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No albums found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                coverUrl={getAlbumCover(album.id)}
                photoCount={getAlbumPhotos(album.id).length}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
