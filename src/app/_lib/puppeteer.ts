import puppeteer from 'puppeteer';

export const TOEI_URL = 'https://yoyaku.sports.metro.tokyo.lg.jp/';
export const TOEI_URL_NEW = 'https://kouen.sports.metro.tokyo.lg.jp/web/';

export const toeiPage = async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    // headless: false,
    // slowMo: 50,
    // devtools: true,
  });
  const page = await browser.newPage();
  await page.goto(`${TOEI_URL}user/view/user/homeIndex.html`);

  return { page, browser };
};

export const toeiPageNew = async () => {
  const browser = await puppeteer.launch({
    // headless: 'new',
    headless: false,
    slowMo: 20,
    devtools: true,
  });
  const page = await browser.newPage();
  await page.goto(TOEI_URL_NEW);

  return { page, browser };
};
