import puppeteer from 'puppeteer';
import { TOEI_URL, toeiPage } from '@/src/app/_lib/puppeteer';
import { login } from '@/src/app/_utils/login';

export async function GET(request: Request) {
  //   const { page, browser } = await toeiPage();
  const browser = await puppeteer.launch({
    // headless: 'new',
    headless: false,
    slowMo: 50,
    devtools: true,
  });
  const page = await browser.newPage();
  await page.goto(`${TOEI_URL}user/view/user/homeIndex.html`);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const password = searchParams.get('password');

  await login(page, id!, password!);

  // クローズさせる
  await browser.close();
  return new Response(JSON.stringify({ message: 'login完了' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
