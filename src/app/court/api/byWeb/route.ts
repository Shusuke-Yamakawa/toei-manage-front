import { getCourt } from '@/src/app/court/api/byWeb/getCourt';

export const dynamic = 'force-dynamic';

export async function GET() {
  const msg = await getCourt();
  return new Response(JSON.stringify({ message: msg }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
