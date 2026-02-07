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
    <div className={clsx('col col--3')}>
      <div className="text--center">
        <span style={{fontSize: '5rem', lineHeight: '1.5', display: 'block', marginBottom: '1rem'}} role="img" aria-label="icon">
          {emoji}
        </span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
