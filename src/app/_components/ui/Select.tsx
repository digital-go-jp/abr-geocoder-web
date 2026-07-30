'use client';

import { type ComponentProps, forwardRef } from 'react';

export type SelectSize = 'lg' | 'md' | 'sm';

export type SelectProps = Omit<ComponentProps<'select'>, 'size'> & {
  isError?: boolean;
  selectSize?: SelectSize;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    const { className, isError, selectSize = 'lg', children, ...rest } = props;

    return (
      <select
        className={`
          max-w-full rounded-8 border bg-white px-4 border-solid-gray-600 text-oln-16N-100 text-solid-gray-800
          hover:border-black
          data-[size=sm]:h-10 data-[size=md]:h-12 data-[size=lg]:h-14
          aria-[invalid=true]:border-error-1 aria-[invalid=true]:hover:border-red-1000
          focus:outline focus:outline-4 focus:outline-black focus:outline-offset-[calc(2/16*1rem)] focus:ring-[calc(2/16*1rem)] focus:ring-yellow-300
          aria-disabled:border-solid-gray-300 aria-disabled:bg-solid-gray-50 aria-disabled:text-solid-gray-420 aria-disabled:pointer-events-none aria-disabled:forced-colors:text-[GrayText] aria-disabled:forced-colors:border-[GrayText]
          ${className ?? ''}
        `}
        aria-invalid={isError || undefined}
        data-size={selectSize}
        ref={ref}
        {...rest}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
