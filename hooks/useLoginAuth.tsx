'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from './useUserSession';

export function useLoginAuth() {
  const { user, saveUser, loading } = useUserSession();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/'); // اگر لاگین کرده بود، مستقیم بفرستش صفحه اصلی
    }
  }, [user, loading, router]);

  return { user, saveUser, loading };
}
