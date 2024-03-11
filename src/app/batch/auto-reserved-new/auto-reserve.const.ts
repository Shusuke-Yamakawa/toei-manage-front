import { Court } from '@/src/app/batch/auto-reserved-new/auto-reserve.type';

export const TARGET_COURT = [
  {
    name: '井の頭恩賜公園',
    value: '1220',
  },
  {
    name: '野川公園',
    value: '1260',
  },
  {
    name: '小金井公園',
    value: '1240',
  },
  {
    name: '府中の森公園',
    value: '1270',
  },
  {
    name: '武蔵野中央公園',
    value: '1230',
  },
] as const satisfies Court[];

export const EXCLUDE_DAY_LIST: number[] = [];

export const DESIRED_RESERVATION_DATE_LIST: number[] = [];

export const USER_ID = '10002097';
export const PASSWD = 'Ryouma2518';

// export const USER_ID = '10003974';
// export const PASSWD = 'Cycling0818@';

export const RETRY_USER_ID = '10001498';
export const RETRY_PASSWD = 'hagayuk01!';
