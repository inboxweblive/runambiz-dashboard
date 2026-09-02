import {
  useEffect,
  useState
} from "react";

import {
  Bot,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MessageCircle,
  Plug,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


export default function Channels({
  business,
  onNavigate
}) {


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    connection,
    setConnection
  ] =
    useState(null);


  const [
    botToken,
    setBotToken
  ] =
    useState("");


  const [
    connecting,
    setConnecting
  ] =
    useState(false);


  const [
    savingConfig,
    setSavingConfig
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    success,
    setSuccess
  ] =
    useState("");



  async function loadConnection() {

    if (!business?.id) {
      return;
    }


    setLoading(true);


    try {

      const {
        data,
        error: loadError
      } =
        await supabase
          .from("channel_connections")
          .select(`
            id,
            channel,
            status,
            display_name,
            provider_username,
            config,
            connected_at
          `)
          .eq("business_id", business.id)
          .eq("channel", "telegram")
          .maybeSingle();


      if (loadError) {
        throw loadError;
      }


      setConnection(data || null);


    } catch (err) {

      setError(
        err?.message ||
        "We couldn't load your channels."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(
    () => {
      loadConnection();
    },
    [business?.id]
  );



  async function connectTelegram() {

    const token = botToken.trim();


    if (!token) {
      setError("Paste the bot token from BotFather.");
      return;
    }


    setError("");
    setSuccess("");
    setConnecting(true);


    try {

      const {
        data,
        error: invokeError
      } =
        await supabase
          .functions
          .invoke(
            "telegram-connect",
            {
              body: {
                businessId: business.id,
                action: "connect",
                botToken: token
              }
            }
          );


      if (invokeError) {
        throw invokeError;
      }


      if (!data?.success) {
        throw new Error(
          data?.error ||
          "We couldn't connect Telegram."
        );
      }


      setBotToken("");

      setSuccess(
        "Telegram connected. Now tap Start in your bot so alerts reach you."
      );

      await loadConnection();


    } catch (err) {

      setError(
        err?.message ||
        "We couldn't connect Telegram."
      );

    } finally {

      setConnecting(false);

    }

  }



  async function disconnectTelegram() {

    setError("");
    setSuccess("");
    setConnecting(true);


    try {

      const {
        data,
        error: invokeError
      } =
        await supabase
          .functions
          .invoke(
            "telegram-connect",
            {
              body: {
                businessId: business.id,
                action: "disconnect"
              }
            }
          );


      if (invokeError) {
        throw invokeError;
      }


      if (!data?.success) {
        throw new Error(
          data?.error ||
          "We couldn't disconnect Telegram."
        );
      }


      setConnection(null);

      setSuccess("Telegram disconnected.");


    } catch (err) {

      setError(
        err?.message ||
        "We couldn't disconnect Telegram."
      );

    } finally {

      setConnecting(false);

    }

  }



  async function updateConfig(key, value) {

    if (!connection) {
      return;
    }


    setSavingConfig(true);
    setError("");


    const nextConfig = {
      ...(connection.config || {}),
      [key]: value
    };


    try {

      const {
        error: updateError
      } =
        await supabase
          .from("channel_connections")
          .update({
            config: nextConfig,
            updated_at: new Date().toISOString()
          })
          .eq("id", connection.id)
          .eq("business_id", business.id);


      if (updateError) {
        throw updateError;
      }


      setConnection({
        ...connection,
        config: nextConfig
      });


    } catch (err) {

      setError(
        err?.message ||
        "We couldn't save that setting."
      );

    } finally {

      setSavingConfig(false);

    }

  }



  const config =
    connection?.config || {};


  const connected =
    connection?.status === "connected";


  const ownerLinked =
    Boolean(config.ownerChatId);


  const botUrl =
    connection?.provider_username
      ? `https://t.me/${connection.provider_username}?start=owner`
      : null;



  return (

    <main className="dashboard-content channels-page">


      <header className="store-page-header">

        <div>

          <span className="dashboard-eyebrow">
            Communication
          </span>

          <h1>
            Channels
          </h1>

          <p>
            Connect a messaging channel so Runambiz AI can
            answer your customers and send you alerts.
          </p>

        </div>

      </header>


      {loading ? (

        <div className="ai-brain-loading">
          <Loader2 size={22} className="spin" />
          Loading channels...
        </div>

      ) : (

        <div className="store-settings-stack">


          {/* ==============================================
              TELEGRAM
          =============================================== */}

          <section className="store-section-card">


            <div className="store-section-heading">

              <div className="store-section-icon">
                <Send size={19} />
              </div>

              <div>
                <h2>Telegram</h2>
                <p>
                  Free to run. Your own bot answers customers
                  and sends you order alerts.
                </p>
              </div>

              <span
                className={
                  connected
                    ? "store-status-badge published"
                    : "store-status-badge unpublished"
                }
              >
                {connected ? "Connected" : "Not connected"}
              </span>

            </div>


            <div className="store-section-content">


              {!connected ? (

                <>

                  <div className="store-editor-empty">
                    <Bot size={20} />
                    <strong>Create your bot first</strong>
                    <span>
                      It takes about a minute and costs nothing.
                    </span>
                  </div>


                  <ol className="payment-steps">
                    <li>
                      Open Telegram and message{" "}
                      <strong>@BotFather</strong>.
                    </li>
                    <li>
                      Send <strong>/newbot</strong> and follow
                      the prompts to name it.
                    </li>
                    <li>
                      BotFather replies with a token that looks
                      like <strong>123456:ABC-DEF...</strong>
                    </li>
                    <li>
                      Paste that token below.
                    </li>
                  </ol>


                  <div className="store-field">

                    <label>Bot token</label>

                    <input
                      type="password"
                      value={botToken}
                      placeholder="123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      autoComplete="off"
                      onChange={event =>
                        setBotToken(event.target.value)
                      }
                    />

                    <small>
                      Stored encrypted on our servers and never
                      sent back to your browser.
                    </small>

                  </div>


                  <button
                    type="button"
                    className="store-save-main"
                    disabled={connecting || !botToken.trim()}
                    onClick={connectTelegram}
                  >
                    {connecting ? (
                      <>
                        <Loader2 size={17} className="spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Plug size={17} />
                        Connect Telegram
                      </>
                    )}
                  </button>

                </>

              ) : (

                <>

                  <div className="store-info-card">

                    <strong>
                      {connection.display_name || "Your bot"}
                    </strong>

                    <p>
                      {connection.provider_username
                        ? `@${connection.provider_username}`
                        : "Bot connected"}
                    </p>

                  </div>


                  {/* OWNER LINK */}

                  {!ownerLinked ? (

                    <div className="order-payment-missing">

                      <strong>
                        One step left.
                      </strong>

                      <p>
                        Open your bot and tap Start so order
                        and payment alerts reach your Telegram.
                      </p>

                      {botUrl && (
                        <a
                          className="store-mini-button"
                          href={botUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open my bot
                          <ExternalLink size={14} />
                        </a>
                      )}

                    </div>

                  ) : (

                    <div className="payment-submitted-success">

                      <div className="payment-submitted-check">
                        <CheckCircle2 size={21} />
                      </div>

                      <div>
                        <strong>Alerts are on</strong>
                        <span>
                          New orders, payments and customer
                          messages arrive in your Telegram.
                        </span>
                      </div>

                    </div>

                  )}


                  {/* TOGGLES */}

                  <div className="store-toggle-list">

                    <ChannelToggle
                      icon={<Sparkles size={17} />}
                      title="AI customer replies"
                      description="Runambiz AI answers customers using your AI Brain. Turn off to handle every message yourself."
                      checked={config.aiEnabled !== false}
                      disabled={savingConfig}
                      onChange={value =>
                        updateConfig("aiEnabled", value)
                      }
                    />

                    <ChannelToggle
                      icon={<MessageCircle size={17} />}
                      title="Business alerts"
                      description="Send order and payment notifications to your linked Telegram chat."
                      checked={config.notifyEnabled !== false}
                      disabled={savingConfig || !ownerLinked}
                      onChange={value =>
                        updateConfig("notifyEnabled", value)
                      }
                    />

                  </div>


                  <div className="support-notice">

                    <ShieldCheck size={18} />

                    <div>
                      <strong>
                        The AI only discusses your business.
                      </strong>
                      <span>
                        It answers from your products, policies
                        and knowledge. When it isn't sure, it
                        hands the chat to you instead of
                        guessing.
                      </span>
                    </div>

                  </div>


                  <div className="store-asset-actions">

                    <button
                      type="button"
                      className="store-mini-button"
                      onClick={() => onNavigate?.("Messages")}
                    >
                      <MessageCircle size={14} />
                      Open Messages
                    </button>

                    <button
                      type="button"
                      className="store-remove-asset"
                      disabled={connecting}
                      onClick={disconnectTelegram}
                    >
                      <Trash2 size={14} />
                      Disconnect
                    </button>

                  </div>

                </>

              )}


            </div>

          </section>


          {/* ==============================================
              WHATSAPP — placeholder
          =============================================== */}

          <section className="store-section-card">

            <div className="store-section-heading">

              <div className="store-section-icon">
                <MessageCircle size={19} />
              </div>

              <div>
                <h2>WhatsApp</h2>
                <p>
                  Requires a verified Meta Business account.
                  Coming after Telegram.
                </p>
              </div>

              <span className="store-status-badge unpublished">
                Coming soon
              </span>

            </div>

          </section>


          {error && (
            <div className="store-page-error">
              {error}
            </div>
          )}


          {success && (
            <div className="store-page-success">
              <CheckCircle2 size={17} />
              {success}
            </div>
          )}


        </div>

      )}


    </main>

  );

}



function ChannelToggle({
  icon,
  title,
  description,
  checked,
  disabled = false,
  onChange
}) {

  return (

    <div
      className={
        disabled
          ? "store-toggle-row disabled"
          : "store-toggle-row"
      }
    >

      <div className="store-toggle-info">

        <div className="store-toggle-icon">
          {icon}
        </div>

        <div>
          <strong>{title}</strong>
          <span>{description}</span>
        </div>

      </div>


      <label className="store-switch">

        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={event =>
            onChange(event.target.checked)
          }
        />

        <span></span>

      </label>

    </div>

  );

}