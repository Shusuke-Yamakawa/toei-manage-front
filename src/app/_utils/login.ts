'use server';

import { Page } from 'puppeteer';
import { sleep } from '@/src/app/_utils/util';

export const login = async (
  page: Page,
  userId: string = '86329044',
  password: string = '19870513'
) => {
  try {
    await page.goto('https://yoyaku.sports.metro.tokyo.lg.jp/user/view/user/homeIndex.html');
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#login'),
    ]);
    console.log(`ログイン処理開始: ${userId}/${password}`);
    await page.type('#userid', userId);
    await page.type('#passwd', password);
    await sleep(3000);
    await page.click('#cookieCheck');
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#login'),
    ]);
    // ログイン確認
    const isElementExist = (await page.$('input[value="ログアウト"]')) !== null;
    if (!isElementExist) {
      console.log('ログイン失敗');
    }
  } catch (error) {
    console.error(`ログイン失敗: ${error}`);
  }
};
