import { login } from '@/src/app/_utils/login';

const TARGET_COURT = ['井の頭恩賜公園', '野川公園', '小金井公園', '府中の森公園', '武蔵野中央公園'];

const USER_ID = '86560751';
const PASSWD = '19550223';

const RETRY_USER_ID = '86329044';
const RETRY_PASSWD = '19870513';

const GET_LIMIT_DAY = 5;
const NOTIFY_OPEN_COURT = 5;

const TOEI_URL = 'https://yoyaku.sports.metro.tokyo.lg.jp/';

export async function GET() {
  // DBから取得したユーザーIDとパスワードを渡す
  login();

  return Response.json({ message: 'Hello world' });
}
