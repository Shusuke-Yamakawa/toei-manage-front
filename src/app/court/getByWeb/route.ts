/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPage } from '@/src/app/_lib/puppeteer';
import { login } from '@/src/app/_utils/login';
import { notify_line } from '@/src/app/_utils/line';
import { currentDate } from '@/src/app/_utils/date';
import {
  createGetCourt,
  deleteGetCourtBySpecialIds,
  deleteGetCourtCurrentMonthBySpecialIds,
} from '@/src/app/_lib/db/getCourt';

export const dynamic = 'force-dynamic';

const USER_LIST = [
  { id: '86560751', password: '19550223' },
  { id: '87088869', password: '19900818' },
  { id: '86329044', password: '19870513' },
];

const getCourtInfo = async (page: Page, userId: string) => {
  let msg = '';
  // 取得名の取得
  const getCourts = await page.$$eval('#ymdLabel', (elements) =>
    elements.map((element) => element.textContent)
  );
  for (let i = 0; i < getCourts.length; i++) {
    // webから取得情報を取得
    const dates = await page.$$eval('#ymdLabel', (elements) =>
      elements.map((element) => element.textContent)
    );
    const date = dates[i]!;

    const fromTimes = await page.$$eval('#stimeLabel', (elements) =>
      elements.map((element) => element.textContent)
    );
    const fromTime = fromTimes[i]!;

    const toTimes = await page.$$eval('#etimeLabel', (elements) =>
      elements.map((element) => element.textContent)
    );
    const toTime = toTimes[i]!;

    const courtNms = await page.$$eval('#bnamem', (elements) =>
      elements.map((element) => element.textContent)
    );
    const courtNm = courtNms[i]!;

    // DBに取得情報を登録
    const month = date.match(/.*年(\d+)月.*/)![1];
    const day = date.match(/.*月(\d+)日.*/)![1];
    const from_time_db = fromTime.match(/(\d+)/)![1];
    const to_time_db = toTime.match(/(\d+)/)![1];
    const court = courtNm.slice(0, -2);
    await createGetCourt({
      card_id: userId,
      year: Number(date.slice(0, 4)),
      month: Number(month),
      day: Number(day),
      from_time: Number(from_time_db),
      to_time: Number(to_time_db),
      court,
    });

    msg += `\n${date.slice(5, -1)} ${fromTime.slice(0, -1)}-${toTime.slice(0, -1)} ${court}`;
  }
  return msg;
};

export async function GET() {
  const { page, browser } = await toeiPage();
  let msg = '【コート取得状況】';
  // 22日以前であれば、今月のみ削除
  const day = currentDate().day();
  console.log('day: ', day);
  if (day > 21) {
    await deleteGetCourtBySpecialIds({ cardIds: USER_LIST.map((user) => user.id) });
  } else {
    await deleteGetCourtCurrentMonthBySpecialIds({ cardIds: USER_LIST.map((user) => user.id) });
  }
  for (const user of USER_LIST) {
    await login(page, user.id, user.password);
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#goRsvStatusList'),
    ]);
    msg += `\n${user.id}`;
    msg += await getCourtInfo(page, user.id);
    while (true) {
      try {
        await Promise.all([
          // 画面遷移まで待機する
          page.waitForNavigation(),
          page.click('#goNextPager'),
        ]);
        msg += await getCourtInfo(page, user.id);
      } catch (NoSuchElementException) {
        // 次のページが押せなくなったらループから抜ける
        break;
      }
    }
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.click('input[value="ログアウト"]'),
    ]);
  }
  await browser.close();
  console.log('最終msg: ', msg);
  // await notify_line(msg);

  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
