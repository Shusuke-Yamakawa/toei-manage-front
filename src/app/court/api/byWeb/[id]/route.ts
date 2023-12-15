import { deleteCourt } from '@/src/app/court/api/byWeb/deleteCourt';
import { getCourt } from '@/src/app/court/api/byWeb/getCourt';

export const dynamic = 'force-dynamic';

export async function GET() {
  const msg = await getCourt();
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const msg = await deleteCourt(Number(params.id));
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
