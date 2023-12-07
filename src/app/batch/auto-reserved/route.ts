import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import puppeteer, { ElementHandle, Page } from 'puppeteer';
import { login } from '@/src/app/_utils/login';
import { getHolidays } from '@/src/app/_utils/date';

const TARGET_COURT = [
  '井の頭恩賜公園',
  '野川公園',
  '小金井公園',
  '府中の森公園',
  '武蔵野中央公園',
  '東大和南公園',
];

const USER_ID = '86560751';
const PASSWD = '19550223';

const RETRY_USER_ID = '86329044';
const RETRY_PASSWD = '19870513';

const GET_LIMIT_DAY = 5;
const NOTIFY_OPEN_COURT = 5;

const TOEI_URL = 'https://yoyaku.sports.metro.tokyo.lg.jp/';
let getDay = null;

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
    // eslint-disable-next-line no-restricted-syntax
    for (const emptyCourt of emptyCourts) {
      // 指定したコートの場合のみ表示させる
      if (targetCourt(emptyCourt!)) {
        console.log('空きコート: ', emptyCourt);
        getDay = day;
        return `\n${day}( ${week}) : ${emptyCourt}`;
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
  await page.click('#dateSearch');
  await page.select('select[name="layoutChildBody:childForm:year"]', `${year}`);
  await page.select('select[name="layoutChildBody:childForm:month"]', `${month}`);
  await page.select('select[name="layoutChildBody:childForm:day"]', `${day}`);
  await page.select('select[name="layoutChildBody:childForm:sHour"]', `${fromTime}`);
  await page.select('select[name="layoutChildBody:childForm:eHour"]', `${toTime}`);
  await page.click('input[value="2-1000-1030"]');
  await page.click('#srchBtn');
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
  console.log('emptyCourts: ', emptyCourts);
  const week = await page.$eval('#weekLabel--', (item) => item.textContent);
  let msg = await write_open_court(day, emptyCourts, week);
  // 次のページがある場合実行する
  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await page.click('#goNextPager');
      // eslint-disable-next-line no-await-in-loop
      const emptyCourtsNextPage = await page.$$eval('#bnamem', (elements) =>
        elements.map((element) => element.textContent)
      );
      // eslint-disable-next-line no-await-in-loop
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
  month: number,
  day: number
) => {
  const targetDay = getHolidays(year, month, day);
  console.log('targetDay: ', targetDay);
  let msg = '';
  // 仮で日付を固定
  msg += await search_open_court(page, fromTime, toTime, year, month, 13);

  // 一旦コメントアウト
  // targetDay.forEach((d: number): void => {
  //   msg += search_open_court(page, fromTime, toTime, year, month, d);
  // });

  return msg;
};

export async function GET(request: Request) {
  const browser = await puppeteer.launch({
    // headless: 'new',
    headless: false,
    slowMo: 50,
    devtools: true,
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
  msg += await search_by_target_day(page, fromTime!, toTime!, year, month, day);
  console.log('最終メッセージ', msg);

  if (day > 21) {
    console.log('day is over 21');
    msg = `来月${fromTime}-${toTime}時の空きテニスコート`;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    msg += await search_by_target_day(page, fromTime!, toTime!, nextMonthYear, nextMonth, 1);
  }
  // DBから取得したユーザーIDとパスワードを渡す
  // login();

  // クローズさせる
  // await browser.close();
  return Response.json({ message: 'Hello world' });
}
