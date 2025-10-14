import { Label } from "@/components/ui/Label";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

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
  return (
    <div className="flex space-x-24">
      <div className="space-y-3">
        <Label className="text-sm font-medium">Ảnh đại diện (Thumbnail)</Label>
        <div className="flex flex-col md:flex-row gap-6">
          <ImageUploadField
            label="Ảnh đại diện"
            imageUrl={tenant?.thumbnailUrl}
            onFileChange={handleThumbnailUpload}
            uploading={uploadingThumbnail}
            canEdit={canEdit}
            maxSizeText="JPG, PNG, GIF, WEBP. Tối đa 5MB"
            emptyText="Chưa có ảnh đại diện"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Ảnh bìa (Cover Image)</Label>
        <div className="flex flex-col md:flex-row gap-6">
          <ImageUploadField
            label="Ảnh bìa"
            imageUrl={tenant?.coverImageUrl}
            onFileChange={handleCoverUpload}
            uploading={uploadingCover}
            canEdit={canEdit}
            maxSizeText="JPG, PNG, GIF, WEBP. Tối đa 5MB"
            emptyText="Chưa có ảnh bìa"
          />
        </div>
      </div>
    </div>
  );
}
