import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}



const COOKIE_DOMAIN = ".runambiz.com";
const REMEMBER_KEY = "runambiz-remember";
const ONE_YEAR = 31536000;
const CHUNK_SIZE = 3000;
 
 
function writeCookie(key, value, maxAge) {
 
  let cookie =
    `${key}=${encodeURIComponent(value)}` +
    `; domain=${COOKIE_DOMAIN}` +
    `; path=/` +
    `; secure; samesite=lax`;
 
  if (typeof maxAge === "number") {
    cookie += `; max-age=${maxAge}`;
  }
 
  document.cookie = cookie;
}
 
 
function readCookie(key) {
  const safe = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp(`(^|;\\s*)${safe}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[2]) : null;
}
 
 
function clearCookie(key) {
 
  writeCookie(key, "", 0);
 
  for (let i = 0; i < 20; i++) {
    if (readCookie(`${key}.${i}`) === null) break;
    writeCookie(`${key}.${i}`, "", 0);
  }
 
}
 
 
const authStorage = {
 
  getItem(key) {
 
    const single = readCookie(key);
    if (single !== null && single !== "") {
      return single;
    }
 
    let out = "";
 
    for (let i = 0; i < 20; i++) {
      const part = readCookie(`${key}.${i}`);
      if (part === null) break;
      out += part;
    }
 
    return out || null;
 
  },
 
  setItem(key, value) {
 
    const remember = readCookie(REMEMBER_KEY) !== "false";
    const age = remember ? ONE_YEAR : undefined;
 
    clearCookie(key);
 
    if (value.length <= CHUNK_SIZE) {
      writeCookie(key, value, age);
      return;
    }
 
    for (let i = 0; i * CHUNK_SIZE < value.length; i++) {
      writeCookie(
        `${key}.${i}`,
        value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
        age
      );
    }
 
  },
 
  removeItem(key) {
    clearCookie(key);
  }
 
};
 



export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "implicit",
  },
});

/* The auth page lives on the marketing site, so every redirect
   out of this app needs an absolute URL — a relative "/auth"
   resolves to app.runambiz.com and 404s. */

export const AUTH_ORIGIN = "https://www.runambiz.com";
export const authUrl = (mode = "login") => `${AUTH_ORIGIN}/auth?mode=${mode}`;

export async function signOut() {
  await supabase.auth.signOut();
  window.location.href = authUrl("login");
}
