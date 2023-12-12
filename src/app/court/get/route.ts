import { toeiPage } from '@/src/app/_lib/puppeteer';
import { login } from '@/src/app/_utils/login';

export const dynamic = 'force-dynamic';

const USER_ID_LIST = ['86560751', '87088869', '86329044'];
const PASSWD_LIST = ['19550223', '19900818', '19870513'];

export async function GET() {
  const { page } = await toeiPage();
  await login(page, USER_ID_LIST[0], PASSWD_LIST[0]);
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    page.click('#goRsvStatusList'),
  ]);
}
