import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const getEnv = (key: string) => import.meta.env[key] || '';

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || getEnv('PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || getEnv('PUBLIC_SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : new Proxy({}, {
      get: (target, prop) => {
        // Allow common JS/TS symbols and inspection props to pass through if necessary,
        // but for actual Supabase methods, throw a helpful error.
        if (typeof prop === 'string' && !prop.startsWith('_') && prop !== 'then') {
          throw new Error(
            `Supabase client accessed but VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY is missing. ` +
            `If this is during build, ensure these are set in Cloudflare Build environment variables.`
          );
        }
        return (target as any)[prop];
      }
    }) as any;

