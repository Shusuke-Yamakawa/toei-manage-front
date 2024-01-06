/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { toeiPage } from '@/src/app/_lib/puppeteer';
import { login } from '@/src/app/_utils/login';
import { notify_line } from '@/src/app/_utils/line';

export const dynamic = 'force-dynamic';

export const calculateOddsDrawNextMonthCourt = async () => {
  const { page, browser } = await toeiPage();
  const msg = '【抽選倍率】\n';
  await login(page, '86329044', '19870513');

  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.click('input[value="ログアウト"]'),
  ]);
  await browser.close();

  console.log('最終msg: ', msg);
  await notify_line(msg);

  return msg;
};
