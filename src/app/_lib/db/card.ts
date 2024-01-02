import { prisma } from '@/src/app/_lib/prisma';

export type Card = {
  card_id: string;
  password: string;
  user_nm: string;
  available_flg: boolean;
  draw_flg: boolean;
  note: string;
};

export const createCard = async (params: Card) => prisma.card.create({ data: params });

export const updateCardDrawFlg = async (cardId: string) =>
  prisma.card.update({
    where: {
      card_id: cardId,
    },
    data: {
      draw_flg: false,
    },
  });

export const findCardAll = async () => prisma.card.findMany();

export const findCardById = async (cardId: string) =>
  prisma.card.findUnique({
    where: {
      card_id: cardId,
    },
  });

export const findCardCanDraw = async () =>
  prisma.card.findMany({
    where: {
      AND: [{ available_flg: true }, { draw_flg: true }],
    },
  });
