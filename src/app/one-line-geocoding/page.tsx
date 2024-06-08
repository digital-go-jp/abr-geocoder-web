'use client';

import React, { Fragment, useState } from 'react';
import { ApiResponseAsJson, ErrorInfo, GeocodingResult } from '../_lib/types';
import Loading from '../_components/loading';
import { OUTPUT_FORMAT } from '../_lib/constants';
import { SubmitHandler, useForm } from 'react-hook-form';
import Image from 'next/image';
import ErrorBox from '../_components/error-box';
import { fetchGeocodeData } from '../_lib/api';
import { Roboto_Mono } from 'next/font/google';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { monokaiSublime } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const RobotoMonoFont = Roboto_Mono({ weight: '400', subsets: ['latin'] });

type FormValues = {
  address: string;
  target: string;
  format: string;
};

const OneLineGeocoding = () => {
  // 一行入力のジオコーディング結果の状態管理
  // テーブルの場合
  const [geocodingResultTable, setGeocodingResultTable] =
    useState<GeocodingResult>();
  // テーブル以外の場合
  const [geocodingResultOthers, setGeocodingResultOthers] =
    useState<string>('');
  // ジオコーディング処理中の状態管理
  const [isLoding, setIsLoding] = useState<boolean>(false);
  // ジオコーディング結果をコピーしたかどうかの状態管理
  const [isCopied, setIsCopied] = useState<boolean>(false);
  // エラー情報の状態管理
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    getValues,
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: {
      address: '',
      target: '',
      format: '',
    },
  });

  /**
   * ジオコーディングボタン押下時の処理
   * @param event ジオコーディングボタン押下イベント
   */
  const onSubmit: SubmitHandler<FormValues> = async data => {
    setIsLoding(true);
    // ジオコーディング結果にてエラーが出た場合、ジオコーディング毎にそのエラー表示を消したいので初期化
    setErrorInfo(undefined);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    const { address, target, format, outputFormat } = processFormData(formData);
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
      setGeocodingResultTable(undefined);
    } finally {
      setIsLoding(false);
    }
  };

  /**
   * フォームの値から必要な形に整える
   *
   * @param formData 入力フォームの各値
   * @returns 整形したフォームデータ
   */
  const processFormData = (
    formData: FormData
  ): {
    address: string;
    target: string;
    format: string;
    outputFormat: string;
  } => {
    const address = formData.get('address') as string;
    const target = formData.get('target') as string;
    const format = formData.get('format') as string;
    // テーブルの場合API/CLIの仕様としての形式はないのでとりあえずjsonでとって加工する
    const outputFormat =
      format === OUTPUT_FORMAT.TABLE ? OUTPUT_FORMAT.JSON : format;
    return { address, target, format, outputFormat };
  };

  /**
   * APIレスポンスをジオコーディング結果表示用配列に変換
   * @param geocodingResult ジオコーディング結果
   * @returns ジオコーディング結果表示用配列を返却
   */
  const parseApitToDto = (
    geocodingResult: ApiResponseAsJson[]
  ): GeocodingResult => {
    const parseResult = geocodingResult[0].result;
    return {
      input: geocodingResult[0].query?.input,
      output: parseResult?.output,
      matching_level: parseResult?.matching_level,
      lg_code: parseResult?.lg_code,
      pref: parseResult?.pref,
      city: parseResult?.city,
      machiaza: parseResult?.machiaza,
      machiaza_id: parseResult?.machiaza_id,
      blk_num: parseResult?.blk_num,
      blk_id: parseResult?.blk_id,
      rsdt_num: parseResult?.rsdt_num,
      rsdt_id: parseResult?.rsdt_id,
      rsdt_num2: parseResult?.rsdt_num2,
      rsdt2_id: parseResult?.rsdt2_id,
      prc_num1: parseResult?.prc_num1,
      prc_num2: parseResult?.prc_num2,
      prc_num3: parseResult?.prc_num3,
      prc_id: parseResult?.prc_id,
      other: parseResult?.other,
      lat: parseResult?.lat,
      lon: parseResult?.lon,
    };
  };

  /**
   * エラー処理
   * @param error エラー情報
   */
  const handleError = (error: Error, isApiError = false) => {
    setErrorInfo({
      title: 'ジオコーディングに失敗しました',
      message: error.message,
      isApiError,
    });
  };

  /**
   * クリップボードにコピーする
   * @param text コピーテキスト
   */
  const copyToClipboard = async (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  /**
   * ジオコーディング結果をフォーマットする
   * 以下要件に基づいて処理
   *
   * CSV:ヘッダ1行、内容1行の都合2行で表示
   * NDJSON, NDGeoJSON：1行で表示
   * NDJSON, NDGeoJSON以外のJSON形式：改行やインデントなど整形して表示
   * @param response
   * @param format
   */
  const createResult = async (response: Response, format: string) => {
    let resultText: string | undefined;
    let resultTable: GeocodingResult | undefined;

    if (format === OUTPUT_FORMAT.CSV) {
      // CSVはtextとして取り出しす
      resultText = await response.text();
    } else {
      // CSV以外はすべてJSONなのでJSONとして取り出す
      const json = await response.json();
      if (format === OUTPUT_FORMAT.TABLE) {
        resultTable = parseApitToDto(json as ApiResponseAsJson[]);
      } else {
        resultText =
          format === OUTPUT_FORMAT.ND_JSON ||
          format === OUTPUT_FORMAT.ND_GEO_JSON
            ? JSON.stringify(json)
            : JSON.stringify(json, null, 2);
      }
    }
    // 結果の設定
    setGeocodingResultOthers(resultText || '');
    setGeocodingResultTable(resultTable);
  };

  return (
    <>
      {isLoding && <Loading text={'ジオコーディング中...'} />}
      {/* 入力フォーム */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className=" bg-main-50">
          <div className="grid gap-4 grid-cols-12 contents-grid-margin-x pt-input-mt pb-input-mb">
            <div className="contents-grid-span-start mb-2">
              <div className="grid grid-cols-1">
                <label htmlFor="address" className="mb-2 text-text-m">
                  住所を入力してください
                </label>
                <input
                  {...register('address', {
                    required: '1文字以上入力してください',
                  })}
                  type="text"
                  // 「autofill:」について：文字入力自動補完時(autocomplete)に入力欄の背景色が水色に変わって、全体の背景と同化してしまうのでbox-shadowで内側に白色の影をつける
                  // 参考：https://github.com/tailwindlabs/tailwindcss/discussions/8679#discussioncomment-4741637
                  className="min-w min-h-oneline-input-min-h border-black rounded-lg border-solid border p-2 autofill:shadow-[inset_0_0_0px_999px_#fff]"
                  placeholder="例）東京都千代田区紀尾井町1-3"
                  name="address"
                  id="address"
                  data-testid="input-address"
                />
                {/* エラー表示領域 */}
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
                  <span className="text-error-800 text-text-m">必須</span>
                </div>
                <div className="flex text-text-l">
                  <div className="flex items-center">
                    <input
                      {...register('target')}
                      defaultChecked
                      id="search_address"
                      name="target"
                      type="radio"
                      value="all"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="search_address"
                      className=" text-gray-900 mr-8 pl-2 cursor-pointer"
                    >
                      住所を検索
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      {...register('target')}
                      id="search_address_2"
                      name="target"
                      type="radio"
                      value="parcel"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="search_address_2"
                      className=" text-gray-900 pl-2 cursor-pointer"
                    >
                      地番を検索
                    </label>
                  </div>
                </div>
              </fieldset>
              <fieldset>
                <div className="flex">
                  <legend className="text-text-m font-semibold leading-6 mr-2">
                    出力形式
                  </legend>
                  <span className="text-error-800 text-text-m">必須</span>
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
                      id="ndjson"
                      name="format"
                      type="radio"
                      value="ndjson"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="ndjson"
                      className="text-gray-900 mr-6 pl-2 cursor-pointer"
                    >
                      NDJSON
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
                  <div className="flex items-center py-2">
                    <input
                      {...register('format')}
                      id="ndgeojson"
                      name="format"
                      type="radio"
                      value="ndgeojson"
                      className="h-4 w-4 accent-main-900"
                    />
                    <label
                      htmlFor="ndgeojson"
                      className="text-gray-900 pl-2 cursor-pointer"
                    >
                      NDGeoJSON
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            <div className="col-span-12 text-center">
              {/* 初期値から変更がありバリデーションエラーがない場合にボタン押下可能 */}
              <button
                className={`rounded-button text-white h-button-h min-w-button-min-w text-button
                ${!isDirty || !isValid ? 'bg-sumi-500 text-opacity-60 ' : 'bg-main-800 text-opacity-100 hover:bg-main-900'}`}
                type="submit"
                disabled={!isDirty || !isValid}
              >
                {/* testが壊れてしまうので修正する時間ないのでspan残し */}
                <span>ジオコーディング開始</span>
              </button>
            </div>
          </div>
        </div>
      </form>
      {/* エラー表示 */}
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
      {/* 処理完了で結果がある場合ジオコーディング結果内容表示 */}
      {!isLoding && (geocodingResultTable || geocodingResultOthers) && (
        <>
          <div className="grid gap-4 grid-cols-12 contents-grid-margin-x mt-10 mb-4">
            <div className="contents-grid-span-start text-heading-xxs">
              ジオコーディング結果
            </div>
          </div>
          {/* 結果ヘッダ */}
          <div
            className={`grid gap-4 grid-cols-12 contents-grid-margin-x h-11 ${RobotoMonoFont.className}`}
          >
            <div className="contents-grid-span-start">
              <div className="flex h-full items-center bg-sumi-700 px-6 text-white text-text-l justify-between">
                <span>
                  {/* label中の文字列を簡単に取得できないので getValues してから文字列セット */}
                  {(() => {
                    switch (getValues('format')) {
                      case OUTPUT_FORMAT.TABLE:
                        return 'Table';
                      case OUTPUT_FORMAT.CSV:
                        return 'CSV';
                      case OUTPUT_FORMAT.JSON:
                        return 'JSON';
                      case OUTPUT_FORMAT.GEO_JSON:
                        return 'GeoJSON';
                      case OUTPUT_FORMAT.ND_JSON:
                        return 'NDJSON';
                      case OUTPUT_FORMAT.ND_GEO_JSON:
                        return 'NDGeoJSON';
                      default:
                        return '';
                    }
                  })()}
                </span>
                <span>
                  <button
                    className=""
                    onClick={() => {
                      let copyText = '';
                      if (geocodingResultTable) {
                        Object.keys(geocodingResultTable).map(key => {
                          // テーブル（表）の形を維持するためにタブ区切りで詰める
                          copyText += `${key}\t${geocodingResultTable[key as keyof GeocodingResult]}\n`;
                        });
                      } else if (geocodingResultOthers) {
                        copyText = geocodingResultOthers;
                      }
                      copyToClipboard(copyText);
                    }}
                  >
                    {/* 初回画像読み込み時間のちらつきがあるので、isCopiedでImage分けるのではなくdisplay: noneで制御 */}
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
          {/* 結果中身 */}
          <div className="grid gap-4 grid-cols-12 contents-grid-margin-x mb-6">
            {/* テーブルだけ2列（grid-colsが指定されているとCSVなど右余白効かない問題の対応も兼ねて） */}
            <div
              className={`contents-grid-span-start
              grid gap-2 overflow-x-auto pb-6 pt-5
              bg-sumi-900 text-white
              ${RobotoMonoFont.className}
              ${geocodingResultTable && !geocodingResultOthers ? 'grid-cols-2' : ''}
              `}
            >
              {/* ジオコーディング結果の中身 */}
              {geocodingResultOthers && !geocodingResultTable && (
                <div
                  className="col-span-2 text-left whitespace-pre px-6"
                  data-testid="geocoding-result-other"
                >
                  {/* CSV以外（json）の場合シンタックスハイライトする */}
                  {getValues('format') === 'csv' ? (
                    <>{geocodingResultOthers}</>
                  ) : (
                    <SyntaxHighlighter
                      language="json"
                      style={monokaiSublime}
                      className="!bg-sumi-900"
                    >
                      {geocodingResultOthers}
                    </SyntaxHighlighter>
                  )}
                </div>
              )}
              {geocodingResultTable && !geocodingResultOthers && (
                <>
                  {Object.keys(geocodingResultTable as GeocodingResult).map(
                    (key, index) => (
                      <Fragment key={index}>
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
                          {/* nullをそのまま表示するためにString()利用 */}
                          {String(
                            geocodingResultTable[key as keyof GeocodingResult]
                          )}
                        </div>
                      </Fragment>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OneLineGeocoding;
