import { prisma } from '@/src/app/_lib/prisma';

export type Guest = {
  guest_nm: string;
  entry_id: number;
};

export const findGuestByCourtId = async (courtId: number) =>
  prisma.guest.findMany({
    where: {
      court_id: courtId,
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
