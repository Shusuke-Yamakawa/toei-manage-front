import { currentDate } from '@/src/app/_utils/date';

/**
 * @package
 */
export const GET_LIMIT_DAY = () => currentDate().add(5, 'day');
/**
 * @package
 */
export const NOTIFY_OPEN_COURT = () => currentDate().add(5, 'day');
/**
 * @package
 */
export const getTimeZone = (fromTime: string) => {
  switch (fromTime) {
    case '9':
      return '10';
    case '11':
      return '20';
    case '13':
      return '30';
    case '15':
      return '40';
    default:
      throw new Error('不正な時間を指定しています');
  }
};
