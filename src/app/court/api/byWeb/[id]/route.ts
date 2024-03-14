import { deleteCourt } from '@/src/app/court/api/byWeb/deleteCourt';
import { deleteCourtNew } from '@/src/app/court/api/byWeb/deleteCourt-new';

export const dynamic = 'force-dynamic';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await deleteCourt(Number(params.id));
  if (!result) {
    return new Response(JSON.stringify({ error: 'Failed to delete court' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response(JSON.stringify({ message: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
