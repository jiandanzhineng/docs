import React, {useState, type ReactNode} from 'react';
import {translate} from '@docusaurus/Translate';
import clsx from 'clsx';
import {FiMessageCircle} from 'react-icons/fi';
import LocaleSuggestBanner from '@site/src/components/LocaleSuggestBanner';
import BaiduTongji from '@site/src/components/BaiduTongji';
import AiKefuChat from '@site/src/components/AiKefuChat';

export default function Root({children}: {children: ReactNode}): ReactNode {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <BaiduTongji />
      <LocaleSuggestBanner />
      {children}
      <div
        className={clsx(
          'customer-service-widget',
          isOpen && 'customer-service-widget--open',
        )}>
        {isOpen && (
          <section
            id="customer-service-panel"
            className="customer-service-panel"
            aria-label={translate({id: 'kefu.panel.ariaLabel', message: '在线客服'})}>
            <AiKefuChat onClose={() => setIsOpen(false)} />
          </section>
        )}
        <button
          className="customer-service-trigger"
          type="button"
          aria-expanded={isOpen}
          aria-controls="customer-service-panel"
          title={
            isOpen
              ? translate({id: 'kefu.trigger.close', message: '关闭客服'})
              : translate({id: 'kefu.trigger.open', message: '联系客服'})
          }
          onClick={() => setIsOpen((current) => !current)}>
          <FiMessageCircle aria-hidden="true" />
          <span>{translate({id: 'kefu.trigger.label', message: '客服'})}</span>
        </button>
      </div>
    </>
  );
}
