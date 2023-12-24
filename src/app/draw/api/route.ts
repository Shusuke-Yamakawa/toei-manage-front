import { findDrawNextMonthCourt } from '@/src/app/_lib/db/draw';

export const dynamic = 'force-dynamic';

export async function GET() {
  const draw = await findDrawNextMonthCourt();
  return new Response(JSON.stringify({ message: draw }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
