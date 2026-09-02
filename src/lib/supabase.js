import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

/*
  Cross-subdomain session storage.

  The auth page is on www.runambiz.com, this app is on
  app.runambiz.com. Different origins, so localStorage
  can't be shared. Cookies scoped to .runambiz.com can.

  This adapter must stay byte-for-byte compatible with the
  one in auth.js on the marketing site — same domain, same
  encoding, same remember-me key. If they drift, the session
  written there won't be found here and you get a redirect
  loop.
*/

const COOKIE_DOMAIN = ".runambiz.com";
const REMEMBER_KEY = "runambiz-remember";
const ONE_YEAR = 31536000;

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

const authStorage = {
  getItem(key) {
    return readCookie(key);
  },
  setItem(key, value) {
    const remember = readCookie(REMEMBER_KEY) !== "false";
    writeCookie(key, value, remember ? ONE_YEAR : undefined);
  },
  removeItem(key) {
    writeCookie(key, "", 0);
  },
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
