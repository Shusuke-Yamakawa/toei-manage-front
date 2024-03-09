import { PuppeteerLaunchOptions } from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';

puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: '92b20bec85b8756a402440aa62da4302',
    },
    // visualFeedback: true, // headless: 'false'にする必要がある
  })
);

export const TOEI_URL = 'https://yoyaku.sports.metro.tokyo.lg.jp/';
export const TOEI_URL_NEW = 'https://kouen.sports.metro.tokyo.lg.jp/web/';
export const MITAKA_URL =
  'https://www.yoyaku.mitaka.site/reservations/facilities?utf8=%E2%9C%93&q%5Brooms_room_details_purposes_id_in%5D%5B%5D=777895430&commit=%E6%AC%A1%E3%81%B8';

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

export const toeiPageNew = async (options: PuppeteerLaunchOptions = { headless: 'new' }) => {
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto(TOEI_URL_NEW);

  return { page, browser };
};

export const mitakaPage = async (options: PuppeteerLaunchOptions = { headless: 'new' }) => {
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  await page.goto(MITAKA_URL);

  return { page, browser };
};
