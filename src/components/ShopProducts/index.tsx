import React, {useCallback, useEffect, useRef} from 'react';
import Translate from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

type ProductSnapshot = {
  slug: string;
  nameZh: string;
  nameEn: string;
  image: string;
};

const SHOP_ORIGIN = 'https://shop.undersilicon.cn';
const WX_JSSDK_URL = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
// 商城 ref 允许字符：^[A-Za-z0-9._-]{1,64}$（见商城 src/lib/promoSource.ts）
const REF_MAX_LEN = 64;

declare global {
  interface Window {
    __wxjs_environment?: string;
    wx?: {miniProgram?: {navigateTo: (opts: {url: string}) => void}};
  }
}

function isMiniProgramEnv(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    window.__wxjs_environment === 'miniprogram' ||
    /miniProgram/i.test(window.navigator.userAgent)
  );
}

function loadWxJssdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.wx?.miniProgram) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = WX_JSSDK_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('wx jssdk load failed'));
    document.head.appendChild(script);
  });
}

/** 页面短标识 → 合法 ref 后缀（只保留 [A-Za-z0-9._-]，超出 64 截断） */
export function buildRefTag(raw: string): string {
  const cleaned = String(raw || '')
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned.slice(0, REF_MAX_LEN - 'docs-'.length) || 'page';
}

/** 原图可达数 MB，走商城的 Next 图片优化取 384 宽缩略图；失败时回退原图 */
function thumbUrl(image: string): string {
  if (!image.startsWith(`${SHOP_ORIGIN}/uploads/`)) {
    return image;
  }
  const path = image.slice(SHOP_ORIGIN.length);
  return `${SHOP_ORIGIN}/_next/image?url=${encodeURIComponent(path)}&w=384&q=75`;
}

function productHref(
  product: ProductSnapshot,
  locale: string,
  refTag: string,
): string {
  const shopLocale = locale === 'zh-Hans' ? 'zh' : 'en';
  return `${SHOP_ORIGIN}/${shopLocale}/products/${product.slug}?ref=docs-${refTag}`;
}

export default function ShopProducts({
  slugs,
  refSource,
  products,
}: {
  slugs: string[];
  refSource: string;
  products: ProductSnapshot[];
}): React.ReactElement | null {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const isZh = currentLocale === 'zh-Hans';
  const refTag = buildRefTag(refSource);
  const miniProgram = useRef<boolean>(false);

  useEffect(() => {
    if (!isMiniProgramEnv()) {
      return;
    }
    miniProgram.current = true;
    loadWxJssdk().catch(() => {
      // JSSDK 加载失败时保持普通链接行为
      miniProgram.current = false;
    });
  }, []);

  const onCardClick = useCallback(
    (event: React.MouseEvent, product: ProductSnapshot) => {
      if (!miniProgram.current || !window.wx?.miniProgram) {
        return;
      }
      event.preventDefault();
      window.wx.miniProgram.navigateTo({
        url: `/pages/product/index?slug=${encodeURIComponent(product.slug)}`,
      });
    },
    [],
  );

  const items = slugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is ProductSnapshot => p !== undefined);
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        <Translate id="theme.shop.heading">
          本页用到的设备
        </Translate>
      </h2>
      <div className={styles.grid}>
        {items.map((product) => (
          <a
            key={product.slug}
            className={styles.card}
            href={productHref(product, currentLocale, refTag)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => onCardClick(e, product)}>
            {product.image ? (
              <img
                className={styles.image}
                src={thumbUrl(product.image)}
                alt={isZh ? product.nameZh : product.nameEn}
                loading="lazy"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (img.src !== product.image) {
                    img.src = product.image;
                  }
                }}
              />
            ) : null}
            <div className={styles.body}>
              <span className={styles.name}>
                {isZh ? product.nameZh : product.nameEn}
              </span>
              <span className={styles.button}>
                <Translate id="theme.shop.goShop">去商城看看</Translate>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
