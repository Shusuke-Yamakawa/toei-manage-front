import { prisma } from '@/src/app/_lib/prisma';

export type Guest = {
  guest_nm: string;
  entry_id: number;
};

export const findGuestByEntryIds = async (entryIds: number[]) =>
  prisma.guest.findMany({
    where: {
      entry_id: {
        in: entryIds,
      },
    },
  });

export const deleteGuestByIds = async (ids: number[]) =>
  prisma.guest.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
