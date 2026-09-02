import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables."
  );
}


/*
  Shared storage.

  auth.html writes the session to sessionStorage when
  "Remember me" is unchecked. Without this adapter the
  React app only reads localStorage, finds nothing, and
  bounces back to auth — which then bounces back here.

  Reading checks both stores, so both pages agree.
*/

const REMEMBER_KEY =
  "runambiz-remember";


const authStorage = {

  getItem(key) {

    return (
      localStorage.getItem(key) ||
      sessionStorage.getItem(key)
    );

  },


  setItem(key, value) {

    const remember =
      localStorage.getItem(REMEMBER_KEY) !== "false";


    if (remember) {

      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);

    } else {

      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);

    }

  },


  removeItem(key) {

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

  }

};


export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: authStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "implicit"
    }
  }
);