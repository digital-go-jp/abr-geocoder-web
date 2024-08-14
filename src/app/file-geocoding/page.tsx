'use client';

import Encoding from 'encoding-japanese';
import React, { useCallback, useRef, useState } from 'react';
import { FILE_PREVIEW_MAX_LINE } from '../_lib/constants';
import Loading from '../_components/loading';
import Image from 'next/image';
import { ErrorInfo } from '../_lib/types';
import { useDropzone } from 'react-dropzone';
import ErrorBox from '../_components/error-box';
import { fetchGeocodeData } from '../_lib/api';
import { ProcessStep } from '../_lib/enums';

const FileGeocoding = () => {
  const [fileContent, setFileContent] = useState<string[]>([]);
  const [fileGeocodingCount, setFileGeocodingCount] = useState<number>(0);
  const [isFileLoading, setIsFileLoading] = useState<boolean>(false);
  const [processStep, setProcessStep] = useState<ProcessStep>(ProcessStep.DEFAULT);
  const [fileInfo, setFileInfo] = useState<File | undefined>(undefined);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState<boolean>(false);
  const [fileGeocodingResult, setFileGeocodingResult] = useState<string[]>([]);
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileNamePostFix = '_GeocodingResults.csv';

  const handleSelectedFiles = useCallback(async (files: File[]) => {
    setIsFileLoading(true);
    try {
      if (files.length === 0) throw new Error('ファイルを選択してください');
      if (files.length > 1) throw new Error('複数ファイルはアップロードできません');
      const file = files[0];
      setFileInfo(file);
      const fileContents = await readFileContents(file);
      if (fileContents.length > Number(process.env.NEXT_PUBLIC_FILE_MAX_LINE)) {
        throw new Error(`アップロードされたリストが${process.env.NEXT_PUBLIC_FILE_MAX_LINE}件を超えています`);
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
        const utf8String = Encoding.convert(codes, { to: 'UNICODE', from: detectedEncoding || 'AUTO', type: 'string' });
        const fileContents = utf8String.split(/\r\n|\n|\r/).filter(v => v !== '');
        resolve(fileContents);
      };
      reader.onerror = () => reject(new Error('ファイルの読み込みでエラーが発生しました'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleError = (title: string, error: Error, isApiError = false) => {
    setErrorInfo({ title, message: error.message, isApiError });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleSelectedFiles,
  });

  const onGeocoding = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsGeocodingLoading(true);
    const geocodingResultList: string[] = [];
    try {
      for (const address of fileContent) {
        if (address === '') continue;
        const response = await fetchGeocodeData(address, 'csv', 'all');
        if (!response.ok) {
          const errorMessage = await response.json();
          throw new Error(`エラーコード: ${response.status}, エラー内容: ${errorMessage?.message}`);
        }
        const text = await response.text();
        const responseData = text.split('\n');
        if (geocodingResultList.length === 0) geocodingResultList.push(responseData[0]);
        geocodingResultList.push(responseData[1]);
        setFileGeocodingCount(prevCount => prevCount + 1);
      }
      setFileGeocodingResult(geocodingResultList);
      setProcessStep(ProcessStep.GEOCODED);
    } catch (error) {
      handleError('ジオコーディングでエラーが発生しました', error as Error, true);
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
    link.download = `${fileInfo?.name?.split('.')[0]}${fileNamePostFix}`;
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

  const formatFileSize = (bytes: number): string => {
    const kb = 1024;
    const mb = kb * 1024;
    const gb = mb * 1024;
    if (bytes < kb) return `${bytes} B`;
    if (bytes < mb) return `${(bytes / kb).toFixed(2)} KB`;
    if (bytes < gb) return `${(bytes / mb).toFixed(2)} MB`;
    return `${(bytes / gb).toFixed(2)} GB`;
  };

  return (
    <>
      {isFileLoading && <Loading text={'ファイル読み込み中...'} />}
      {isGeocodingLoading && (
        <Loading text={`ジオコーディング中... ${fileGeocodingCount} 件 / ${fileContent.length} 件中`} />
      )}
      <div className="grid gap-4 grid-cols-12">
        <form onSubmit={onSubmit} className="col-span-12">
          <div className="bg-main-50 h-file-input-h">
            <div className="grid grid-cols-12 gap-4 pt-10 contents-grid-margin-x justify-center items-center ">
              <div
                className={`grid grid-cols-12 contents-grid-span-start place-items-center
                            border-dashed border min-h-file-description-h border-main-800 rounded-lg
                            ${isDragActive ? 'bg-grey-200 bg-opacity-40' : 'bg-grey-200 bg-opacity-20'}`}
                {...getRootProps()}
              >
                <div className="col-span-12 h-full pt-file-select-pt pb-file-select-pb">
                  <button
                    onClick={e => {
                      e.preventDefault();
                      fileInputRef?.current?.click();
                    }}
                    className="rounded-button bg-main-800 hover:bg-main-900 text-button text-white h-button-h w-selected-file p-spacing-unit-1"
                  >
                    ファイルを選ぶ
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    onClick={e => (e.target as HTMLButtonElement).value = ''}
                    hidden
                    {...getInputProps()}
                    data-testid="file-input"
                  />
                </div>
                <div className="col-span-12 items-center text-center text-sumi-700 text-text-l h-full pb-6">
                  ここにファイルをドラッグ＆ドロップしてください。
                  <br />
                  １回のジオコーディングでは {process.env.NEXT_PUBLIC_FILE_MAX_LINE} 件が上限です。
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4 contents-grid-margin-x">
            {errorInfo && processStep === ProcessStep.ERROR && (
              <div className="contents-grid-span-start">
                <ErrorBox title={errorInfo.title} message={errorInfo.message} isApiError={errorInfo.isApiError} />
              </div>
            )}
            {fileContent.length <= 0 && processStep === ProcessStep.DEFAULT && (
              <div className="contents-grid-span-start border-solid border-description-box p-spacing-unit-3 border-main-800 mt-8 rounded-xl">
                <div className="box-heading">
                  <div className="min-w-[32px]">
                    <Image src="./info.svg" alt="info" width="32" height="32" priority />
                  </div>
                  <div className="pl-6 text-sumi-900 text-heading-xxs-bold">
                    以下の形式のテキストファイルがジオコーディング可能です
                  </div>
                </div>
                <div className="pl-14">
                  <div className="text-sumi-900 text-text-m mb-6">
                    <ul className="list-disc list-inside">
                      <li>文字コード：Shift_JIS または UTF-8</li>
                      <li>改行コード：CR, LF, CR+LF</li>
                      <li>入力ファイルの例：</li>
                      <div className="border border-sumi-900 mt-2 ml-4 p-2">
                        東京都千代田区紀尾井町1-3
                        <br />
                        東京都千代田区永田町1-6-1
                      </div>
                    </ul>
                  </div>
                  <div className="text-sumi-700 text-text-m">
                    ジオコーディング結果は以下の形式のCSVです。CSVの各項目の意味については利用者マニュアルをご参照ください。
                  </div>
                  <div className="text-sumi-900 text-text-m ml-4">
                    <ul className="list-disc list-inside">
                      <li>文字コード：UFT-8</li>
                      <li>改行コード：LF</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {fileContent.length > 0 && processStep === ProcessStep.FILE_LOADED && (
              <div className="grid grid-cols-12 gap-4 contents-grid-span-start">
                <div className="grid col-span-12 mt-10">
                  <div className="col-span-12 text-heading-xxs">ファイルの読み込みが完了しました</div>
                  <div className="col-span-12 border-solid border px-file-items-x border-sumi-500 mt-1 break-all">
                    {previewFileContents(fileContent).map((item, idx) => (
                      <div key={idx} className="border-b flex h-file-items-h items-center text-text-l">
                        <div>
                          <Image src="./file_inactive.svg" alt="file" width="16" height="20" priority />
                        </div>
                        <div className="ml-1">{item}</div>
                      </div>
                    ))}
                    <div className="flex h-file-items-h items-center justify-end">全 {fileContent.length} 件</div>
                  </div>
                </div>
                <div className="grid col-span-12 mt-6 justify-items-center">
                  <div className="flex justify-center justify-items-center w-full">
                    <button
                      className="border border-main-800 rounded-button text-main-800 hover:text-main-900 hover:border-main-900 h-button-h w-cancel-button mr-6"
                      onClick={onCancel}
                    >
                      キャンセル
                    </button>
                    <button
                      className="rounded-button bg-main-800 hover:bg-main-900 text-white h-button-h w-geocoding-button"
                      onClick={onGeocoding}
                    >
                      ジオコーディング開始
                    </button>
                  </div>
                </div>
              </div>
            )}
            {fileContent.length > 0 && processStep === ProcessStep.GEOCODED && (
              <div className="contents-grid-span-start">
                <div className="flex items-center border-solid border px-file-items-x border-sumi-500 rounded-md mt-10 h-file-description-h">
                  <div>
                    <Image src="./file_inactive.svg" alt="file" width="16" height="20" priority />
                  </div>
                  <div className="text-sumi-900 ml-1">{fileInfo?.name?.split('.')[0]}{fileNamePostFix}</div>
                  <div className="flex items-center text-sumi-900 ml-auto">
                    <div>
                      <Image src="./download.svg" alt="file" width="16" height="20" priority />
                    </div>
                    <div className="ml-1">{fileContent.length} 件</div>
                  </div>
                  <div className="flex items-center text-sumi-900 ml-auto">
                    <div>
                      <Image src="./size.svg" alt="file" width="16" height="20" priority />
                    </div>
                    <div className="ml-1">{formatFileSize(fileInfo?.size || 0)}</div>
                  </div>
                </div>
                <div className="place-self-center text-center mt-6">
                  <button className="rounded-button bg-main-800 hover:bg-main-900 text-white h-button-h min-w-button-min-w w-save-file-button" type="submit">
                    ファイルを保存する
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default FileGeocoding;
