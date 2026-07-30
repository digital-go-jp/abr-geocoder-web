'use client';

import type { ComponentProps, ReactNode } from 'react';

export type LegendSize = 'lg' | 'md' | 'sm';

export type LegendProps = {
  size?: LegendSize;
  required?: boolean;
  children?: ReactNode;
  className?: string;
} & Omit<
  ComponentProps<'legend'>,
  'size' | 'required' | 'children' | 'className'
>;

export const Legend = (props: LegendProps) => {
  const { children, className, size = 'md', required, ...rest } = props;

  return (
    <legend
      className={`
        flex w-fit items-center gap-2 text-solid-gray-800
        data-[size=sm]:text-std-16B-170 data-[size=md]:text-std-17B-170 data-[size=lg]:text-std-18B-160
        ${className ?? ''}
      `}
      data-size={size}
      {...rest}
    >
      {children}
      {required !== undefined && (
        <span
          className={`
            text-dns-14N-130 font-normal
            ${required ? 'text-error-1' : 'text-solid-gray-600'}
          `}
        >
          {required ? '※必須' : '※任意'}
        </span>
      )}
    </legend>
  );
};
