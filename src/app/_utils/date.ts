import dayjs from 'dayjs';
import Holidays from 'date-holidays';

export const getHolidays = (year: number, month: number, day: number) => {
  const holidays = new Holidays('JP');
  const result = [];

  const startDate = dayjs(`${year}-${month}-01`);
  const endDate = startDate.endOf('month');

  for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
    const isWeekend = date.day() === 0 || date.day() === 6;
    // 12/25は祝日ではない、29,30は祝日扱い
    const isHoliday =
      (holidays.isHoliday(date.toDate()) && month === 12 && date.date() !== 25) ||
      (month === 12 && date.date() === 29) ||
      (month === 12 && date.date() === 30);
    if (date.date() >= day + 2 && (isWeekend || isHoliday)) {
      result.push(date.date());
    }
  }

  return result;
};
