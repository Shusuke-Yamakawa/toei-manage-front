/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-restricted-syntax */
import { Page } from 'puppeteer';
import { toeiPage } from '@/src/app/_lib/puppeteer';
import { login } from '@/src/app/_utils/login';
import { currentDate } from '@/src/app/_utils/date';
import {
  createGetCourt,
  deleteGetCourtById,
  deleteGetCourtBySpecialIds,
  deleteGetCourtCurrentMonthBySpecialIds,
  findGetCourtById,
} from '@/src/app/_lib/db/getCourt';

export const dynamic = 'force-dynamic';

export const deleteCourt = async (id: number) => {
  const { page, browser } = await toeiPage();
  const msg = '【削除コート】';
  const getCourt = await findGetCourtById(id);
  // await login(page, getCourt?.card_id, user.password);
  console.log('getCourt: ', getCourt);
  console.log('最終msg: ', msg);

  // DBから削除
  // await deleteGetCourtById({ id });
  // await notify_line(msg);

  return msg;
};
