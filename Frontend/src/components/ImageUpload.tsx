import { useState, useRef, useEffect } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
}

export const ImageUpload = ({ images, onImagesChange, maxImages = 10 }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const previousUrlsRef = useRef<string[]>([]);

  // Create preview URLs and clean them up
  useEffect(() => {
    // Revoke previous URLs
    previousUrlsRef.current.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        // Ignore errors when revoking URLs
      }
    });

    // Create new URLs for current images
    const urls = images.map((image) => URL.createObjectURL(image));
    setPreviewUrls(urls);
    previousUrlsRef.current = urls;

    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      urls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          // Ignore errors when revoking URLs
        }
      });
    };
  }, [images]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files).filter((file) => {
      return file.type.startsWith("image/");
    });

    const totalImages = images.length + newImages.length;
    if (totalImages > maxImages) {
      alert(`You can only upload up to ${maxImages} images.`);
      return;
    }

    onImagesChange([...images, ...newImages]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium mb-2">
          Drag and drop images here, or click to select
        </p>
        <p className="text-xs text-muted-foreground">
          You can upload up to {maxImages} images (PNG, JPG, WebP)
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                <img
                  src={previewUrls[index]}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

