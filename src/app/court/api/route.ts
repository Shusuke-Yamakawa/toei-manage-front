import { findGetCourtOverCurrentCourt } from '@/src/app/_lib/db/getCourt';

export const dynamic = 'force-dynamic';

export async function GET() {
  const getCourt = await findGetCourtOverCurrentCourt();

  return new Response(JSON.stringify({ message: getCourt }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
