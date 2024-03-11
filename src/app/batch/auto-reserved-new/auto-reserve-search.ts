/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { zeroPad, getHolidays } from '@/src/app/_utils/date';
import {
  EXCLUDE_DAY_LIST,
  TARGET_COURT,
} from '@/src/app/batch/auto-reserved-new/auto-reserve.const';
import {
  getTimeZone,
  NOTIFY_OPEN_COURT,
} from '@/src/app/batch/auto-reserved-new/auto-reserve.util';
import { Court } from '@/src/app/batch/auto-reserved-new/auto-reserve.type';

/**
 * @package
 */
export const searchOpenCourt = async (
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
      ) as any;
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
  return altText === '休館日'; // ここは変える そのまま予約しても良いかも
};

/**
 * @package
 */
export const searchByTargetDay = async (
  page: Page,
  fromTime: string,
  year: number,
  month: number
) => {
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
        return { msg, getDay: day, emptyCourt: court };
      }
      await Promise.all([
        // 画面遷移まで待機する
        page.waitForNavigation(),
        page.click('#nav-home'), // ループがなくなれば不要になるか
      ]);
    }
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#nav-home'),
    ]);
  }
  return { msg, getDay: 0, emptyCourt: { name: '', value: '' } as Court };
};
