import React from 'react';
import Footer from '@theme-original/DocItem/Footer';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {usePluginData} from '@docusaurus/useGlobalData';
import ShopProducts from '@site/src/components/ShopProducts';
import shopProductsData from '@site/src/data/shop-products.json';

type PluginData = {
  docProducts: Record<string, string[]>;
  slugToDocs: Record<string, string[]>;
};

export default function DocItemFooter(): React.ReactElement {
  const {metadata} = useDoc();
  const pluginData = usePluginData('docusaurus-plugin-shop-docs', 'default', {
    failfast: false,
  }) as PluginData | undefined;

  const docId: string =
    (metadata as {unversionedId?: string}).unversionedId ?? metadata.id;
  const slugs = pluginData?.docProducts?.[docId] ?? [];
  // 页面短标识取 permalink 末段（如 drink-pee-unlock），作为 ref=docs-<标识>
  const permalink: string = metadata?.permalink ?? '';
  const refSource = permalink.replace(/\/+$/, '').split('/').pop() ?? docId;

  return (
    <>
      <Footer />
      {slugs.length > 0 ? (
        <ShopProducts
          slugs={slugs}
          refSource={refSource}
          products={shopProductsData}
        />
      ) : null}
    </>
  );
}
