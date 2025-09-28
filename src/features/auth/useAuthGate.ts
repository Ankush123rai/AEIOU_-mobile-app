import { useEffect, useState } from 'react';
import { initGoogle, getStoredUser, signInWithGoogle } from '../../core/auth/google';
import { ENV } from '../../config/env';
// import { useAppDispatch } from '../../state/store';
import { setUser } from '../../state/slices/userSlice';

export function useAuthGate() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
//   const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      try {
        initGoogle();
        let user = await getStoredUser();
        if (!user) {
          user = await signInWithGoogle();
        }
        const email = (user?.email || '').toLowerCase();
        setIsAdmin(ENV.ADMIN_EMAILS.includes(email));
        // dispatch(setUser({
        //   name: user?.name,
        //   email: user?.email,
        //   photo: (user as any)?.photo,
        //   progress: { listening: 0, speaking: 0, reading: 0, writing: 0 },
        // }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { loading, isAdmin };
}
