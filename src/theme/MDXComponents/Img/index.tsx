import {useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode} from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import type {Props} from '@theme/MDXComponents/Img';

/**
 * Screenshot presentation for a documentation set that is ~400 images deep and
 * mixes two very different formats: wide desktop captures (up to 3760px) and
 * tall portrait phone captures (up to 4056px). Two rules fall out of that mix.
 *
 * 1. Anything big enough to read as "a screen" gets a frame (see .politis-shot)
 *    so it separates from the page instead of bleeding into it. Small crops —
 *    a 56px button glyph, a menu snippet — stay raw; a border and shadow around
 *    an icon is noise.
 * 2. Anything the layout has to shrink becomes zoomable, so the detail lost to
 *    downscaling is one click away. Without that, capping tall captures would
 *    trade one problem (a phone screenshot eating a whole viewport) for another
 *    (an unreadable thumbnail).
 *
 * Docusaurus writes real intrinsic `width`/`height` attributes onto every
 * markdown image, so both decisions are made at render time and stay
 * server-rendered — no layout-shifting measurement on the client.
 */

/** Longest edge, in px, at which an image starts reading as a screen capture. */
const FRAME_MIN_EDGE = 200;

/** Widths above this are downscaled by the doc column on most viewports. */
const ZOOM_MIN_WIDTH = 640;

/**
 * Tall captures are clamped to this height. The clamp is expressed as a *width*
 * cap (--politis-shot-cap) because `max-height` on an <img> that carries a
 * width attribute is not reliably aspect-ratio preserving, while `max-width` is.
 */
const MAX_SHOT_HEIGHT = 620;

function toPixels(value: Props['width']): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export default function MDXImg(props: Props): ReactNode {
  const {className, style, ...rest} = props;

  const width = toPixels(props.width);
  const height = toPixels(props.height);
  const hasIntrinsicSize = width > 0 && height > 0;

  const framed = !hasIntrinsicSize || width >= FRAME_MIN_EDGE || height >= FRAME_MIN_EDGE;
  const clamped = hasIntrinsicSize && height > MAX_SHOT_HEIGHT;
  const zoomable = hasIntrinsicSize && (width >= ZOOM_MIN_WIDTH || clamped);

  const alt = typeof props.alt === 'string' ? props.alt.trim() : '';
  /* Two thirds of these images carry a markdown title (`![alt](src "title")`),
     which is usually the more readable of the two — prefer it for the visible
     caption, and leave `alt` to do its accessibility job on the <img>. */
  const title = typeof props.title === 'string' ? props.title.trim() : '';
  const caption = title || alt;

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, close]);

  const shotStyle: CSSProperties | undefined = clamped
    ? ({
        ...style,
        '--politis-shot-cap': `${Math.round((width * MAX_SHOT_HEIGHT) / height)}px`,
      } as CSSProperties)
    : style;

  const image = (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img
      decoding="async"
      loading="lazy"
      {...rest}
      style={shotStyle}
      className={clsx(className, 'politis-img', framed && 'politis-shot')}
    />
  );

  if (!zoomable) {
    return image;
  }

  const enlargeLabel = translate({
    id: 'theme.MDXImg.enlarge',
    message: 'Увеличаване на изображението',
    description: 'Tooltip / fallback label for the click-to-zoom screenshot button',
  });

  const closeLabel = translate({
    id: 'theme.MDXImg.close',
    message: 'Затваряне',
    description: 'Label of the button that closes the enlarged screenshot',
  });

  /*
   * Markdown images live inside a <p>, so the overlay is built from phrasing
   * content (<span>) with its box model set in CSS — a <div>/<figure> here
   * would be invalid nesting. It is positioned `fixed`; no ancestor in the doc
   * layout establishes a containing block or a competing stacking context.
   */
  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="politis-zoom"
        /* Don't shadow an image's own tooltip with the generic zoom hint. */
        title={title === '' ? enlargeLabel : undefined}
        /* With alt text present the <img> already names the button; only fall
           back to a generic label for the few images that have empty alt. */
        aria-label={alt === '' ? enlargeLabel : undefined}
        onClick={() => setOpen(true)}>
        {image}
      </button>
      {open && (
        <span
          className="politis-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={caption === '' ? enlargeLabel : caption}
          onClick={close}>
          <button
            type="button"
            className="politis-lightbox__close"
            aria-label={closeLabel}
            onClick={close}
            autoFocus>
            <span aria-hidden="true">✕</span>
          </button>
          <span className="politis-lightbox__figure">
            <img
              className="politis-lightbox__img"
              src={props.src}
              alt={alt}
              width={props.width}
              height={props.height}
            />
            {caption !== '' && (
              <span className="politis-lightbox__caption">{caption}</span>
            )}
          </span>
        </span>
      )}
    </>
  );
}
