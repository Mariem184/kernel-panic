import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { API_BASE } from '../core/api.config';

export interface UploadResult {
  url: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB — must match MediaController's limit on the backend
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// A photo card on the site is never shown wider than this in practice, even on a huge
// monitor — no point uploading (or later re-downloading) pixels nobody will ever see.
const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;

/** Client-side pre-check before even hitting the network — instant feedback for an
 *  obviously-wrong file, without waiting on a round trip just to get the same rejection. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'invalidType';
  if (file.size > MAX_FILE_SIZE) return 'tooLarge';
  return null;
}

/**
 * Downscales and re-compresses an image in the browser before it ever reaches the
 * network — a phone photo straight off a camera can be 4000px wide and several MB;
 * nobody needs that for a card thumbnail or even a full-width hero image. This is what
 * actually fixes "images load slowly", since the file the server ends up storing (and
 * later serving to every visitor) is the small one from the start.
 *
 * GIFs are passed through untouched — drawing one to a canvas would flatten it to a
 * single frame and destroy any animation.
 */
async function shrinkImage(file: File): Promise<File> {
  if (file.type === 'image/gif') return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // decoding failed for some reason — upload the original rather than block

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  if (scale >= 1 && file.size <= 400 * 1024) {
    // Already small and already within the target dimensions — nothing worth doing.
    bitmap.close();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) { bitmap.close(); return file; }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // PNGs with real transparency stay PNG (JPEG has no alpha channel and would flatten
  // it to black); everything else becomes JPEG, which compresses photos far better.
  const keepPng = file.type === 'image/png' && await hasTransparency(canvas, ctx);
  const outType = keepPng ? 'image/png' : 'image/jpeg';
  const blob: Blob | null = await new Promise(resolve => canvas.toBlob(resolve, outType, JPEG_QUALITY));
  if (!blob || blob.size >= file.size) return file; // shrinking made it worse somehow — keep the original

  const newName = file.name.replace(/\.\w+$/, '') + (keepPng ? '.png' : '.jpg');
  return new File([blob], newName, { type: outType });
}

/** Cheap transparency check on a small sample of the canvas — good enough to decide PNG vs JPEG. */
async function hasTransparency(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<boolean> {
  try {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4 * 97) { // sample, not every pixel — this only needs a yes/no
      if (data[i] < 255) return true;
    }
    return false;
  } catch {
    return true; // if we can't tell, keep PNG rather than risk losing real transparency
  }
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private http = inject(HttpClient);

  /** Shrinks the image client-side, then POSTs /media/upload (admin only) — returns the
   *  absolute URL of the stored (now much smaller) image. */
  upload(file: File): Observable<UploadResult> {
    return from(shrinkImage(file)).pipe(
      switchMap(finalFile => {
        const formData = new FormData();
        formData.append('file', finalFile, finalFile.name);
        return this.http.post<UploadResult>(`${API_BASE}/media/upload`, formData);
      })
    );
  }
}
