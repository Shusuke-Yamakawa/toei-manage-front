import { prisma } from '@/src/app/_lib/prisma';

export type GetCourt = {
  card_id: string;
  year: number;
  month: number;
  day: number;
  from_time: number;
  to_time: number;
  court: string;
};

export const createGetCourt = async (params: GetCourt) => prisma.getCourt.create({ data: params });
