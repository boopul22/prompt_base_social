'use client';

import React from 'react';

interface IconifyProps extends React.HTMLAttributes<HTMLElement> {
    icon: string;
    width?: string | number;
    height?: string | number;
    class?: string;
}

export default function Iconify({ icon, width, height, className, ...props }: IconifyProps) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return <iconify-icon icon={icon} width={width} height={height} class={className} {...props}></iconify-icon>;
}
