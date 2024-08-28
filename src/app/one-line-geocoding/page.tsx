'use client';

import React, { Fragment, useState, useEffect } from 'react';
import { ErrorInfo } from '../_lib/types';
import Loading from '../_components/loading';
import { OUTPUT_FORMAT } from '../_lib/constants';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import ErrorBox from '../_components/error-box';
import { fetchGeocodeData } from '../_lib/api';
import { Roboto_Mono } from 'next/font/google';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const RobotoMonoFont = Roboto_Mono({ weight: '400', subsets: ['latin'] });

type FormValues = {
  address: string;
  target: string;
  format: string;
};

const OneLineGeocoding = () => {
  const [geocodingResultTable, setGeocodingResultTable] = useState<
    Record<string, any>[]
  >([]);
  const [geocodingResultOthers, setGeocodingResultOthers] =
    useState<string>('');
  const [isLoding, setIsLoding] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    setValue,
    getValues,
    trigger,
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      address: '',
      target: '',
      format: '',
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address');
    if (address) {
      setValue('address', decodeURIComponent(address));
      trigger(); // フォームのバリデーションを再評価
    }
  }, [setValue, trigger]);

  const onSubmit: SubmitHandler<FormValues> = async data => {
    setIsLoding(true);
    setErrorInfo(undefined);

    const { address, target, format, outputFormat } = processFormData(data);
    try {
      const response = await fetchGeocodeData(address, outputFormat, target);
      if (!response.ok) {
        const statusCode = response.status;
        const errorMessage = await response.json();
        throw new Error(
          `エラーコード: ${statusCode}, エラー内容: ${errorMessage?.message}`
        );
      }
      await createResult(response, format);
    } catch (error) {
      handleError(error as Error, true);
      setGeocodingResultOthers('');
      setGeocodingResultTable([]);
    } finally {
      setIsLoding(false);
    }
  };

  const processFormData = (data: FormValues) => {
    const { address, target, format } = data;
    const outputFormat =
      format === OUTPUT_FORMAT.TABLE ? OUTPUT_FORMAT.JSON : format;
    return { address, target, format, outputFormat };
  };

  const handleError = (error: Error, isApiError = false) => {
    setErrorInfo({
      title: 'ジオコーディングに失敗しました',
      message: error.message,
      isApiError,
    });
  };

  const copyToClipboard = async (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  const flattenObject = (obj: any, parentKey = '', res: any = {}) => {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const propName = parentKey ? `${parentKey}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          flattenObject(obj[key], propName, res);
        } else {
          res[propName] = obj[key];
        }
      }
    }
    return res;
  };

  const createResult = async (response: Response, format: string) => {
    let resultText: string | undefined;
    let resultTable: Record<string, any>[] | undefined;

    if (format === OUTPUT_FORMAT.CSV) {
      resultText = await response.text();
    } else {
      const json = await response.json();
      if (format === OUTPUT_FORMAT.TABLE) {
        resultTable = json.map((item: any) => flattenObject(item));
        resultTable = resultTable?.map(item => {
          const newItem: Record<string, any> = {};
          Object.entries(item).forEach(([key, value]) => {
            const keys = key.split('.');
            if (keys.length > 1) {
              newItem[keys.slice(1).join('.')] = value;
            }
          });
          return newItem;
        });
      } else {
        resultText = JSON.stringify(json, null, 2);
      }
    }
    setGeocodingResultOthers(resultText || '');
    setGeocodingResultTable(resultTable || []);
  };

  const renderGeocodingResult = () => {
    if (!geocodingResultTable.length && !geocodingResultOthers) return null;

    return (
      <>
        <div className="grid gap-4 grid-cols-12 contents-grid-margin-x mt-10 mb-4">
          <div className="contents-grid-span-start text-heading-xxs">
            ジオコーディング結果
          </div>
        </div>
        <div
          className={`grid gap-4 grid-cols-12 contents-grid-margin-x h-11 ${RobotoMonoFont.className}`}
        >
          <div className="contents-grid-span-start">
            <div className="flex h-full items-center bg-sumi-700 px-6 text-white text-text-l justify-between">
              <span>{formatLabel(getValues('format'))}</span>
              <span>
                <button onClick={handleCopy}>
                  <div
                    className={`flex items-center ${isCopied ? '' : 'hidden'}`}
                  >
                    <Image
                      src="./check.svg"
                      alt="check"
                      width="24"
                      height="24"
                      priority
                    />
                    <span className="ml-2">Copied!</span>
                  </div>
                  <div
                    className={`flex items-center ${isCopied ? 'hidden' : ''}`}
                  >
                    <Image
                      src="./copy.svg"
                      alt="copy"
                      width="16"
                      height="20"
                      priority
                    />
                    <span className="ml-2">Copy</span>
                  </div>
                </button>
              </span>
            </div>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-12 contents-grid-margin-x mb-6">
          <div
            className={`contents-grid-span-start
            grid gap-2 overflow-x-auto pb-6 pt-5
            bg-sumi-900 text-white
            ${RobotoMonoFont.className}
            ${geocodingResultTable.length && !geocodingResultOthers ? 'grid-cols-2' : ''}`}
          >
            {geocodingResultOthers && !geocodingResultTable.length && (
              <div
                className="col-span-2 text-left whitespace-pre px-6"
                data-testid="geocoding-result-other"
              >
                <SyntaxHighlighter
                  language="json"
                  style={nightOwl}
                  className="!bg-sumi-900"
                >
                  {geocodingResultOthers}
                </SyntaxHighlighter>
              </div>
            )}
            {geocodingResultTable.length > 0 &&
              !geocodingResultOthers &&
              renderTableResult(geocodingResultTable)}
          </div>
        </div>
      </>
    );
  };

  const renderTableResult = (resultTable: Record<string, any>[]) => {
    return resultTable.map((result, rowIndex) => (
      <Fragment key={rowIndex}>
        {Object.entries(result).map(([key, value], cellIndex) => (
          <Fragment key={cellIndex}>
            <div
              className="col-span-1 text-left px-6"
              data-testid="geocoding-result-table-key"
            >
              {key}
            </div>
            <div
              className="col-span-1 text-left"
              data-testid="geocoding-result-table-value"
            >
              {String(value)}
            </div>
          </Fragment>
        ))}
      </Fragment>
    ));
  };

  const handleCopy = () => {
    let copyText = '';
    if (geocodingResultTable.length) {
      geocodingResultTable.forEach(result => {
        Object.entries(result).forEach(([key, value]) => {
          copyText += `${key}\t${value}\n`;
        });
      });
    } else if (geocodingResultOthers) {
      copyText = geocodingResultOthers;
    }
    copyToClipboard(copyText);
  };

  const formatLabel = (format: string) => {
    switch (format) {
      case OUTPUT_FORMAT.TABLE:
        return 'Table';
      case OUTPUT_FORMAT.CSV:
        return 'CSV';
      case OUTPUT_FORMAT.JSON:
        return 'JSON';
      case OUTPUT_FORMAT.GEO_JSON:
        return 'GeoJSON';
      default:
        return '';
    }
  };

  return (
    <>
      {isLoding && <Loading text={'ジオコーディング中...'} />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-main-50">
          <div className="grid gap-4 grid-cols-12 contents-grid-margin-x pt-input-mt pb-input-mb">
            <div className="contents-grid-span-start mb-2">
              <div className="grid grid-cols-1">
                <div className="flex mb-2">
                  <label
                    htmlFor="address"
                    className="text-s font-semibold leading-6 mr-2"
                  >
                    住所
                  </label>
                </div>
                <input
                  {...register('address', {
                    required: '1文字以上入力してください',
                  })}
                  type="text"
                  className="min-w min-h-oneline-input-min-h border-black rounded-lg border-solid border p-2 autofill:shadow-[inset_0_0_0px_999px_#fff]"
                  placeholder="例）東京都千代田区紀尾井町1-3"
                  name="address"
                  id="address"
                  data-testid="input-address"
                />
                <span className="text-error-800 text-text-m">
                  {errors.address?.message}
                </span>
              </div>
            </div>
            <div className="contents-grid-span-start pb-input-mb">
              <fieldset className="mb-4">
                <div className="flex mb-2">
                  <legend className="text-sm font-semibold leading-6 mr-2">
                    検索対象
                  </legend>
                </div>
                <div className="flex text-text-l">
                  <div className="flex items-center">
                    <input
                      {...register('target')}
                      defaultChecked
                      id="target_all"
                      name="target"
                      type="radio"
                      value="all"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="target_all"
                      className="text-gray-900 mr-8 pl-2 cursor-pointer"
                    >
                      住居表示 + 地番
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      {...register('target')}
                      id="target_residential"
                      name="target"
                      type="radio"
                      value="residential"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="target_residential"
                      className="text-gray-900 mr-8 pl-2 cursor-pointer"
                    >
                      住居表示
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      {...register('target')}
                      id="target_parcel"
                      name="target"
                      type="radio"
                      value="parcel"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="target_parcel"
                      className="text-gray-900 pl-2 cursor-pointer"
                    >
                      地番
                    </label>
                  </div>
                </div>
              </fieldset>
              <fieldset>
                <div className="flex">
                  <legend className="text-text-m font-semibold leading-6 mr-2">
                    出力形式
                  </legend>
                </div>
                <div className="flex m:flex-wrap s:flex-wrap xs:flex-wrap text-text-l">
                  <div className="flex items-center py-2">
                    <input
                      {...register('format')}
                      defaultChecked
                      id="table"
                      name="format"
                      value="table"
                      type="radio"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="table"
                      className="text-gray-900 mr-6 pl-2 cursor-pointer"
                    >
                      Table（表）
                    </label>
                  </div>
                  <div className="flex items-center py-2">
                    <input
                      {...register('format')}
                      id="csv"
                      name="format"
                      type="radio"
                      value="csv"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="csv"
                      className="text-gray-900 mr-6 pl-2 cursor-pointer"
                    >
                      CSV
                    </label>
                  </div>
                  <div className="flex items-center py-2">
                    <input
                      {...register('format')}
                      id="json"
                      name="format"
                      type="radio"
                      value="json"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="json"
                      className="text-gray-900 mr-6 pl-2 cursor-pointer"
                    >
                      JSON
                    </label>
                  </div>
                  <div className="flex items-center py-2">
                    <input
                      {...register('format')}
                      id="geojson"
                      name="format"
                      type="radio"
                      value="geojson"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="geojson"
                      className="text-gray-900 mr-6 pl-2 cursor-pointer"
                    >
                      GeoJSON
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            <div className="col-span-12 text-center">
              <button
                className={`rounded-button text-white h-button-h min-w-button-min-w text-button
                ${!isDirty || !isValid ? 'bg-sumi-500 text-opacity-60 ' : 'bg-main-800 text-opacity-100 hover:bg-main-900'}`}
                type="submit"
                disabled={!isDirty || !isValid}
              >
                <span>ジオコーディング開始</span>
              </button>
            </div>
          </div>
        </div>
      </form>
      {errorInfo && (
        <div className="grid gap-4 grid-cols-12 contents-grid-margin-x">
          <div className="contents-grid-span-start">
            <ErrorBox
              title={errorInfo.title}
              message={errorInfo.message}
              isApiError={errorInfo.isApiError}
            />
          </div>
        </div>
      )}
      {!isLoding && renderGeocodingResult()}
    </>
  );
};

export default OneLineGeocoding;
