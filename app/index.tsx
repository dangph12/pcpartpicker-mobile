/* eslint-disable import/no-unresolved */
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-url-polyfill/auto';
import Account from '~/components/Account';
import Auth from '~/components/Auth';
import { supabase } from '~/lib/subpabase';

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
  }, []);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {session ? <Account key={session.user.id} session={session} /> : <Auth />}
    </View>
  );
}
