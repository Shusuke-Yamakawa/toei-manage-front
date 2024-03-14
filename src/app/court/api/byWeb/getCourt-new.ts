/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPageNew } from '@/src/app/_lib/puppeteer';
import { findGetCourtOverCurrentCourt } from '@/src/app/_lib/db/getCourt';
import { notify_line } from '@/src/app/_utils/line';
import { findCardById } from '@/src/app/_lib/db/card';
import { USER_LIST } from '@/src/app/court/api/byWeb/getCourt.const';
import { loginNew, logout } from '@/src/app/_utils/loginNew';

export const dynamic = 'force-dynamic';

const getCourtInfo = async (page: Page) => {
  await page.click('a[data-target="#modal-reservation-menus"]');
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.evaluate(() => {
      doAction(document.form1, gRsvWGetCancelRsvDataAction); // エラーが出るが問題はない
    }),
  ]);
  const courtInfo = await page.$$eval('#rsvacceptlist tbody tr', (rows) =>
    rows
      .filter(
        (row) =>
          row.querySelector('td:nth-child(2)') &&
          row.querySelector('td:nth-child(3)') &&
          row.querySelector('td:nth-child(4)')
      ) // 不要な行を除外
      .map((row) => {
        const useDate = row
          .querySelector('td:nth-child(2)')!
          .innerText.trim()
          .replace(/\s+/g, '\n');
        const time = row.querySelector('td:nth-child(3)')!.innerText.trim().replace(/\s+/g, '\n');
        const facility = row
          .querySelector('td:nth-child(4)')!
          .innerText.trim()
          .replace(/\s+/g, '\n');
        return { useDate, time, facility };
      })
  );
  console.log('courtInfo: ', courtInfo);
  const msg = courtInfo
    .map((info) => {
      const useDateFormatted = info.useDate.split('\n')[0];
      const timeFormatted = info.time.split('～')[0].trim().slice(0, 2);
      const facilityFormatted = info.facility.split('\n')[0].trim();
      return `\n${useDateFormatted}${timeFormatted}@${facilityFormatted}`;
    })
    .join('\n');
  return msg;
};

export const getCourtNew = async () => {
  // const { page, browser } = await toeiPageNew();
  const { page, browser } = await toeiPageNew({
    headless: false,
    slowMo: 20,
    devtools: true,
  });
  let msg = '【コート取得状況】';
  for (const user of USER_LIST) {
    await loginNew(page, user.id, user.password);
    const card = await findCardById(user.id);
    msg += `\n${card?.user_nm}`;
    msg += await getCourtInfo(page);
    // while (true) {
    //   try {
    //     await Promise.all([
    //       // 画面遷移まで待機する
    //       page.waitForNavigation(),
    //       page.click('#goNextPager'),
    //     ]);
    //     msg += await getCourtInfo(page);
    //   } catch (NoSuchElementException) {
    //     // 次のページが押せなくなったらループから抜ける
    //     break;
    //   }
    // }
    await logout(page);
  }
  await browser.close();
  // 抽選等で取得した分を追加する
  const cardsIdsIncludeUserList = USER_LIST.map((user) => user.id);
  const getCourtListExcludeUserList = await findGetCourtOverCurrentCourt(cardsIdsIncludeUserList);
  for (const court of getCourtListExcludeUserList) {
    msg += `\n${court.card.user_nm}\n${court.month}月${court.day}日${court.court.slice(0, -2)}`;
  }

  console.log('最終msg: ', msg);
  await notify_line(msg);

  return msg;
};
