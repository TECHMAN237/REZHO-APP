import { useRef, useState, type DragEvent } from 'react';
import { CloudUpload, Images, Play, Plus, X } from 'lucide-react';
import { makeId, type MediaItem } from '@rezho/shared';

interface MediaUploaderProps {
  value: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  /** Sample images offered for the demo when the user has no local files. */
  samples?: { url: string; name: string }[];
  max?: number;
  error?: string;
  title?: string;
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const MAX_BYTES = 100 * 1024 * 1024;

export function MediaUploader({ value, onChange, samples = [], max = 12, error, title }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string>();
  const [samplesOpen, setSamplesOpen] = useState(false);

  const addItems = (items: MediaItem[]) => {
    const room = Math.max(0, max - value.length);
    const accepted = items.slice(0, room);
    if (!accepted.length) return;
    setUploading((u) => [...u, ...accepted.map((i) => i.id)]);
    onChange([...value, ...accepted]);
    setTimeout(() => setUploading((u) => u.filter((id) => !accepted.some((a) => a.id === id))), 950);
  };

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const next: MediaItem[] = [];
    const errors: string[] = [];
    for (const f of list) {
      const isImage = IMAGE_TYPES.includes(f.type);
      const isVideo = VIDEO_TYPES.includes(f.type);
      if (!isImage && !isVideo) {
        errors.push(`${f.name} : format non supporté`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        errors.push(`${f.name} : dépasse 100 Mo`);
        continue;
      }
      next.push({ id: makeId('m'), kind: isVideo ? 'video' : 'image', url: URL.createObjectURL(f), name: f.name, duration: isVideo ? '00:30' : undefined });
    }
    setLocalError(errors.length ? errors.join(' · ') : undefined);
    if (next.length) addItems(next);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const remove = (id: string) => onChange(value.filter((v) => v.id !== id));

  const addSample = (s: { url: string; name: string }, asVideo = false) => {
    addItems([{ id: makeId('m'), kind: asVideo ? 'video' : 'image', url: s.url, name: asVideo ? s.name.replace(/\.\w+$/, '.mp4') : s.name, duration: asVideo ? '00:45' : undefined }]);
  };

  return (
    <div>
      {title && <p className="text-[13px] font-semibold text-ink-900 mb-3">{title}</p>}
      <div className="grid gap-4 lg:grid-cols-[minmax(240px,320px)_1fr]">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center rounded-[14px] border-2 border-dashed px-5 py-8 text-center transition-colors ${dragging ? 'border-brand-600 bg-brand-50' : error ? 'border-danger bg-white' : 'border-ink-200 bg-ink-50/60'}`}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <CloudUpload size={24} />
          </span>
          <p className="mt-3 text-[13px] font-semibold text-ink-900">Glissez-déposez vos photos et vidéos ici</p>
          <p className="my-2 text-[11px] text-ink-500">ou</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="h-9 rounded-[10px] bg-white border border-brand-600 px-4 text-[12px] font-semibold text-brand-700 hover:bg-brand-50">
            Choisir des fichiers
          </button>
          {samples.length > 0 && (
            <button type="button" onClick={() => setSamplesOpen((v) => !v)} className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-ink-500 hover:text-brand-700">
              <Images size={13} /> Utiliser des photos d’exemple
            </button>
          )}
          <p className="mt-3 text-[10px] text-ink-500">Formats : JPG, PNG, MP4 · Max : 100 Mo</p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" multiple className="hidden" aria-label="Choisir des fichiers" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </div>

        <div>
          {samplesOpen && (
            <div className="mb-3 rounded-[12px] border border-ink-100 bg-white p-3 pop-in">
              <p className="text-[11px] font-semibold text-ink-500 mb-2">Photos d’exemple (démo)</p>
              <div className="flex flex-wrap gap-2">
                {samples.map((s) => (
                  <button key={s.url} type="button" onClick={() => addSample(s)} className="h-14 w-14 overflow-hidden rounded-[8px] border border-ink-200 hover:ring-2 hover:ring-brand-500" aria-label={`Ajouter ${s.name}`}>
                    <img src={s.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
                {samples[0] && (
                  <button type="button" onClick={() => addSample(samples[0]!, true)} className="relative h-14 w-14 overflow-hidden rounded-[8px] border border-ink-200 hover:ring-2 hover:ring-brand-500" aria-label="Ajouter une vidéo d’exemple">
                    <img src={samples[0].url} alt="" className="h-full w-full object-cover brightness-75" />
                    <Play size={16} className="absolute inset-0 m-auto text-white fill-white" />
                  </button>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-5">
            {value.map((m) => (
              <div key={m.id} className="group relative aspect-square overflow-hidden rounded-[12px] bg-ink-100">
                {m.kind === 'video' ? (
                  <>
                    <img src={m.url} alt="" className="h-full w-full object-cover brightness-75" />
                    <span className="absolute inset-0 flex items-center justify-center text-white">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50">
                        <Play size={16} className="fill-white" />
                      </span>
                    </span>
                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">{m.duration}</span>
                  </>
                ) : (
                  <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
                )}
                {uploading.includes(m.id) && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/40">
                    <div className="upload-progress h-full bg-lime-500" />
                  </div>
                )}
                <button type="button" aria-label={`Supprimer ${m.name}`} onClick={() => remove(m.id)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-ink-900 shadow-sm hover:bg-white">
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            ))}
            {value.length < max && (
              <button type="button" onClick={() => inputRef.current?.click()} className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[12px] border-2 border-dashed border-ink-200 text-ink-500 hover:border-brand-500 hover:text-brand-700">
                <Plus size={20} />
                <span className="text-[11px] font-semibold">Ajouter plus</span>
              </button>
            )}
          </div>
          {value.length === 0 && <p className="mt-2 text-[11px] text-ink-500">Aucun média ajouté. Ajoutez au moins une photo.</p>}
        </div>
      </div>
      {(error || localError) && <p className="mt-2 text-[11px] font-medium text-danger">{error ?? localError}</p>}
    </div>
  );
}
