import Image from 'next/image';

type PropsType = {
  title: string;
  message: string;
  isApiError?: boolean;
};
/**
 * エラー表示用のコンポーネント
 * @returns
 */
const ErrorBox = ({ title, message, isApiError = false }: PropsType) => {
  return (
    <div className="border-solid border-description-box p-spacing-unit-3 border-error-800 mt-8 rounded-xl">
      <div className="box-heading">
        <div className="min-w-[32px]">
          <Image
            src="./error.svg"
            alt="error"
            width="32"
            height="32"
            priority
          />
        </div>
        <div className="pl-6 text-sumi-900 text-heading-xxs-bold">{title}</div>
      </div>
      <div className="pl-14">
        <div className="text-sumi-700 text-text-m whitespace-pre-wrap">
          <ul className="list-disc list-inside">
            <li>{message}</li>
            {/* APIエラーレスポンスの時だけ以下表示 */}
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
