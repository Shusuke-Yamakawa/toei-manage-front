import { prisma } from '@/src/app/_lib/prisma';
import { currentDate } from '@/src/app/_utils/date';

export type GetCourt = {
  card_id: string;
  year: number;
  month: number;
  day: number;
  from_time: number;
  to_time: number;
  court: string;
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
  });

export const findGetCourtOverCurrentCourt = async () => {
  const date = currentDate();
  const month = date.month() + 1;
  let nextMonths = month;
  if (month === 12) {
    nextMonths = 1;
  } else {
    nextMonths = month + 1;
  }
  const day = date.date();
  return prisma.getCourt.findMany({
    where: {
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
    },
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
