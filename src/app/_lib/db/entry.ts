import { prisma } from '@/src/app/_lib/prisma';

export type Entry = {
  card_id: string;
  court_id: number;
  possibility: string;
  comment: string;
};

export const deleteEntryByIds = async (ids: number[]) =>
  prisma.entry.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
