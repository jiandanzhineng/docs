export default function stripFontTags() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (!node || typeof node !== 'object') return;

      if (node.type === 'html' || node.type === 'text') {
        const value = typeof node.value === 'string' ? node.value : '';
        if (value.includes('<font')) {
          node.value = value
            .replace(/<font\b[^>]*>/gi, '')
            .replace(/<\/font>/gi, '');
        }
      }

      const children = node.children;
      if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const isMdxJsx =
            child &&
            (child.type === 'mdxJsxTextElement' ||
              child.type === 'mdxJsxFlowElement');

          if (isMdxJsx && Array.isArray(child.attributes)) {
            child.attributes = child.attributes.filter(
              (attr: any) => attr?.name !== 'style',
            );
          }

          if (isMdxJsx && child.name === 'font') {
            const replacement = Array.isArray(child.children)
              ? child.children
              : [];
            children.splice(i, 1, ...replacement);
            i--;
            continue;
          }

          walk(child);
        }
      }
    };

    walk(tree);
  };
}
