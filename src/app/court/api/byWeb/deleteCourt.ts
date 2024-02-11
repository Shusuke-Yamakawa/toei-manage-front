/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPage } from '@/src/app/_lib/puppeteer';
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

export const dynamic = 'force-dynamic';

const getCourtCancel = async (
  page: Page,
  getCourt: GetCourt & GetCourtIncludeEntry,
  id: number
) => {
  // 取得名の取得
  const getCourtDbKey = `${getCourt.month}${getCourt.day}${getCourt.from_time}${getCourt.to_time}${getCourt.court}`;
  console.log('getCourtDbKey: ', getCourtDbKey);
  const getCourts = await page.$$eval('#ymdLabel', (elements) =>
    elements.map((element) => element.textContent)
  );
  const entryIds = getCourt.entries.map((entry) => entry.id);
  const guestInfo = await findGuestByCourtId(id);
  const guestIds = guestInfo.map((guest) => guest.id);

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

    // DBの登録情報と合わせる登録
    const month = date.match(/.*年(\d+)月.*/)![1];
    const day = date.match(/.*月(\d+)日.*/)![1];
    const from_time_db = fromTime.match(/(\d+)/)![1];
    const to_time_db = toTime.match(/(\d+)/)![1];
    const courtKey = month + day + from_time_db + to_time_db + courtNm;
    console.log('courtKey: ', courtKey);
    if (courtKey === getCourtDbKey) {
      console.log('一致したのでキャンセルします');
      const doSelectElements = await page.$$('#doSelect');
      await Promise.all([
        // 画面遷移まで待機する
        page.waitForNavigation(),
        await doSelectElements[i].click(),
      ]);
      // ダイアログでOKの処理はダイアログが出る直前に記述する
      page.once('dialog', async (dialog) => {
        await dialog.accept();
      });
      await page.click('#doDelete');
      console.log('キャンセル完了');
      await notify_line(`【キャンセル完了】\n ${courtKey}`);
      await deleteGuestByIds(guestIds);
      await deleteEntryByIds(entryIds);
      await deleteGetCourtById({ id });
      return true;
    }
  }
  console.log('一致するコートがなかった\nレコードは除去します');
  await deleteGuestByIds(guestIds);
  await deleteEntryByIds(entryIds);
  await deleteGetCourtById({ id });
  return false;
};

export const deleteCourt = async (id: number) => {
  const { page, browser } = await toeiPage();
  const getCourt = await findGetCourtById(id);
  if (getCourt?.hold_flg) {
    console.log('開催予定のためキャンセルできません');
    return false;
  }
  const cardId = getCourt?.card_id!;
  const card = await findCardById(cardId);
  await login(page, cardId, card?.password);
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    page.click('#goRsvStatusList'),
  ]);
  let result = false;
  result = await getCourtCancel(page, getCourt!, id);

  if (!result) {
    while (true) {
      try {
        await Promise.all([
          // 画面遷移まで待機する
          page.waitForNavigation(),
          page.click('#goNextPager'),
        ]);
        result = await getCourtCancel(page, getCourt!, id);
      } catch (NoSuchElementException) {
        // 次のページが押せなくなったらループから抜ける
        break;
      }
    }
  }

  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.click('input[value="ログアウト"]'),
  ]);

  // クローズさせる
  await browser.close();

  return result;
};
