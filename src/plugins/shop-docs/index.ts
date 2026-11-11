import path from 'node:path';
import fs from 'node:fs';
import type {Plugin} from '@docusaurus/types';
import {readDocProducts, findUnknownSlugs} from './shared.mjs';

type Options = {
  /** 新手引导页的 doc id 列表（按顺序导出到 product-docs.json 的 onboarding） */
  onboarding?: string[];
};

type DocEntry = {
  id: string;
  title?: string;
  permalink?: string;
};

type LoadedVersionLike = {docs?: DocEntry[]};
type DocsPluginContentLike = {loadedVersions?: LoadedVersionLike[]};

const DOC_ID = 'default';

export default function shopDocsPlugin(
  context: {siteDir: string; outDir: string; i18n: {currentLocale: string}},
  options: Options,
): Plugin<Record<string, string[]>> {
  let docProducts: Record<string, string[]> = {};
  let loadedDocs: DocEntry[] = [];
  return {
    name: 'docusaurus-plugin-shop-docs',

    async loadContent() {
      docProducts = readDocProducts(context.siteDir) as Record<
        string,
        string[]
      >;
      const unknown = findUnknownSlugs(context.siteDir) as Record<
        string,
        string[]
      >;
      for (const [docId, slugs] of Object.entries(unknown)) {
        console.warn(
          `[shop-docs] 警告：${docId} 声明了快照中不存在的商品 slug：${slugs.join(
            ', ',
          )}（请先运行 npm run sync:shop-products 或修正 slug）`,
        );
      }
      return docProducts;
    },

    async contentLoaded({content, actions}) {
      // 商品 slug -> 页内 docId 列表，供主题组件（usePluginData）渲染卡片
      const slugToDocs: Record<string, string[]> = {};
      for (const [docId, slugs] of Object.entries(content)) {
        for (const slug of slugs) {
          (slugToDocs[slug] ??= []).push(docId);
        }
      }
      actions.setGlobalData({docProducts, slugToDocs});
    },

    async allContentLoaded({allContent}) {
      const docsContent = allContent?.['docusaurus-plugin-content-docs']?.[
        DOC_ID
      ] as DocsPluginContentLike | undefined;
      loadedDocs =
        docsContent?.loadedVersions?.flatMap((v) => v.docs ?? []) ?? [];
    },

    async postBuild() {
      const byDocId = new Map(loadedDocs.map((d) => [d.id, d]));
      const locale = context.i18n.currentLocale;

      const toEntry = (docId: string) => {
        const doc = byDocId.get(docId);
        if (!doc) {
          return null;
        }
        const rawPath = doc.permalink ?? '';
        const pathname =
          rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
        return {id: docId, title: doc.title ?? docId, path: pathname};
      };

      const onboarding: {id: string; title: string; path: string}[] = [];
      for (const docId of options.onboarding ?? []) {
        const entry = toEntry(docId);
        if (entry) {
          onboarding.push(entry);
        } else {
          console.warn(
            `[shop-docs] 警告：onboarding 页 ${docId} 在 ${locale} 构建中未找到`,
          );
        }
      }

      const products: Record<
        string,
        {id: string; title: string; path: string}[]
      > = {};
      for (const [docId, slugs] of Object.entries(docProducts)) {
        const entry = toEntry(docId);
        if (!entry) {
          continue;
        }
        for (const slug of slugs) {
          (products[slug] ??= []).push(entry);
        }
      }

      const out = {
        version: 1,
        locale,
        generatedAt: new Date().toISOString(),
        onboarding,
        products,
      };
      fs.mkdirSync(context.outDir, {recursive: true});
      fs.writeFileSync(
        path.join(context.outDir, 'product-docs.json'),
        `${JSON.stringify(out, null, 2)}\n`,
        'utf8',
      );
    },
  };
}
