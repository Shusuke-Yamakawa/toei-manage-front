import { currentDate } from '@/src/app/_utils/date';
import { toeiPageNew } from '@/src/app/_lib/puppeteer';
import { searchByTargetDay } from '@/src/app/batch/auto-reserved-new/auto-reserve-search';
import { checkAndReserveAvailableCourt } from '@/src/app/batch/auto-reserved-new/auto-reserve-exec';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { page, browser } = await toeiPageNew({
    headless: false,
    slowMo: 20,
    devtools: true,
  });
  // const { page, browser } = await toeiPageNew();
  const { searchParams } = new URL(request.url);
  const fromTime = searchParams.get('from');
  const toTime = searchParams.get('to');
  const date = currentDate();
  const year = date.year();
  const month = date.month() + 1; // month()の結果は0から始まるため、1を追加します
  const day = date.date();
  let msg = `今月${fromTime}-${toTime}時の空きテニスコート`;
  const {
    msg: searchMsg,
    getDay,
    emptyCourt,
  } = await searchByTargetDay(page, fromTime!, year, month);
  msg += searchMsg;
  if (msg.indexOf('空きコートあり！！') !== -1) {
    msg = await checkAndReserveAvailableCourt(
      page,
      msg,
      fromTime!,
      toTime!,
      year,
      month,
      getDay,
      emptyCourt,
      false
    );
  }
  if (day > 21) {
    msg += `来月${fromTime}-${toTime}時の空きテニスコート`;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const {
      msg: searchMsgNext,
      getDay: getDayNext,
      emptyCourt: emptyCourtNext,
    } = await searchByTargetDay(page, fromTime!, nextMonthYear, nextMonth);
    msg += searchMsgNext;
    if (searchMsgNext.indexOf('空きコートあり！！') !== -1) {
      msg = await checkAndReserveAvailableCourt(
        page,
        msg,
        fromTime!,
        toTime!,
        nextMonthYear,
        nextMonth,
        getDayNext,
        emptyCourtNext,
        false
      );
    }
  }
  console.log('最終メッセージ', msg);

  // クローズさせる
  await browser.close();
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
