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

export const confirmExpired = async (page: Page, userNm: string) => {
  try {
    const web_element = await page.$x(
      "//*[@id='childForm']/div/table[1]/tbody/tr[2]/td/div/dl[2]/dd/font/u"
    );

    if (web_element.length > 0) {
      const textContent = await page.evaluate((el) => el.textContent, web_element[0]);

      if (textContent!.includes('有効期限が切れます')) {
        const warnMsg = `\n\n${userNm} 【期限切れ直前】`;
        return warnMsg;
      }
      if (textContent!.includes('有効期限が切れている')) {
        console.log('有効期限が切れている');
        return '';
      }
      if (textContent!.includes('ペナルティ期間中')) {
        console.log('ペナルティ期間中です');
        return '';
      }
      console.log('想定外です。確認してください。');
    }
    return '';
  } catch (error) {
    // 警告メッセージの表示がない場合
    console.error(error, '期限切れ等はありません');
    return '';
  }
};
