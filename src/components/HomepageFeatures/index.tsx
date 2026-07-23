import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

type FeatureItem = {
  title: ReactNode;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: <Translate>硬件生态与连接</Translate>,
    emoji: '🔌',
    description: (
      <Translate>
        支持多种智能终端（电机、跳蛋、脉冲等），极速 WiFi 配网，稳定连接，轻松上手。
      </Translate>
    ),
  },
  {
    title: <Translate>无限创意玩法</Translate>,
    emoji: '🎮',
    description: (
      <Translate>
        内置俯卧撑检测、电击问答、寸止训练等多种趣味互动模式，让控制更有趣。
      </Translate>
    ),
  },
  {
    title: <Translate>全平台控制</Translate>,
    emoji: '📱',
    description: (
      <Translate>
        提供强大的电脑客户端与手机端支持（App/小程序），随时随地掌控设备状态。
      </Translate>
    ),
  },
  {
    title: <Translate>开放开发生态</Translate>,
    emoji: '👨‍💻',
    description: (
      <Translate>
        提供 Python 控制接口与开源代码，支持开发者自定义扩展，共建智能玩具体验。
      </Translate>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--3', styles.featureCol)}>
      <div className={styles.featureCard}>
        <div className={styles.iconTile}>
          <span role="img" aria-hidden="true">
            {emoji}
          </span>
        </div>
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>
            <Translate id="homepage.featuresEyebrow">核心能力</Translate>
          </span>
          <Heading as="h2" className={styles.sectionTitle}>
            <Translate id="homepage.featuresTitle">一个生态，连接所有玩法</Translate>
          </Heading>
          <p className={styles.sectionSubtitle}>
            <Translate id="homepage.featuresSubtitle">
              从硬件连接到软件开发，硅基之下为你提供完整的智能互动体验。
            </Translate>
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
