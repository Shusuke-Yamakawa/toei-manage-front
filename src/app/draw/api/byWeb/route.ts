import { drawCourt } from '@/src/app/draw/api/byWeb/drawCourt';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { day, fromTime, toTime, court, drawCount } = await req.json();
  const result = await drawCourt({ day, fromTime, toTime, court, drawCount });
  return new Response(JSON.stringify({ message: result }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
