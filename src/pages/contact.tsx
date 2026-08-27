import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  FaWeixin,
  FaEnvelope,
  FaHeadset,
  FaQq,
  FaShoppingBag,
  FaGithub,
  FaArrowRight,
} from 'react-icons/fa';
import {FaXTwitter} from 'react-icons/fa6';
import styles from './contact.module.css';

const QR_SRC = 'img/新人工.png';
const EMAIL = 'jiandanzhineng@outlook.com';

const CONTACTS = [
  {title: '邮箱', desc: EMAIL, href: `mailto:${EMAIL}`, Icon: FaEnvelope},
  {title: '在线客服', desc: '网页在线咨询', href: 'https://undersilicon.com/kefu/', Icon: FaHeadset},
  {title: 'QQ 群', desc: '验证问题答案为 硅基之下', href: 'https://qm.qq.com/q/EN44NRr8RO', Icon: FaQq},
  {title: 'X', desc: '@lufashi181845', href: 'https://x.com/lufashi181845', Icon: FaXTwitter},
  {title: 'X（英文）', desc: '@Undersilicon', href: 'https://x.com/Undersilicon', Icon: FaXTwitter},
  {title: '淘宝店', desc: '官方店铺', href: 'https://shop282688998.taobao.com/', Icon: FaShoppingBag},
  {title: 'GitHub', desc: '开源仓库', href: 'https://github.com/orgs/jiandanzhineng/repositories', Icon: FaGithub},
];

function isExternal(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://');
}

export default function Contact(): ReactNode {
  const qrSrc = useBaseUrl(QR_SRC);

  return (
    <Layout title="联系我们" description="硅基之下联系方式：微信客服、邮箱、QQ 群、淘宝店等">
      <main className={styles.page}>
        <div className={styles.bg} aria-hidden="true" />
        <div className="container">
          <header className={styles.header}>
            <Heading as="h1" className={styles.title}>
              联系我们
            </Heading>
            <p className={styles.lead}>遇到问题或想了解产品，欢迎通过以下方式联系。</p>
          </header>

          <section className={styles.qrCard} aria-labelledby="wechat-cs-title">
            <div id="wechat-cs-title" className={styles.qrLabel}>
              <FaWeixin aria-hidden="true" />
              <span>微信客服</span>
            </div>
            <img className={styles.qr} src={qrSrc} alt="微信客服二维码" />
            <p className={styles.qrHint}>微信扫码添加客服</p>
          </section>

          <ul className={styles.grid}>
            {CONTACTS.map(({title, desc, href, Icon}) => (
              <li key={href}>
                <a
                  className={styles.card}
                  href={href}
                  {...(isExternal(href)
                    ? {target: '_blank', rel: 'noopener noreferrer'}
                    : {})}>
                  <span className={styles.cardIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <span className={styles.cardText}>
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </span>
                  <FaArrowRight className={styles.cardArrow} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </Layout>
  );
}
