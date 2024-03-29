import { prisma } from '@/src/app/_lib/prisma';
import { currentDate } from '@/src/app/_utils/date';

export type GetCourtIncludeEntry = {
  id: number;
  entries: {
    id: number;
    card_id: string;
    court_id: number;
    possibility: string;
    comment: string;
  }[];
};

// TODO どこかのタイミングでキーを入れたい
// @@unique(fields: [reserve_no], name: "reserve_no_key")
export type GetCourt = {
  card_id: string;
  year: number;
  month: number;
  day: number;
  from_time: number;
  to_time: number;
  court: string;
  reserve_no: string;
  public_flg?: boolean;
  hold_flg?: boolean;
};

type Id = {
  id: number;
};

type CardIds = {
  cardIds: string[];
};

export const createGetCourt = async (params: GetCourt) => prisma.getCourt.create({ data: params });

export const deleteGetCourtById = async ({ id }: Id) =>
  prisma.getCourt.delete({
    where: {
      id,
    },
  });
export const deleteGetCourtBySpecialIds = async ({ cardIds }: CardIds) =>
  prisma.getCourt.deleteMany({
    where: {
      card_id: { in: cardIds },
    },
  });
export const deleteGetCourtCurrentMonthBySpecialIds = async ({ cardIds }: CardIds) => {
  const date = currentDate();
  const month = date.month() + 1;
  return prisma.getCourt.deleteMany({
    where: {
      AND: [{ card_id: { in: cardIds }, month }],
    },
  });
};

export const findGetCourtById = async (id: number) =>
  prisma.getCourt.findUnique({
    where: {
      id,
    },
    include: {
      card: true,
      entries: true, // 関連するentryも取得する
    },
  });

export const findGetCourtMany = async () =>
  prisma.getCourt.findMany({
    include: { card: true },
    orderBy: [
      { year: 'asc' },
      { month: 'asc' },
      { day: 'asc' },
      { from_time: 'asc' },
      { court: 'asc' },
      { card_id: 'asc' },
    ],
  });

/**
 * 現在日付以降のコート取得情報を取得する
 * @param cardIds 指定すると指定したカードID以外の情報を取得する
 */
export const findGetCourtOverCurrentCourt = async (cardIds?: string[]) => {
  const date = currentDate();
  const month = date.month() + 1;
  let nextMonths = month;
  if (month === 12) {
    nextMonths = 1;
  } else {
    nextMonths = month + 1;
  }
  const day = date.date();

  const whereConditions = {
    AND: [
      {
        year: {
          gte: date.year(),
        },
      },
      {
        OR: [
          {
            month: {
              gte: month,
            },
          },
          {
            month: nextMonths,
          },
        ],
      },
      {
        OR: [
          {
            day: {
              gte: day,
            },
          },
          {
            month: nextMonths,
          },
        ],
      },
    ],
  } as any;

  if (cardIds && cardIds.length > 0) {
    whereConditions.card_id = { not: { in: cardIds } };
  }

  return prisma.getCourt.findMany({
    where: whereConditions,
    include: { card: true },
    orderBy: [
      { year: 'asc' },
      { month: 'asc' },
      { day: 'asc' },
      { from_time: 'asc' },
      { court: 'asc' },
      { card_id: 'asc' },
    ],
  });
};

export const findGetCourtByDateAndHoldFlg = async ({
  year,
  month,
  day,
  osawaYear,
  osawaMonth,
  osawaDay,
}: {
  year: number;
  month: number;
  day: number;
  osawaYear: number;
  osawaMonth: number;
  osawaDay: number;
}) =>
  prisma.getCourt.findMany({
    where: {
      OR: [
        {
          year,
          month,
          day,
          hold_flg: false,
        },
        {
          year: osawaYear,
          month: osawaMonth,
          day: osawaDay,
          hold_flg: false,
          court: {
            startsWith: '大沢',
          },
        },
      ],
    },
    include: {
      card: true,
    },
  });

export const findGetCourtByDate = async (year: number, month: number, day: number) =>
  prisma.getCourt.count({
    where: {
      year,
      month,
      day,
    },
  });
