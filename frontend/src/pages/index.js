import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">WhatsApp Broadcast Platform</h1>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
