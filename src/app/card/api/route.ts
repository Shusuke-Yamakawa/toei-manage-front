import { findCardAll } from '@/src/app/_lib/db/card';

export const dynamic = 'force-dynamic';

export async function GET() {
  const card = await findCardAll();

  return new Response(JSON.stringify({ message: card }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
