/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPageNew } from '@/src/app/_lib/puppeteer';
import { currentDate } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { updateCardDrawFlg } from '@/src/app/_lib/db/card';
import { findDrawNextMonthCourt, updateConfirmDrawFlg } from '@/src/app/_lib/db/draw';
import { createGetCourt } from '@/src/app/_lib/db/getCourt';
import { loginNew, logout } from '@/src/app/_utils/loginNew';

export const dynamic = 'force-dynamic';

const confirmExec = async (page: Page): Promise<number> => {
  await page.click('.nav-link.dropdown-toggle.m-auto.d-table-cell.align-middle');
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.evaluate(() => {
      doAction(document.form1, gLotWTransLotElectListAction); // エラーが出るが問題はない
    }),
  ]);

  const caption = await page.$x('//*[@id="lottery-result"]/table/caption');
  if (caption.length === 0) return 0;
  const captionText = await page.evaluate((element) => element.textContent, caption[0]);
  if (captionText !== '確認されていない当選結果') return 0;
  const confirmNumberElements = await page.$x(
    '//*[@id="lottery-result"]/table/tbody/tr/td[1]/label/span[4]'
  );
  const confirmNumber = await page.evaluate(
    (element) => Number(element.textContent!.charAt(0)), // 1面→1
    confirmNumberElements[0]
  );
  console.log('confirmNumber: ', confirmNumber);

  const select = (await page.$x('//*[@id="refine-checkbox0"]/label')) as any;
  await select[0].click();

  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.click('#btn-go'),
  ]);
  await page.evaluate(() => {
    document.querySelector('#applynum0')!.value = '4';
  });
  // ダイアログでOKの処理はダイアログが出る直前に記述
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.click('#btn-go'), // 抽選確定
  ]);
  return confirmNumber;
};

export const drawCourtConfirm = async () => {
  // const { page, browser } = await toeiPageNew();
  const { page, browser } = await toeiPageNew({
    headless: false,
    slowMo: 20,
    devtools: true,
  });

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
      // TODO 予約者番号も入るようにする
      await createGetCourt({
        card_id,
        year: nextMonthYear,
        month: nextMonth,
        day,
        from_time,
        to_time,
        court,
        public_flg: true,
        reserve_no: '',
      });
    }
    msg += getNumber && `${user_nm}\n${day}日 ${from_time}-${to_time}\n${court}${getNumber}件\n`;
    await logout(page);
    processedCardIds[card_id] = true;
  }

  await browser.close();

  console.log('最終msg: ', msg);
  await notify_line(msg);

  return msg;
};
