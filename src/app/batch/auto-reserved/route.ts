/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
// eslint-disable-next-line no-restricted-syntax
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import puppeteer, { Page } from 'puppeteer';
import { login } from '@/src/app/_utils/login';
import { getHolidays } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';

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

const RETRY_USER_ID = '86329044';
const RETRY_PASSWD = '19870513';

const GET_LIMIT_DAY = dayjs().add(4, 'day');
const NOTIFY_OPEN_COURT = dayjs().add(2, 'day');

const TOEI_URL = 'https://yoyaku.sports.metro.tokyo.lg.jp/';
let getDay: number = 0;

dayjs.extend(utc);

const targetCourt = (openCourt: string): boolean => {
  if (TARGET_COURT.includes(openCourt)) {
    return true;
  }
  return false;
};

const write_open_court = async (
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

const search_day_time = async (
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

const search_open_court = async (
  page: Page,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  day: number
) => {
  const emptyCourts = await search_day_time(page, fromTime, toTime, year, month, day);
  const week = await page.$eval('#weekLabel--', (item) => item.textContent);
  let msg = await write_open_court(day, emptyCourts, week);
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
      msg += await write_open_court(day, emptyCourtsNextPage, week);
    } catch (NoSuchElementException) {
      // 次のページが押せなくなったらループから抜ける
      break;
    }
  }
  return msg;
};

const search_by_target_day = async (
  page: Page,
  fromTime: string,
  toTime: string,
  year: number,
  month: number
) => {
  const targetDayList = getHolidays(year, month, NOTIFY_OPEN_COURT);
  // テスト用
  // targetDayList.unshift(13);
  console.log('targetDayList: ', targetDayList);
  let msg = '';
  for (const d of targetDayList) {
    const result = await search_open_court(page, fromTime, toTime, year, month, d);
    msg += result;

    if (result.indexOf('空きコートあり！！') !== -1) {
      return msg;
    }
  }

  return msg;
};

const reserve_court = async (
  page: Page,
  msg: string,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  emptyCourts: (string | null)[]
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
          await page.click('input[value="ログアウト"]');
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          msg = await now_reserve(page, msg, fromTime, toTime, year, month, true);
        }
        msg += `\n${courtName}を予約`;
        return msg;
      } catch (error) {
        msg += '\n予約取れず';
        return msg;
      }
    }
  }
  return msg;
};

const now_reserve = async (
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
  const emptyCourts = await search_day_time(page, fromTime, toTime, year, month, getDay);
  msg = await reserve_court(page, msg, fromTime, toTime, year, month, emptyCourts);
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
      msg = await reserve_court(page, msg, fromTime, toTime, year, month, emptyCourtsNextPage);
    } catch (NoSuchElementException) {
      // 次のページが押せなくなったらループから抜ける
      break;
    }
  }

  return msg;
};

const post_process = async (
  page: Page,
  msg: string,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  retry: boolean
) => {
  if (msg.indexOf('空きコートあり！！') === -1) return msg;
  console.log('post_process動きます！');
  const targetDay = dayjs(`${year}-${month}-${getDay}`);
  if (targetDay.isAfter(GET_LIMIT_DAY)) {
    msg = await now_reserve(page, msg, fromTime, toTime, year, month, retry);
  }
  await notify_line(msg);
  return msg;
};

export async function GET(request: Request) {
  const browser = await puppeteer.launch({
    headless: 'new',
    // headless: false,
    // slowMo: 50,
    // devtools: true,
  });
  const page = await browser.newPage();
  await page.goto(`${TOEI_URL}user/view/user/homeIndex.html`);

  const { searchParams } = new URL(request.url);
  const fromTime = searchParams.get('from');
  const toTime = searchParams.get('to');
  const date = dayjs();
  const year = date.year();
  const month = date.month() + 1; // month()の結果は0から始まるため、1を追加します
  const day = date.date();
  let msg = `今月${fromTime}-${toTime}時の空きテニスコート
${TOEI_URL}`;
  msg += await search_by_target_day(page, fromTime!, toTime!, year, month);
  msg = await post_process(page, msg, fromTime!, toTime!, year, month, false);
  console.log('最終メッセージ', msg);

  if (day > 21) {
    console.log('day is over 21');
    msg += `来月${fromTime}-${toTime}時の空きテニスコート`;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    msg += await search_by_target_day(page, fromTime!, toTime!, nextMonthYear, nextMonth);
    msg += await post_process(page, msg, fromTime!, toTime!, nextMonthYear, nextMonth, false);
  }
  // クローズさせる
  await browser.close();
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
