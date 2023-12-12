/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { login } from '@/src/app/_utils/login';
import { currentDate, getHolidays } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { TOEI_URL, toeiPage } from '@/src/app/_lib/puppeteer';
import dayjs from '@/src/app/_lib/dayjs';
import { createGetCourt } from '@/src/app/_lib/db/getCourt';

export const dynamic = 'force-dynamic';

const TARGET_COURT = [
  '井の頭恩賜公園',
  '野川公園',
  '小金井公園',
  '府中の森公園',
  '武蔵野中央公園',
  // '東大和南公園',
];

const USER_ID = '86560751';
const PASSWD = '19550223';

// const USER_ID = '87088869';
// const PASSWD = '19900818';

const RETRY_USER_ID = '86329044';
const RETRY_PASSWD = '19870513';

const GET_LIMIT_DAY = currentDate().add(5, 'day');
const NOTIFY_OPEN_COURT = currentDate().add(4, 'day');

let getDay: number = 0;

const targetCourt = (openCourt: string): boolean => {
  if (TARGET_COURT.includes(openCourt)) {
    return true;
  }
  return false;
};

const isTargetCourtAvailable = async (
  day: number,
  emptyCourts: (string | null)[],
  week: string | null
) => {
  if (emptyCourts.length > 0) {
    for (const emptyCourt of emptyCourts) {
      // 指定したコートの場合のみ表示させる
      if (targetCourt(emptyCourt!)) {
        console.log('空きコート: ', emptyCourt);
        getDay = day;
        return `\n${day}( ${week}) : ${emptyCourt}\n空きコートあり！！`;
      }
    }
  }
  return '';
};

const searchOpenCourt = async (
  page: Page,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  day: number
) => {
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    page.click('#dateSearch'),
  ]);
  await page.select('select[name="layoutChildBody:childForm:year"]', `${year}`);
  await page.select('select[name="layoutChildBody:childForm:month"]', `${month}`);
  await page.select('select[name="layoutChildBody:childForm:day"]', `${day}`);
  await page.select('select[name="layoutChildBody:childForm:sHour"]', `${fromTime}`);
  await page.select('select[name="layoutChildBody:childForm:eHour"]', `${toTime}`);
  await page.click('input[value="2-1000-1030"]');
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    page.click('#srchBtn'),
  ]);
  // 空きコート名の取得
  const emptyCourts = await page.$$eval('#bnamem', (elements) =>
    elements.map((element) => element.textContent)
  );
  return emptyCourts;
};

const searchByTargetDay = async (
  page: Page,
  fromTime: string,
  toTime: string,
  year: number,
  month: number
) => {
  const targetDayList = getHolidays(year, month, NOTIFY_OPEN_COURT);
  // テスト用
  // targetDayList.unshift(20);
  let msg = '';
  for (const day of targetDayList) {
    const emptyCourts = await searchOpenCourt(page, fromTime, toTime, year, month, day);
    const week = await page.$eval('#weekLabel--', (item) => item.textContent);
    msg = await isTargetCourtAvailable(day, emptyCourts, week);
    // 次のページがある場合実行する
    while (true) {
      try {
        await Promise.all([
          // 画面遷移まで待機する
          page.waitForNavigation(),
          page.click('#goNextPager'),
        ]);
        const emptyCourtsNextPage = await page.$$eval('#bnamem', (elements) =>
          elements.map((element) => element.textContent)
        );
        msg += await isTargetCourtAvailable(day, emptyCourtsNextPage, week);
      } catch (NoSuchElementException) {
        // 次のページが押せなくなったらループから抜ける
        break;
      }
    }
    if (msg.indexOf('空きコートあり！！') !== -1) {
      return msg;
    }
  }
  return msg;
};

const reserveCourt = async (
  page: Page,
  msg: string,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  emptyCourts: (string | null)[],
  userId: string
) => {
  if (emptyCourts.length === 0) return msg;
  for (const emptyCourt of emptyCourts) {
    // 指定したコートが存在する場合、予約する
    if (targetCourt(emptyCourt!)) {
      console.log('空きコート:予約前 ', emptyCourt);
      const emptyStateIcon = await page.$('img#emptyStateIcon[alt="空き"]');
      // 最初に見つかったimg要素をクリック
      if (emptyStateIcon) {
        await emptyStateIcon.click();
      }
      await Promise.all([
        // 画面遷移まで待機する
        page.waitForNavigation(),
        page.click('#doReserve'),
      ]);
      try {
        const courtName = await page.$eval('#bnamem', (item) => item.textContent);
        await Promise.all([
          // 画面遷移まで待機する
          page.waitForNavigation(),
          page.click('#apply'),
        ]);
        const applyConf = await page.$$('#apply');
        if (applyConf.length > 0) {
          msg += '\n重複してるのでリトライ';
          await Promise.all([
            // 画面遷移まで待機する
            page.waitForNavigation(),
            await page.click('input[value="ログアウト"]'),
          ]);
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          msg = await reserveCourtController(page, msg, fromTime, toTime, year, month, true);
        }
        msg += `\n${courtName}を予約`;
        // DBに登録する
        await createGetCourt({
          card_id: userId,
          year,
          month,
          day: getDay,
          from_time: Number(fromTime),
          to_time: Number(toTime),
          court: courtName!,
        });
        return msg;
      } catch (error) {
        msg += '\n予約取れず';
        return msg;
      }
    }
  }
  return msg;
};

const reserveCourtController = async (
  page: Page,
  msg: string,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  retry: boolean
) => {
  console.log('reserve動きます！');
  let userId = USER_ID;
  let password = PASSWD;
  if (retry) {
    userId = RETRY_USER_ID;
    password = RETRY_PASSWD;
  }
  await login(page, userId, password);
  const emptyCourts = await searchOpenCourt(page, fromTime, toTime, year, month, getDay);
  msg = await reserveCourt(page, msg, fromTime, toTime, year, month, emptyCourts, userId);
  // 次のページがある場合実行する
  while (true) {
    try {
      await Promise.all([
        // 画面遷移まで待機する
        page.waitForNavigation(),
        page.click('#goNextPager'),
      ]);
      const emptyCourtsNextPage = await page.$$eval('#bnamem', (elements) =>
        elements.map((element) => element.textContent)
      );
      msg = await reserveCourt(
        page,
        msg,
        fromTime,
        toTime,
        year,
        month,
        emptyCourtsNextPage,
        userId
      );
    } catch (NoSuchElementException) {
      // 次のページが押せなくなったらループから抜ける
      break;
    }
  }

  return msg;
};

const checkAndReserveAvailableCourt = async (
  page: Page,
  msg: string,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  retry: boolean
) => {
  if (msg.indexOf('空きコートあり！！') === -1) return msg;
  const targetDay = dayjs(`${year}-${month}-${getDay}`);
  if (targetDay.isAfter(GET_LIMIT_DAY)) {
    msg = await reserveCourtController(page, msg, fromTime, toTime, year, month, retry);
  }
  await notify_line(msg, 'Qeuzd60OWvkoG0ZbctkpkkWFb9fUmYJYcTDBujxypsV');
  return msg;
};

export async function GET(request: Request) {
  const { page, browser } = await toeiPage();
  const { searchParams } = new URL(request.url);
  const fromTime = searchParams.get('from');
  const toTime = searchParams.get('to');
  const date = currentDate();
  const year = date.year();
  const month = date.month() + 1; // month()の結果は0から始まるため、1を追加します
  const day = date.date();
  let msg = `今月${fromTime}-${toTime}時の空きテニスコート
${TOEI_URL}`;
  msg += await searchByTargetDay(page, fromTime!, toTime!, year, month);
  msg = await checkAndReserveAvailableCourt(page, msg, fromTime!, toTime!, year, month, false);
  if (day > 21) {
    msg += `来月${fromTime}-${toTime}時の空きテニスコート`;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    msg += await searchByTargetDay(page, fromTime!, toTime!, nextMonthYear, nextMonth);
    msg = await checkAndReserveAvailableCourt(
      page,
      msg,
      fromTime!,
      toTime!,
      nextMonthYear,
      nextMonth,
      false
    );
  }
  console.log('最終メッセージ', msg);

  // クローズさせる
  await browser.close();
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
