import React from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";

import "./dashboard.css";


createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <App />

  </React.StrictMode>

);

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    function() {

      navigator.serviceWorker
        .register("/sw.js")
        .then(function(registration) {

          console.log(
            "Runambiz service worker registered:",
            registration.scope
          );

        })
        .catch(function(error) {

          console.error(
            "Runambiz service worker registration failed:",
            error
          );

        });

    }
  );

}