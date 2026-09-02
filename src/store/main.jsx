import React from "react";

import {
  createRoot
} from "react-dom/client";

import PublicStore
  from "./PublicStore";

import "./storefront.css";


createRoot(
  document.getElementById(
    "store-root"
  )
).render(

  <React.StrictMode>

    <PublicStore />

  </React.StrictMode>

);