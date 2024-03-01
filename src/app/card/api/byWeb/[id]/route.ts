import { favoriteAddDraw } from '@/src/app/card/api/byWeb/favoriteAddDraw';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await favoriteAddDraw(params.id);
  return new Response(JSON.stringify({ message: 'favoriteAddDraw' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
