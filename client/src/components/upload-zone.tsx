import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud } from 'lucide-react';

interface UploadZoneProps {
  onDrop: (files: File[]) => void;
}

export function UploadZone({ onDrop }: UploadZoneProps) {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    onDrop(acceptedFiles);
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg', '.webp']
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
        flex flex-col items-center justify-center gap-4
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30'}
      `}
    >
      <input {...getInputProps()} />
      <div className="p-4 bg-background rounded-full shadow-sm">
        <UploadCloud className={`h-8 w-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {isDragActive ? "Drop photos here" : "Drag & drop photos or click to upload"}
        </p>
        <p className="text-xs text-muted-foreground">
          Supports JPEG, PNG, WEBP
        </p>
      </div>
    </div>
  );
}
