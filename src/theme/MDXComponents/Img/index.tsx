import React, { type ReactNode } from 'react';
import type { Props } from '@theme/MDXComponents/Img';
import matchRegex from '@site/src/utils/matchRegex';

export default function MDXImg (props: Props): ReactNode {
    const {
        alt,      // 获取到 ![alt]()
        src = '', // 获取到 ![alt](src)
    } = props;

    // 解析宽度: ##w50%## 或 ##w500## 或 ##w50vh##
    const width = ((res: string | undefined) => {
        if (!res) return undefined;
        // 如果是纯数字(包括小数), 添加px; 否则直接使用
        return /^\d+(\.\d+)?$/.test(res) ? `${res}px` : res;
    })(matchRegex("##[wW]([\\d\\.]+(?:[a-zA-Z%]+)?)##", alt));

    // 解析高度: ##h50%## 或 ##h500## 或 ##h50vh## (新增功能，参考项目仅有宽度)
    const height = ((res: string | undefined) => {
        if (!res) return undefined;
        // 如果是纯数字(包括小数), 添加px; 否则直接使用
        return /^\d+(\.\d+)?$/.test(res) ? `${res}px` : res;
    })(matchRegex("##[hH]([\\d\\.]+(?:[a-zA-Z%]+)?)##", alt));

    // 解析圆角: ##r10##
    const borderRadius = matchRegex("##[rR](\\d+)##", alt);

    return (
        // eslint-disable-next-line jsx-a11y/alt-text
        <img
            decoding="async"
            loading="lazy"
            {...props}
            style={{
                width: width,
                height: height ? 'auto' : undefined,
                maxHeight: height,
                borderRadius: borderRadius && `${borderRadius}px`,
                objectFit: 'contain'
            }}
        />
    );
}
