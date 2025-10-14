import { useRef, forwardRef } from "react";
import { Button } from "@/components/ui/Button";
import { ImageIcon, Upload, Loader2 } from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  imageUrl?: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  canEdit: boolean;
  maxSizeText?: string;
  emptyText?: string;
  variant?: 'square' | 'circle';
  size?: number; // size in pixels
}

export const ImageUploadField = forwardRef<HTMLInputElement, ImageUploadFieldProps>(({
  label,
  imageUrl,
  onFileChange,
  uploading,
  canEdit,
  maxSizeText = "JPG, PNG, GIF, WEBP. Tối đa 5MB",
  emptyText = "Chưa có ảnh",
  variant = 'square',
  size = 192, // default 48 * 4 = 192px (w-48)
}, ref) => {
  const localInputRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) || localInputRef;

  const handleUploadClick = () => {
    inputRef.current?.click();
  };

  const containerClass = variant === 'circle' 
    ? 'rounded-full' 
    : 'rounded-lg';

  return (
    <div className="flex flex-col gap-3 items-center">
      <div 
        className={`relative border overflow-hidden bg-muted/40 flex items-center justify-center ${containerClass}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`flex flex-col items-center justify-center w-full h-full gap-2 border-2 border-dashed bg-muted/30 ${containerClass}`}>
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          </div>
        )}
        
        {uploading && (
          <div className={`absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 ${containerClass}`}>
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
      </div>

      {canEdit && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={uploading}
            style={{ width: `${size}px` }}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang upload...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {imageUrl ? "Thay đổi" : "Tải lên"}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground max-w-xs">{maxSizeText}</p>
        </>
      )}
    </div>
  );
});

ImageUploadField.displayName = "ImageUploadField";
