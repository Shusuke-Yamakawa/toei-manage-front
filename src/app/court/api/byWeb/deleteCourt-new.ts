/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPage, toeiPageNew } from '@/src/app/_lib/puppeteer';
import { login } from '@/src/app/_utils/login';
import {
  GetCourt,
  GetCourtIncludeEntry,
  deleteGetCourtById,
  findGetCourtById,
} from '@/src/app/_lib/db/getCourt';
import { findCardById } from '@/src/app/_lib/db/card';
import { notify_line } from '@/src/app/_utils/line';
import { deleteEntryByIds } from '@/src/app/_lib/db/entry';
import { deleteGuestByIds, findGuestByCourtId } from '@/src/app/_lib/db/guest';
import { currentDate, getTargetDay } from '@/src/app/_utils/date';
import { loginNew, logout } from '@/src/app/_utils/loginNew';
import { getCourtInfoWeb } from '@/src/app/court/api/byWeb/getCourt-info';

export const dynamic = 'force-dynamic';

const getCourtCancel = async (
  page: Page,
  getCourt: GetCourt & GetCourtIncludeEntry,
  id: number
) => {
  const courtInfo = await getCourtInfoWeb(page);
  console.log('courtInfo: ', courtInfo);
  const courtInfoKey = courtInfo.map((info) => {
    const [month, day] = info.useDate.match(/\d+/g);
    const monthDay = `${month}${day}`;
    // timeから開始時間を抽出し、09時の場合は0を除去
    const startTime = info.time.match(/\d+/)[0];
    const formattedStartTime = startTime === '09' ? startTime.slice(1) : startTime;
    const facility = info.facility.split('\n')[0];
    return `${monthDay}${formattedStartTime}${facility}`;
  });

  console.log('courtInfoKey:', courtInfoKey);
  const getCourtDbKey = `${getCourt.month}${getCourt.day}${getCourt.from_time}${getCourt.court}`;
  console.log('getCourtDbKey: ', getCourtDbKey);

  const matchingIndex = courtInfoKey.indexOf(getCourtDbKey);
  console.log('Matching index:', matchingIndex);

  const entryIds = getCourt.entries.map((entry) => entry.id);
  const guestInfo = await findGuestByCourtId(id);
  const guestIds = guestInfo.map((guest) => guest.id);

  if (matchingIndex !== -1) {
    console.log('一致したのでキャンセルします');
    // ダイアログでOKの処理はダイアログが出る直前に記述
    // page.once('dialog', async (dialog) => {
    //   await dialog.accept();
    // });
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.evaluate((index) => {
        rsvcancel(document.form1, gRsvWCancelRsvAction, index); // エラーが出るが問題はない
      }, matchingIndex),
    ]);
    console.log('キャンセル完了');
    await notify_line(`【キャンセル完了】\n ${getCourtDbKey}`);
    // await deleteGuestByIds(guestIds);
    // await deleteEntryByIds(entryIds);
    // await deleteGetCourtById({ id });
    return true;
  }
  console.log(`一致するコートがなかった\nレコードは除去します${getCourtDbKey}`);
  // await deleteGuestByIds(guestIds);
  // await deleteEntryByIds(entryIds);
  // await deleteGetCourtById({ id });
  return false;
};

export const deleteCourtNew = async (id: number) => {
  // const { page, browser } = await toeiPageNew();
  const { page, browser } = await toeiPageNew({
    headless: false,
    slowMo: 20,
    devtools: true,
  });
  const getCourt = await findGetCourtById(id);
  const { year, month, day } = getCourt!;
  const targetDate = getTargetDay(year, month, day);
  const isFutureDate = targetDate.isAfter(currentDate(), 'day');
  if (isFutureDate && getCourt?.hold_flg) {
    console.log('開催予定のためキャンセルできません');
    return false;
  }
  const card = getCourt?.card!;
  await loginNew(page, card.card_id, card.password);
  let result = false;
  result = await getCourtCancel(page, getCourt!, id);

  // if (!result) {
  //   while (true) {
  //     try {
  //       await Promise.all([
  //         // 画面遷移まで待機する
  //         page.waitForNavigation(),
  //         page.click('#goNextPager'),
  //       ]);
  //       result = await getCourtCancel(page, getCourt!, id);
  //     } catch (NoSuchElementException) {
  //       // 次のページが押せなくなったらループから抜ける
  //       break;
  //     }
  //   }
  // }

  await logout(page);

  // クローズさせる
  await browser.close();

  return result;
};
