"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Cropper, { type Area } from "react-easy-crop";
import { uploadPhoto } from "@/app/admin/(portal)/profile/actions";
import { btnPrimary, btnSoft } from "./styles";
import { FormMessage, type ActionState } from "./forms";

async function cropToBlob(src: string, area: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
  const size = Math.min(1200, area.width);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas.getContext("2d")!.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("crop failed"))), "image/jpeg", 0.92));
}

export function PhotoUploader() {
  const router = useRouter();
  const [src, setSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [state, setState] = useState<ActionState>(null);
  const [pending, start] = useTransition();

  const onPick = (f: File | undefined) => {
    setState(null);
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return setState({ error: "Use a JPG, PNG or WebP image." });
    if (f.size > 5 * 1024 * 1024) return setState({ error: "The photo must be 5 MB or smaller." });
    setSrc(URL.createObjectURL(f));
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };
  const onComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  const save = () =>
    start(async () => {
      if (!src || !area) return;
      const blob = await cropToBlob(src, area);
      const fd = new FormData();
      fd.append("photo", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      const res = await uploadPhoto(fd);
      setState(res);
      if (res?.ok) {
        setSrc(null);
        router.refresh();
      }
    });

  return (
    <div>
      {!src ? (
        <label className={`${btnSoft} cursor-pointer`}>
          Choose a new photo
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onPick(e.target.files?.[0])} />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative h-[320px] w-full overflow-hidden rounded-2xl bg-forest-900">
            <Cropper image={src} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete} />
          </div>
          <label className="flex items-center gap-3 text-sm font-semibold text-forest-700">
            Zoom
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="flex-1 accent-[#2f6b45]" />
          </label>
          <div className="flex gap-2">
            <button onClick={save} disabled={pending} className={btnPrimary}>{pending ? "Uploading…" : "Use this photo"}</button>
            <button onClick={() => setSrc(null)} disabled={pending} className={btnSoft}>Cancel</button>
          </div>
        </div>
      )}
      <div className="mt-3"><FormMessage state={state} /></div>
    </div>
  );
}
