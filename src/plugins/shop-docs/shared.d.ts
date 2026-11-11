export declare const DOCS_DIR_NAME: string;
export declare const SNAPSHOT_REL_PATH: string;
export declare function fileToDocId(
  contentDir: string,
  filePath: string,
): string;
export declare function readDocProducts(
  siteDir: string,
): Record<string, string[]>;
export declare function readProductSnapshot(siteDir: string): Record<
  string,
  {slug: string; nameZh: string; nameEn: string; image: string}
>;
export declare function findUnknownSlugs(
  siteDir: string,
): Record<string, string[]>;
