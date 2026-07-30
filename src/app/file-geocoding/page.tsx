'use client';

import type { FormEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import Encoding from 'encoding-japanese';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { FILE_PREVIEW_MAX_LINE } from '../_lib/constants';
import { ProcessStep } from '../_lib/enums';
import { fetchGeocodeData } from '../_lib/api';
import { flattenObject } from '../_lib/utils';
import type { ErrorInfo } from '../_lib/types';
import Loading from '../_components/loading';
import { Button, NotificationBanner } from '../_components/ui';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['.txt', '.csv'];
const FILE_NAME_POSTFIX = '_GeocodingResults.csv';

export default function FileGeocoding() {
  const [fileContent, setFileContent] = useState<string[]>([]);
  const [fileGeocodingCount, setFileGeocodingCount] = useState(0);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [processStep, setProcessStep] = useState(ProcessStep.DEFAULT);
  const [fileInfo, setFileInfo] = useState<File | undefined>(undefined);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [fileGeocodingResult, setFileGeocodingResult] = useState<string[]>([]);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    const kb = 1024;
    const mb = kb * 1024;
    const gb = mb * 1024;
    if (bytes < kb) return `${bytes} B`;
    if (bytes < mb) return `${(bytes / kb).toFixed(2)} KB`;
    if (bytes < gb) return `${(bytes / mb).toFixed(2)} MB`;
    return `${(bytes / gb).toFixed(2)} GB`;
  };

  const handleSelectedFiles = useCallback(async (files: File[]) => {
    setIsFileLoading(true);
    setErrorInfo(undefined);
    try {
      if (files.length === 0) throw new Error('ファイルを選択してください');
      if (files.length > 1)
        throw new Error('複数ファイルはアップロードできません');
      const file = files[0];

      // ファイル形式チェック
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
        throw new Error(
          `許可されていないファイル形式です。対応形式：${ACCEPTED_FILE_TYPES.join(', ')}`
        );
      }

      // ファイルサイズチェック
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `ファイルサイズが上限（${formatFileSize(MAX_FILE_SIZE)}）を超えています。現在：${formatFileSize(file.size)}`
        );
      }

      setFileInfo(file);
      const fileContents = await readFileContents(file);
      if (fileContents.length > Number(process.env.NEXT_PUBLIC_FILE_MAX_LINE)) {
        throw new Error(
          `アップロードされたリストが${process.env.NEXT_PUBLIC_FILE_MAX_LINE}件を超えています（現在：${fileContents.length}件）`
        );
      }
      setFileContent(fileContents);
      setProcessStep(ProcessStep.FILE_LOADED);
    } catch (error) {
      handleError('ファイルの読み込みでエラーが発生しました', error as Error);
      setProcessStep(ProcessStep.ERROR);
    } finally {
      setIsFileLoading(false);
    }
  }, []);

  const readFileContents = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        const codes = new Uint8Array(event.target?.result as ArrayBuffer);
        const detectedEncoding = Encoding.detect(codes);
        const utf8String = Encoding.convert(codes, {
          to: 'UNICODE',
          from: detectedEncoding || 'AUTO',
          type: 'string',
        });
        const fileContents = utf8String
          .split(/\r\n|\n|\r/)
          .filter(v => v !== '');
        resolve(fileContents);
      };
      reader.onerror = () =>
        reject(new Error('ファイルの読み込みでエラーが発生しました'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleError = (title: string, error: Error, isApiError = false) => {
    setErrorInfo({ title, message: error.message, isApiError });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleSelectedFiles,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
  });

  const geojsonToCsvRow = (
    feature: Record<string, unknown>,
    headers: string[]
  ): string => {
    const geometry = feature.geometry as Record<string, unknown>;
    const coordinates = geometry?.coordinates as number[];
    const properties = flattenObject(
      feature.properties as Record<string, unknown>
    );

    const row: Record<string, unknown> = {
      lng: coordinates?.[0] ?? 'null',
      lat: coordinates?.[1] ?? 'null',
      ...properties,
    };

    return headers.map(h => row[h] ?? 'null').join(',');
  };

  const onGeocoding = async (event: FormEvent) => {
    event.preventDefault();
    setIsGeocodingLoading(true);
    const geocodingResultList: string[] = [];
    const csvHeaders: string[] = [];
    try {
      for (const address of fileContent) {
        if (address === '') continue;
        const json = await fetchGeocodeData({ address, category: 'all' });
        const feature = json.features?.[0];

        if (feature && csvHeaders.length === 0) {
          const properties = flattenObject(
            feature.properties as Record<string, unknown>
          );
          csvHeaders.push('lng', 'lat', ...Object.keys(properties));
          geocodingResultList.push(csvHeaders.join(','));
        }

        if (feature) {
          geocodingResultList.push(geojsonToCsvRow(feature, csvHeaders));
        } else {
          geocodingResultList.push(
            csvHeaders.map((_, i) => (i === 0 ? address : '')).join(',')
          );
        }
        setFileGeocodingCount(prevCount => prevCount + 1);
      }
      setFileGeocodingResult(geocodingResultList);
      setProcessStep(ProcessStep.GEOCODED);
    } catch (error) {
      handleError(
        'ジオコーディングでエラーが発生しました',
        error as Error,
        true
      );
      setProcessStep(ProcessStep.ERROR);
    } finally {
      setIsGeocodingLoading(false);
      setFileGeocodingCount(0);
    }
  };

  const onSubmit = () => {
    downloadCSV(fileGeocodingResult);
  };

  const downloadCSV = (data: string[]) => {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, data.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = `${fileInfo?.name?.split('.')[0]}${FILE_NAME_POSTFIX}`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const previewFileContents = (fileContent: string[]): string[] => {
    const result = fileContent.slice(0, FILE_PREVIEW_MAX_LINE);
    if (fileContent.length > FILE_PREVIEW_MAX_LINE) result.push('...');
    return result;
  };

  const onCancel = () => {
    setFileContent([]);
    setFileGeocodingCount(0);
    setProcessStep(ProcessStep.DEFAULT);
  };

  return (
    <>
      {isFileLoading && <Loading text={'ファイル読み込み中...'} />}
      {isGeocodingLoading && (
        <Loading
          text={`ジオコーディング中... ${fileGeocodingCount} 件 / ${fileContent.length} 件中`}
        />
      )}
      <div className="grid gap-4 grid-cols-12">
        <form onSubmit={onSubmit} className="col-span-12">
          <div className="bg-blue-50 h-file-input-h">
            <div className="grid grid-cols-12 gap-4 pt-10 mx-4 md:mx-20 justify-center items-center ">
              <div
                className={`grid grid-cols-12 col-span-12 md:col-span-8 md:col-start-3 place-items-center
                            border min-h-file-description-h rounded-8
                            ${
                              isDragActive
                                ? 'outline outline-4 -outline-offset-4 outline-green-500 bg-green-50 border-green-500'
                                : 'border-solid-gray-500 bg-solid-gray-200/20'
                            }`}
                {...getRootProps()}
              >
                <div className="col-span-12 h-full pt-file-select-pt pb-file-select-pb">
                  <button
                    onClick={e => {
                      e.preventDefault();
                      fileInputRef?.current?.click();
                    }}
                    className={`rounded-8 text-oln-16B-100 h-button-h w-selected-file p-spacing-unit-1 border
                      ${
                        isDragActive
                          ? 'border-green-500 bg-green-50 text-green-500 underline'
                          : 'border-blue-900 bg-white text-blue-900 hover:bg-blue-200 hover:text-blue-1000 hover:underline'
                      }`}
                  >
                    ファイルを選択
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    onClick={e => ((e.target as HTMLButtonElement).value = '')}
                    hidden
                    {...getInputProps()}
                    data-testid="file-input"
                  />
                </div>
                <div
                  className={`col-span-12 items-center text-center text-std-16N-170 h-full pb-6
                  ${isDragActive ? 'text-green-500 font-bold' : 'text-solid-gray-700'}`}
                >
                  {isDragActive ? (
                    'ここにファイルをドロップしてください'
                  ) : (
                    <>
                      または、このエリア内にドラッグ＆ドロップ
                      <br />
                      <span className="text-dns-14N-130">
                        対応形式：TXT/CSV（最大5MB）、
                        {process.env.NEXT_PUBLIC_FILE_MAX_LINE}件まで
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 mx-4 md:mx-20">
            {errorInfo && processStep === ProcessStep.ERROR && (
              <div className="col-span-12 md:col-span-8 md:col-start-3 mt-8">
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
            )}
            {fileContent.length <= 0 && processStep === ProcessStep.DEFAULT && (
              <div className="col-span-12 md:col-span-8 md:col-start-3 mt-8">
                <NotificationBanner
                  type="info1"
                  title="以下の形式のテキストファイルがジオコーディング可能です"
                >
                  <div className="space-y-4">
                    <ul className="list-disc list-inside">
                      <li>文字コード：Shift_JIS または UTF-8</li>
                      <li>改行コード：CR, LF, CR+LF</li>
                      <li>入力ファイルの例：</li>
                    </ul>
                    <div className="border border-solid-gray-900 ml-4 p-2">
                      東京都千代田区紀尾井町1-3
                      <br />
                      東京都千代田区永田町1-6-1
                    </div>
                    <p className="text-solid-gray-700">
                      ジオコーディング結果は以下の形式のCSVです。CSVの各項目の意味については利用者マニュアルをご参照ください。
                    </p>
                    <ul className="list-disc list-inside ml-4">
                      <li>文字コード：UFT-8</li>
                      <li>改行コード：LF</li>
                    </ul>
                  </div>
                </NotificationBanner>
              </div>
            )}
            {fileContent.length > 0 &&
              processStep === ProcessStep.FILE_LOADED && (
                <div className="grid grid-cols-12 gap-4 col-span-12 md:col-span-8 md:col-start-3">
                  <div className="grid col-span-12 mt-10">
                    <div className="col-span-12 text-std-20N-150">
                      ファイルの読み込みが完了しました
                    </div>
                    <div className="col-span-12 border-solid border px-file-items-x border-solid-gray-500 mt-1 break-all">
                      {previewFileContents(fileContent).map((item, idx) => (
                        <div
                          key={idx}
                          className="border-b flex h-file-items-h items-center text-std-16N-170"
                        >
                          <div>
                            <Image
                              src="./file_inactive.svg"
                              alt="file"
                              width="16"
                              height="20"
                              priority
                            />
                          </div>
                          <div className="ml-1">{item}</div>
                        </div>
                      ))}
                      <div className="flex h-file-items-h items-center justify-end">
                        全 {fileContent.length} 件
                      </div>
                    </div>
                  </div>
                  <div className="grid col-span-12 mt-6 justify-items-center">
                    <div className="flex justify-center justify-items-center w-full">
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-button-h w-cancel-button mr-6"
                        onClick={onCancel}
                      >
                        キャンセル
                      </Button>
                      <Button
                        size="lg"
                        className="h-button-h w-geocoding-button"
                        onClick={onGeocoding}
                      >
                        ジオコーディング開始
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            {fileContent.length > 0 && processStep === ProcessStep.GEOCODED && (
              <div className="col-span-12 md:col-span-8 md:col-start-3">
                <div className="flex items-center border-solid border px-file-items-x border-solid-gray-500 rounded-6 mt-10 h-file-description-h">
                  <div>
                    <Image
                      src="./file_inactive.svg"
                      alt="file"
                      width="16"
                      height="20"
                      priority
                    />
                  </div>
                  <div className="text-solid-gray-900 ml-1">
                    {fileInfo?.name?.split('.')[0]}
                    {FILE_NAME_POSTFIX}
                  </div>
                  <div className="flex items-center text-solid-gray-900 ml-auto">
                    <div>
                      <Image
                        src="./download.svg"
                        alt="file"
                        width="16"
                        height="20"
                        priority
                      />
                    </div>
                    <div className="ml-1">{fileContent.length} 件</div>
                  </div>
                  <div className="flex items-center text-solid-gray-900 ml-auto">
                    <div>
                      <Image
                        src="./size.svg"
                        alt="file"
                        width="16"
                        height="20"
                        priority
                      />
                    </div>
                    <div className="ml-1">
                      {formatFileSize(fileInfo?.size || 0)}
                    </div>
                  </div>
                </div>
                <div className="place-self-center text-center mt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="h-button-h min-w-button-min-w w-save-file-button"
                  >
                    ファイルを保存する
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
