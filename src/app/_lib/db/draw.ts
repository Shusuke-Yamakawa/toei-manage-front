import { prisma } from '@/src/app/_lib/prisma';
import { currentDate } from '@/src/app/_utils/date';

export type Draw = {
  card_id: string;
  year: number;
  month: number;
  day: number;
  from_time: number;
  to_time: number;
  court: string;
  confirm_flg: boolean;
};

type Id = {
  id: number;
};

type CardIds = {
  cardIds: string[];
};

export const createDraw = async (params: Draw) => prisma.draw.create({ data: params });

export const deleteDrawById = async ({ id }: Id) =>
  prisma.draw.delete({
    where: {
      id,
    },
  });

export const deleteDrawCurrentMonthBySpecialIds = async ({ cardIds }: CardIds) => {
  const date = currentDate();
  const month = date.month() + 1;
  return prisma.draw.deleteMany({
    where: {
      AND: [{ card_id: { in: cardIds }, month }],
    },
  });
};

export const findDrawById = async (id: number) =>
  prisma.draw.findUnique({
    where: {
      id,
    },
  });

export const findDrawNextMonthCourt = async () => {
  const date = currentDate();
  const month = date.month() + 1;
  let nextMonths = month;
  if (month === 12) {
    nextMonths = 1;
  } else {
    nextMonths = month + 1;
  }
  return prisma.draw.findMany({
    where: {
      AND: [
        {
          year: {
            gte: date.year(),
          },
        },
        {
          month: nextMonths,
        },
      ],
    },
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
