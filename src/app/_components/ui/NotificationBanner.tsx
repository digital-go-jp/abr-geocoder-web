'use client';

import type { ComponentProps, ReactNode } from 'react';

export type NotificationBannerStyle = 'standard' | 'color-chip';
export type NotificationBannerType =
  'info1' | 'info2' | 'warning' | 'error' | 'success';
export type NotificationBannerHeadingLevel = 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

type IconProps = ComponentProps<'svg'>;

const InfoIcon = (props: IconProps) => (
  <svg
    aria-label="インフォメーション"
    fill="none"
    height="24"
    role="img"
    viewBox="0 0 24 24"
    width="24"
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill="currentcolor" />
    <circle cx="12" cy="8" r="1" fill="Canvas" />
    <path d="M11 11h2v6h-2z" fill="Canvas" />
  </svg>
);

const WarningIcon = (props: IconProps) => (
  <svg
    aria-label="警告"
    fill="none"
    height="24"
    role="img"
    viewBox="0 0 24 24"
    width="24"
    {...props}
  >
    <path d="M1 21 12 2l11 19H1Z" fill="currentcolor" />
    <path d="M13 15h-2v-5h2v5Z" fill="Canvas" />
    <circle cx="12" cy="17" r="1" fill="Canvas" />
  </svg>
);

const ErrorIcon = (props: IconProps) => (
  <svg
    aria-label="エラー"
    fill="none"
    height="24"
    role="img"
    viewBox="0 0 24 24"
    width="24"
    {...props}
  >
    <path
      d="M8.25 21 3 15.75v-7.5L8.25 3h7.5L21 8.25v7.5L15.75 21h-7.5Z"
      fill="currentcolor"
    />
    <path
      d="m12 13.4-2.85 2.85-1.4-1.4L10.6 12 7.75 9.15l1.4-1.4L12 10.6l2.85-2.85 1.4 1.4L13.4 12l2.85 2.85-1.4 1.4L12 13.4Z"
      fill="Canvas"
    />
  </svg>
);

const SuccessIcon = (props: IconProps) => (
  <svg
    aria-label="成功"
    fill="none"
    height="24"
    role="img"
    viewBox="0 0 24 24"
    width="24"
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill="currentcolor" />
    <path
      d="m17.6 9.6-7 7-4.3-4.3L7.7 11l2.9 2.9 5.7-5.6 1.3 1.4Z"
      fill="Canvas"
    />
  </svg>
);

const NotificationBannerIcon = ({
  type,
  className,
}: {
  type: NotificationBannerType;
  className?: string;
}) => {
  switch (type) {
    case 'info1':
    case 'info2':
      return <InfoIcon className={className} />;
    case 'warning':
      return <WarningIcon className={className} />;
    case 'error':
      return <ErrorIcon className={className} />;
    case 'success':
      return <SuccessIcon className={className} />;
    default:
      return null;
  }
};

const bannerStyleClasses = `
  data-[style=standard]:border-[calc(3/16*1rem)] data-[style=standard]:rounded-12
  data-[style=color-chip]:[--color-chip-color:currentColor] data-[style=color-chip]:border-[calc(2/16*1rem)] data-[style=color-chip]:!pl-6 data-[style=color-chip]:shadow-[inset_calc(8/16*1rem)_0_0_0_var(--color-chip-color)]
`;

const bannerTypeClasses = `
  data-[type=info1]:text-blue-900
  data-[type=info2]:text-solid-gray-536
  data-[type=warning]:text-warning-yellow-2 data-[type=warning]:[--color-chip-color:theme(colors.yellow.400)]
  data-[type=error]:text-error-1
  data-[type=success]:text-success-2
`;

export type NotificationBannerProps = {
  className?: string;
  children?: ReactNode;
  bannerStyle?: NotificationBannerStyle;
  type?: NotificationBannerType;
  title: string;
  headingLevel?: NotificationBannerHeadingLevel;
};

export const NotificationBanner = (props: NotificationBannerProps) => {
  const {
    className,
    children,
    bannerStyle = 'standard',
    type = 'info1',
    title,
    headingLevel,
  } = props;
  const Tag = headingLevel ?? 'div';

  return (
    <div
      className={`
        grid grid-cols-[var(--icon-size)_1fr_minmax(0,auto)] grid-rows-[minmax(calc(36/16*1rem),auto)] border-current px-4 pt-2 pb-6 [--icon-size:calc(24/16*1rem)] gap-4
        ${bannerStyleClasses}
        ${bannerTypeClasses}
        ${className ?? ''}
      `}
      data-type={type}
      data-style={bannerStyle}
      role="alert"
    >
      <Tag className="col-span-2 grid grid-cols-[inherit] gap-[inherit]">
        <NotificationBannerIcon
          className="justify-self-center mt-[calc(3/16*1rem)] size-7 max-w-none max-h-none"
          type={type}
        />
        <span className="pt-[calc(3/16*1rem)] text-std-17B-170 text-solid-gray-900">
          {title}
        </span>
      </Tag>
      {children && (
        <div className="col-start-2 text-solid-gray-800 text-std-16N-170">
          {children}
        </div>
      )}
    </div>
  );
};
