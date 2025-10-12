import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { ImageIcon, Upload, Loader2 } from "lucide-react";

export function TenantImagesForm({
  tenant,
  canEdit,
  uploadingThumbnail,
  uploadingCover,
  handleThumbnailUpload,
  handleCoverUpload,
}: {
  tenant: any;
  canEdit: boolean;
  uploadingThumbnail: boolean;
  uploadingCover: boolean;
  handleThumbnailUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCoverUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex space-x-24">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ảnh đại diện (Thumbnail)</Label>
        <div className="flex flex-col md:flex-row gap-6">
          <ImageUploadField
            label="Ảnh đại diện"
            imageUrl={tenant?.thumbnailUrl}
            inputRef={thumbnailInputRef}
            onUploadClick={() => thumbnailInputRef.current?.click()}
            onFileChange={handleThumbnailUpload}
            uploading={uploadingThumbnail}
            canEdit={canEdit}
            maxSizeText="Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF, WEBP"
            emptyText="Chưa có ảnh đại diện"
          />
        </div>
      </div>

      {/* ẢNH BÌA */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ảnh bìa (Cover Image)</Label>
        <div className="flex flex-col md:flex-row gap-6">
          <ImageUploadField
            label="Ảnh bìa"
            imageUrl={tenant?.coverImageUrl}
            inputRef={coverInputRef}
            onUploadClick={() => coverInputRef.current?.click()}
            onFileChange={handleCoverUpload}
            uploading={uploadingCover}
            canEdit={canEdit}
            maxSizeText="Kích thước tối đa: 10MB. Định dạng: JPG, PNG, GIF, WEBP"
            emptyText="Chưa có ảnh bìa"
          />
        </div>
      </div>
    </div>
  );
}

/* Subcomponent */
function ImageUploadField({
  label,
  imageUrl,
  inputRef,
  onUploadClick,
  onFileChange,
  uploading,
  canEdit,
  maxSizeText,
  emptyText,
}: any) {
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="w-48 h-48 border rounded-lg overflow-hidden bg-muted/40 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-2 border-2 border-dashed rounded-lg bg-muted/30">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{emptyText}</p>
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
            variant="outline"
            onClick={onUploadClick}
            disabled={uploading}
            className="w-48"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang upload...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {imageUrl ? "Thay đổi ảnh" : "Upload ảnh"}
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground max-w-xs">{maxSizeText}</p>
        </>
      )}
    </div>
  );
}
