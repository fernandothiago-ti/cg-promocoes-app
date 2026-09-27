import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ncuhndyrluiqpdfcnton.supabase.co';
const supabaseAnonKey = 'sb_publishable_t9u6I1ltXOY6HwEI3bslVw_LgTuLIPw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});