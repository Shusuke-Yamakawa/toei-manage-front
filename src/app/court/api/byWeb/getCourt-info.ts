import { Page } from 'puppeteer';

export const getCourtInfoWeb = async (page: Page) => {
  await page.click('a[data-target="#modal-reservation-menus"]');
  await Promise.all([
    // 画面遷移まで待機する
    page.waitForNavigation(),
    await page.evaluate(() => {
      doAction(document.form1, gRsvWGetCancelRsvDataAction); // エラーが出るが問題はない
    }),
  ]);
  const courtInfo = await page.$$eval('#rsvacceptlist tbody tr', (rows) =>
    rows
      .filter(
        (row) =>
          row.querySelector('td:nth-child(2)') &&
          row.querySelector('td:nth-child(3)') &&
          row.querySelector('td:nth-child(4)')
      ) // 不要な行を除外
      .map((row) => {
        const useDate = row
          .querySelector('td:nth-child(2)')!
          .innerText.trim()
          .replace(/\s+/g, '\n');
        const time = row.querySelector('td:nth-child(3)')!.innerText.trim().replace(/\s+/g, '\n');
        const facility = row
          .querySelector('td:nth-child(4)')!
          .innerText.trim()
          .replace(/\s+/g, '\n');
        return { useDate, time, facility };
      })
  );
  return courtInfo;
};
