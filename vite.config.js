import {
  defineConfig
} from "vite";

import react from
  "@vitejs/plugin-react";

import {
  resolve
} from "path";


const root =
  import.meta.dirname;


export default defineConfig({

  plugins: [
    react()
  ],


  build: {

    rollupOptions: {

      input: {

        home:
          resolve(root, "index.html"),

        auth:
          resolve(root, "auth.html"),

        onboarding:
          resolve(root, "onboarding.html"),

        dashboard:
          resolve(root, "dashboard.html"),

        store:
          resolve(root, "store.html"),

        admin:
          resolve(root, "admin.html"),

        documentation:
          resolve(root, "documentation.html"),

          claim: resolve(root, "claim.html"),

        privacy:
          resolve(root, "privacy.html"),

        terms:
          resolve(root, "terms.html"),

        resetPassword:
          resolve(root, "reset-password.html")

      }

    }

  }

});
