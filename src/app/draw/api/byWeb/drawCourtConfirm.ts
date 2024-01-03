/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPage } from '@/src/app/_lib/puppeteer';
import { login } from '@/src/app/_utils/login';
import { currentDate } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';
import { updateCardDrawFlg } from '@/src/app/_lib/db/card';
import { findDrawNextMonthCourt, updateConfirmDrawFlg } from '@/src/app/_lib/db/draw';
import { createGetCourt } from '@/src/app/_lib/db/getCourt';

export const dynamic = 'force-dynamic';

const confirmExec = async (page: Page) => {
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.click('#goLotStatusList'),
  ]);

  let confirmNumber = 0;

  try {
    const web_elements = await page.$eval('#lotStatusListItems', (element) =>
      element.querySelectorAll('tr')
    );
    const num = web_elements.length;

    for (let i = 0; i < num; i++) {
      try {
        const lotElectConfirmElements = await page.$$('#goLotElectConfirm');
        await Promise.all([
          page.waitForNavigation(),
          page.evaluate(
            (elements, j) => {
              elements[j].click();
            },
            lotElectConfirmElements,
            i
          ),
        ]);
        confirmNumber += 1;
      } catch {
        continue;
      }
    }
  } catch {
    return confirmNumber;
  }

  return confirmNumber;
};

export const drawCourtConfirm = async () => {
  const { page, browser } = await toeiPage();
  let msg = '【抽選確定】\n';
  const drawTarget = await findDrawNextMonthCourt(false);
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
    await login(page, card_id, password);
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
      });
    }
    msg += `${user_nm}\n${day}日 ${from_time}-${to_time}\n${court}${getNumber}件\n`;
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
