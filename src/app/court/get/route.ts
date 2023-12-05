import { login } from '@/src/app/_utils/login';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id') || undefined;
  const password = searchParams.get('password') || undefined;
  // DBから取得したユーザーIDとパスワードを渡す
  login(id, password);

  return Response.json({ message: 'Hello world' });
}
