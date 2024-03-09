import { prisma } from '@/src/app/_lib/prisma';

export type MitakaCourt = {
  year: number;
  month: number;
  day: number;
  from_time: number;
  to_time: number;
  detect_count: number;
};

export const createMitakaCourt = async (params: MitakaCourt) =>
  prisma.mitakaCourt.create({ data: params });

export const findMitakaCourtByKey = async ({
  year,
  month,
  day,
  from_time,
  to_time,
}: Omit<MitakaCourt, 'detect_count'>) =>
  prisma.mitakaCourt.findUnique({
    where: {
      mitaka_court: {
        year,
        month,
        day,
        from_time,
        to_time,
      },
    },
  });

export const updateMitakaCourt = async ({ id }: { id: number }) =>
  prisma.mitakaCourt.update({
    where: { id },
    data: {
      detect_count: {
        increment: 1,
      },
    },
  });
