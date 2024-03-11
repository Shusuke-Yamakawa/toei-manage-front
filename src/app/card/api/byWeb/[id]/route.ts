import { favoriteAddDraw } from '@/src/app/card/api/byWeb/favoriteAdd';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await favoriteAddDraw(params.id);
  // await favoriteAddReserve(params.id);

  return new Response(JSON.stringify({ message: 'favoriteAddDraw' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
