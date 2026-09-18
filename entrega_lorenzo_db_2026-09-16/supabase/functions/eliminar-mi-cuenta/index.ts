import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
import { createDeleteAccountHandler } from './handler.mjs';

const url = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const admin = url && serviceKey
  ? createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  : null;

const allowedOrigins = (
  Deno.env.get('ALLOWED_ORIGINS') ?? 'https://dolaritosep.netlify.app'
).split(',').map((origin) => origin.trim()).filter(Boolean);

Deno.serve(createDeleteAccountHandler({ admin, allowedOrigins }));
