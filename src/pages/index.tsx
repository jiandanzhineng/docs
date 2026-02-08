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
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          <Translate id="homepage.heroTitle">硅基之下(UnderSilicon)文档</Translate>
        </Heading>
        <p className="hero__subtitle">
          <Translate id="homepage.heroTagline">探索 硅基之下(UnderSilicon) 智能生态，解锁无限互动玩法</Translate>
        </p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/">
            <Translate id="homepage.visitDocs">开始使用</Translate>
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/pc-client">
            <Translate id="homepage.downloadClient">下载客户端</Translate>
          </Link>
        </div>
      </div>
    </header>
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
      </main>
    </Layout>
  );
}
