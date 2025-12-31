import { useEffect } from "react";
import { Photo } from "@/lib/gallery-context";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxProps {
  photo: Photo;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function Lightbox({ photo, onClose, onNext, onPrev }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [onClose, onNext, onPrev]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[hsl(209_40%_8%)] dark:bg-[hsl(209_40%_8%)] backdrop-blur-sm flex items-center justify-center"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 hover:bg-white/10 text-white/70 hover:text-blush"
          onClick={onClose}
        >
          <X className="h-8 w-8 stroke-[1.5]" />
        </Button>

        {onPrev && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 hover:bg-white/10 text-white/70 hover:text-blush hidden md:flex"
            onClick={onPrev}
          >
            <ChevronLeft className="h-10 w-10 stroke-[1]" />
          </Button>
        )}

        {onNext && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 hover:bg-white/10 text-white/70 hover:text-blush hidden md:flex"
            onClick={onNext}
          >
            <ChevronRight className="h-10 w-10 stroke-[1]" />
          </Button>
        )}

        <div className="w-full h-full p-4 md:p-12 flex flex-col items-center justify-center" onClick={onClose}>
          <motion.img
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={photo.originalUrl || photo.url}
            alt={photo.title}
            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="mt-4 text-center">
             <p className="font-serif text-lg text-white/90">{photo.title}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
