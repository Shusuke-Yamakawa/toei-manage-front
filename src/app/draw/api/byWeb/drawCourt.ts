/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPage } from '@/src/app/_lib/puppeteer';
import { confirmExpired, login } from '@/src/app/_utils/login';
import { currentDate } from '@/src/app/_utils/date';
import {
  createGetCourt,
  deleteGetCourtBySpecialIds,
  deleteGetCourtCurrentMonthBySpecialIds,
  findGetCourtOverCurrentCourt,
} from '@/src/app/_lib/db/getCourt';
import { notify_line } from '@/src/app/_utils/line';
import { findCardById, findCardCanDraw, updateCardDrawFlg } from '@/src/app/_lib/db/card';
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
  const msg = `抽選したよ\n${userNm}\n`;
  const month = currentDate().month() + 1;
  const nextMonthYear = month === 12 ? currentDate().year() + 1 : currentDate().year();
  const nextMonth = month === 12 ? 1 : month + 1;
  // 2件登録されるようにする
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

  await updateCardDrawFlg(card_id);
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
    const { user_nm, card_id } = cardCanDraw[i];
    msg += `${user_nm}\n`;
    // await login(page, card.card_id, card.password);
    // await Promise.all([
    //   // 画面遷移まで待機する
    //   page.waitForNavigation(),
    //   page.click('#goRsvStatusList'),
    // ]);
    msg += confirmExpired(page, user_nm);
    msg += await drawExec(page, {
      card_id,
      userNm: user_nm,
      day,
      fromTime,
      toTime,
      court,
    });
    // await Promise.all([
    //   // 画面遷移まで待機する
    //   page.waitForNavigation(),
    //   await page.click('input[value="ログアウト"]'),
    // ]);
  }

  await browser.close();

  console.log('最終msg: ', msg);
  // await notify_line(msg);

  return msg;
};
