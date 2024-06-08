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
  // ファイル内容の状態管理
  const [fileContent, setFileContent] = useState<string[]>([]);
  // ファイルジオコーディング中表示のためのカウンターの状態管理
  const [fileGeocodingCount, setFileGeocodingCount] = useState<number>(0);
  // ファイル選択中の状態管理
  const [isFileLoding, setIsFileLoding] = useState<boolean>(false);
  // ファイル処理ステップの状態管理
  const [processStep, setProcessStep] = useState<ProcessStep>(
    ProcessStep.DEFAULT
  );
  // ファイルサイズの状態管理
  const [fileInfo, setFileInfo] = useState<File | undefined>(undefined);
  // ジオコーディング処理中の状態管理
  const [isGeocodingLoding, setIsGeocodingLoding] = useState<boolean>(false);
  // ジオコーディング結果の状態管理
  const [fileGeocodingResult, setFileGeocodingResult] = useState<string[]>([]);

  // エラー情報の状態管理
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);

  // ファイル入力部品のHTML
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileNamePostFix = '_GeocodingResults.csv';

  /**
   * ファイルを選択および、ドラッグ＆ドロップしたとき
   *
   * @files ファイルリスト（原則1件のみ想定)
   */
  const handleSelectedFiles = useCallback(async (files: File[]) => {
    setIsFileLoding(true);

    try {
      if (files.length === 0) {
        throw new Error('ファイルを選択してください');
      }
      if (files.length > 1) {
        throw new Error('複数ファイルはアップロードできません');
      }

      const file = files[0];
      setFileInfo(file);

      const fileContents = await readFileContents(file);

      if (fileContents.length > Number(process.env.NEXT_PUBLIC_FILE_MAX_LINE)) {
        throw new Error(
          `アップロードされたリストが${process.env.NEXT_PUBLIC_FILE_MAX_LINE}件を超えています`
        );
      }

      setFileContent(fileContents);
      setProcessStep(ProcessStep.FILE_LOADED);
    } catch (error) {
      handleError('ファイルの読み込みでエラーが発生しました', error as Error);
      setProcessStep(ProcessStep.ERROR);
    } finally {
      setIsFileLoding(false);
    }
  }, []);

  /**
   * ファイル読み込み処理
   * @param file 選択されたファイル
   * @returns ファイル内容を返却
   */
  const readFileContents = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        // ファイル内の文字列
        const codes = new Uint8Array(event.target?.result as ArrayBuffer);
        // 文字コード判定
        const detectedEncoding = Encoding.detect(codes);
        const utf8String = Encoding.convert(codes, {
          // encoding.js では JavaScript内部で扱いたいときは UTF8 ではなくUNICODEを指定する模様(https://github.com/polygonplanet/encoding.js/blob/master/README_ja.md#unicode-%E3%81%AB%E3%81%A4%E3%81%84%E3%81%A6)
          to: 'UNICODE',
          // 文字コード判定できない場合falseが返るので、そのときは「AUTO」(自動判定)にする
          from: detectedEncoding || 'AUTO',
          type: 'string',
        });

        // 行区切りで配列にして格納する(入力時は改行コード3種対応するため以下のようにsplit)
        const fileContents = utf8String
          .split(/\r\n|\n|\r/)
          .filter(v => v !== '');
        resolve(fileContents);
      };

      reader.onerror = () => {
        reject(new Error('ファイルの読み込みでエラーが発生しました'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * エラー処理
   * @param error エラー内容
   */
  const handleError = (title: string, error: Error, isApiError = false) => {
    setErrorInfo({
      title: title,
      message: error.message,
      isApiError,
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleSelectedFiles, // ファイル選択、ドロップ時の処理
  });

  /**
   * ジオコーディングボタン押下時の処理
   * @param event ジオコーディングボタン押下イベント
   */
  const onGeocoding = async (event: any) => {
    setIsGeocodingLoding(true);
    event.preventDefault();
    const geocodingResultList = [];
    try {
      for (let i = 0; i < fileContent.length; i++) {
        const address = fileContent[i];
        // 空行は無視
        if (address === '') {
          continue;
        }
        // csvで取得
        const response = await fetchGeocodeData(address, 'csv');
        if (!response.ok) {
          const statusCode = response.status;
          const errorMessage = await response.json();
          throw new Error(
            `エラーコード: ${statusCode}, エラー内容: ${errorMessage?.message}`
          );
        }
        // csv文字列なのでtext()
        const text = await response.text();
        const responseData = text.split('\n');
        if (i === 0) {
          geocodingResultList.push(responseData[0]);
        }
        geocodingResultList.push(responseData[1]);
        // 進捗表示用のカウンターセット
        setFileGeocodingCount(prevCount => prevCount + 1);
      }

      // 結果セット
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
      setIsGeocodingLoding(false);
      // 処理終わったらカウンターリセット
      setFileGeocodingCount(0);
    }
  };

  /**
   * ジオコーディング結果保存ボタン押下
   */
  const onSubmit = async () => {
    // 1行ずつのジオコーディングレスポンスをまとめたものをCSV作成->ダウンロードする
    downloadCSV(fileGeocodingResult);
  };

  /**
   * CSVダウンロード処理
   * @param data ジオコーディング結果の文字列リスト(既にcsv文字列リストになっている想定)
   */
  const downloadCSV = (data: string[]) => {
    //Excelで開く際文字化けしてしまうので、UTF-8 BOMを付与
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    //BlobからオブジェクトURLを作成(出力時は改行コードLFに統一する)
    const blob = new Blob([bom, data.join('\n')], { type: 'text/csv' });
    //リンク先にダウンロード用リンクを指定する
    const link = document.createElement('a');
    link.download = `${fileInfo?.name?.split('.')[0]}${fileNamePostFix}`;
    link.href = URL.createObjectURL(blob);
    link.click();
    // 不要になったURLを解放
    URL.revokeObjectURL(link.href);
  };

  /**
   * ファイル内容の頭数行をプレビュー表示する
   * @param fileContent 入力ファイル内の住所がそれぞれ入っているリスト
   */
  const previewFileContents = (fileContent: string[]): string[] => {
    const result = fileContent.slice(0, FILE_PREVIEW_MAX_LINE);
    // 最大行数超えたら省略
    if (fileContent.length > FILE_PREVIEW_MAX_LINE) {
      result.push('...');
    }
    return result;
  };

  /**
   * キャンセルボタン押下
   */
  const onCancel = () => {
    // 選択ファイル、ジオコーディングカウント、ステップ全部初期化
    setFileContent([]);
    setFileGeocodingCount(0);
    setProcessStep(ProcessStep.DEFAULT);
  };

  /**
   * バイトをGBまでの表記に変換する
   * @param bytes バイト単位のファイルサイズ
   * @returns 適宜変換されたファイルサイズ + 単位の文字列
   */
  const formatFileSize = (bytes: number): string => {
    const kb = 1024;
    const mb = kb * 1024;
    const gb = mb * 1024;

    if (bytes < kb) {
      return bytes + ' B';
    } else if (bytes < mb) {
      return (bytes / kb).toFixed(2) + ' KB';
    } else if (bytes < gb) {
      return (bytes / mb).toFixed(2) + ' MB';
    } else {
      return (bytes / gb).toFixed(2) + ' GB';
    }
  };

  return (
    <>
      {isFileLoding && <Loading text={'ファイル読み込み中...'} />}
      {isGeocodingLoding && (
        <Loading
          text={`ジオコーディング中... ${fileGeocodingCount} 件 / ${fileContent.length} 件中`}
        />
      )}
      {/* 入力フォーム */}
      <div className="grid gap-4 grid-cols-12">
        <form onSubmit={onSubmit} className="col-span-12">
          <div className="bg-main-50 h-file-input-h">
            {/* ファイル選択領域 */}
            <div className="grid grid-cols-12 gap-4 pt-10 contents-grid-margin-x justify-center items-center ">
              <div
                className={`grid grid-cols-12 contents-grid-span-start place-items-center 
                            border-dashed border min-h-file-description-h border-main-800 rounded-lg
                            ${isDragActive ? 'bg-grey-200 bg-opacity-40' : 'bg-grey-200 bg-opacity-20'}`}
                {...getRootProps()}
              >
                <div className="col-span-12 h-full pt-file-select-pt pb-file-select-pb">
                  <button
                    onClick={(
                      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
                    ) => {
                      e.preventDefault();
                      // オリジナルのファイル選択にしているので、ここでhiddenにしてあるinputのclick eventを発火
                      fileInputRef?.current?.click();
                    }}
                    className="rounded-button bg-main-800 hover:bg-main-900 text-button text-white h-button-h w-selected-file p-spacing-unit-1"
                  >
                    ファイルを選ぶ
                  </button>
                  {/* オリジナルのファイル選択のため以下はhiddenで隠しておく */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="file"
                    onClick={e => {
                      // ファイル読み込み->キャンセル->同じファイル読み込みでもchange eventを発火させるためvalueを初期化
                      (e.target as HTMLButtonElement).value = '';
                    }}
                    hidden
                    {...getInputProps()}
                    data-testid="file-input"
                  />
                </div>
                <div className="col-span-12 items-center text-center text-sumi-700 text-text-l h-full pb-6">
                  ここにファイルをドラッグ＆ドロップしてください。
                  <br />
                  １回のジオコーディングでは
                  {process.env.NEXT_PUBLIC_FILE_MAX_LINE}件が上限です。
                </div>
              </div>
            </div>
          </div>
          {/* 以下表示について、ワークフロー毎の段階があるのでstepの状態管理で表示を制御する */}
          <div className="grid grid-cols-12 gap-4 contents-grid-margin-x">
            {/* エラー表示領域 */}
            {errorInfo && processStep === ProcessStep.ERROR && (
              <div className="contents-grid-span-start">
                <ErrorBox
                  title={errorInfo.title}
                  message={errorInfo.message}
                  isApiError={errorInfo.isApiError}
                />
              </div>
            )}
            {/* 説明領域 */}
            {fileContent.length <= 0 && processStep === ProcessStep.DEFAULT && (
              <>
                {/* 説明 */}
                <div
                  className="contents-grid-span-start
                  border-solid border-description-box p-spacing-unit-3 border-main-800 mt-8 rounded-xl"
                >
                  <div className="box-heading">
                    <div className="min-w-[32px]">
                      <Image
                        src="./info.svg"
                        alt="info"
                        width="32"
                        height="32"
                        priority
                      />
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
              </>
            )}
            {/* ファイル選択時後のファイルプレビューの表示領域 */}
            {fileContent.length > 0 &&
              processStep === ProcessStep.FILE_LOADED && (
                <div className="grid grid-cols-12 gap-4 contents-grid-span-start">
                  <div className="grid col-span-12 mt-10">
                    <div className="col-span-12 text-heading-xxs">
                      ファイルの読み込みが完了しました
                    </div>
                    <div className="col-span-12 border-solid border px-file-items-x border-sumi-500 mt-1 break-all">
                      {previewFileContents(fileContent).map((item, idx) => (
                        <div
                          key={idx}
                          className="border-b flex h-file-items-h items-center text-text-l"
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
                      <button
                        className="border border-main-800 rounded-button text-main-800
                        hover:text-main-900 hover:border-main-900 h-button-h w-cancel-button mr-6"
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
            {/* ジオコーディング結果のファイル名出力領域 */}
            {fileContent.length > 0 && processStep === ProcessStep.GEOCODED && (
              <div className="contents-grid-span-start">
                <div className="flex items-center border-solid border px-file-items-x border-sumi-500 rounded-md mt-10 h-file-description-h">
                  <div>
                    <Image
                      src="./file_inactive.svg"
                      alt="file"
                      width="16"
                      height="20"
                      priority
                    />
                  </div>
                  <div className="text-sumi-900 ml-1">
                    {fileInfo?.name?.split('.')[0]}
                    {fileNamePostFix}
                  </div>
                  {/* 件数とサイズ */}
                  <div className="flex items-center  text-sumi-900 ml-auto">
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
                  <div className="flex items-center text-sumi-900 ml-auto">
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
                  <button
                    className="rounded-button bg-main-800 hover:bg-main-900 text-white h-button-h min-w-button-min-w w-save-file-button"
                    type="submit"
                  >
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
