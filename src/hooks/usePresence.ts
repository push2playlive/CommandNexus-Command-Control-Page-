import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type UserPresence = {
  user_id: string;
  username: string;
  location: {
    lat: number;
    lng: number;
  };
  online_at: string;
};

export function usePresence(channelName: string = 'war-room') {
  const [presences, setPresences] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!import.meta.env.VITE_SUPABASE_URL) return;

    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: 'user',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: UserPresence[] = [];
        
        Object.values(state).forEach((presenceList: any) => {
          presenceList.forEach((p: any) => {
            users.push(p);
          });
        });
        
        setPresences(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Mock user for now
          const mockUser = {
            user_id: Math.random().toString(36).substring(7),
            username: `Agent_${Math.floor(Math.random() * 1000)}`,
            location: {
              lat: (Math.random() - 0.5) * 160,
              lng: (Math.random() - 0.5) * 360,
            },
            online_at: new Date().toISOString(),
          };
          
          await channel.track(mockUser);
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [channelName]);

  return presences;
}
