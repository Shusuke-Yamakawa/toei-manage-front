import Holidays from 'date-holidays';
import dayjs from '@/src/app/_lib/dayjs';

export const getHolidays = (year: number, month: number, limitDay: dayjs.Dayjs) => {
  const holidays = new Holidays('JP');
  const result = [];

  const startDate = dayjs(`${year}-${month}-01`);
  const endDate = startDate.endOf('month');

  for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
    const isWeekend = date.day() === 0 || date.day() === 6;
    // 12/25は祝日ではない、29,30は祝日扱い
    if (month === 12 && date.date() === 25) continue;
    const isHoliday =
      holidays.isHoliday(date.toDate()) ||
      (month === 12 && date.date() === 29) ||
      (month === 12 && date.date() === 30);
    if (date.isAfter(limitDay) && (isWeekend || isHoliday)) {
      result.push(date.date());
    }
  }

  return result;
};

export const currentDate = () => dayjs().tz();

export const checkHoliday = (year: number, month: number) => {
  const holidays = new Holidays('JP');
  const startDate = dayjs(`${year}-${month}-01`);
  const endDate = startDate.endOf('month');
  for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
    if (holidays.isHoliday(date.toDate())) {
      console.log(date.format('YYYY-MM-DD'));
    }
  }
};
