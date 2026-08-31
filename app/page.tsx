import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const TOKEN_KEY = 'makromedia_auth_token';

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;

  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
