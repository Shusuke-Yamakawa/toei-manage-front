/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPage } from '@/src/app/_lib/puppeteer';
import { currentDate } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { updateCardDrawFlg } from '@/src/app/_lib/db/card';
import { findDrawNextMonthCourt, updateConfirmDrawFlg } from '@/src/app/_lib/db/draw';
import { createGetCourt } from '@/src/app/_lib/db/getCourt';
import { loginNew } from '@/src/app/_utils/loginNew';

export const dynamic = 'force-dynamic';

const confirmExec = async (page: Page) => {
  await page.click('.nav-link.dropdown-toggle.m-auto.d-table-cell.align-middle');
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.evaluate(() => {
      doAction(document.form1, gLotWTransLotElectListAction); // エラーが出るが問題はない
    }),
  ]);

  let confirmNumber = 0;

  // ここからは14日以降に変更する
  try {
    const num = await page.$$eval('#lotStatusListItems tr', (elements) => elements.length);
    for (let i = 0; i < num; i++) {
      try {
        await Promise.all([
          // 画面遷移まで待機する
          page.waitForNavigation(),
          await page.click('#goLotElectConfirm'),
        ]);
        await Promise.all([
          // 画面遷移まで待機する
          page.waitForNavigation(),
          await page.click('#doOnceLockFix'),
        ]);
        console.log('抽選確定しました');
        confirmNumber += 1;
      } catch {
        console.log('抽選確定するものがありません');
        continue;
      }
    }
  } catch {
    console.log('抽選が行われてない');
    return confirmNumber;
  }

  return confirmNumber;
};

export const drawCourtConfirm = async () => {
  const { page, browser } = await toeiPage();
  let msg = '【抽選確定】\n';
  const drawTarget = await findDrawNextMonthCourt(false);
  const processedCardIds: Record<string, boolean> = {};
  for (const draw of drawTarget) {
    const {
      id,
      card_id,
      card: { password, user_nm },
      day,
      from_time,
      to_time,
      court,
    } = draw;
    // すでに処理済みのカードはスキップする
    if (processedCardIds[card_id]) {
      await updateConfirmDrawFlg(id);
      continue;
    }
    await loginNew(page, card_id, password);
    const getNumber = await confirmExec(page);
    await updateCardDrawFlg(card_id, true);
    await updateConfirmDrawFlg(id);
    const month = currentDate().month() + 1;
    const nextMonthYear = month === 12 ? currentDate().year() + 1 : currentDate().year();
    const nextMonth = month === 12 ? 1 : month + 1;
    for (let i = 0; i < getNumber; i++) {
      await createGetCourt({
        card_id,
        year: nextMonthYear,
        month: nextMonth,
        day,
        from_time,
        to_time,
        court,
        public_flg: true,
      });
    }
    msg += getNumber && `${user_nm}\n${day}日 ${from_time}-${to_time}\n${court}${getNumber}件\n`;
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.click('input[value="ログアウト"]'),
    ]);
    processedCardIds[card_id] = true;
  }

  await browser.close();

  console.log('最終msg: ', msg);
  await notify_line(msg);

  return msg;
};
