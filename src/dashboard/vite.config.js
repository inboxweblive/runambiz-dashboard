import {
  defineConfig
} from "vite";

import react from
  "@vitejs/plugin-react";

import {
  resolve
} from "path";


export default defineConfig({

  plugins: [
    react()
  ],


  build: {

    rollupOptions: {

      input: {

        home:
          resolve(
            __dirname,
            "index.html"
          ),

        auth:
          resolve(
            __dirname,
            "auth.html"
          ),

        onboarding:
          resolve(
            __dirname,
            "onboarding.html"
          ),

        dashboard:
          resolve(
            __dirname,
            "dashboard.html"
          ),

              store:
          resolve(
            process.cwd(),
            "store.html"
          ),

        documentation:
          resolve(
            __dirname,
            "documentation.html"
          ),

        privacy:
          resolve(
            __dirname,
            "privacy.html"
          ),

        terms:
          resolve(
            __dirname,
            "terms.html"
          ),

        resetPassword:
          resolve(
            __dirname,
            "reset-password.html"
          )

      }

    }

  }

});