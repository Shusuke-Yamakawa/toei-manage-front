/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { currentDate, getHolidays, zeroPad } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { toeiPageNew } from '@/src/app/_lib/puppeteer';
import dayjs from '@/src/app/_lib/dayjs';
import { createGetCourt } from '@/src/app/_lib/db/getCourt';
import { loginNew, logout } from '@/src/app/_utils/loginNew';

export const dynamic = 'force-dynamic';
type Court = { name: string; value: string };

const TARGET_COURT = [
  {
    name: '井の頭恩賜公園',
    value: '1220',
  },
  {
    name: '野川公園',
    value: '1260',
  },
  {
    name: '小金井公園',
    value: '1240',
  },
  {
    name: '府中の森公園',
    value: '1270',
  },
  {
    name: '武蔵野中央公園',
    value: '1230',
  },
];
const EXCLUDE_DAY_LIST: number[] = [];

const USER_ID = '10002097';
const PASSWD = 'Ryouma2518';

// const USER_ID = '10003974';
// const PASSWD = 'Cycling0818@';

const RETRY_USER_ID = '10001498';
const RETRY_PASSWD = 'hagayuk01!';

const GET_LIMIT_DAY = () => currentDate().add(5, 'day');
const NOTIFY_OPEN_COURT = () => currentDate().add(5, 'day');

let getDay = 0;
let emptyCourt = { name: '', value: '' } satisfies Court;
const getTimeZone = (fromTime: string) => {
  switch (fromTime) {
    case '9':
      return '10';
    case '11':
      return '20';
    case '13':
      return '30';
    case '15':
      return '40';
    default:
      throw new Error('不正な時間を指定しています');
  }
};

const searchOpenCourt = async (
  page: Page,
  fromTime: string,
  year: number,
  month: number,
  day: number,
  courtValue: string
) => {
  const yearStr = String(year);
  const monthStr = zeroPad(month);
  const dayStr = zeroPad(day);
  await page.type('#daystart-home', yearStr);
  // 右矢印押すことで、月の欄に移動します。
  await page.keyboard.press('ArrowRight');
  await page.type('#daystart-home', monthStr);
  await page.keyboard.press('ArrowRight');
  await page.type('#daystart-home', dayStr);
  await page.select('#purpose-home', '1000_1030');
  await page.waitForSelector('#bname-home:not([disabled])');
  await page.select('#bname-home', courtValue);
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    page.click('#btn-go'),
  ]);
  const timeZone = getTimeZone(fromTime);
  // ここで空きコート一覧が出るなら、日付ループはしない。
  const altText = await page.evaluate(
    // eslint-disable-next-line @typescript-eslint/no-shadow
    (yearStr, monthStr, dayStr, timeZone) => {
      const elements = document.evaluate(
        `//*[@id='${yearStr}${monthStr}${dayStr}_${timeZone}']/div/img`,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      if (elements.singleNodeValue) {
        return elements.singleNodeValue.alt; // img要素のalt属性を返す
      }
      return ''; // 要素が見つからない場合は空文字を返す
    },
    yearStr,
    monthStr,
    dayStr,
    timeZone
  );
  console.log('altText: ', altText);
  return altText !== '休館日'; // ここは変える そのまま予約しても良いかも
};

const searchByTargetDay = async (page: Page, fromTime: string, year: number, month: number) => {
  const targetDayList = getHolidays(year, month, NOTIFY_OPEN_COURT());
  // テスト用に追加する日付
  // targetDayList.unshift(26);
  let msg = '';
  const targetDayListFiltered = targetDayList.filter((day) => !EXCLUDE_DAY_LIST.includes(day));
  console.log('targetDayListFilterd: ', targetDayListFiltered);
  for (const court of TARGET_COURT) {
    // ループじゃなくて良いかもしれない targetDayListを渡すだけでいいかも
    for (const day of targetDayList) {
      console.log('day: ', day);
      const isOpenCourt = await searchOpenCourt(page, fromTime, year, month, day, court.value);
      console.log('isOpenCourt: ', isOpenCourt);
      if (isOpenCourt) {
        const weekElements = await page.$x('//*[@id="head_d1_s0_0"]');
        const week = await page.evaluate((element) => element.textContent, weekElements[0]);
        msg = `\n${day}(${week}) : ${court.name}\n空きコートあり！！`;
        getDay = day;
        emptyCourt = court;
        return msg;
      }
      await Promise.all([
        // 画面遷移まで待機する
        page.waitForNavigation(),
        page.click('#nav-home'), // 不要になる気がする
      ]);
    }
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#nav-home'),
    ]);
  }
  return '';
};

const reserveCourt = async (
  page: Page,
  msg: string,
  fromTime: string,
  toTime: string,
  year: number,
  month: number,
  emptyCourts: Court,
  userId: string
) => {
  console.log('空きコート:予約前 ', emptyCourts.name);
  const yearStr = String(year);
  const monthStr = zeroPad(month);
  const dayStr = zeroPad(getDay);
  const timeZone = getTimeZone(fromTime);
  const xpath = `//*[@id='${yearStr}${monthStr}${dayStr}_${timeZone}']/div/img`;
  await page.waitForXPath(xpath);
  const elements = await page.$x(xpath);
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
        msg = await reserveCourtController(page, msg, fromTime, toTime, year, month, true);
      }
      return msg;
    }
    msg += `\n${emptyCourts.name}を予約`;
    // DBに登録する
    // TODO 予約者番号も入るようにする
    await createGetCourt({
      card_id: userId,
      year,
      month,
      day: getDay,
      from_time: Number(fromTime),
      to_time: Number(toTime),
      court: emptyCourts.name,
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
  msg = await reserveCourt(page, msg, fromTime, toTime, year, month, emptyCourt, userId);
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
  const targetDay = dayjs(`${year}-${month}-${getDay}`);

  if (targetDay.isAfter(GET_LIMIT_DAY())) {
    msg = await reserveCourtController(page, msg, fromTime, toTime, year, month, retry);
  }
  await notify_line(msg, 'Qeuzd60OWvkoG0ZbctkpkkWFb9fUmYJYcTDBujxypsV');
  return msg;
};

export async function GET(request: Request) {
  const { page, browser } = await toeiPageNew({
    headless: false,
    slowMo: 20,
    devtools: true,
  });
  const { searchParams } = new URL(request.url);
  const fromTime = searchParams.get('from');
  const toTime = searchParams.get('to');
  const date = currentDate();
  const year = date.year();
  const month = date.month() + 1; // month()の結果は0から始まるため、1を追加します
  const day = date.date();
  let msg = `今月${fromTime}-${toTime}時の空きテニスコート`;
  msg += await searchByTargetDay(page, fromTime!, year, month);
  if (msg.indexOf('空きコートあり！！') !== -1) {
    msg = await checkAndReserveAvailableCourt(page, msg, fromTime!, toTime!, year, month, false);
  }
  if (day > 21) {
    msg += `来月${fromTime}-${toTime}時の空きテニスコート`;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    msg += await searchByTargetDay(page, fromTime!, nextMonthYear, nextMonth);
    if (msg.indexOf('空きコートあり！！') !== -1) {
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
  }
  console.log('最終メッセージ', msg);

  // クローズさせる
  await browser.close();
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
