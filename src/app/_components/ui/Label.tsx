'use client';

import type { ComponentProps, ElementType, ReactNode } from 'react';

export type LabelSize = 'lg' | 'md' | 'sm';

export type LabelProps<T extends ElementType = 'label'> = {
  as?: T;
  size?: LabelSize;
  required?: boolean;
  children?: ReactNode;
  className?: string;
} & Omit<
  ComponentProps<T>,
  'as' | 'size' | 'required' | 'children' | 'className'
>;

export const Label = <T extends ElementType = 'label'>(
  props: LabelProps<T>
) => {
  const { as, children, className, size = 'md', required, ...rest } = props;
  const Component = as || 'label';

  return (
    <Component
      className={`
        text-solid-gray-800 flex items-center gap-2
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
    </Component>
  );
};
