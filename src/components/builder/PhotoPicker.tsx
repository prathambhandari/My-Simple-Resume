"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { compressImageFile } from "@/lib/compressImage";
import { useResumeStore } from "@/store/useResumeStore";

export function PhotoPicker() {
  const data = useResumeStore((state) => state.data);
  const setData = useResumeStore((state) => state.setData);
  const inputRef = useRef<HTMLInputElement>(null);
  const photo = data.personalInfo.photoUrl?.trim();

  const onPick = async (file: File | undefined) => {
    if (!file) return;
    try {
      const photoUrl = await compressImageFile(file);
      setData(
        {
          ...data,
          personalInfo: { ...data.personalInfo, photoUrl },
        },
        { label: "Photo" },
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not use that photo.");
    }
  };

  const onRemove = () => {
    setData(
      {
        ...data,
        personalInfo: { ...data.personalInfo, photoUrl: "" },
      },
      { label: "Remove photo" },
    );
  };

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          void onPick(file);
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => inputRef.current?.click()}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className="size-5 rounded-sm object-cover" />
        ) : (
          <Camera />
        )}
        <span className="hidden md:inline">Photo</span>
      </Button>
      {photo ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove photo"
          onClick={onRemove}
        >
          <X />
        </Button>
      ) : null}
    </div>
  );
}
