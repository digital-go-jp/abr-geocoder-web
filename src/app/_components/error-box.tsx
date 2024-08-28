import React from 'react';
import Image from 'next/image';

type ErrorBoxProps = {
  title: string;
  message: string;
  isApiError?: boolean;
};

/**
 * エラー表示用のコンポーネント
 */
const ErrorBox: React.FC<ErrorBoxProps> = ({
  title,
  message,
  isApiError = false,
}) => {
  return (
    <div
      className="border-solid border-description-box p-spacing-unit-3 border-error-800 mt-8 rounded-xl"
      role="alert"
    >
      <div className="box-heading">
        <div className="min-w-[32px]">
          <Image src="/error.svg" alt="" width={32} height={32} priority />
        </div>
        <h2 className="pl-6 text-sumi-900 text-heading-xxs-bold">{title}</h2>
      </div>
      <div className="pl-14">
        <div className="text-sumi-700 text-text-m whitespace-pre-wrap">
          <ul className="list-disc list-inside">
            <li>{message}</li>
            {isApiError && (
              <li>
                このメッセージが繰り返し表示される場合は、管理者にお問い合わせください。
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorBox;
