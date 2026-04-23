import React, {type CSSProperties, type MouseEvent, type ReactNode, useEffect, useMemo, useState} from 'react';
import {createPortal} from 'react-dom';
import type {Props} from '@theme/MDXComponents/Img';
import matchRegex from '@site/src/utils/matchRegex';

function normalizeSize(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
}

function stripAltTokens(alt?: string): string | undefined {
  if (!alt) {
    return alt;
  }

  const cleaned = alt.replace(/##[wWhHrR][\d.]+(?:[a-zA-Z%]+)?##/g, '').replace(/\s+/g, ' ').trim();
  return cleaned || undefined;
}

export default function MDXImg(props: Props): ReactNode {
  const {
    alt,
    src,
    srcSet,
    sizes,
    style,
    onClick,
    ...restProps
  } = props;

  const width = normalizeSize(matchRegex('##[wW]([\\d\\.]+(?:[a-zA-Z%]+)?)##', alt));
  const height = normalizeSize(matchRegex('##[hH]([\\d\\.]+(?:[a-zA-Z%]+)?)##', alt));
  const borderRadius = matchRegex('##[rR](\\d+)##', alt);
  const cleanedAlt = useMemo(() => stripAltTokens(alt), [alt]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const imageStyle: CSSProperties = {
    ...style,
    objectFit: style?.objectFit ?? 'contain',
  };

  if (width) {
    imageStyle.width = width;
  }

  if (height) {
    imageStyle.height = 'auto';
    imageStyle.maxHeight = height;
  }

  if (borderRadius) {
    imageStyle.borderRadius = `${borderRadius}px`;
  }

  const handleOpen = (event: MouseEvent<HTMLImageElement>) => {
    onClick?.(event);

    if (event.defaultPrevented || !src) {
      return;
    }

    if (event.currentTarget.closest('a')) {
      return;
    }

    setIsOpen(true);
  };

  const lightbox = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <div
          aria-modal="true"
          className="mdx-img-lightbox"
          onClick={() => setIsOpen(false)}
          role="dialog">
          <button
            aria-label="Close image preview"
            className="mdx-img-lightbox__close"
            onClick={() => setIsOpen(false)}
            type="button">
            x
          </button>
          {/* Keep the preview unconstrained so the overlay can use the source size. */}
          <img
            alt={cleanedAlt}
            className="mdx-img-lightbox__image"
            decoding="async"
            loading="eager"
            sizes={sizes}
            src={src}
            srcSet={srcSet}
          />
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img
        decoding="async"
        loading="lazy"
        {...restProps}
        alt={cleanedAlt}
        onClick={handleOpen}
        src={src}
        srcSet={srcSet}
        style={imageStyle}
      />
      {lightbox}
    </>
  );
}
