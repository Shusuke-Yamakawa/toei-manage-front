import dayjs from 'dayjs';
import { getHolidays } from '@/src/app/_utils/date';

describe('===hiraganaToKatakana', () => {
  it('2023年12月の休日判定が正しいこと', () => {
    expect(getHolidays(2023, 12, dayjs('2023-12-01'))).toStrictEqual([
      2, 3, 9, 10, 16, 17, 23, 24, 29, 30, 31,
    ]);
  });
  it('2024年2月の休日判定が正しいこと', () => {
    expect(getHolidays(2024, 2, dayjs('2024-02-01'))).toStrictEqual([
      3, 4, 10, 11, 12, 17, 18, 23, 24, 25,
    ]);
  });
});
