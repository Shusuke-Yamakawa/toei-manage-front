import { calculateOddsDrawNextMonthCourt } from '@/src/app/draw/api/byWeb/odds/calculateOddsDrawNextMonthCourt';

export const dynamic = 'force-dynamic';

export async function GET() {
  const odds = await calculateOddsDrawNextMonthCourt();
  return new Response(JSON.stringify({ message: odds }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
