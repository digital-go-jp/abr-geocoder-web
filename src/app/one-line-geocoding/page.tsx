'use client';

import { Fragment, useState, useEffect } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Roboto_Mono } from 'next/font/google';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { LIMIT_OPTIONS, OUTPUT_FORMAT, PREFECTURES } from '../_lib/constants';
import { fetchGeocodeData } from '../_lib/api';
import { flattenObject } from '../_lib/utils';
import type {
  ErrorInfo,
  GeoJSONFeature,
  GeocodeResult,
  GeocodingResultRow,
} from '../_lib/types';
import Loading from '../_components/loading';
import {
  Button,
  Input,
  Radio,
  Label,
  Legend,
  ErrorText,
  NotificationBanner,
  Select,
} from '../_components/ui';

const RobotoMonoFont = Roboto_Mono({ weight: '400', subsets: ['latin'] });

type FormValues = {
  address: string;
  target: string;
  pref: string;
  limit: string;
  format: string;
};

export default function OneLineGeocoding() {
  const [geocodingResultTable, setGeocodingResultTable] = useState<
    GeocodingResultRow[]
  >([]);
  const [geocodingResultOthers, setGeocodingResultOthers] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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
      pref: '',
      limit: '1',
      format: '',
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

  const onSubmit: SubmitHandler<FormValues> = async data => {
    setIsLoading(true);
    setErrorInfo(undefined);

    const { format, ...params } = processFormData(data);
    try {
      createResult(await fetchGeocodeData(params), format);
    } catch (error) {
      handleError(error as Error, true);
      setGeocodingResultOthers('');
      setGeocodingResultTable([]);
    } finally {
      setIsLoading(false);
    }
  };

  const processFormData = (data: FormValues) => {
    const { address, target, pref, limit, format } = data;
    return { address, category: target, pref, limit: Number(limit), format };
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

  const createResult = (json: GeocodeResult, format: string) => {
    let resultText: string | undefined;
    let resultTable: GeocodingResultRow[] | undefined;

    if (format === OUTPUT_FORMAT.TABLE) {
      resultTable = json.features.map((feature: GeoJSONFeature) => {
        const coordinates = feature.geometry?.coordinates;
        const properties = flattenObject(feature.properties ?? {});
        return {
          lng: coordinates?.[0] ?? 'null',
          lat: coordinates?.[1] ?? 'null',
          ...properties,
        };
      });
    } else {
      resultText = JSON.stringify(json, null, 2);
    }
    setGeocodingResultOthers(resultText || '');
    setGeocodingResultTable(resultTable || []);
  };

  const renderGeocodingResult = () => {
    if (!geocodingResultTable.length && !geocodingResultOthers) return null;

    return (
      <>
        <div className="grid gap-4 grid-cols-12 mx-4 md:mx-20 mt-10 mb-4">
          <div className="col-span-12 md:col-span-8 md:col-start-3 text-std-20N-150">
            ジオコーディング結果
          </div>
        </div>
        <div
          className={`grid gap-4 grid-cols-12 mx-4 md:mx-20 h-11 ${RobotoMonoFont.className}`}
        >
          <div className="col-span-12 md:col-span-8 md:col-start-3">
            <div className="flex h-full items-center bg-solid-gray-700 px-6 text-white text-std-16N-170 justify-between">
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
        <div className="grid gap-4 grid-cols-12 mx-4 md:mx-20 mb-6">
          <div
            className={`col-span-12 md:col-span-8 md:col-start-3
            grid gap-2 overflow-x-auto pb-6 pt-5
            bg-solid-gray-900 text-white
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
                  className="!bg-solid-gray-900"
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

  // 候補が複数あるときだけ番号で区切る。表示とコピーで同じ見出しを使う
  const hasMultipleCandidates = geocodingResultTable.length > 1;
  const candidateLabel = (index: number) => `候補 ${index + 1}`;

  const renderTableResult = (resultTable: GeocodingResultRow[]) => {
    return resultTable.map((result, rowIndex) => (
      <Fragment key={rowIndex}>
        {hasMultipleCandidates && (
          <div
            className="col-span-2 px-6 pt-4 text-left text-solid-gray-420 first:pt-0"
            data-testid="geocoding-result-candidate"
          >
            {candidateLabel(rowIndex)}
          </div>
        )}
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
      geocodingResultTable.forEach((result, index) => {
        if (hasMultipleCandidates) {
          copyText += `${candidateLabel(index)}\n`;
        }
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
      case OUTPUT_FORMAT.GEO_JSON:
        return 'GeoJSON';
      default:
        return '';
    }
  };

  return (
    <>
      {isLoading && <Loading text={'ジオコーディング中...'} />}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-blue-50">
          <div className="grid gap-4 grid-cols-12 mx-4 md:mx-20 pt-input-mt pb-input-mb">
            {/* 住所入力 */}
            <div className="col-span-12 md:col-span-8 md:col-start-3 mb-2">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="address" required>
                  住所
                </Label>
                <Input
                  {...register('address', {
                    required: '1文字以上入力してください',
                  })}
                  type="text"
                  className="w-full"
                  placeholder="例）東京都千代田区紀尾井町1-3"
                  id="address"
                  isError={!!errors.address}
                  data-testid="input-address"
                />
                {errors.address && (
                  <ErrorText>{errors.address.message}</ErrorText>
                )}
              </div>
            </div>

            {/* 検索対象 */}
            <div className="col-span-12 md:col-span-8 md:col-start-3 pb-input-mb">
              <fieldset className="mb-4">
                <Legend className="mb-2">検索対象</Legend>
                <div className="flex flex-wrap gap-x-6">
                  <Radio
                    {...register('target')}
                    defaultChecked
                    id="target_all"
                    value="all"
                    size="sm"
                  >
                    住居表示 + 地番
                  </Radio>
                  <Radio
                    {...register('target')}
                    id="target_rsdtdsp"
                    value="rsdtdsp"
                    size="sm"
                  >
                    住居表示
                  </Radio>
                  <Radio
                    {...register('target')}
                    id="target_parcel"
                    value="parcel"
                    size="sm"
                  >
                    地番
                  </Radio>
                  <Radio
                    {...register('target')}
                    id="target_basic"
                    value="basic"
                    size="sm"
                  >
                    都道府県/市区町村/町字
                  </Radio>
                </div>
              </fieldset>

              {/* 都道府県・結果件数 */}
              <div className="flex flex-wrap gap-6 mb-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="pref">都道府県</Label>
                  <Select {...register('pref')} id="pref" selectSize="sm">
                    <option value="">指定しない</option>
                    {PREFECTURES.map(({ code, name }) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="limit">結果件数</Label>
                  <Select {...register('limit')} id="limit" selectSize="sm">
                    {LIMIT_OPTIONS.map(limit => (
                      <option key={limit} value={limit}>
                        {limit}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* 出力形式 */}
              <fieldset>
                <Legend className="mb-2">出力形式</Legend>
                <div className="flex flex-wrap gap-x-6">
                  <Radio
                    {...register('format')}
                    defaultChecked
                    id="table"
                    value="table"
                    size="sm"
                  >
                    Table（表）
                  </Radio>
                  <Radio
                    {...register('format')}
                    id="geojson"
                    value="geojson"
                    size="sm"
                  >
                    GeoJSON
                  </Radio>
                </div>
              </fieldset>
            </div>

            {/* 送信ボタン */}
            <div className="col-span-12 text-center">
              <Button
                type="submit"
                size="lg"
                className="h-button-h min-w-button-min-w"
                disabled={!isDirty || !isValid}
              >
                ジオコーディング開始
              </Button>
            </div>
          </div>
        </div>
      </form>
      {errorInfo && (
        <div className="grid gap-4 grid-cols-12 mx-4 md:mx-20 mt-8">
          <div className="col-span-12 md:col-span-8 md:col-start-3">
            <NotificationBanner type="error" title={errorInfo.title}>
              <ul className="list-disc list-inside space-y-1">
                <li>{errorInfo.message}</li>
                {errorInfo.isApiError && (
                  <li>
                    このメッセージが繰り返し表示される場合は、管理者にお問い合わせください。
                  </li>
                )}
              </ul>
            </NotificationBanner>
          </div>
        </div>
      )}
      {!isLoading && renderGeocodingResult()}
    </>
  );
}
