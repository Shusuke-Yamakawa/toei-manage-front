import { prisma } from '@/src/app/_lib/prisma';

export type Card = {
  card_id: string;
  password: string;
  user_nm: string;
  available_flg: boolean;
  note: string;
};

export const createCard = async (params: Card) => prisma.card.create({ data: params });

export const findCardById = async (cardId: string) =>
  prisma.card.findUnique({
    where: {
      card_id: cardId,
    },
  });
