// hooks/useAuth.js

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useAuth() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('loginToken');
      const isAuthPage = ['/auth/login', '/signup/signup', '/forgot-password', "/auth/verify-otp" , "/auth/reset-password" , "/auth/forgot-password-otp" ].includes(router.pathname);
      
      if (!token && !isAuthPage) {
        router.push('/auth/login');
      }
      
      if (token && isAuthPage) {
        router.push('/');
      }
    }
  }, [router.pathname]);
}