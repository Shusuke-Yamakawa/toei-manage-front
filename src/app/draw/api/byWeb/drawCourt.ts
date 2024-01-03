/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPage } from '@/src/app/_lib/puppeteer';
import { confirmExpired, login } from '@/src/app/_utils/login';
import { currentDate } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { findCardCanDraw, updateCardDrawFlg } from '@/src/app/_lib/db/card';
import { createDraw } from '@/src/app/_lib/db/draw';

export const dynamic = 'force-dynamic';

const drawExec = async (
  page: Page,
  param: {
    card_id: string;
    userNm: string;
    day: number;
    fromTime: number;
    toTime: number;
    court: string;
  }
) => {
  const { card_id, userNm, day, fromTime, toTime, court } = param;
  let msg = `${userNm}\n`;
  try {
    await page.click('#goLotSerach');
  } catch (error) {
    // カードが無効の場合に失敗する
    msg += '抽選失敗\n';
    return msg;
  }
  await page.click('#goFavLotList');
  await page.click(`//input[@type='radio' and @value='${court}']`);
  await page.click('#doLotApp');
  const month = currentDate().month() + 1;
  const nextMonthYear = month === 12 ? currentDate().year() + 1 : currentDate().year();
  const nextMonth = month === 12 ? 1 : month + 1;
  for (let i = 0; i < 2; i++) {
    await page.click(`[link="${day}"]`);
    const targetTime = `${fromTime}00_${toTime}00`;
    await page.click(`//input[@value='${targetTime}']`);
    await page.click("//input[@value='申込みを確定する']");
    // ダイアログでOKの処理はダイアログが出る直前に記述する
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.click("//input[@value='抽選を申込む']");
    if (i === 0) await page.click('#doDateSearch');
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
  await updateCardDrawFlg(card_id);
  msg = `\n${await page.$eval('#bgcdnamem', (element) => element.textContent)}`;
  msg += `\n${await page.$eval(
    '#targetLabel',
    (element) => element.textContent
  )} ${await page.$eval('#timeLabel', (element) => element.textContent)}`;
  msg += `\n件数${await page.$eval('#totalCount', (element) => element.textContent)}`;
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
  const { page, browser } = await toeiPage();
  let msg = '【抽選設定】\n';
  const cardCanDraw = await findCardCanDraw();

  for (let i = 0; i < drawCount; i++) {
    const { user_nm, card_id, password } = cardCanDraw[i];
    msg += `${user_nm}\n`;
    await login(page, card_id, password);
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#goRsvStatusList'),
    ]);
    msg += confirmExpired(page, user_nm);
    msg += await drawExec(page, {
      card_id,
      userNm: user_nm,
      day,
      fromTime,
      toTime,
      court,
    });
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.click('input[value="ログアウト"]'),
    ]);
  }

  await browser.close();

  console.log('最終msg: ', msg);
  await notify_line(msg);

  return msg;
};
