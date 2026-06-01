'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SpaRedirectHandler() {
  const router = useRouter();
  useEffect(() => {
    const redirect = sessionStorage.getItem('ghpages_redirect');
    if (redirect) {
      sessionStorage.removeItem('ghpages_redirect');
      if (redirect && redirect !== '/') {
        router.replace(redirect);
      }
    }
  }, [router]);
  return null;
}
