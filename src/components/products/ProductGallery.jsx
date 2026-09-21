'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Maximize2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Thumbs, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { cn, productArt } from '@/lib/format';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/i18n/I18nProvider';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

function normalizeImages(incoming, productId) {
  if (!incoming?.length) return [];
  return incoming
    .filter((im) => im?.url)
    .map((im, i) => ({
      id: im.url || `${productId}-img-${i}`,
      url: im.url,
      seed: `${productId}-${i}`,
    }));
}

function initialsOf(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Public bucket in Supabase Storage. Falls back to data URLs when missing. */
const IMAGE_BUCKET = 'product-images';

function uploadToStorage(blob) {
  const ext = (blob.type && blob.type.split('/')[1]) || 'jpg';
  const path = `${new Date().getUTCFullYear()}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, blob, { contentType: blob.type || 'image/jpeg', cacheControl: '31536000', upsert: false })
    .then(({ error }) => {
      if (error) return null;
      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
      return data?.publicUrl || null;
    })
    .catch(() => null);
}

function blobToDataUrl(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function readImageFile(file) {
  const blob = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = () => {
        const max = 1400;
        let { width, height } = img;
        if (width > max || height > max) {
          const scale = max / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((b) => resolve(b || file), 'image/jpeg', 0.86);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  const remote = await uploadToStorage(blob);
  if (remote) return remote;
  return blobToDataUrl(blob);
}

function Art({ seed, url, className, label, name }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={label || ''} className={cn('h-full w-full object-cover', className)} />
    );
  }
  const [from, to] = productArt(seed);
  return (
    <span
      role="img"
      aria-label={label}
      className={cn('flex items-center justify-center overflow-hidden', className)}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <span className="text-black/25" style={{ fontSize: '1.5em', fontWeight: 700 }}>
        {initialsOf(name)}
      </span>
    </span>
  );
}

function NavButton({ dir, onClick, label }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center',
        'rounded-full border border-white/20 bg-black/45 text-white shadow-md backdrop-blur-sm',
        'transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        dir === 'prev' ? 'start-3' : 'end-3'
      )}
    >
      <Icon aria-hidden className="h-4 w-4 rtl:rotate-180" strokeWidth={2.4} />
    </button>
  );
}

export default function ProductGallery({ productId, name, images: incoming, editable = false, onChange }) {
  const [images, setImages] = useState(() => normalizeImages(incoming, productId));
  const { t } = useI18n();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    setImages(normalizeImages(incoming, productId));
    setActive(0);
    // Only re-hydrate when the product itself changes — not on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const commit = (next) => {
    setImages(next);
    onChange?.(next);
  };

  const remove = (i) => {
    const next = images.filter((_, idx) => idx !== i);
    commit(next);
    setActive((a) => Math.max(0, Math.min(a, next.length - 1)));
  };

  const openPicker = () => fileRef.current?.click();

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/'));
    e.target.value = '';
    if (!files.length) return;
    const added = [];
    for (const file of files) {
      try {
        const url = await readImageFile(file);
        added.push({
          id: `${productId}-img-${Date.now()}-${added.length}`,
          url,
          seed: `${productId}-${images.length + added.length}`,
        });
      } catch {
        /* skip unreadable files */
      }
    }
    if (added.length) commit([...images, ...added]);
  };

  const current = images[active];
  const thumbsReady = thumbsSwiper && !thumbsSwiper.destroyed;
  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      multiple
      className="sr-only"
      onChange={onFiles}
    />
  );

  if (!images.length) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-card-lg border border-dashed border-line-strong bg-surface-2 text-center">
        {fileInput}
        <p className="text-body-sm text-ink-2">{t('gallery.none')}</p>
        {editable && (
          <Button size="sm" variant="secondary" icon={Upload} onClick={openPicker}>
            {t('gallery.upload')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="nexora-gallery flex flex-col gap-3">
      {fileInput}
      <div className="group relative aspect-square w-full overflow-hidden rounded-card-lg border border-line bg-surface-2">
        <Swiper
          modules={[Pagination, Thumbs, Keyboard, A11y]}
          thumbs={{ swiper: thumbsReady ? thumbsSwiper : null }}
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          spaceBetween={0}
          onSwiper={setMainSwiper}
          onSlideChange={(s) => setActive(s.activeIndex)}
          className="h-full w-full"
          a11y={{
            prevSlideMessage: t('gallery.prev'),
            nextSlideMessage: t('gallery.next'),
          }}
        >
          {images.map((img, i) => (
            <SwiperSlide key={img.id}>
              <Art
                seed={img.seed}
                url={img.url}
                name={name}
                label={`${name}, image ${i + 1} of ${images.length}`}
                className="h-full w-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {images.length > 1 && (
          <>
            <NavButton dir="prev" label={t('gallery.prev')} onClick={() => mainSwiper?.slidePrev()} />
            <NavButton dir="next" label={t('gallery.next')} onClick={() => mainSwiper?.slideNext()} />
          </>
        )}

        <div className="pointer-events-none absolute end-3 top-3 z-10 flex gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="pointer-events-auto">
            <IconButton
              icon={Maximize2}
              label={t('gallery.preview')}
              variant="secondary"
              size="sm"
              onClick={() => setPreview(true)}
            />
          </span>
          {editable && images.length > 0 && (
            <span className="pointer-events-auto">
              <IconButton
                icon={Trash2}
                label={t('gallery.remove')}
                variant="secondary"
                size="sm"
                className="text-danger-text"
                onClick={() => remove(active)}
              />
            </span>
          )}
        </div>
        {active === 0 && (
          <span className="absolute start-3 top-3 z-10 inline-flex items-center gap-1 rounded-pill bg-surface/95 px-2 py-0.5 text-caption font-medium text-ink shadow-xs">
            <Star aria-hidden className="h-3 w-3 fill-brand text-brand" />
            {t('gallery.primary')}
          </span>
        )}
      </div>

      <Swiper
        modules={[Thumbs, A11y]}
        onSwiper={setThumbsSwiper}
        watchSlidesProgress
        slidesPerView={5}
        spaceBetween={8}
        className="nexora-gallery-thumbs w-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={img.id} className="!h-auto !w-auto max-w-none flex-[1_0_calc(20%-6.4px)]">
            <button
              type="button"
              aria-label={`${name} ${i + 1}`}
              aria-current={active === i}
              onClick={() => mainSwiper?.slideTo(i)}
              className={cn(
                'relative aspect-square w-full overflow-hidden rounded-control border-2 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                active === i ? 'border-brand' : 'border-line hover:border-line-strong'
              )}
            >
              <Art seed={img.seed} url={img.url} name={name} label="" className="h-full w-full" />
            </button>
          </SwiperSlide>
        ))}
        {editable && (
          <SwiperSlide className="!h-auto !w-auto max-w-none flex-[1_0_calc(20%-6.4px)]">
            <button
              type="button"
              onClick={openPicker}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-control border-2 border-dashed border-line-strong text-ink-3 transition-colors hover:border-brand hover:bg-brand-softer hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Upload aria-hidden className="h-4 w-4" />
              <span className="text-[10px] font-medium">{t('gallery.add')}</span>
            </button>
          </SwiperSlide>
        )}
      </Swiper>

      {editable && (
        <p className="text-caption text-ink-3">{t('gallery.hint')}</p>
      )}

      <Modal open={preview} onClose={() => setPreview(false)} title={name} size="lg">
        <div className="pb-4">
          {current && (
            <Art
              seed={current.seed}
              url={current.url}
              name={name}
              label={name}
              className="aspect-square w-full rounded-card-lg"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
