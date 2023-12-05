import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { login } from '@/src/app/_utils/login';
import { getHolidays } from '@/src/app/_utils/date';

const TARGET_COURT = ['井の頭恩賜公園', '野川公園', '小金井公園', '府中の森公園', '武蔵野中央公園'];

const USER_ID = '86560751';
const PASSWD = '19550223';

const RETRY_USER_ID = '86329044';
const RETRY_PASSWD = '19870513';

const GET_LIMIT_DAY = 5;
const NOTIFY_OPEN_COURT = 5;

const TOEI_URL = 'https://yoyaku.sports.metro.tokyo.lg.jp/';

dayjs.extend(utc);
const DATE_FORMAT = 'YYYY/MM/DD';

const search_by_target_day = (fromTime: string, toTime: string) => {
  console.log(fromTime, toTime);
  const date = dayjs();
  const year = date.year();
  const month = date.month() + 1; // month()の結果は0から始まるため、1を追加します
  const day = date.date();
  console.log(`年: ${year}`);
  console.log(`月: ${month}`);
  console.log(`日: ${day}`);
  const targetDay = getHolidays(year, month, day);
  console.log('targetDay: ', targetDay);

  return '15日';
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fromTime = searchParams.get('from');
  const toTime = searchParams.get('to');
  let msg = `今月${fromTime}-${toTime}時の空きテニスコート
${TOEI_URL}`;
  msg += '\n';
  msg += search_by_target_day(fromTime!, toTime!);

  console.log(msg);
  // DBから取得したユーザーIDとパスワードを渡す
  login();

  return Response.json({ message: 'Hello world' });
}
