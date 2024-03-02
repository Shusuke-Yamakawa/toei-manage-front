/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPageNew } from '@/src/app/_lib/puppeteer';
import { currentDate } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { findCardCanDraw, updateCardDrawFlg } from '@/src/app/_lib/db/card';
import { createDraw } from '@/src/app/_lib/db/draw';
import { loginNew, logout } from '@/src/app/_utils/loginNew';

export const dynamic = 'force-dynamic';

const getValueByCourt = (court: string) => {
  switch (court) {
    case '野川公園':
      return '1301260';
    case '井の頭恩賜公園':
      return '1301220';
    case '小金井公園':
      return '1301240';
    default:
      throw new Error('不正な公園を指定しています');
  }
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

// 列の値を示す（例: 'td[6]'の'6'）
const dayValue = '6';

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
  const courtValue = getValueByCourt(court);
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.click(`button[onclick="doFavoriteEntry('130','${courtValue}','12600010');"]`),
  ]);
  const month = currentDate().month() + 1;
  const nextMonthYear = month === 12 ? currentDate().year() + 1 : currentDate().year();
  const nextMonth = month === 12 ? 1 : month + 1;
  const timeValue = getTimeValue(fromTime);
  for (let i = 0; i < 2; i++) {
    // 必要に応じて次ページにする
    const xpath = `//*[@id="usedate-bheader-${timeValue}"]/td[${dayValue}]`; // dayValueは実際に画面で確認して変更する
    await page.waitForXPath(xpath);
    const elements = await page.$x(xpath);
    await elements[0].click();
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.click('#btn-go'),
    ]);
    // ダイアログでOKの処理はダイアログが出る直前に記述する
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.select('#apply', `${i + 1}-1`);
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.click('#btn-go'),
    ]);

    if (i === 0) {
      await Promise.all([
        // 画面遷移まで待機する
        page.waitForNavigation(),
        await page.click('#btn-light'),
      ]);
    }
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
  const dateTextElements = await page.$x('//*[@id="lottery-application"]/table/tbody/tr[1]/td[4]');
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
  const { page, browser } = await toeiPageNew({
    headless: false,
    slowMo: 20,
    devtools: true,
  });
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
