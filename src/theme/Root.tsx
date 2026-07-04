import React, {useState, type ReactNode} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {FiMail, FiMessageCircle, FiX} from 'react-icons/fi';
import {FaWeixin} from 'react-icons/fa';

const CUSTOMER_SERVICE_EMAIL = 'jiandanzhineng@outlook.com';
const CUSTOMER_SERVICE_QR_CODE = 'img/微信客服二维码.png';

export default function Root({children}: {children: ReactNode}): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const qrCodeSrc = useBaseUrl(CUSTOMER_SERVICE_QR_CODE);

  return (
    <>
      {children}
      <div className="customer-service-widget">
        {isOpen && (
          <section
            id="customer-service-panel"
            className="customer-service-panel"
            aria-labelledby="customer-service-title">
            <button
              className="customer-service-close"
              type="button"
              aria-label="关闭客服面板"
              title="关闭"
              onClick={() => setIsOpen(false)}>
              <FiX aria-hidden="true" />
            </button>
            <h2 id="customer-service-title" className="customer-service-title">
              在线客服
            </h2>
            <div className="customer-service-wechat-label">
              <FaWeixin aria-hidden="true" />
              <span>微信客服</span>
            </div>
            <img
              className="customer-service-qr"
              src={qrCodeSrc}
              alt="微信客服二维码"
            />
            <a
              className="customer-service-email"
              href={`mailto:${CUSTOMER_SERVICE_EMAIL}`}>
              <FiMail aria-hidden="true" />
              <span>{CUSTOMER_SERVICE_EMAIL}</span>
            </a>
          </section>
        )}
        <button
          className="customer-service-trigger"
          type="button"
          aria-expanded={isOpen}
          aria-controls="customer-service-panel"
          title={isOpen ? '关闭客服' : '联系客服'}
          onClick={() => setIsOpen((current) => !current)}>
          <FiMessageCircle aria-hidden="true" />
          <span>客服</span>
        </button>
      </div>
    </>
  );
}
