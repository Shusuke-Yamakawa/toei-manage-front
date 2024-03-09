/* eslint-disable no-param-reassign */
import dayjs from 'dayjs';
import { Page } from 'puppeteer';
import { createGetCourt } from '@/src/app/_lib/db/getCourt';
import { zeroPad } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { logout, loginNew } from '@/src/app/_utils/loginNew';
import { searchOpenCourt } from '@/src/app/batch/auto-reserved-new/auto-reserve-search';
import {
  USER_ID,
  PASSWD,
  RETRY_USER_ID,
  RETRY_PASSWD,
} from '@/src/app/batch/auto-reserved-new/auto-reserve.const';
import { getTimeZone, GET_LIMIT_DAY } from '@/src/app/batch/auto-reserved-new/auto-reserve.util';

type Court = { name: string; value: string };

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
    // const courtName = await page.$eval('#bnamem', (item) => item.textContent);
    // const toTimeWeb = await page.$eval('#etimeLabel', (element) => element.textContent);
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#apply'),
    ]);
    const applyConf = await page.$$('#apply');
    if (applyConf.length > 0) {
      const retryTarget = emptyCourt.name === '井の頭恩賜公園' || emptyCourt.name === '野川公園';
      if (retryTarget) {
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
  const targetDay = dayjs(`${year}-${month}-${getDay}`);

  if (targetDay.isAfter(GET_LIMIT_DAY())) {
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
