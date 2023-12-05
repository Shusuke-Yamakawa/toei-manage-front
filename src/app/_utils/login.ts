'use server';

import puppeteer from 'puppeteer';

export const login = async (userId: string = '86329044', password: string = '19870513') => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      // headless: false,
      // slowMo: 50,
      // devtools: true,
    });
    const page = await browser.newPage();
    await page.goto('https://yoyaku.sports.metro.tokyo.lg.jp/user/view/user/homeIndex.html');
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#login'),
    ]);
    console.log(`ログイン処理開始: ${userId}/${password}`);
    await page.type('#userid', userId);
    await page.type('#passwd', password);
    // sleepいるかも
    await page.click('#login');
    // DBから取得したユーザー名を返す？

    await browser.close();
  } catch (error) {
    console.error(`エラーが発生しました: ${error}`);
  }
};
