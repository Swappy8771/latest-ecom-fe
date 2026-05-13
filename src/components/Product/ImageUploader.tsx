import { useRef } from 'react';
import { toast } from 'sonner';
import { useUploadProductImageMutation } from '../../services/productApi';

const BASE_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace('/api', '');

function resolveImg(url: string) {
  if (!url) return url;
  if (url.startsWith('http')) return url;
  return BASE_ORIGIN + url;
}

interface Props {
  images:   string[];
  onChange: (images: string[]) => void;
  max?:     number;
}

export default function ImageUploader({ images, onChange, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [upload, { isLoading }] = useUploadProductImageMutation();

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const toUpload = Array.from(files).slice(0, max - images.length);
    if (toUpload.length === 0) {
      toast.error(`Maximum ${max} images allowed`);
      return;
    }

    const results: string[] = [];
    for (const file of toUpload) {
      const form = new FormData();
      form.append('image', file);
      try {
        const res = await upload(form).unwrap();
        results.push(res.file.url);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    onChange([...images, ...results]);
  }

  function remove(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url, idx) => (
          <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-zinc-200">
            <img src={resolveImg(url)} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
            >
              ×
            </button>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-300 hover:border-violet-400 flex flex-col items-center justify-center text-zinc-400 hover:text-violet-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-xl leading-none">+</span>
                <span className="text-xs mt-0.5">Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-xs text-zinc-400">{images.length}/{max} images uploaded</p>
    </div>
  );
}
