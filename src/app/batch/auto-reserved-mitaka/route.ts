/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { currentDate } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { mitakaPage } from '@/src/app/_lib/puppeteer';
import {
  createMitakaCourt,
  findMitakaCourtByKey,
  updateMitakaCourt,
} from '@/src/app/_lib/db/mitakaCourt';

export const dynamic = 'force-dynamic';

let month = 0;
let day = 0;
let fromTime = 0;
let toTime = 0;

// 空き情報を確認する関数の模擬
const extractTimeSlot = async (text: string) => {
  // 正規表現パターンの定義
  const pattern = /\n(\d{2}:\d{2}) 〜 (\d{2}:\d{2}) ○/g;

  // パターンにマッチする部分を全て取得
  const matches = [...text.matchAll(pattern)];

  // マッチした時間帯について、指定された時間帯のうち最初にマッチしたものを返す
  for (const match of matches) {
    if (match[1] === '09:00') {
      return '09:00 〜 11:00';
    }
    if (match[1] === '11:00') {
      return '11:00 〜 13:00';
    }
    if (match[1] === '13:00') {
      return '13:00 〜 15:00';
    }
    if (match[1] === '15:00') {
      return '15:00 〜 17:00';
    }
  }

  // ヒットしなかった場合は空文字列を返す
  return '';
};

const searchOpenCourt = async (page: Page) => {
  const courtElement = (await page.$x('/html/body/div[2]/div[3]/form/div[2]/dl/dt/label')) as any;
  await courtElement[0].click();
  const nextElement = (await page.$x('/html/body/div[2]/div[3]/form/div[4]/ul/li[2]/label')) as any;
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await nextElement[0].click(),
  ]);
  await page.select('#display_period', '2');
  await page.click('label[title="夜間"]');
  await page.click('label[title="全ての曜日"]');
  // await page.click('label[title="水"]');
  await page.click('label[title="土"]');
  await page.click('label[title="祝日"]');

  // await sleep(3000);
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.click('label.po-bt.po-bt-bg.po-bt-forward.po-role-button[title="次へ"]'),
  ]);
  // await sleep(3000);
  let msg = '';
  const weeks = [
    '/html/body/div[2]/div[3]/form/div[3]/div[1]/div/table/tbody/tr[2]/td/label',
    '/html/body/div[2]/div[3]/form/div[3]/div[2]/div/table/tbody/tr[2]/td[1]/label',
    '/html/body/div[2]/div[3]/form/div[3]/div[3]/div/table/tbody/tr[2]/td[1]/label',
    '/html/body/div[2]/div[3]/form/div[3]/div[4]/div/table/tbody/tr[2]/td[1]/label',
    '/html/body/div[2]/div[3]/form/div[3]/div[5]/div/table/tbody/tr[2]/td[1]/label',
  ];

  for (let i = 0; i < weeks.length; i++) {
    const element = await page.$x(weeks[i]);
    if (element.length > 0) {
      const title = await page.evaluate((el: any) => el.getAttribute('title'), element[0]);
      if (title !== '空きなし') {
        const times = await extractTimeSlot(title);
        if (times) {
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          const dateText = await page.evaluate((index) => {
            const listItem = document.querySelector(`li[role="tab"][tabindex="${index}"]`);
            if (!listItem) return '';
            const anchor = listItem.querySelector('a');
            return anchor ? anchor.title.match(/\d{2}\/\d{2}/)![0] : '日付が見つかりません';
          }, i);
          const dateRegex = /(\d{2})\/(\d{2})/;
          const dateMatches = dateText.match(dateRegex)!;
          month = parseInt(dateMatches[1], 10);
          day = parseInt(dateMatches[2], 10);
          const timeRegex = /(\d{2}):(\d{2}) 〜 (\d{2}):(\d{2})/;
          const timeMatches = times.match(timeRegex)!;
          fromTime = parseInt(timeMatches[1], 10);
          toTime = parseInt(timeMatches[3], 10);

          msg += `\n空きコートあり！！\n${dateText} ${times}`;
        }
      }
    }
  }
  return msg;
};

const notifyCourt = async (msg: string, year: number) => {
  console.log('空きコート:情報', month, day, fromTime, toTime);
  const existsCourt = await findMitakaCourtByKey({
    year,
    month,
    day,
    from_time: fromTime,
    to_time: toTime,
  });
  if (!existsCourt) {
    await createMitakaCourt({
      year,
      month,
      day,
      from_time: fromTime,
      to_time: toTime,
      detect_count: 1,
    });
    await notify_line(msg, 'Qeuzd60OWvkoG0ZbctkpkkWFb9fUmYJYcTDBujxypsV');
  } else {
    await updateMitakaCourt({ id: existsCourt.id });
  }
};

export async function GET() {
  // const { page, browser } = await mitakaPage({
  //   headless: false,
  //   slowMo: 20,
  //   devtools: true,
  // });
  const { page, browser } = await mitakaPage();

  const date = currentDate();
  const year = date.year();

  let msg = '三鷹テニスコート';
  msg += await searchOpenCourt(page);
  if (msg.indexOf('空きコートあり！！') !== -1) {
    notifyCourt(msg, year);
  }
  console.log('最終メッセージ', msg);

  // クローズさせる
  await browser.close();
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
