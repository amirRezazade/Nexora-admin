'use client';

import { useEffect, useState } from 'react';
import { Upload, Trash2, Maximize2, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { cn, productArt } from '@/lib/format';
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

export default function ProductGallery({ productId, name, images: incoming, editable = false, onChange }) {
  const [images, setImages] = useState(() => normalizeImages(incoming, productId));
  const { t } = useI18n();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(false);

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

  const addImage = () => {
    commit([...images, { id: `${productId}-img-${Date.now()}`, seed: `${productId}-${images.length + Math.random()}` }]);
  };

  const Art = ({ seed, url, className, label }) => {
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
          {name
            .split(' ')
            .slice(0, 2)
            .map((w) => w[0])
            .join('')
            .toUpperCase()}
        </span>
      </span>
    );
  };

  const current = images[active];
  const thumbsReady = thumbsSwiper && !thumbsSwiper.destroyed;

  if (!images.length) {
    return (
      <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-card-lg border border-line bg-surface-2 text-center">
        <p className="text-body-sm text-ink-2">{t('gallery.none')}</p>
        {editable && (
          <Button size="sm" variant="secondary" icon={Upload} onClick={addImage}>
            {t('gallery.upload')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="nova-gallery flex flex-col gap-3">
      <div className="group relative aspect-square w-full overflow-hidden rounded-card-lg border border-line bg-surface-2">
        <Swiper
          modules={[Navigation, Pagination, Thumbs, Keyboard, A11y]}
          thumbs={{ swiper: thumbsReady ? thumbsSwiper : null }}
          navigation
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          spaceBetween={0}
          onSlideChange={(s) => setActive(s.activeIndex)}
          className="h-full w-full"
          a11y={{
            prevSlideMessage: 'Previous image',
            nextSlideMessage: 'Next image',
          }}
        >
          {images.map((img, i) => (
            <SwiperSlide key={img.id}>
              <Art
                seed={img.seed}
                url={img.url}
                label={`${name}, image ${i + 1} of ${images.length}`}
                className="h-full w-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="pointer-events-none absolute right-3 top-3 z-10 flex gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
          <span className="pointer-events-auto">
            <IconButton
              icon={Maximize2}
              label="Open image preview"
              variant="secondary"
              size="sm"
              onClick={() => setPreview(true)}
            />
          </span>
          {editable && images.length > 1 && (
            <span className="pointer-events-auto">
              <IconButton
                icon={Trash2}
                label={`Remove image ${active + 1}`}
                variant="secondary"
                size="sm"
                className="text-danger-text"
                onClick={() => remove(active)}
              />
            </span>
          )}
        </div>
        {active === 0 && (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-pill bg-surface/95 px-2 py-0.5 text-caption font-medium text-ink shadow-xs">
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
        className="nova-gallery-thumbs w-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={img.id} className="!h-auto !w-auto max-w-none flex-[1_0_calc(20%-6.4px)]">
            <button
              type="button"
              aria-label={`Show image ${i + 1}${i === 0 ? ' (primary)' : ''}`}
              aria-current={active === i}
              className={cn(
                'relative aspect-square w-full overflow-hidden rounded-control border-2 transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                active === i ? 'border-brand' : 'border-line hover:border-line-strong'
              )}
            >
              <Art seed={img.seed} url={img.url} label="" className="h-full w-full" />
            </button>
          </SwiperSlide>
        ))}
        {editable && (
          <SwiperSlide className="!h-auto !w-auto max-w-none flex-[1_0_calc(20%-6.4px)]">
            <button
              type="button"
              onClick={addImage}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-control border-2 border-dashed border-line-strong text-ink-3 transition-colors hover:border-brand hover:bg-brand-softer hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Upload aria-hidden className="h-4 w-4" />
              <span className="text-[10px] font-medium">{t('gallery.add')}</span>
            </button>
          </SwiperSlide>
        )}
      </Swiper>

      {editable && (
        <p className="text-caption text-ink-3">
          Swipe or use arrows. The first image is used as the primary product image.
        </p>
      )}

      <Modal open={preview} onClose={() => setPreview(false)} title={name} size="lg">
        <div className="pb-4">
          {current && (
            <Art
              seed={current.seed}
              url={current.url}
              label={`${name}, enlarged preview`}
              className="aspect-square w-full rounded-card-lg"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
