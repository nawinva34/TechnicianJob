'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import liff from '@line/liff';

interface LIFFContextType {
  liff: typeof liff | null;
  liffError: string | null;
  profile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  } | null;
  loading: boolean;
}

const LIFFContext = createContext<LIFFContextType>({
  liff: null,
  liffError: null,
  profile: null,
  loading: true,
});

export const useLIFF = () => useContext(LIFFContext);

export function LIFFProvider({ children }: { children: React.ReactNode }) {
  const [liffInstance, setLiffInstance] = useState<typeof liff | null>(null);
  const [liffError, setLiffError] = useState<string | null>(null);
  const [profile, setProfile] = useState<LIFFContextType['profile']>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          throw new Error('NEXT_PUBLIC_LIFF_ID is not set');
        }

        await liff.init({ liffId });
        setLiffInstance(liff);

        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const userProfile = await liff.getProfile();
          setProfile({
            userId: userProfile.userId,
            displayName: userProfile.displayName,
            pictureUrl: userProfile.pictureUrl,
          });
        }
      } catch (error: any) {
        console.error('LIFF init failed', error);
        setLiffError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initLiff();
  }, []);

  return (
    <LIFFContext.Provider
      value={{
        liff: liffInstance,
        liffError,
        profile,
        loading,
      }}
    >
      {children}
    </LIFFContext.Provider>
  );
}
