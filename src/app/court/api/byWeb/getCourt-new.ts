/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPageNew } from '@/src/app/_lib/puppeteer';
import { findGetCourtOverCurrentCourt } from '@/src/app/_lib/db/getCourt';
import { notify_line } from '@/src/app/_utils/line';
import { findCardById } from '@/src/app/_lib/db/card';
import { USER_LIST } from '@/src/app/court/api/byWeb/getCourt.const';
import { loginNew, logout } from '@/src/app/_utils/loginNew';
import { getCourtInfoWeb } from '@/src/app/court/api/byWeb/getCourt-info';

export const dynamic = 'force-dynamic';

const getCourtInfo = async (page: Page) => {
  const courtInfo = await getCourtInfoWeb(page);
  console.log('courtInfo: ', courtInfo);
  const msg = courtInfo.map((info) => {
    const useDateFormatted = info.useDate.split('\n')[0];
    const timeFormatted = info.time.split('～')[0].trim().slice(0, 2);
    const facilityFormatted = info.facility.split('\n')[0].trim();
    return `\n${useDateFormatted}${timeFormatted}@${facilityFormatted}`;
  });
  return msg;
};

export const getCourtNew = async () => {
  // const { page, browser } = await toeiPageNew();
  const { page, browser } = await toeiPageNew({
    headless: false,
    slowMo: 20,
    devtools: true,
  });
  let msg = '【コート取得状況】';
  for (const user of USER_LIST) {
    await loginNew(page, user.id, user.password);
    const card = await findCardById(user.id);
    msg += `\n${card?.user_nm}`;
    msg += await getCourtInfo(page);
    await logout(page);
  }
  await browser.close();
  // 抽選等で取得した分を追加する
  const cardsIdsIncludeUserList = USER_LIST.map((user) => user.id);
  const getCourtListExcludeUserList = await findGetCourtOverCurrentCourt(cardsIdsIncludeUserList);
  for (const court of getCourtListExcludeUserList) {
    msg += `\n${court.card.user_nm}\n${court.month}月${court.day}日${court.court.slice(0, -2)}`;
  }

  console.log('最終msg: ', msg);
  await notify_line(msg);

  return msg;
};
