
import { useEffect, useState, useCallback } from "react";

import {
  Check,
  Copy,
  Globe2,
  Loader2,
  Sparkles,
  Trash2,
  TriangleAlert
} from "lucide-react";

import { supabase } from "../../lib/supabase";


export default function CustomDomainSection({
  business,
  canUseCustomDomain = false,
  onNavigate,
  onBusinessChanged
}) {

  const [input, setInput] = useState("");
  const [domain, setDomain] = useState(business?.custom_domain || "");
  const [status, setStatus] = useState(business?.custom_domain_status || "none");
  const [records, setRecords] = useState([]);

  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");


  /* Every call needs the user's access token — the function
     verifies they actually own this business. */

  const callApi = useCallback(async (action, extra = {}) => {

    const { data: sessionData } = await supabase.auth.getSession();

    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error("Your session has expired. Sign in again.");
    }

    const response = await fetch("/api/domains", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        action,
        businessId: business.id,
        ...extra
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error || "Something went wrong.");
    }

    return result;

  }, [business?.id]);


  /* Poll while pending. DNS can take minutes or hours, so
     this checks every 20 seconds rather than hammering. */

  useEffect(() => {

    if (status !== "pending" || !domain) {
      return;
    }

    let cancelled = false;

    async function check() {

      try {

        const result = await callApi("status");

        if (cancelled) return;

        setStatus(result.status);
        setRecords(result.records || []);

        if (result.status === "active" && onBusinessChanged) {
          const { data } = await supabase
            .from("businesses")
            .select("*")
            .eq("id", business.id)
            .single();

          if (data) await onBusinessChanged(data);
        }

      } catch {
        /* Network blip. The next tick retries. */
      }

    }

    check();

    const timer = setInterval(check, 20000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };

  }, [status, domain, callApi, business?.id, onBusinessChanged]);


  async function connect() {

    setError("");

    if (!input.trim()) {
      setError("Enter the domain you want to connect.");
      return;
    }

    setBusy(true);

    try {

      const result = await callApi("add", { domain: input.trim() });

      setDomain(result.domain);
      setStatus(result.status);
      setRecords(result.records || []);
      setInput("");

    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }

  }


  async function checkNow() {

    setError("");
    setChecking(true);

    try {

      const result = await callApi("status");

      setStatus(result.status);
      setRecords(result.records || []);

      if (result.status === "pending") {
        setError(
          "DNS hasn't updated yet. This can take up to 48 hours."
        );
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }

  }


  async function disconnect() {

    const ok = window.confirm(
      `Disconnect ${domain}? Your store stays available at its Runambiz address.`
    );

    if (!ok) return;

    setError("");
    setBusy(true);

    try {

      await callApi("remove");

      setDomain("");
      setStatus("none");
      setRecords([]);

    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }

  }


  async function copyValue(value) {

    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* Clipboard blocked — the value is visible anyway. */
    }

  }


  return (

    <section className="store-section-card">

      <div className="store-section-heading">

        <div className="store-section-icon">
          <Globe2 size={19} />
        </div>

        <div>
          <h2>Custom domain</h2>
          <p>
            Use a domain you own instead of your Runambiz
            address. You buy the domain from any registrar,
            then point it here.
          </p>
        </div>

      </div>


      <div className="store-section-content">


        {/* ===============================================
            FREE PLAN — nothing connected yet
        ================================================ */}

        {status === "none" && !canUseCustomDomain && (

          <>

            <div className="store-free-explanation">

              <Sparkles size={17} />

              <div>

                <strong>
                  Available on paid plans
                </strong>

                <span>
                  Connect a domain you own — like
                  yourbusiness.com — so customers see your
                  brand instead of a Runambiz address. Your
                  free storefront link keeps working either
                  way.
                </span>

              </div>

            </div>


            <button
              type="button"
              className="store-save-main"
              onClick={() => onNavigate?.("Plans & Billing")}
            >
              <Sparkles size={16} />
              See plans
            </button>

          </>

        )}


        {/* ===============================================
            PAID PLAN — connect form
        ================================================ */}

        {status === "none" && canUseCustomDomain && (

          <>

            <div className="store-field">

              <label htmlFor="custom-domain-input">
                Your domain
              </label>

              <input
                id="custom-domain-input"
                type="text"
                value={input}
                placeholder="shop.yourbusiness.com"
                disabled={busy}
                onChange={event => setInput(event.target.value)}
              />

              <small>
                Enter it without https:// — for example
                mystore.com or shop.mystore.com
              </small>

            </div>


            <button
              type="button"
              className="store-save-main"
              disabled={busy}
              onClick={connect}
            >

              {busy ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Connecting
                </>
              ) : (
                <>
                  <Globe2 size={16} />
                  Connect domain
                </>
              )}

            </button>

          </>

        )}


        {/* ===============================================
            CONNECTED — pending or active

            Deliberately NOT gated. A merchant whose plan
            lapses keeps full control of a domain they
            already connected: they can see it, check it,
            and disconnect it. Locking someone out of a
            live store URL because a payment failed turns
            a billing problem into a support crisis.
        ================================================ */}

        {status !== "none" && (

          <>

            <div className="store-info-card">

              <strong>{domain}</strong>

              <p>
                {status === "active"
                  ? "Connected and serving your store."
                  : "Waiting for your DNS to update."}
              </p>

            </div>


            {status === "pending" && (

              <>

                <div className="support-notice">

                  <TriangleAlert size={17} />

                  <div>
                    <strong>Add this record at your registrar</strong>
                    <span>
                      Go to wherever you bought the domain,
                      open its DNS settings, and add the
                      record below. Changes can take up to 48
                      hours to reach everyone.
                    </span>
                  </div>

                </div>


                {records.map(record => (

                  <div
                    key={record.type + record.host}
                    className="store-repeat-card"
                  >

                    <DnsRow
                      label="Type"
                      value={record.type}
                      copied={copied}
                      onCopy={copyValue}
                    />

                    <DnsRow
                      label="Name / Host"
                      value={record.host}
                      copied={copied}
                      onCopy={copyValue}
                    />

                    <DnsRow
                      label="Value"
                      value={record.value}
                      copied={copied}
                      onCopy={copyValue}
                    />

                  </div>

                ))}


                <button
                  type="button"
                  className="store-mini-button"
                  disabled={checking}
                  onClick={checkNow}
                >

                  {checking ? (
                    <>
                      <Loader2 size={14} className="spin" />
                      Checking
                    </>
                  ) : (
                    "Check now"
                  )}

                </button>

              </>

            )}


            {status === "active" && (

              <div className="payment-submitted-success">

                <div className="payment-submitted-check">
                  <Check size={20} />
                </div>

                <div>
                  <strong>Your domain is live</strong>
                  <span>
                    Customers can now reach your store at{" "}
                    {domain}. Your Runambiz address still
                    works too.
                  </span>
                </div>

              </div>

            )}


            <button
              type="button"
              className="store-remove-asset"
              disabled={busy}
              onClick={disconnect}
            >
              <Trash2 size={14} />
              Disconnect domain
            </button>

          </>

        )}


        {error && (
          <div className="store-page-error">
            {error}
          </div>
        )}


      </div>

    </section>

  );

}


function DnsRow({ label, value, copied, onCopy }) {

  return (

    <div className="store-field">

      <label>{label}</label>

      <div style={{ display: "flex", gap: "8px" }}>

        <input
          readOnly
          value={value}
          onFocus={event => event.target.select()}
        />

        <button
          type="button"
          className="store-mini-button"
          aria-label={`Copy ${label}`}
          onClick={() => onCopy(value)}
        >
          {copied === value ? <Check size={14} /> : <Copy size={14} />}
        </button>

      </div>

    </div>

  );

}
