import { getCourt } from '@/src/app/court/api/byWeb/getCourt';
import { getCourtNew } from '@/src/app/court/api/byWeb/getCourt-new';

export const dynamic = 'force-dynamic';

export async function GET() {
  const msg = await getCourt();
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
