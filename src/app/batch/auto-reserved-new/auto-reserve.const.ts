import { Court } from '@/src/app/batch/auto-reserved-new/auto-reserve.type';

export const TARGET_COURT_MAIN = [
  {
    name: '野川公園',
    value: '1260',
  },
] as const satisfies Court[];

export const TARGET_COURT_SUB = [
  // {
  //   name: '井の頭恩賜公園',
  //   value: '1220',
  // },
  {
    name: '小金井公園',
    value: '1240',
  },
  {
    name: '府中の森公園',
    value: '1270',
  },
  // {
  //   name: '武蔵野中央公園',
  //   value: '1230',
  // },
] as const satisfies Court[];

export const EXCLUDE_DAY_LIST: number[] = [];

export const DESIRED_RESERVATION_DATE_LIST: number[] = [];

// 10000973 Aa00620513
// 10002865 I-am-always-hangover
// 10003498 Oomiya0911
// 10004025 wiHpar-joxrym-xazqy9 yamamoto
// 10002097 Ryouma2518
// 10001197 Tennis0503
// 10001371 Agoago0223
// 10001498 hagayuk01!
// 10003974 Cycling0818@
// 10004678 4uFgP7JZLg kuma

export const USER_ID = '10002865';
export const PASSWD = 'I-am-always-hangover';

export const RETRY_USER_ID = '10001498';
export const RETRY_PASSWD = 'hagayuk01!';
