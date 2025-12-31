import { Link } from "wouter";
import { Album } from "@/lib/gallery-context";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { motion } from "framer-motion";

interface AlbumCardProps {
  album: Album;
  coverUrl?: string;
  photoCount: number;
}

export function AlbumCard({ album, coverUrl, photoCount }: AlbumCardProps) {
  return (
    <Link href={`/album/${album.id}`}>
      <a className="block group cursor-pointer">
        <motion.div
          whileHover={{ y: -8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="group-hover:shadow-lg transition-shadow"
        >
          <Card className="overflow-hidden border-none shadow-none bg-transparent accent-bar-blush">
            <CardContent className="p-0">
              <AspectRatio ratio={4 / 5} className="bg-muted overflow-hidden rounded-sm relative">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={album.title}
                    className="object-cover object-bottom w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-secondary text-muted-foreground text-sm font-light">
                    Empty Album
                  </div>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pastel-overlay transition-opacity duration-300" />
              </AspectRatio>
            </CardContent>
            <CardFooter className="flex flex-col items-start px-0 py-3 gap-1">
              <h3 className="font-serif text-lg font-medium tracking-tight group-hover:text-primary transition-colors">
                {album.title}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium bg-lavender/20 px-2 py-0.5 rounded">
                {photoCount} Photos
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </a>
    </Link>
  );
}
