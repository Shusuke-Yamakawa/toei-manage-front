/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPageNew } from '@/src/app/_lib/puppeteer';
import { currentDate } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { findCardCanDraw, updateCardDrawFlg } from '@/src/app/_lib/db/card';
import { createDraw } from '@/src/app/_lib/db/draw';
import { loginNew, logout } from '@/src/app/_utils/loginNew';
import { favoriteList } from '@/src/app/card/api/byWeb/favoriteAdd';
import { sleep } from '@/src/app/_utils/util';

export const dynamic = 'force-dynamic';

const findFavoriteByKey = (court: string) => {
  const item = favoriteList.find((favorite) => favorite.name === court);
  return item ? { key: item.key, facility: item.facility } : undefined;
};

// 行の値を示す（例: 'usedate-bheader-1'の'1'）
const getTimeValue = (fromTime: number) => {
  switch (fromTime) {
    case 9:
      return '1';
    case 11:
      return '2';
    case 13:
      return '3';
    case 15:
      return '4';
    default:
      throw new Error('不正な時間を指定しています');
  }
};

// ここは実行前に変更する
// 列の値を示す（例: 'td[6]'の'6'）
const dayValue = '7';
const nextWeekCounter = 0;

const submitApplication = async (page: Page, i: number) => {
  await page.select('#apply', `${i + 1}-1`);

  // ダイアログでOKの処理はダイアログが出る直前に記述
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });

  await Promise.all([
    page.waitForNavigation(),
    page.click('#btn-go'), // 抽選申し込み
  ]);

  if (i === 0) {
    await Promise.all([page.waitForNavigation(), page.click('#btn-light')]);
  }
  // reCAPTCHAがあるかどうかをチェック
  const isRecaptchaVisible = await page.evaluate(
    () =>
      // ここにreCAPTCHAのチェックを行うコードを追加
      // 例えば、reCAPTCHAのiframeが存在するかどうかを確認
      document.querySelector('iframe[src*="recaptcha"]') !== null
  );

  if (isRecaptchaVisible) {
    console.log('solveRecaptchasが火をふくぞ');
    // reCAPTCHAを解決
    await page.solveRecaptchas();
    console.log('solveRecaptchasがやった');

    // 再度submitApplicationを呼び出す（必要な処理に応じて）
    await submitApplication(page, i); // 再帰的に呼び出し、必要に応じてループの条件を調整してください
  }
};

const drawExec = async (
  page: Page,
  param: {
    card_id: string;
    day: number;
    fromTime: number;
    toTime: number;
    court: string;
  }
) => {
  const { card_id, day, fromTime, toTime, court } = param;
  let msg = '';
  try {
    await page.click('.nav-link.dropdown-toggle.m-auto.d-table-cell.align-middle');
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.evaluate(() => {
        doAction(document.form1, gLotWOpeLotSearchAction); // エラーが出るが問題はない
      }),
    ]);
  } catch (error) {
    // カードが無効の場合に失敗する
    msg += '抽選失敗\n';
    return msg;
  }
  const courtItem = findFavoriteByKey(court);
  if (!courtItem) {
    console.error('抽選お気に入り設定が間違ってます');
    // eslint-disable-next-line consistent-return
    return;
  }
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.click(
      `button[onclick="doFavoriteEntry('130','${courtItem.key}','${courtItem.facility}');"]`
    ),
  ]);
  const month = currentDate().month() + 1;
  const nextMonthYear = month === 12 ? currentDate().year() + 1 : currentDate().year();
  const nextMonth = month === 12 ? 1 : month + 1;
  const timeValue = getTimeValue(fromTime);
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < nextWeekCounter; j++) {
      await page.waitForSelector('#next-week', { visible: true });
      // 初回画面表示時のみダブルクリックが必要なため制御を入れる
      if (i === 0 && j === 0) {
        await page.click('#next-week');
      }
      await page.click('#next-week');
      await sleep(1000);
    }
    const xpath = `//*[@id="usedate-bheader-${timeValue}"]/td[${dayValue}]`; // dayValueは実際に画面で確認して変更する
    await page.waitForXPath(xpath);
    const elements = await page.$x(xpath);
    await elements[0].click();
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.click('#btn-go'),
    ]);
    await submitApplication(page, i);
    await createDraw({
      card_id,
      year: nextMonthYear,
      month: nextMonth,
      day,
      from_time: fromTime,
      to_time: toTime,
      court,
      confirm_flg: false,
    });
  }
  await updateCardDrawFlg(card_id, false);
  await page.click('.nav-link.dropdown-toggle.m-auto.d-table-cell.align-middle');
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.evaluate(() => {
      doAction(document.form1, gLotWTransLotCancelListAction); // エラーが出るが問題はない
    }),
  ]);
  const facilityTextElements = await page.$x(
    '//*[@id="lottery-application"]/table/tbody/tr[1]/td[4]/span[2]'
  );
  const facilityText = await page.evaluate((e) => e.textContent, facilityTextElements[0]);
  const dateTextElements = await page.$x(
    '//*[@id="lottery-application"]/table/tbody/tr[1]/td[5]/span[2]'
  );
  const dateText = await page.evaluate((e) => e.textContent, dateTextElements[0]);
  const timeTextElements = await page.$x(
    '//*[@id="lottery-application"]/table/tbody/tr[1]/td[6]/text()[1]'
  );
  const timeText = await page.evaluate((e) => e.textContent, timeTextElements[0]);
  msg += `${dateText}${timeText}${facilityText}`;
  return msg;
};

export const drawCourt = async (param: {
  day: number;
  fromTime: number;
  toTime: number;
  court: string;
  drawCount: number;
}) => {
  const { day, fromTime, toTime, court, drawCount } = param;
  // {
  //   headless: false,
  //   slowMo: 20,
  //   devtools: true,
  // }
  const { page, browser } = await toeiPageNew();
  let msg = '【抽選設定】';
  const cardCanDraw = await findCardCanDraw();

  for (let i = 0; i < drawCount; i++) {
    const { user_nm, card_id, password } = cardCanDraw[i];
    msg += `\n${user_nm}\n`;
    await loginNew(page, card_id, password);
    // msg += await confirmExpired(page); //2025/02辺りから適用する
    msg += await drawExec(page, {
      card_id,
      day,
      fromTime,
      toTime,
      court,
    });
    await logout(page);
  }

  await browser.close();

  console.log('最終msg: ', msg);
  await notify_line(msg);

  return msg;
};
