"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Upload, Trash2, Image as ImageIcon } from "lucide-react";

interface ImagesSectionProps {
  mainImagePreview: string | null;
  isDraggingMain: boolean;
  onDragEnterMain: (e: React.DragEvent) => void;
  onDragLeaveMain: (e: React.DragEvent) => void;
  onDragOverMain: (e: React.DragEvent) => void;
  onDropMain: (e: React.DragEvent) => void;
  onMainImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveMainImage: () => void;

  additionalImagePreviews: { [key: string]: string | null };
  isDraggingAdditional: string | null;
  onDragEnterAdditional: (e: React.DragEvent, label: string) => void;
  onDragLeaveAdditional: (e: React.DragEvent) => void;
  onDragOverAdditional: (e: React.DragEvent, label: string) => void;
  onDropAdditional: (e: React.DragEvent, label: string) => void;
  onAdditionalImageChange: (e: React.ChangeEvent<HTMLInputElement>, label: string) => void;
  onRemoveAdditionalImage: (label: string) => void;
}

const ImagesSection: React.FC<ImagesSectionProps> = ({
  mainImagePreview,
  isDraggingMain,
  onDragEnterMain,
  onDragLeaveMain,
  onDragOverMain,
  onDropMain,
  onMainImageChange,
  onRemoveMainImage,
  additionalImagePreviews,
  isDraggingAdditional,
  onDragEnterAdditional,
  onDragLeaveAdditional,
  onDragOverAdditional,
  onDropAdditional,
  onAdditionalImageChange,
  onRemoveAdditionalImage,
}) => {
  const labels = [
    "Depan",
    "Samping",
    "Berbagai sisi",
    "Saat diguna...",
    "Variasi",
    "Dengan latar...",
    "Close-up",
    "Ukuran & Sk...",
  ];

  return (
    <div className="space-y-2 max-w-3xl mx-auto">
      <Label htmlFor="product-image" className="flex items-center">
        <span className="text-red-500 mr-1">*</span>Gambar
      </Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Image Upload with Drag & Drop */}
        <div
          className={cn(
            "md:col-span-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 aspect-square text-center hover:border-primary cursor-pointer bg-muted/20",
            isDraggingMain ? "border-primary bg-primary/5" : "",
            mainImagePreview ? "relative" : ""
          )}
          onDragEnter={onDragEnterMain}
          onDragLeave={onDragLeaveMain}
          onDragOver={onDragOverMain}
          onDrop={onDropMain}
          onClick={() => document.getElementById("main-image-upload")?.click()}
        >
          {mainImagePreview ? (
            <>
              <img
                src={mainImagePreview}
                alt="Preview"
                className="object-contain w-full h-full rounded-md"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveMainImage();
                }}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium">Unggah gambar utama</span>
              <p className="text-xs text-muted-foreground mt-1">
                - Dimensi: 600 x 600 px.<br />- Ukuran file maks.: 5 MB.<br />- Format: JPG, JPEG, PNG.<br />- Seret & lepas gambar di sini
              </p>
            </>
          )}
          {/* Hidden file input */}
          <Input
            id="main-image-upload"
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png"
            onChange={onMainImageChange}
          />
        </div>
        {/* Additional Image Placeholders with Drag & Drop */}
        <div className="md:col-span-2 grid grid-cols-4 gap-2">
          {labels.map((label) => (
            <div
              key={label}
              className={cn(
                "border rounded-lg flex flex-col items-center justify-center p-2 aspect-square bg-muted/50 text-center cursor-pointer hover:border-primary",
                isDraggingAdditional === label ? "border-primary bg-primary/5" : "",
                additionalImagePreviews[label] ? "relative" : ""
              )}
              onDragEnter={(e) => onDragEnterAdditional(e, label)}
              onDragLeave={onDragLeaveAdditional}
              onDragOver={(e) => onDragOverAdditional(e, label)}
              onDrop={(e) => onDropAdditional(e, label)}
              onClick={() => document.getElementById(`image-upload-${label}`)?.click()}
            >
              {additionalImagePreviews[label] ? (
                <>
                  <img
                    src={additionalImagePreviews[label] || ""}
                    alt={label}
                    className="object-contain w-full h-full rounded-md"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveAdditionalImage(label);
                    }}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm hover:bg-destructive/90 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
                </>
              )}
              {/* Hidden file input for each */}
              <Input
                id={`image-upload-${label}`}
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png"
                onChange={(e) => onAdditionalImageChange(e, label)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImagesSection;