'use server';

import { Page } from 'puppeteer';
import { sleep } from '@/src/app/_utils/util';
import { TOEI_URL_NEW } from '@/src/app/_lib/puppeteer';

export const loginNew = async (
  page: Page,
  userId: string = '10000973',
  password: string = 'Aa00620513'
) => {
  try {
    await page.goto(TOEI_URL_NEW);
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#btn-login'),
    ]);
    console.log(`ログイン処理開始: ${userId}/${password}`);
    await page.type('#userId', userId);
    await page.type('#password', password);
    // await sleep(3000);
    // await page.click('#cookieCheck');
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      page.click('#btn-go'),
    ]);
    // ログイン確認
    // 「予約」リンクの存在を確認
    const element = await page.$('a[data-toggle="modal"][data-target="#modal-reservation-menus"]');
    if (!element) {
      console.log('ログイン失敗');
    }
  } catch (error) {
    console.error(`ログイン失敗: ${error}`);
  }
};

export const logout = async (page: Page) => {
  // ログアウト
  await page.click('#userName');
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.evaluate(() => {
      doAction(document.form1, gRsvWTransUserAttestationEndAction); // エラーが出るが問題はない
    }),
  ]);
};

// TODO 2024/02辺りに仕様が分かる
// export const confirmExpired = async (page: Page) => {
//   try {
//     const web_element = await page.$x(
//       "//*[@id='childForm']/div/table[1]/tbody/tr[2]/td/div/dl[2]/dd/font/u"
//     );

//     if (web_element.length > 0) {
//       const textContent = await page.evaluate((el) => el.textContent, web_element[0]);

//       if (textContent!.includes('有効期限が切れます')) {
//         const warnMsg = '【期限切れ直前】\n';
//         return warnMsg;
//       }
//       if (textContent!.includes('有効期限が切れている')) {
//         console.log('有効期限が切れている');
//         return '';
//       }
//       if (textContent!.includes('ペナルティ期間中')) {
//         console.log('ペナルティ期間中です');
//         return '';
//       }
//       console.log('想定外です。確認してください。');
//     }
//     return '';
//   } catch (error) {
//     // 警告メッセージの表示がない場合
//     console.error(error, '期限切れ等はありません');
//     return '';
//   }
// };
