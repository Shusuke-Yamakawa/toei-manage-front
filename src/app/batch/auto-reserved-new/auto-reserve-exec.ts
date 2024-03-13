/* eslint-disable no-param-reassign */
import dayjs from 'dayjs';
import { Page } from 'puppeteer';
import { createGetCourt, findGetCourtByDate } from '@/src/app/_lib/db/getCourt';
import { zeroPad } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { logout, loginNew } from '@/src/app/_utils/loginNew';
import { searchOpenCourt } from '@/src/app/batch/auto-reserved-new/auto-reserve-search';
import {
  USER_ID,
  PASSWD,
  RETRY_USER_ID,
  RETRY_PASSWD,
  DESIRED_RESERVATION_DATE_LIST,
} from '@/src/app/batch/auto-reserved-new/auto-reserve.const';
import { getTimeZone, GET_LIMIT_DAY } from '@/src/app/batch/auto-reserved-new/auto-reserve.util';
import { Court } from '@/src/app/batch/auto-reserved-new/auto-reserve.type';

const submitApplication = async (page: Page) => {
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    page.click('#apply'), // 予約申し込み
  ]);
  // reCAPTCHAがあるかどうかをチェック
  const isRecaptchaVisible = await page.evaluate(
    () =>
      // ここにreCAPTCHAのチェックを行うコードを追加
      // 例えば、reCAPTCHAのiframeが存在するかどうかを確認
      document.querySelector('iframe[src*="recaptcha"]') !== null
  );

  if (isRecaptchaVisible) {
    console.log('solveRecaptchasが火をふくぞ');
    // reCAPTCHAを解決
    await page.solveRecaptchas();
    console.log('solveRecaptchasがやった');

    // 再度submitApplicationを呼び出す（必要な処理に応じて）
    await submitApplication(page); // 再帰的に呼び出し、必要に応じてループの条件を調整してください
  }
};

const reserveCourt = async (
  page: Page,
  msg: string,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  getDay: number,
  emptyCourt: Court,
  userId: string
) => {
  console.log('空きコート:予約前 ', emptyCourt.name);
  const yearStr = String(year);
  const monthStr = zeroPad(month);
  const dayStr = zeroPad(getDay);
  const timeZone = getTimeZone(fromTime);
  const xpath = `//*[@id='${yearStr}${monthStr}${dayStr}_${timeZone}']/div/img`;
  await page.waitForXPath(xpath);
  const elements = (await page.$x(xpath)) as any;
  await elements[0].click();
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    page.click('#btn-go'),
  ]);
  try {
    await submitApplication(page);
    const applyConf = await page.$$('#apply'); // 予約ができているかの確認
    if (applyConf.length > 0) {
      const retryTarget =
        emptyCourt.name === '井の頭恩賜公園' ||
        emptyCourt.name === '野川公園' ||
        emptyCourt.name === '武蔵野中央公園';
      // 無限ループにならないようにする
      if (retryTarget && msg.indexOf('重複してるのでリトライ') === -1) {
        msg += '\n重複してるのでリトライ';
        await logout(page);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        msg = await reserveCourtController(
          page,
          msg,
          fromTime,
          toTime,
          year,
          month,
          getDay,
          emptyCourt,
          true
        );
      }
      return msg;
    }
    msg += `\n${emptyCourt.name}を予約`;
    // DBに登録する
    // TODO 予約者番号も入るようにする
    await createGetCourt({
      card_id: userId,
      year,
      month,
      day: getDay,
      from_time: Number(fromTime),
      to_time: Number(toTime),
      court: emptyCourt.name,
      reserve_no: '',
    });
    return msg;
  } catch (error) {
    console.log('予約失敗error: ', error);
    msg += '\n予約取れず';
    return msg;
  }
};

const reserveCourtController = async (
  page: Page,
  msg: string,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  getDay: number,
  emptyCourt: Court,
  retry: boolean
) => {
  console.log('reserve動きます！');
  let userId = USER_ID;
  let password = PASSWD;
  if (retry) {
    userId = RETRY_USER_ID;
    password = RETRY_PASSWD;
  }
  await loginNew(page, userId, password);
  const isOpenCourt = await searchOpenCourt(page, fromTime, year, month, getDay, emptyCourt.value);
  console.log('isOpenCourt: ', isOpenCourt);
  if (!isOpenCourt) return msg;
  msg = await reserveCourt(page, msg, fromTime, toTime, year, month, getDay, emptyCourt, userId);
  return msg;
};

/**
 * testのためにexport
 * @package
 */
export const shouldReserve = async (
  year: number,
  month: number,
  getDay: number,
  fromTime: string
) => {
  const targetDay = dayjs(`${year}-${month}-${getDay}`);
  const targetDayGetCourtCount = await findGetCourtByDate(year, month, getDay);
  console.log('targetDayGetCourtCount: ', targetDayGetCourtCount);

  const result =
    DESIRED_RESERVATION_DATE_LIST.includes(getDay) ||
    targetDayGetCourtCount === 0 ||
    fromTime === '9';

  return targetDay.isAfter(GET_LIMIT_DAY()) && result;
};

/**
 * @package
 */
export const checkAndReserveAvailableCourt = async (
  page: Page,
  msg: string,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  getDay: number,
  emptyCourt: Court,
  retry: boolean
) => {
  if (await shouldReserve(year, month, getDay, fromTime)) {
    msg = await reserveCourtController(
      page,
      msg,
      fromTime,
      toTime,
      year,
      month,
      getDay,
      emptyCourt,
      retry
    );
  }
  await notify_line(msg, 'Qeuzd60OWvkoG0ZbctkpkkWFb9fUmYJYcTDBujxypsV');
  return msg;
};
