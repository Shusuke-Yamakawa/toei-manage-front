/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { toeiPageNew } from '@/src/app/_lib/puppeteer';
import { findCardById } from '@/src/app/_lib/db/card';
import { loginNew, logout } from '@/src/app/_utils/loginNew';

export const dynamic = 'force-dynamic';

const favoriteList = [
  { key: '1301260', name: '野川' },
  { key: '1301220', name: '井の頭' },
  { key: '1301240', name: '小金井' },
];

export const favoriteAddDraw = async (id: string) => {
  const { page, browser } = await toeiPageNew();
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
    await page.select('#iname', '12600010'); // なぜかループの2週目が上手くいかない
    await Promise.all([
      // 画面遷移まで待機する
      page.waitForNavigation(),
      await page.click('#btn-go'),
    ]);
  }

  await logout(page);

  // クローズさせる
  await browser.close();
};
