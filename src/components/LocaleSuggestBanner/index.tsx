import {useEffect, useState, type ReactNode} from 'react';
import {useAlternatePageUtils} from '@docusaurus/theme-common/internal';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {FiX} from 'react-icons/fi';
import {hasLocaleChoice, markLocaleChosen} from '@site/src/utils/localeChoice';
import {
  getBrowserLanguages,
  getPreferredLocale,
  type SupportedLocale,
} from '@site/src/utils/preferredLocale';
import {BANNER_COPY} from './copy';
import styles from './styles.module.css';

function isLocaleMenuLink(link: HTMLAnchorElement): boolean {
  if (link.classList.contains('dropdown__link')) {
    return Boolean(
      link
        .closest('.navbar__item.dropdown')
        ?.querySelector('.mobileLocaleDropdown'),
    );
  }
  if (
    link.classList.contains('menu__link') &&
    !link.classList.contains('menu__link--sublist')
  ) {
    const group = document
      .querySelector('.navbar-sidebar .mobileLocaleDropdown')
      ?.closest('.menu__list-item');
    return Boolean(group?.contains(link));
  }
  return false;
}

export default function LocaleSuggestBanner(): ReactNode {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const alternatePageUtils = useAlternatePageUtils();
  const [preferred, setPreferred] = useState<SupportedLocale | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a');
      if (link instanceof HTMLAnchorElement && isLocaleMenuLink(link)) {
        markLocaleChosen();
        setPreferred(null);
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    if (hasLocaleChoice()) {
      return;
    }
    const next = getPreferredLocale(getBrowserLanguages());
    if (next !== currentLocale) {
      setPreferred(next);
    }
  }, [currentLocale]);

  if (!preferred) {
    return null;
  }

  const copy = BANNER_COPY[preferred];
  const href = alternatePageUtils.createUrl({
    locale: preferred,
    fullyQualified: false,
  });

  const onSwitch = () => {
    markLocaleChosen();
  };

  const onClose = () => {
    markLocaleChosen();
    setPreferred(null);
  };

  return (
    <div
      className={styles.banner}
      data-locale-suggest-banner=""
      role="region"
      aria-label={copy.message}>
      <p className={styles.message}>{copy.message}</p>
      <a className={styles.switch} href={href} onClick={onSwitch}>
        {copy.switchLabel}
      </a>
      <button
        className={styles.close}
        type="button"
        aria-label={copy.closeLabel}
        title={copy.closeLabel}
        onClick={onClose}>
        <FiX aria-hidden="true" />
      </button>
    </div>
  );
}
