/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { toeiPageNew } from '@/src/app/_lib/puppeteer';
import { findCardById } from '@/src/app/_lib/db/card';
import { loginNew, logout } from '@/src/app/_utils/loginNew';
import { sleep } from '@/src/app/_utils/util';

export const dynamic = 'force-dynamic';

export const favoriteList = [
  { key: '1301260', name: '野川公園', facility: '12600010' },
  { key: '1301220', name: '井の頭恩賜公園', facility: '12200020' },
  { key: '1301240', name: '小金井公園', facility: '12400020' },
] as const;

export const favoriteListReserve = [
  { key: '1260', name: '野川公園', facility: '12600010' },
  { key: '1220', name: '井の頭恩賜公園', facility: '12200020' },
  { key: '1240', name: '小金井公園', facility: '12400020' },
  { key: '1270', name: '府中の森公園', facility: '12700020' },
  { key: '1230', name: '武蔵野中央公園', facility: '12300010' },
];

export const favoriteAddDraw = async (id: string) => {
  const { page, browser } = await toeiPageNew({
    headless: false,
    slowMo: 20,
    devtools: true,
  });
  const card = await findCardById(id);
  await loginNew(page, id, card?.password);
  await page.click('.nav-link.dropdown-toggle.m-auto.d-table-cell.align-middle');
  for (const favorite of favoriteList) {
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.evaluate(() => {
        doAction(document.form1, gLotWRegistLotFavoriteInfoDispAction); // エラーが出るが問題はない
      }),
    ]);
    await page.type('#fname', favorite.name);
    await page.select('#cname', '130');
    await page.waitForSelector('#bname:not([disabled])');
    await page.select('#bname', favorite.key);
    await page.waitForSelector('#iname:not([disabled])');
    await page.select('#iname', favorite.facility);
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.click('#btn-go'),
    ]);
  }
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.evaluate(() => {
      doAction(document.form1, gLotWTransLotFavoriteInfoAction); // エラーが出るが問題はない
    }),
  ]);
  await sleep(2000);

  await logout(page);

  // クローズさせる
  await browser.close();
};

export const favoriteAddReserve = async (id: string) => {
  const { page, browser } = await toeiPageNew({
    headless: false,
    slowMo: 20,
    devtools: true,
  });
  const card = await findCardById(id);
  await loginNew(page, id, card?.password);
  await page.click('a[data-target="#modal-reservation-menus"]');
  for (const favorite of favoriteListReserve) {
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.evaluate(() => {
        doAction(document.form1, gRsvWTransFavorite2InfoDispAction); // エラーが出るが問題はない
      }),
    ]);
    await page.type('#fname', favorite.name);
    await page.select('#purpose', '1000_1030');
    await page.waitForSelector('#bname:not([disabled])');
    await page.select('#bname', favorite.key);
    await page.waitForSelector('#iname:not([disabled])');
    await page.select('#iname', favorite.facility);
    await page.click('label[for="yes"]');
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.click('#btn-go'),
    ]);
  }
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.evaluate(() => {
      doAction(document.form1, gRsvWTransFavorite2InfoAction); // エラーが出るが問題はない
    }),
  ]);
  await sleep(2000);

  await logout(page);

  // クローズさせる
  await browser.close();
};
