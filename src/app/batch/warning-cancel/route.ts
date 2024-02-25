import { findGetCourtByDateAndHoldFlg } from '@/src/app/_lib/db/getCourt';
import { currentDate } from '@/src/app/_utils/date';
import { notify_line } from '@/src/app/_utils/line';

export const dynamic = 'force-dynamic';

// 5日後の予約で開催予定がないコートをラインに通知
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const addDay = Number(searchParams.get('day'));
  const date = currentDate();
  const warningDate = date.add(addDay, 'day');
  const year = warningDate.year();
  const month = warningDate.month() + 1;
  const day = warningDate.date();
  const warningCourt = await findGetCourtByDateAndHoldFlg({ year, month, day });
  const msg = warningCourt
    .map(
      ({ card, from_time, to_time, court }) =>
        `\n${card.user_nm}\n${month}/${day} ${from_time}-${to_time} ${court}`
    )
    .join('');
  notify_line(msg);
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
