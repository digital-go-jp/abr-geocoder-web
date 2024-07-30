'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Image from 'next/image';
import { Roboto_Mono } from 'next/font/google';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

import { ErrorInfo, FormValues, GeocodingResult } from '../_lib/types';
import { OUTPUT_FORMAT } from '../_lib/constants';
import { fetchGeocodeData } from '../_lib/api';
import Loading from '../_components/loading';
import ErrorBox from '../_components/error-box';

const RobotoMonoFont = Roboto_Mono({ weight: '400', subsets: ['latin'] });

const OneLineGeocoding: React.FC = () => {
  const [geocodingResult, setGeocodingResult] = useState<GeocodingResult>({ table: [], others: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
      target: 'all',
      format: 'table',
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address');
    if (address) {
      setValue('address', decodeURIComponent(address));
      trigger();
    }
  }, [setValue, trigger]);

  const onSubmit: SubmitHandler<FormValues> = useCallback(async (data) => {
    setIsLoading(true);
    setErrorInfo(undefined);

    const { address, target, format } = data;
    const outputFormat = format === OUTPUT_FORMAT.TABLE ? OUTPUT_FORMAT.JSON : format;

    try {
      const response = await fetchGeocodeData(address, outputFormat, target);
      if (!response.ok) {
        throw new Error(`エラーコード: ${response.status}, エラー内容: ${await response.text()}`);
      }
      await processResult(response, format);
    } catch (error) {
      handleError(error as Error, true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleError = useCallback((error: Error, isApiError = false) => {
    setErrorInfo({
      title: 'ジオコーディングに失敗しました',
      message: error.message,
      isApiError,
    });
    setGeocodingResult({ table: [], others: '' });
  }, []);

  const processResult = useCallback(async (response: Response, format: string) => {
    if (format === OUTPUT_FORMAT.CSV) {
      const text = await response.text();
      setGeocodingResult({ table: [], others: text });
    } else {
      const json = await response.json();
      if (format === OUTPUT_FORMAT.TABLE) {
        const table = json.map((item: any) => flattenObject(item));
        setGeocodingResult({ table, others: '' });
      } else {
        setGeocodingResult({ table: [], others: JSON.stringify(json, null, 2) });
      }
    }
  }, []);

  const flattenObject = (obj: any, parentKey = '', result: Record<string, any> = {}): Record<string, any> => {
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        flattenObject(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    });
    return result;
  };

  const copyToClipboard = useCallback(async () => {
    const { table, others } = geocodingResult;
    let copyText = '';
    if (table.length) {
      copyText = table.map(row =>
        Object.entries(row).map(([key, value]) => `${key}\t${value}`).join('\n')
      ).join('\n\n');
    } else if (others) {
      copyText = others;
    }
    await navigator.clipboard.writeText(copyText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  }, [geocodingResult]);

  const formatLabel = (format: string): string => {
    const labels: Record<string, string> = {
      [OUTPUT_FORMAT.TABLE]: 'Table',
      [OUTPUT_FORMAT.CSV]: 'CSV',
      [OUTPUT_FORMAT.JSON]: 'JSON',
      [OUTPUT_FORMAT.GEO_JSON]: 'GeoJSON',
    };
    return labels[format] || '';
  };

  const renderGeocodingResult = () => {
    const { table, others } = geocodingResult;
    if (!table.length && !others) return null;

    return (
      <>
        <div className="grid gap-4 grid-cols-12 contents-grid-margin-x mt-10 mb-4">
          <div className="contents-grid-span-start text-heading-xxs">
            ジオコーディング結果
          </div>
        </div>
        <div className={`grid gap-4 grid-cols-12 contents-grid-margin-x h-11 ${RobotoMonoFont.className}`}>
          <div className="contents-grid-span-start">
            <div className="flex h-full items-center bg-sumi-700 px-6 text-white text-text-l justify-between">
              <span>{formatLabel(getValues('format'))}</span>
              <button onClick={copyToClipboard}>
                {isCopied ? (
                  <div className="flex items-center">
                    <Image src="./check.svg" alt="check" width={24} height={24} priority />
                    <span className="ml-2">Copied!</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Image src="./copy.svg" alt="copy" width={16} height={20} priority />
                    <span className="ml-2">Copy</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-12 contents-grid-margin-x mb-6">
          <div className={`contents-grid-span-start grid gap-2 overflow-x-auto pb-6 pt-5 bg-sumi-900 text-white ${RobotoMonoFont.className} ${table.length ? 'grid-cols-2' : ''}`}>
            {others && !table.length && (
              <div className="col-span-2 text-left whitespace-pre px-6" data-testid="geocoding-result-other">
                <SyntaxHighlighter language="json" style={nightOwl} className="!bg-sumi-900">
                  {others}
                </SyntaxHighlighter>
              </div>
            )}
            {table.length > 0 && !others && table.map((result, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {Object.entries(result).map(([key, value], cellIndex) => (
                  <React.Fragment key={cellIndex}>
                    <div className="col-span-1 text-left px-6" data-testid="geocoding-result-table-key">
                      {key}
                    </div>
                    <div className="col-span-1 text-left" data-testid="geocoding-result-table-value">
                      {String(value)}
                    </div>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {isLoading && <Loading text={'ジオコーディング中...'} />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-main-50">
          <div className="grid gap-4 grid-cols-12 contents-grid-margin-x pt-input-mt pb-input-mb">
            <div className="contents-grid-span-start mb-2">
              <div className="grid grid-cols-1">
                <div className="flex mb-2">
                  <label htmlFor="address" className="text-s font-semibold leading-6 mr-2">住所</label>
                </div>
                <input
                  {...register('address', { required: '1文字以上入力してください' })}
                  type="text"
                  className="min-w min-h-oneline-input-min-h border-black rounded-lg border-solid border p-2 autofill:shadow-[inset_0_0_0px_999px_#fff]"
                  placeholder="例）東京都千代田区紀尾井町1-3"
                  id="address"
                  data-testid="input-address"
                />
                <span className="text-error-800 text-text-m">{errors.address?.message}</span>
              </div>
            </div>
            <div className="contents-grid-span-start pb-input-mb">
              <fieldset className="mb-4">
                <div className="flex mb-2">
                  <legend className="text-sm font-semibold leading-6 mr-2">検索対象</legend>
                </div>
                <div className="flex text-text-l">
                  {['all', 'residential', 'parcel'].map((value) => (
                    <div key={value} className="flex items-center mr-8">
                      <input
                        {...register('target')}
                        id={`target_${value}`}
                        type="radio"
                        value={value}
                        className="h-4 w-4 accent-main-900"
                      />
                      <label htmlFor={`target_${value}`} className="text-gray-900 pl-2 cursor-pointer">
                        {value === 'all' ? '住居表示 + 地番' : value === 'residential' ? '住居表示' : '地番'}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <div className="flex">
                  <legend className="text-text-m font-semibold leading-6 mr-2">出力形式</legend>
                </div>
                <div className="flex m:flex-wrap s:flex-wrap xs:flex-wrap text-text-l">
                  {['table', 'csv', 'json', 'geojson'].map((value) => (
                    <div key={value} className="flex items-center py-2 mr-6">
                      <input
                        {...register('format')}
                        id={value}
                        type="radio"
                        value={value}
                        className="h-4 w-4 accent-main-900"
                      />
                      <label htmlFor={value} className="text-gray-900 pl-2 cursor-pointer">
                        {value === 'table' ? 'Table（表）' : value.toUpperCase()}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="col-span-12 text-center">
              <button
                className={`rounded-button text-white h-button-h min-w-button-min-w text-button
                ${!isDirty || !isValid ? 'bg-sumi-500 text-opacity-60' : 'bg-main-800 text-opacity-100 hover:bg-main-900'}`}
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
            <ErrorBox title={errorInfo.title} message={errorInfo.message} isApiError={errorInfo.isApiError} />
          </div>
        </div>
      )}
      {!isLoading && renderGeocodingResult()}
    </>
  );
};

export default OneLineGeocoding;