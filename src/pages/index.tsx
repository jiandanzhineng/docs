import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import Translate, {translate} from '@docusaurus/Translate';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={clsx(styles.heroOrb, styles.heroOrbLeft)} aria-hidden="true" />
      <div className={clsx(styles.heroOrb, styles.heroOrbRight)} aria-hidden="true" />
      <div className={clsx('container', styles.heroContent)}>
        <span className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} aria-hidden="true" />
          <Translate id="homepage.heroBadge">智能生态 · 文档中心</Translate>
        </span>
        <Heading as="h1" className={styles.heroTitle}>
          <span className={styles.heroTitleLine}>
            <Translate id="homepage.heroTitle">硅基之下(UnderSilicon)文档</Translate>
          </span>
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate id="homepage.heroTagline">探索 硅基之下(UnderSilicon) 智能生态，解锁无限互动玩法</Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--lg', styles.primaryButton)}
            to="/docs/">
            <Translate id="homepage.visitDocs">开始使用</Translate>
            <span className={styles.primaryButtonArrow} aria-hidden="true">→</span>
          </Link>
          <Link
            className={clsx('button button--lg', styles.secondaryButton)}
            to="/docs/pc-client">
            <Translate id="homepage.downloadClient">下载客户端</Translate>
          </Link>
        </div>
      </div>
      <div className={styles.heroFade} aria-hidden="true" />
    </header>
  );
}

function HomepageCta() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaPanel}>
          <div className={styles.ctaGlow} aria-hidden="true" />
          <Heading as="h2" className={styles.ctaTitle}>
            <Translate id="homepage.ctaTitle">准备好开始了吗？</Translate>
          </Heading>
          <p className={styles.ctaSubtitle}>
            <Translate id="homepage.ctaSubtitle">跟随文档指引，几分钟内即可连接设备，体验完整的智能互动生态。</Translate>
          </p>
          <Link className={clsx('button button--lg', styles.ctaButton)} to="/docs/">
            <Translate id="homepage.ctaButton">查看使用文档</Translate>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={translate({id: 'homepage.title', message: '欢迎来到 硅基之下(UnderSilicon)文档'})}
      description={translate({id: 'homepage.description', message: '硅基之下(UnderSilicon) 文档网站'})}>
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageCta />
      </main>
    </Layout>
  );
}
