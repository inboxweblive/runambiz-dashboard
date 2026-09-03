/* =========================================================
   RUNAMBIZ — CUSTOM DOMAIN API

   Place at:  api/domains.js  (repo root, NOT src/)

   Vercel turns any file under /api into a serverless
   function automatically. This works on the Hobby plan.

   The Vercel token can add and remove domains on your whole
   account, so it must never reach the browser. Everything
   here runs server-side.

   Required environment variables on the dashboard project:

     VERCEL_TOKEN                account token
     VERCEL_PROJECT_ID           the dashboard project's ID
     VERCEL_TEAM_ID              only if the project sits in a team
     SUPABASE_URL                same value as VITE_SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY   service role, NOT the anon key

   Note these have no VITE_ prefix — that prefix is what
   exposes a variable to the client bundle, which is exactly
   what we're avoiding.
========================================================= */

import { createClient } from "@supabase/supabase-js";


const VERCEL_API = "https://api.vercel.com";


function teamQuery() {
  return process.env.VERCEL_TEAM_ID
    ? `?teamId=${process.env.VERCEL_TEAM_ID}`
    : "";
}


function vercelHeaders() {
  return {
    Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
    "Content-Type": "application/json"
  };
}


/* ---------------------------------------------------------
   Normalise whatever the merchant typed.

   People paste "https://www.shop.com/" and expect it to
   work. Strip it down to a bare hostname.
--------------------------------------------------------- */

function normaliseDomain(input) {

  let value = String(input || "").trim().toLowerCase();

  value = value.replace(/^https?:\/\//, "");
  value = value.split("/")[0];
  value = value.split("?")[0];
  value = value.replace(/\.$/, "");

  return value;
}


function isValidDomain(value) {

  /* Letters, digits, hyphens, at least one dot, and a TLD of
     two or more letters. Deliberately strict — a bad domain
     that reaches Vercel comes back as an opaque error. */

  return /^(?!-)[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})*\.[a-z]{2,}$/
    .test(value);
}


/* ---------------------------------------------------------
   Confirm the caller owns the business they're editing.

   Without this, any signed-in user could attach a domain to
   somebody else's store.
--------------------------------------------------------- */

async function authorise(request, admin, businessId) {

  const header = request.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { error: "Not signed in.", status: 401 };
  }

  const { data: userData, error: userError } =
    await admin.auth.getUser(token);

  if (userError || !userData?.user) {
    return { error: "Your session has expired.", status: 401 };
  }

  const { data: business, error: businessError } =
    await admin
      .from("businesses")
      .select("id, owner_id, custom_domain, custom_domain_status")
      .eq("id", businessId)
      .maybeSingle();

  if (businessError) {
    return { error: businessError.message, status: 500 };
  }

  if (!business) {
    return { error: "Business not found.", status: 404 };
  }

  if (business.owner_id !== userData.user.id) {
    return { error: "You don't own this business.", status: 403 };
  }

  return { business };
}


/* =========================================================
   HANDLER
========================================================= */

export default async function handler(request, response) {

  if (request.method !== "POST") {
    return response
      .status(405)
      .json({ error: "Method not allowed." });
  }

  const missing = [
    "VERCEL_TOKEN",
    "VERCEL_PROJECT_ID",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY"
  ].filter(key => !process.env[key]);

  if (missing.length) {
    console.error("Missing env vars:", missing.join(", "));
    return response
      .status(500)
      .json({ error: "Domain service is not configured." });
  }

  const admin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { action, businessId, domain } = request.body || {};

  if (!action || !businessId) {
    return response
      .status(400)
      .json({ error: "Missing action or businessId." });
  }

  const auth = await authorise(request, admin, businessId);

  if (auth.error) {
    return response
      .status(auth.status)
      .json({ error: auth.error });
  }

  const business = auth.business;

  try {

    if (action === "add") {
      return await addDomain(response, admin, business, domain);
    }

    if (action === "status") {
      return await checkDomain(response, admin, business);
    }

    if (action === "remove") {
      return await removeDomain(response, admin, business);
    }

    return response
      .status(400)
      .json({ error: "Unknown action." });

  } catch (err) {

    console.error("Domain API error:", err);

    return response
      .status(500)
      .json({ error: "Something went wrong. Please try again." });

  }

}


/* =========================================================
   ADD
========================================================= */

async function addDomain(response, admin, business, rawDomain) {

  const name = normaliseDomain(rawDomain);

  if (!isValidDomain(name)) {
    return response
      .status(400)
      .json({ error: "That doesn't look like a valid domain." });
  }

  if (name.endsWith(".runambiz.com")) {
    return response
      .status(400)
      .json({ error: "Use a domain you own, not a runambiz.com address." });
  }

  /* Claimed by another merchant? Check before calling Vercel
     so the error is meaningful instead of a 409 from the API. */

  const { data: taken } = await admin
    .from("businesses")
    .select("id")
    .eq("custom_domain", name)
    .neq("id", business.id)
    .maybeSingle();

  if (taken) {
    return response
      .status(409)
      .json({ error: "That domain is already connected to another store." });
  }

  /* If they're replacing an existing domain, release the old
     one from Vercel first — otherwise it keeps serving. */

  if (business.custom_domain && business.custom_domain !== name) {
    await releaseFromVercel(business.custom_domain);
  }

  const addResponse = await fetch(
    `${VERCEL_API}/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains${teamQuery()}`,
    {
      method: "POST",
      headers: vercelHeaders(),
      body: JSON.stringify({ name })
    }
  );

  const addResult = await addResponse.json();

  /* domain_already_in_use means it's attached to a different
     Vercel account entirely — the merchant has to remove it
     there first. Worth naming, because the generic message
     sends people in circles. */

  if (!addResponse.ok) {

    const code = addResult?.error?.code;

    const message =
      code === "domain_already_in_use"
        ? "This domain is already used by another Vercel account. Remove it there first."
        : addResult?.error?.message ||
          "Vercel rejected this domain.";

    return response.status(400).json({ error: message });
  }

  await admin
    .from("businesses")
    .update({
      custom_domain: name,
      custom_domain_status: "pending",
      custom_domain_added_at: new Date().toISOString(),
      custom_domain_verified_at: null
    })
    .eq("id", business.id);

  const config = await fetchConfig(name);

  return response.status(200).json({
    domain: name,
    status: "pending",
    records: dnsInstructions(name, config)
  });

}


/* =========================================================
   STATUS

   Called by the UI while the merchant sets up DNS. Vercel
   reports two separate things: whether we've verified they
   own it, and whether the DNS actually points at us.
========================================================= */

async function checkDomain(response, admin, business) {

  const name = business.custom_domain;

  if (!name) {
    return response
      .status(200)
      .json({ status: "none" });
  }

  const [detail, config] = await Promise.all([
    fetch(
      `${VERCEL_API}/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${name}${teamQuery()}`,
      { headers: vercelHeaders() }
    ).then(r => r.json()),
    fetchConfig(name)
  ]);

  const verified = detail?.verified === true;
  const misconfigured = config?.misconfigured !== false;

  const status =
    verified && !misconfigured
      ? "active"
      : "pending";

  /* Only write when it changes — this endpoint gets polled. */

  if (status !== business.custom_domain_status) {

    await admin
      .from("businesses")
      .update({
        custom_domain_status: status,
        custom_domain_verified_at:
          status === "active"
            ? new Date().toISOString()
            : null
      })
      .eq("id", business.id);

  }

  return response.status(200).json({
    domain: name,
    status,
    verified,
    misconfigured,
    records: dnsInstructions(name, config)
  });

}


/* =========================================================
   REMOVE
========================================================= */

async function removeDomain(response, admin, business) {

  if (business.custom_domain) {
    await releaseFromVercel(business.custom_domain);
  }

  await admin
    .from("businesses")
    .update({
      custom_domain: null,
      custom_domain_status: "none",
      custom_domain_added_at: null,
      custom_domain_verified_at: null
    })
    .eq("id", business.id);

  return response
    .status(200)
    .json({ status: "none" });

}


/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

async function releaseFromVercel(name) {

  try {

    await fetch(
      `${VERCEL_API}/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${name}${teamQuery()}`,
      { method: "DELETE", headers: vercelHeaders() }
    );

  } catch (err) {

    /* Already gone, or Vercel is down. Don't block the
       merchant from moving on — worst case an orphan domain
       sits on the project. */

    console.warn("Could not release domain:", name, err);

  }

}


async function fetchConfig(name) {

  try {

    const result = await fetch(
      `${VERCEL_API}/v6/domains/${name}/config${teamQuery()}`,
      { headers: vercelHeaders() }
    );

    return await result.json();

  } catch (err) {

    console.warn("Could not fetch domain config:", err);
    return null;

  }

}


/* An apex domain (shop.com) needs an A record; a subdomain
   (store.shop.com) needs a CNAME. Getting this backwards is
   the single most common reason merchant setups fail. */

function dnsInstructions(name, config) {

  const isApex = name.split(".").length === 2;

  if (isApex) {
    return [
      {
        type: "A",
        host: "@",
        value: "76.76.21.21"
      }
    ];
  }

  const subdomain = name.split(".")[0];

  return [
    {
      type: "CNAME",
      host: subdomain,
      value:
        config?.cnames?.[0] ||
        "cname.vercel-dns.com"
    }
  ];

}