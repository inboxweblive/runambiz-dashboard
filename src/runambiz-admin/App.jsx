import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Ban,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Coins,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  LogOut,
  MessageSquare,
  RefreshCw,
  Search,
  ScrollText,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Copy,
  ExternalLink,
  Mail,
  Megaphone,
  Package,
  Plus,
  Rocket,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  X
} from "lucide-react";

import {
  supabase
} from "../lib/supabase";

import "./admin.css";


/* =========================================================
   API

   Every call goes through one Edge Function. The browser
   never holds a service key and never writes directly.
========================================================= */

async function callAdmin(
  action,
  payload = {}
) {

  const {
    data,
    error
  } =
    await supabase
      .functions
      .invoke(
        "admin-action",
        {
          body: {
            action,
            ...payload
          }
        }
      );


  if (error) {

    /*
      A non-admin gets 404 by design, so the message is
      deliberately unhelpful. Translate it once here.
    */

    const body =
      await error?.context
        ?.json?.()
        .catch(() => null);


    throw new Error(
      body?.error ||
      error.message ||
      "That request failed."
    );

  }


  if (!data?.success) {

    throw new Error(
      data?.error ||
      "That request failed."
    );

  }


  return data;

}


async function callFunction(
  name,
  payload = {}
) {

  const {
    data,
    error
  } =
    await supabase
      .functions
      .invoke(name, { body: payload });


  if (error) {

    const body =
      await error?.context
        ?.json?.()
        .catch(() => null);


    throw new Error(
      body?.error ||
      error.message ||
      "That request failed."
    );

  }


  if (!data?.success) {

    throw new Error(
      data?.error ||
      "That request failed."
    );

  }


  return data;

}


/* =========================================================
   ROOT
========================================================= */

export default function App() {


  const [session, setSession] =
    useState(null);

  const [checking, setChecking] =
    useState(true);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [page, setPage] =
    useState("Overview");


  useEffect(
    () => {

      supabase
        .auth
        .getSession()
        .then(
          ({ data }) => {

            setSession(
              data?.session || null
            );

            setChecking(false);

          }
        );


      const {
        data: listener
      } =
        supabase
          .auth
          .onAuthStateChange(
            (_event, next) => {

              setSession(next);

              if (!next) {
                setIsAdmin(false);
              }

            }
          );


      return () => {

        listener
          ?.subscription
          ?.unsubscribe();

      };

    },
    []
  );


  if (checking) {

    return (
      <div className="admin-boot">
        <Loader2 size={24} className="spin" />
      </div>
    );

  }


  if (!session) {

    return <Login />;

  }


  if (!isAdmin) {

    return (
      <AdminGate
        onPass={() => setIsAdmin(true)}
      />
    );

  }


  return (

    <div className="admin-shell">

      <Sidebar
        page={page}
        onSelect={setPage}
        email={session.user?.email}
      />

      <main className="admin-main">

        {page === "Overview" && <Overview />}
        {page === "Revenue" && <Revenue />}
        {page === "Broadcast" && <Broadcast />}
        {page === "Outreach" && <Outreach />}
        {page === "Support" && <Support />}
        {page === "Businesses" && <Businesses />}
        {page === "Moderation" && <Moderation />}
        {page === "Activity" && <Activity />}

      </main>

    </div>

  );

}


/* =========================================================
   LOGIN
========================================================= */

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");


  async function submit(event) {

    event.preventDefault();

    setError("");
    setBusy(true);


    const {
      error: signInError
    } =
      await supabase
        .auth
        .signInWithPassword({
          email: email.trim(),
          password
        });


    if (signInError) {
      setError(signInError.message);
    }


    setBusy(false);

  }


  return (

    <div className="admin-login-page">

      <form
        className="admin-login-card"
        onSubmit={submit}
      >

        <div className="admin-login-mark">
          <ShieldCheck size={24} />
        </div>

        <h1>Runambiz Admin</h1>

        <p>Platform staff only.</p>


        <label>
          <span>Email</span>
          <input
            type="email"
            value={email}
            autoComplete="username"
            onChange={
              event =>
                setEmail(event.target.value)
            }
          />
        </label>


        <label>
          <span>Password</span>
          <input
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={
              event =>
                setPassword(event.target.value)
            }
          />
        </label>


        {error && (
          <div className="admin-error">{error}</div>
        )}


        <button
          type="submit"
          disabled={busy || !email || !password}
        >
          {busy
            ? <Loader2 size={16} className="spin" />
            : <ShieldCheck size={16} />}
          Sign in
        </button>

      </form>

    </div>

  );

}


/* =========================================================
   ADMIN GATE

   A valid Runambiz login is not enough. This confirms the
   account is in platform_admins before anything renders.
========================================================= */

function AdminGate({ onPass }) {

  const [error, setError] = useState("");


  useEffect(
    () => {

      let cancelled = false;


      callAdmin("overview")
        .then(
          () => {
            if (!cancelled) {
              onPass();
            }
          }
        )
        .catch(
          err => {
            if (!cancelled) {
              setError(
                err.message ||
                "This account has no admin access."
              );
            }
          }
        );


      return () => {
        cancelled = true;
      };

    },
    [onPass]
  );


  if (!error) {

    return (
      <div className="admin-boot">
        <Loader2 size={24} className="spin" />
        <span>Checking access...</span>
      </div>
    );

  }


  return (

    <div className="admin-login-page">

      <div className="admin-login-card">

        <div className="admin-login-mark danger">
          <Ban size={24} />
        </div>

        <h1>No access</h1>

        <p>
          This account isn't a Runambiz platform admin.
        </p>

        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
        >
          <LogOut size={16} />
          Sign out
        </button>

      </div>

    </div>

  );

}


/* =========================================================
   SIDEBAR
========================================================= */

const NAV = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Revenue", icon: Wallet },
  { label: "Broadcast", icon: Megaphone },
  { label: "Outreach", icon: Rocket },
  { label: "Support", icon: LifeBuoy },
  { label: "Businesses", icon: Building2 },
  { label: "Moderation", icon: Star },
  { label: "Activity", icon: ScrollText }
];


function Sidebar({ page, onSelect, email }) {

  return (

    <aside className="admin-sidebar">

      <div className="admin-brand">
        <ShieldCheck size={19} />
        <div>
          <strong>Runambiz</strong>
          <span>Platform admin</span>
        </div>
      </div>


      <nav>
        {NAV.map(item => {

          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={
                page === item.label
                  ? "admin-nav-item active"
                  : "admin-nav-item"
              }
              onClick={() => onSelect(item.label)}
            >
              <Icon size={17} />
              {item.label}
            </button>
          );

        })}
      </nav>


      <div className="admin-sidebar-foot">

        <span title={email}>{email}</span>

        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
        >
          <LogOut size={15} />
          Sign out
        </button>

      </div>

    </aside>

  );

}


/* =========================================================
   SHARED
========================================================= */

function useAdminData(
  action,
  payload,
  deps = []
) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const load =
    useCallback(
      async () => {

        setLoading(true);
        setError("");

        try {

          const result =
            await callAdmin(action, payload);

          setData(result);

        } catch (err) {

          setError(err.message);

        } finally {

          setLoading(false);

        }

      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      deps
    );


  useEffect(
    () => {
      load();
    },
    [load]
  );


  return { data, loading, error, reload: load };

}


function PageHead({
  eyebrow,
  title,
  description,
  onReload,
  children
}) {

  return (

    <header className="admin-page-head">

      <div>
        <span className="admin-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      <div className="admin-page-actions">
        {children}

        {onReload && (
          <button
            type="button"
            className="admin-ghost-button"
            onClick={onReload}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        )}
      </div>

    </header>

  );

}


function Loading({ label = "Loading..." }) {

  return (
    <div className="admin-loading">
      <Loader2 size={20} className="spin" />
      {label}
    </div>
  );

}


function Empty({ icon: Icon, title, text }) {

  return (
    <div className="admin-empty">
      <Icon size={26} />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );

}


function formatDate(value) {

  if (!value) {
    return "";
  }

  return new Date(value)
    .toLocaleDateString(
      "en-NG",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );

}


function formatNaira(value) {

  return `NGN ${Number(value || 0).toLocaleString()}`;

}


function formatUsd(value) {

  return `$${Number(value || 0).toFixed(2)}`;

}


/* =========================================================
   OVERVIEW
========================================================= */

function Overview() {

  const {
    data,
    loading,
    error,
    reload
  } = useAdminData("overview", {}, []);


  const stats = data?.stats;


  return (

    <>

      <PageHead
        eyebrow="Platform"
        title="Overview"
        description="How Runambiz is doing right now."
        onReload={reload}
      />


      {error && (
        <div className="admin-error">{error}</div>
      )}


      {loading ? (

        <Loading />

      ) : stats ? (

        <>

          <div className="admin-stat-grid">

            <Stat
              label="Businesses"
              value={stats.businesses}
              icon={Building2}
            />

            <Stat
              label="Published stores"
              value={stats.published}
              icon={CheckCircle2}
            />

            <Stat
              label="Active subscriptions"
              value={stats.activeSubs}
              icon={BadgeCheck}
              accent
            />

            <Stat
              label="Orders this week"
              value={stats.ordersWeek}
              icon={Sparkles}
            />

          </div>


          <div className="admin-stat-grid">

            <Stat
              label="Open enquiries"
              value={stats.openEnquiries}
              icon={LifeBuoy}
              warn={stats.openEnquiries > 0}
            />

            <Stat
              label="Reviews awaiting approval"
              value={stats.pendingReviews}
              icon={Star}
              warn={stats.pendingReviews > 0}
            />

            <Stat
              label="Suspended"
              value={stats.suspended}
              icon={Ban}
              warn={stats.suspended > 0}
            />

            <Stat
              label="Credit sales this week"
              value={formatNaira(stats.creditRevenue)}
              icon={Sparkles}
              accent
            />

          </div>

        </>

      ) : null}

    </>

  );

}


function Stat({
  label,
  value,
  icon: Icon,
  accent = false,
  warn = false
}) {

  return (

    <article
      className={
        `admin-stat${accent ? " accent" : ""}${warn ? " warn" : ""}`
      }
    >

      <div className="admin-stat-icon">
        <Icon size={17} />
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

    </article>

  );

}


/* =========================================================
   REVENUE
========================================================= */

const PERIODS = [
  { key: "Week", label: "7 days" },
  { key: "Month", label: "30 days" },
  { key: "All", label: "All time" }
];


function Revenue() {

  const [period, setPeriod] = useState("Month");


  const {
    data,
    loading,
    error,
    reload
  } = useAdminData("revenue", {}, []);


  if (loading) {
    return (
      <>
        <PageHead
          eyebrow="Money"
          title="Revenue"
          description="What came in, what it cost, what's left."
        />
        <Loading />
      </>
    );
  }


  if (error || !data) {
    return (
      <>
        <PageHead
          eyebrow="Money"
          title="Revenue"
          onReload={reload}
        />
        <div className="admin-error">
          {error || "No data."}
        </div>
      </>
    );
  }


  const suffix = period;

  const earned = data.earned || {};
  const cost = data.cost || {};
  const net = data.net || {};


  const totalIn =
    earned[`total${suffix}`] || 0;

  const credits =
    earned[`credits${suffix}`] || 0;

  const subs =
    earned[`subs${suffix}`] || 0;

  const costNaira =
    cost[`naira${suffix}`] || 0;

  const costUsd =
    cost[`usd${suffix}`] || 0;

  const profit =
    net[period.toLowerCase()] || 0;


  const margin =
    totalIn > 0
      ? Math.round((profit / totalIn) * 100)
      : 0;


  return (

    <>

      <PageHead
        eyebrow="Money"
        title="Revenue"
        description="What came in, what it cost, what's left."
        onReload={reload}
      >

        <div className="admin-tabs">
          {PERIODS.map(item => (
            <button
              key={item.key}
              type="button"
              className={
                period === item.key ? "active" : ""
              }
              onClick={() => setPeriod(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

      </PageHead>


      {/* HEADLINE */}

      <div className="admin-money-row">

        <article className="admin-money-card in">
          <div className="admin-money-icon">
            <TrendingUp size={18} />
          </div>
          <span>Money in</span>
          <strong>{formatNaira(totalIn)}</strong>
          <small>
            {formatNaira(credits)} credits
            {" · "}
            {formatNaira(subs)} subscriptions
          </small>
        </article>


        <article className="admin-money-card out">
          <div className="admin-money-icon">
            <TrendingDown size={18} />
          </div>
          <span>AI cost</span>
          <strong>{formatNaira(costNaira)}</strong>
          <small>
            {formatUsd(costUsd)} at OpenAI
            {" · "}
            rate {data.rate}
          </small>
        </article>


        <article
          className={
            profit >= 0
              ? "admin-money-card net"
              : "admin-money-card net negative"
          }
        >
          <div className="admin-money-icon">
            <Coins size={18} />
          </div>
          <span>Left over</span>
          <strong>{formatNaira(profit)}</strong>
          <small>
            {totalIn > 0
              ? `${margin}% margin`
              : "no revenue yet"}
          </small>
        </article>

      </div>


      {/* RECURRING + PLAN MIX */}

      <div className="admin-stat-grid">

        <Stat
          label="Monthly recurring"
          value={formatNaira(data.mrr)}
          icon={RefreshCw}
          accent
        />

        <Stat
          label="Paying businesses"
          value={data.paidCount}
          icon={BadgeCheck}
          accent
        />

        <Stat
          label="Free businesses"
          value={data.freeCount}
          icon={Building2}
        />

        <Stat
          label="AI replies billed"
          value={data.aiCalls}
          icon={Sparkles}
        />

      </div>


      {/* PLANS */}

      <section className="admin-section">

        <h2>Plan mix</h2>

        <div className="admin-list">

          {data.plans
            .filter(plan => plan.isPaid || plan.count > 0)
            .map(plan => (

            <div
              key={plan.code}
              className="admin-list-row static"
            >

              <div className="admin-list-main">

                <div className="admin-row-top">
                  <strong>{plan.name || plan.code}</strong>

                  {plan.isPaid ? (
                    <span className="admin-pill paid">
                      paid
                    </span>
                  ) : (
                    <span className="admin-pill">free</span>
                  )}
                </div>

                <span className="admin-row-sub">
                  {plan.count}
                  {plan.count === 1
                    ? " business"
                    : " businesses"}
                  {plan.isPaid && plan.monthlyPrice > 0
                    ? ` · ${formatNaira(plan.monthlyPrice)}/mo · ${formatNaira(plan.count * plan.monthlyPrice)} recurring`
                    : ""}
                </span>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* COST BY FEATURE */}

      <section className="admin-section">

        <h2>Cost by feature</h2>

        <p className="admin-section-note">
          Hold this total against OpenAI's own usage page
          for the same period. A feature missing from this
          list is calling OpenAI without logging it.
        </p>

        {!data.costByTask?.length ? (

          <Empty
            icon={Sparkles}
            title="No AI usage logged"
            text="Nothing has been recorded yet."
          />

        ) : (

          <div className="admin-list">

            {data.costByTask.map(row => (

              <div
                key={row.taskType}
                className="admin-list-row static"
              >

                <div className="admin-list-main">

                  <div className="admin-row-top">
                    <strong>
                      {row.taskType.replace(/_/g, " ")}
                    </strong>

                    {row.credits === 0 && (
                      <span className="admin-pill">
                        free to merchant
                      </span>
                    )}
                  </div>

                  <span className="admin-row-sub">
                    {formatUsd(row.costUsd)}
                    {" · "}
                    {formatNaira(row.costNaira)}
                    {" · "}
                    {row.calls}
                    {row.calls === 1 ? " call" : " calls"}
                    {row.credits > 0
                      ? ` · ${row.credits} credits billed`
                      : ""}
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* HEAVIEST USERS */}

      <section className="admin-section">

        <h2>Heaviest AI users</h2>

        <p className="admin-section-note">
          Who costs you the most at OpenAI. Watch for a
          business here that isn't in the list below.
        </p>

        {!data.heaviestUsers.length ? (

          <Empty
            icon={Sparkles}
            title="No AI usage yet"
            text="Nothing has been billed to OpenAI."
          />

        ) : (

          <div className="admin-list">

            {data.heaviestUsers.map(row => (

              <div
                key={row.businessId}
                className="admin-list-row static"
              >

                <div className="admin-list-main">

                  <div className="admin-row-top">
                    <strong>{row.name}</strong>
                  </div>

                  <span className="admin-row-sub">
                    {formatUsd(row.costUsd)} cost
                    {" · "}
                    {formatNaira(
                      Math.round(row.costUsd * data.rate)
                    )}
                    {" · "}
                    {row.credits} credits billed
                    {" · "}
                    {row.calls} replies
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* TOP PAYERS */}

      <section className="admin-section">

        <h2>Top paying businesses</h2>

        <p className="admin-section-note">
          Credit purchases plus subscription payments, all
          time.
        </p>

        {!data.topPayers.length ? (

          <Empty
            icon={Wallet}
            title="No payments yet"
            text="Nobody has bought credits or a plan."
          />

        ) : (

          <div className="admin-list">

            {data.topPayers.map(row => (

              <div
                key={row.businessId}
                className="admin-list-row static"
              >

                <div className="admin-list-main">

                  <div className="admin-row-top">
                    <strong>{row.name}</strong>
                  </div>

                  <span className="admin-row-sub">
                    {formatNaira(row.paid)} all time
                  </span>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </>

  );

}


/* =========================================================
   BROADCAST
========================================================= */

const AUDIENCES = [
  { key: "all", label: "Everyone" },
  { key: "paid", label: "Paying" },
  { key: "free", label: "Free plan" },
  { key: "published", label: "Published" },
  { key: "unpublished", label: "Not published" },
  { key: "single", label: "One business" }
];


function Broadcast() {

  const [audience, setAudience] = useState("all");
  const [businessId, setBusinessId] = useState("");
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  const [audienceInfo, setAudienceInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [past, setPast] = useState([]);


  const loadHistory =
    useCallback(
      async () => {

        try {

          const data =
            await callFunction(
              "admin-broadcast",
              { action: "history" }
            );

          setPast(data.broadcasts || []);

        } catch (err) {
          console.error(err);
        }

      },
      []
    );


  useEffect(
    () => {
      loadHistory();
    },
    [loadHistory]
  );


  useEffect(
    () => {

      if (
        audience === "single" &&
        !businessId
      ) {
        setAudienceInfo(null);
        return;
      }


      let cancelled = false;

      setChecking(true);


      callFunction(
        "admin-broadcast",
        {
          action: "preview",
          audience,
          businessId
        }
      )
        .then(
          data => {
            if (!cancelled) {
              setAudienceInfo(data);
            }
          }
        )
        .catch(
          err => {
            if (!cancelled) {
              setError(err.message);
            }
          }
        )
        .finally(
          () => {
            if (!cancelled) {
              setChecking(false);
            }
          }
        );


      return () => {
        cancelled = true;
      };

    },
    [audience, businessId]
  );


  async function send() {

    const reachable =
      audienceInfo?.reachable || 0;


    const confirmed =
      window.confirm(
        `Send "${subject}" to ${reachable} ` +
        `${reachable === 1 ? "business" : "businesses"}? ` +
        `This cannot be undone.`
      );


    if (!confirmed) {
      return;
    }


    setSending(true);
    setError("");
    setResult(null);


    try {

      const data =
        await callFunction(
          "admin-broadcast",
          {
            action: "send",
            audience,
            businessId,
            subject,
            heading,
            body: message,
            ctaLabel,
            ctaUrl
          }
        );

      setResult(data);

      setSubject("");
      setHeading("");
      setMessage("");
      setCtaLabel("");
      setCtaUrl("");

      loadHistory();

    } catch (err) {

      setError(err.message);

    } finally {

      setSending(false);

    }

  }


  const canSend =
    subject.trim() &&
    message.trim() &&
    (audienceInfo?.reachable || 0) > 0 &&
    !sending;


  return (

    <>

      <PageHead
        eyebrow="Messaging"
        title="Broadcast"
        description="Email your merchants. Announcements, updates, anything."
      />


      {error && (
        <div className="admin-error">{error}</div>
      )}


      {result && (
        <div className="admin-success">
          <CheckCircle2 size={16} />
          Sent to {result.sent} of {result.total}.
          {result.failed > 0
            ? ` ${result.failed} failed.`
            : ""}
        </div>
      )}


      <div className="admin-compose">


        {/* AUDIENCE */}

        <div className="admin-field">

          <label>Who gets this</label>

          <div className="admin-tabs wrap">
            {AUDIENCES.map(item => (
              <button
                key={item.key}
                type="button"
                className={
                  audience === item.key ? "active" : ""
                }
                onClick={() => setAudience(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

        </div>


        {audience === "single" && (

          <div className="admin-field">
            <label>Business ID</label>
            <input
              type="text"
              value={businessId}
              placeholder="Paste the business id from the Businesses page"
              onChange={
                event => setBusinessId(event.target.value)
              }
            />
          </div>

        )}


        {/* REACH */}

        <div className="admin-reach">

          <Users size={16} />

          {checking ? (
            "Checking..."
          ) : audienceInfo ? (
            <>
              <strong>{audienceInfo.reachable}</strong>
              {" will receive this"}
              {audienceInfo.missingEmail > 0 && (
                <span className="admin-reach-warn">
                  {" · "}
                  {audienceInfo.missingEmail} have no email
                </span>
              )}
            </>
          ) : (
            "Pick an audience"
          )}

        </div>


        {/* CONTENT */}

        <div className="admin-field">
          <label>Subject line</label>
          <input
            type="text"
            value={subject}
            maxLength={120}
            placeholder="What lands in their inbox"
            onChange={
              event => setSubject(event.target.value)
            }
          />
        </div>


        <div className="admin-field">
          <label>Heading (optional)</label>
          <input
            type="text"
            value={heading}
            maxLength={120}
            placeholder="Defaults to the subject line"
            onChange={
              event => setHeading(event.target.value)
            }
          />
        </div>


        <div className="admin-field">
          <label>Message</label>
          <textarea
            rows="9"
            value={message}
            placeholder={
              "Write normally. Leave a blank line between paragraphs.\n\nThey'll be greeted by their business name automatically."
            }
            onChange={
              event => setMessage(event.target.value)
            }
          />
        </div>


        <div className="admin-field-row">

          <div className="admin-field">
            <label>Button text (optional)</label>
            <input
              type="text"
              value={ctaLabel}
              maxLength={40}
              placeholder="Open my dashboard"
              onChange={
                event => setCtaLabel(event.target.value)
              }
            />
          </div>

          <div className="admin-field">
            <label>Button link</label>
            <input
              type="text"
              value={ctaUrl}
              placeholder="https://app.runambiz.com"
              onChange={
                event => setCtaUrl(event.target.value)
              }
            />
          </div>

        </div>


        <button
          type="button"
          className="admin-primary-button"
          disabled={!canSend}
          onClick={send}
        >
          {sending
            ? <Loader2 size={15} className="spin" />
            : <Mail size={15} />}
          {sending
            ? "Sending..."
            : `Send to ${audienceInfo?.reachable || 0}`}
        </button>

      </div>


      {/* HISTORY */}

      {past.length > 0 && (

        <section className="admin-section">

          <h2>Sent before</h2>

          <div className="admin-list">

            {past.map(item => (

              <div
                key={item.id}
                className="admin-list-row static"
              >

                <div className="admin-list-main">

                  <div className="admin-row-top">
                    <strong>{item.subject}</strong>
                    <span className={`admin-pill ${item.status}`}>
                      {item.status}
                    </span>
                  </div>

                  <span className="admin-row-sub">
                    {item.audience}
                    {" · "}
                    {item.sent_count} sent
                    {item.failed_count > 0
                      ? ` · ${item.failed_count} failed`
                      : ""}
                    {" · "}
                    {formatDate(item.created_at)}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </section>

      )}

    </>

  );

}


/* =========================================================
   OUTREACH
========================================================= */

function Outreach() {

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState(null);


  const load =
    useCallback(
      async () => {

        setLoading(true);

        try {

          const data =
            await callFunction(
              "admin-outreach",
              { action: "list" }
            );

          setStores(data.stores || []);

        } catch (err) {

          setError(err.message);

        } finally {

          setLoading(false);

        }

      },
      []
    );


  useEffect(
    () => {
      load();
    },
    [load]
  );


  const unclaimed =
    stores.filter(item => !item.claimed_at);

  const claimed =
    stores.filter(item => item.claimed_at);


  return (

    <>

      <PageHead
        eyebrow="Growth"
        title="Outreach"
        description="Build a store for a prospect, send them the link, let them claim it."
        onReload={load}
      >

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => setCreating(true)}
        >
          <Plus size={15} />
          New store
        </button>

      </PageHead>


      {error && (
        <div className="admin-error">{error}</div>
      )}


      <div className="admin-stat-grid">

        <Stat
          label="Waiting to be claimed"
          value={unclaimed.length}
          icon={Rocket}
        />

        <Stat
          label="Claimed"
          value={claimed.length}
          icon={CheckCircle2}
          accent
        />

      </div>


      {loading ? (

        <Loading />

      ) : !stores.length ? (

        <Empty
          icon={Rocket}
          title="No outreach stores yet"
          text="Build one for a business you want to win over."
        />

      ) : (

        <div className="admin-list">

          {stores.map(store => (

            <button
              key={store.id}
              type="button"
              className="admin-list-row"
              onClick={() => setSelected(store)}
            >

              <div className="admin-avatar">
                {store.logo_url ? (
                  <img src={store.logo_url} alt="" />
                ) : (
                  store.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="admin-list-main">

                <div className="admin-row-top">
                  <strong>{store.name}</strong>

                  {store.claimed_at ? (
                    <span className="admin-pill live">
                      claimed
                    </span>
                  ) : (
                    <span className="admin-pill open">
                      waiting
                    </span>
                  )}
                </div>

                <span className="admin-row-sub">
                  {store.prospect_name || "No contact name"}
                  {store.prospect_email
                    ? ` · ${store.prospect_email}`
                    : ""}
                  {` · ${store.productCount} products`}
                  {` · ${formatDate(store.created_at)}`}
                </span>

              </div>

              <ChevronRight size={16} />

            </button>

          ))}

        </div>

      )}


      {creating && (
        <CreateOutreach
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            load();
          }}
        />
      )}


      {selected && (
        <OutreachPanel
          store={selected}
          onClose={() => setSelected(null)}
          onChanged={load}
        />
      )}

    </>

  );

}


function CreateOutreach({ onClose, onCreated }) {

  const [form, setForm] = useState({
    name: "",
    businessType: "",
    location: "",
    description: "",
    prospectName: "",
    prospectEmail: "",
    prospectPhone: "",
    note: ""
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");


  function set(key, value) {
    setForm(current => ({ ...current, [key]: value }));
  }


  async function submit() {

    setBusy(true);
    setError("");

    try {

      await callFunction(
        "admin-outreach",
        { action: "create", ...form }
      );

      onCreated();

    } catch (err) {

      setError(err.message);
      setBusy(false);

    }

  }


  return (

    <Drawer
      title="New outreach store"
      eyebrow="Growth"
      onClose={onClose}
    >

      <p className="admin-drawer-note">
        This creates a real, live store with no owner. Send
        the prospect their link — if they sign up, it
        becomes theirs with everything intact.
      </p>


      <div className="admin-field">
        <label>Business name</label>
        <input
          type="text"
          value={form.name}
          placeholder="Wumight Collection"
          onChange={
            event => set("name", event.target.value)
          }
        />
        <small>
          Becomes their store address, so keep it close to
          what they actually call themselves.
        </small>
      </div>


      <div className="admin-field">
        <label>What they sell</label>
        <input
          type="text"
          value={form.businessType}
          placeholder="Fashion, food, electronics..."
          onChange={
            event => set("businessType", event.target.value)
          }
        />
      </div>


      <div className="admin-field">
        <label>Location</label>
        <input
          type="text"
          value={form.location}
          placeholder="Ibadan"
          onChange={
            event => set("location", event.target.value)
          }
        />
      </div>


      <div className="admin-field">
        <label>Short description</label>
        <textarea
          rows="3"
          value={form.description}
          placeholder="One or two lines about the business."
          onChange={
            event => set("description", event.target.value)
          }
        />
      </div>


      <div className="admin-field">
        <label>Contact name</label>
        <input
          type="text"
          value={form.prospectName}
          onChange={
            event => set("prospectName", event.target.value)
          }
        />
      </div>


      <div className="admin-field">
        <label>Contact email</label>
        <input
          type="text"
          value={form.prospectEmail}
          onChange={
            event => set("prospectEmail", event.target.value)
          }
        />
      </div>


      <div className="admin-field">
        <label>Contact phone</label>
        <input
          type="text"
          value={form.prospectPhone}
          onChange={
            event => set("prospectPhone", event.target.value)
          }
        />
      </div>


      <div className="admin-field">
        <label>Private note</label>
        <textarea
          rows="2"
          value={form.note}
          placeholder="Where you found them, what to say."
          onChange={
            event => set("note", event.target.value)
          }
        />
        <small>Only you see this.</small>
      </div>


      {error && (
        <div className="admin-error">{error}</div>
      )}


      <div className="admin-drawer-actions">
        <button
          type="button"
          className="admin-primary-button"
          disabled={busy || !form.name.trim()}
          onClick={submit}
        >
          {busy
            ? <Loader2 size={15} className="spin" />
            : <Rocket size={15} />}
          Create store
        </button>
      </div>

    </Drawer>

  );

}


function OutreachPanel({ store, onClose, onChanged }) {

  const [product, setProduct] = useState({
    name: "",
    price: "",
    category: ""
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");


  const storeUrl =
    `https://app.runambiz.com/store/${store.slug}`;


  const claimUrl =
    store.claim_token
      ? `https://app.runambiz.com/claim.html?token=${store.claim_token}`
      : null;


  function copy(value, which) {

    navigator.clipboard
      .writeText(value)
      .then(
        () => {
          setCopied(which);
          setTimeout(() => setCopied(""), 1600);
        }
      );

  }


  async function addProduct() {

    if (!product.name.trim()) {
      return;
    }

    setBusy(true);
    setError("");

    try {

      await callFunction(
        "admin-outreach",
        {
          action: "add_product",
          businessId: store.id,
          name: product.name,
          price: Number(product.price || 0),
          category: product.category
        }
      );

      setProduct({ name: "", price: "", category: "" });

      onChanged();

    } catch (err) {

      setError(err.message);

    } finally {

      setBusy(false);

    }

  }


  async function destroy() {

    const confirmed =
      window.confirm(
        `Delete ${store.name}? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setBusy(true);

    try {

      await callFunction(
        "admin-outreach",
        {
          action: "delete",
          businessId: store.id
        }
      );

      onChanged();
      onClose();

    } catch (err) {

      setError(err.message);
      setBusy(false);

    }

  }


  return (

    <Drawer
      title={store.name}
      eyebrow={store.claimed_at ? "Claimed" : "Waiting"}
      onClose={onClose}
    >

      {store.claimed_at ? (

        <div className="admin-success">
          <CheckCircle2 size={16} />
          Claimed {formatDate(store.claimed_at)}. This is a
          real merchant now.
        </div>

      ) : (

        <>

          <Field label="Store preview">
            <div className="admin-copy-row">
              <code>{storeUrl}</code>
              <button
                type="button"
                onClick={() => copy(storeUrl, "store")}
              >
                {copied === "store"
                  ? <Check size={14} />
                  : <Copy size={14} />}
              </button>
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={14} />
              </a>
            </div>
            <small>
              Send this first. It's a working store they can
              browse.
            </small>
          </Field>


          {claimUrl && (

            <Field label="Claim link">
              <div className="admin-copy-row">
                <code>{claimUrl}</code>
                <button
                  type="button"
                  onClick={() => copy(claimUrl, "claim")}
                >
                  {copied === "claim"
                    ? <Check size={14} />
                    : <Copy size={14} />}
                </button>
              </div>
              <small>
                Anyone with this link can take the store.
                Send it only to the prospect.
              </small>
            </Field>

          )}

        </>

      )}


      <Field label="Contact">
        <strong>
          {store.prospect_name || "No name"}
        </strong>
        <span>{store.prospect_email || "No email"}</span>
        <span>{store.prospect_phone || "No phone"}</span>
      </Field>


      {store.outreach_note && (
        <Field label="Your note">
          <p className="admin-message-body">
            {store.outreach_note}
          </p>
        </Field>
      )}


      {!store.claimed_at && (
        <div className="admin-drawer-note">
          <strong>Open full editor</strong> loads the real
          merchant dashboard for this store — product images,
          Store AI, colours, everything. The quick form below
          is just for dropping in a placeholder product.
        </div>
      )}


      <Field label={`Products (${store.productCount})`}>

        {!store.claimed_at && (

          <>

            <input
              type="text"
              value={product.name}
              placeholder="Product name"
              onChange={
                event =>
                  setProduct(c => ({
                    ...c,
                    name: event.target.value
                  }))
              }
            />

            <div className="admin-field-row tight">

              <input
                type="text"
                value={product.price}
                placeholder="Price"
                onChange={
                  event =>
                    setProduct(c => ({
                      ...c,
                      price: event.target.value
                    }))
                }
              />

              <input
                type="text"
                value={product.category}
                placeholder="Category"
                onChange={
                  event =>
                    setProduct(c => ({
                      ...c,
                      category: event.target.value
                    }))
                }
              />

            </div>

            <button
              type="button"
              className="admin-ghost-button small"
              disabled={busy || !product.name.trim()}
              onClick={addProduct}
            >
              <Package size={14} />
              Add product
            </button>

          </>

        )}

      </Field>


      {error && (
        <div className="admin-error">{error}</div>
      )}


      {!store.claimed_at && (

        <div className="admin-drawer-actions">

          <a
            className="admin-primary-button"
            href={`/?store=${store.id}`}
            target="_blank"
            rel="noreferrer"
          >
            <Rocket size={15} />
            Open full editor
          </a>

          <button
            type="button"
            className="admin-danger-button"
            disabled={busy}
            onClick={destroy}
          >
            <Trash2 size={15} />
            Delete
          </button>

        </div>

      )}

    </Drawer>

  );

}


/* =========================================================
   SUPPORT
========================================================= */

function Support() {

  const [status, setStatus] = useState("open");
  const [selected, setSelected] = useState(null);


  const {
    data,
    loading,
    error,
    reload
  } = useAdminData(
    "list_enquiries",
    { status },
    [status]
  );


  const enquiries =
    data?.enquiries || [];


  return (

    <>

      <PageHead
        eyebrow="Support"
        title="Enquiries"
        description="Questions Support AI couldn't resolve."
        onReload={reload}
      >

        <div className="admin-tabs">
          {["open", "resolved", "all"].map(item => (
            <button
              key={item}
              type="button"
              className={
                status === item ? "active" : ""
              }
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}
        </div>

      </PageHead>


      {error && (
        <div className="admin-error">{error}</div>
      )}


      {loading ? (

        <Loading />

      ) : !enquiries.length ? (

        <Empty
          icon={LifeBuoy}
          title="Nothing here"
          text={
            status === "open"
              ? "No open enquiries. Good sign."
              : "No enquiries match that filter."
          }
        />

      ) : (

        <div className="admin-list">

          {enquiries.map(item => (

            <button
              key={item.id}
              type="button"
              className="admin-list-row"
              onClick={() => setSelected(item)}
            >

              <div className="admin-list-main">

                <div className="admin-row-top">
                  <strong>{item.subject}</strong>
                  <span className={`admin-pill ${item.status}`}>
                    {item.status}
                  </span>
                </div>

                <span className="admin-row-sub">
                  {item.business?.name || "Unknown business"}
                  {" · "}
                  {item.category}
                  {" · "}
                  {formatDate(item.created_at)}
                </span>

              </div>

              <ChevronRight size={16} />

            </button>

          ))}

        </div>

      )}


      {selected && (
        <EnquiryPanel
          enquiry={selected}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            reload();
          }}
        />
      )}

    </>

  );

}


function EnquiryPanel({ enquiry, onClose, onDone }) {

  const [response, setResponse] =
    useState(enquiry.admin_response || "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");


  async function send(nextStatus) {

    setBusy(true);
    setError("");
    setWarning("");

    try {

      const result =
        await callAdmin(
          "respond_enquiry",
          {
            enquiryId: enquiry.id,
            response,
            status: nextStatus
          }
        );


      /*
        The reply saved, but the merchant may not have
        been told. Say so rather than closing silently.
      */

      if (
        response.trim() &&
        !result.emailed
      ) {

        setWarning(
          result.emailError ||
          "Reply saved, but the email did not send. Contact them another way."
        );

        setBusy(false);

        return;

      }


      onDone();

    } catch (err) {

      setError(err.message);
      setBusy(false);

    }

  }


  return (

    <Drawer
      title={enquiry.subject}
      eyebrow={enquiry.category}
      onClose={onClose}
    >

      <Field label="From">
        <strong>{enquiry.name}</strong>
        <span>{enquiry.email}</span>
      </Field>


      <Field label="Business">
        <strong>
          {enquiry.business?.name || "Unknown"}
        </strong>
        {enquiry.business?.slug && (
          <span>{enquiry.business.slug}</span>
        )}
      </Field>


      <Field label="Message">
        <p className="admin-message-body">
          {enquiry.message}
        </p>
      </Field>


      <Field label="Your reply">
        <textarea
          rows="7"
          value={response}
          placeholder="Write the reply this merchant will receive..."
          onChange={
            event => setResponse(event.target.value)
          }
        />
        <small>
          Emailed to {enquiry.email} and saved on the
          enquiry.
        </small>
      </Field>


      {error && (
        <div className="admin-error">{error}</div>
      )}


      {warning && (
        <div className="admin-warning-inline">
          <AlertTriangle size={15} />
          {warning}
        </div>
      )}


      <div className="admin-drawer-actions">

        <button
          type="button"
          className="admin-primary-button"
          disabled={busy || !response.trim()}
          onClick={() => send("resolved")}
        >
          {busy
            ? <Loader2 size={15} className="spin" />
            : <Send size={15} />}
          Reply and resolve
        </button>

        <button
          type="button"
          className="admin-ghost-button"
          disabled={busy}
          onClick={() => send("open")}
        >
          Save, keep open
        </button>

      </div>

    </Drawer>

  );

}


/* =========================================================
   BUSINESSES
========================================================= */

function Businesses() {

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);


  const {
    data,
    loading,
    error,
    reload
  } = useAdminData(
    "list_businesses",
    { search: query, filter },
    [query, filter]
  );


  const businesses =
    data?.businesses || [];


  return (

    <>

      <PageHead
        eyebrow="Platform"
        title="Businesses"
        description="Every merchant on Runambiz."
        onReload={reload}
      >

        <form
          className="admin-search"
          onSubmit={event => {
            event.preventDefault();
            setQuery(search.trim());
          }}
        >
          <Search size={15} />
          <input
            type="search"
            value={search}
            placeholder="Name or slug..."
            onChange={
              event => setSearch(event.target.value)
            }
          />
        </form>


        <div className="admin-tabs">
          {[
            "all",
            "new",
            "paid",
            "free",
            "spenders",
            "published",
            "suspended"
          ].map(item => (
            <button
              key={item}
              type="button"
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

      </PageHead>


      {error && (
        <div className="admin-error">{error}</div>
      )}


      {loading ? (

        <Loading />

      ) : !businesses.length ? (

        <Empty
          icon={Building2}
          title="No businesses"
          text="Nothing matches that search or filter."
        />

      ) : (

        <div className="admin-list">

          {businesses.map(item => (

            <button
              key={item.id}
              type="button"
              className="admin-list-row"
              onClick={() => setSelectedId(item.id)}
            >

              <div className="admin-avatar">
                {item.logo_url ? (
                  <img src={item.logo_url} alt="" />
                ) : (
                  item.name.charAt(0).toUpperCase()
                )}
              </div>


              <div className="admin-list-main">

                <div className="admin-row-top">
                  <strong>{item.name}</strong>

                  {item.is_paid && (
                    <span className="admin-pill paid">
                      {item.plan_code}
                    </span>
                  )}

                  {item.is_suspended && (
                    <span className="admin-pill danger">
                      suspended
                    </span>
                  )}

                  {!item.is_suspended && item.is_published && (
                    <span className="admin-pill live">
                      live
                    </span>
                  )}
                </div>

                <span className="admin-row-sub">
                  {item.slug}
                  {` · joined ${formatDate(item.created_at)}`}
                  {Number(item.total_spent) > 0
                    ? ` · paid ${formatNaira(item.total_spent)}`
                    : ""}
                  {Number(item.credits_used) > 0
                    ? ` · ${item.credits_used} credits used`
                    : ""}
                </span>

              </div>


              <ChevronRight size={16} />

            </button>

          ))}

        </div>

      )}


      {selectedId && (
        <BusinessPanel
          businessId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={reload}
        />
      )}

    </>

  );

}


function BusinessPanel({
  businessId,
  onClose,
  onChanged
}) {

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");


  const load =
    useCallback(
      async () => {

        setLoading(true);

        try {

          const result =
            await callAdmin(
              "business_detail",
              { businessId }
            );

          setDetail(result);

        } catch (err) {

          setError(err.message);

        } finally {

          setLoading(false);

        }

      },
      [businessId]
    );


  useEffect(
    () => {
      load();
    },
    [load]
  );


  async function toggleSuspension() {

    const business = detail?.business;

    if (!business) {
      return;
    }


    if (
      !business.is_suspended &&
      !reason.trim()
    ) {

      setError("Give a reason before suspending.");
      return;

    }


    setBusy(true);
    setError("");

    try {

      await callAdmin(
        business.is_suspended
          ? "unsuspend_business"
          : "suspend_business",
        {
          businessId,
          reason: reason.trim()
        }
      );

      setReason("");

      await load();

      onChanged();

    } catch (err) {

      setError(err.message);

    } finally {

      setBusy(false);

    }

  }


  async function saveDiscovery(patch) {

    setBusy(true);
    setError("");

    try {

      await callAdmin(
        "set_discovery",
        {
          businessId,
          ...patch
        }
      );

      await load();

    } catch (err) {

      setError(err.message);

    } finally {

      setBusy(false);

    }

  }


  const business = detail?.business;
  const discovery = detail?.discovery;
  const wallet = detail?.wallet;
  const counts = detail?.counts;


  return (

    <Drawer
      title={business?.name || "Business"}
      eyebrow={business?.slug || ""}
      onClose={onClose}
    >

      {loading ? (

        <Loading />

      ) : !business ? (

        <div className="admin-error">
          {error || "Not found."}
        </div>

      ) : (

        <>

          {business.is_suspended && (

            <div className="admin-warning-box">
              <AlertTriangle size={17} />
              <div>
                <strong>Suspended</strong>
                <span>
                  {business.suspension_reason ||
                    "No reason recorded."}
                </span>
              </div>
            </div>

          )}


          <div className="admin-mini-grid">

            <MiniStat
              label="Products"
              value={counts?.products ?? 0}
            />

            <MiniStat
              label="Orders"
              value={counts?.orders ?? 0}
            />

            <MiniStat
              label="Customers"
              value={counts?.customers ?? 0}
            />

          </div>


          <Field label="Plan">
            <strong>
              {detail.subscription?.plan_code || "free"}
            </strong>
            <span>
              {detail.subscription?.status || "no subscription"}
            </span>
          </Field>


          <Field label="AI credits">
            <strong>
              {
                Number(wallet?.daily_balance || 0) +
                Number(wallet?.bonus_balance || 0) +
                Number(wallet?.purchased_balance || 0) +
                Number(wallet?.plan_balance || 0)
              }
              {" available"}
            </strong>
            <span>
              {`${wallet?.lifetime_used || 0} used all time`}
            </span>
          </Field>


          <Field label="Contact">
            <span>{business.contact_email || "No email"}</span>
            <span>{business.contact_phone || "No phone"}</span>
          </Field>


          {/* DISCOVERY */}

          <Field label="Discovery">

            <label className="admin-check">
              <input
                type="checkbox"
                checked={discovery?.is_enabled || false}
                disabled={busy}
                onChange={
                  event =>
                    saveDiscovery({
                      isEnabled: event.target.checked
                    })
                }
              />
              Show in discovery
            </label>

            <label className="admin-check">
              <input
                type="checkbox"
                checked={discovery?.is_featured || false}
                disabled={busy}
                onChange={
                  event =>
                    saveDiscovery({
                      isFeatured: event.target.checked
                    })
                }
              />
              Featured
            </label>

            <label className="admin-weight">
              <span>Weight</span>
              <input
                type="number"
                min="0"
                max="100"
                defaultValue={discovery?.manual_weight ?? 0}
                disabled={busy}
                onBlur={
                  event =>
                    saveDiscovery({
                      manualWeight: event.target.value
                    })
                }
              />
            </label>

          </Field>


          {/* SUSPENSION */}

          {!business.is_suspended && (

            <Field label="Suspension reason">
              <input
                type="text"
                value={reason}
                placeholder="Why is this business being suspended?"
                onChange={
                  event => setReason(event.target.value)
                }
              />
            </Field>

          )}


          {error && (
            <div className="admin-error">{error}</div>
          )}


          <div className="admin-drawer-actions">

            <button
              type="button"
              className={
                business.is_suspended
                  ? "admin-primary-button"
                  : "admin-danger-button"
              }
              disabled={busy}
              onClick={toggleSuspension}
            >
              {busy
                ? <Loader2 size={15} className="spin" />
                : business.is_suspended
                  ? <Check size={15} />
                  : <Ban size={15} />}
              {business.is_suspended
                ? "Lift suspension"
                : "Suspend business"}
            </button>

          </div>

        </>

      )}

    </Drawer>

  );

}


function MiniStat({ label, value }) {

  return (
    <div className="admin-mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );

}


/* =========================================================
   MODERATION
========================================================= */

function Moderation() {

  const [status, setStatus] = useState("pending");
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");


  const {
    data,
    loading,
    error: loadError,
    reload
  } = useAdminData(
    "list_reviews",
    { status },
    [status]
  );


  const reviews =
    data?.reviews || [];


  async function moderate(review, approve) {

    setBusyId(review.id);
    setError("");

    try {

      await callAdmin(
        "moderate_review",
        {
          reviewId: review.id,
          approve
        }
      );

      reload();

    } catch (err) {

      setError(err.message);

    } finally {

      setBusyId(null);

    }

  }


  return (

    <>

      <PageHead
        eyebrow="Moderation"
        title="Reviews"
        description="Nothing appears publicly until you approve it."
        onReload={reload}
      >

        <div className="admin-tabs">
          {["pending", "approved", "all"].map(item => (
            <button
              key={item}
              type="button"
              className={status === item ? "active" : ""}
              onClick={() => setStatus(item)}
            >
              {item}
            </button>
          ))}
        </div>

      </PageHead>


      {(error || loadError) && (
        <div className="admin-error">
          {error || loadError}
        </div>
      )}


      {loading ? (

        <Loading />

      ) : !reviews.length ? (

        <Empty
          icon={Star}
          title="Nothing to moderate"
          text="No reviews match that filter."
        />

      ) : (

        <div className="admin-cards">

          {reviews.map(review => (

            <article
              key={review.id}
              className="admin-review-card"
            >

              <div className="admin-review-head">

                <div>
                  <strong>{review.name}</strong>
                  <span>
                    {review.business_name}
                    {" · "}
                    {formatDate(review.created_at)}
                  </span>
                </div>

                <div className="admin-stars">
                  {"★".repeat(
                    Math.max(
                      0,
                      Math.min(5, Number(review.rating) || 0)
                    )
                  )}
                </div>

              </div>


              <p>{review.message}</p>


              <div className="admin-review-actions">

                {!review.is_approved && (
                  <button
                    type="button"
                    className="admin-primary-button small"
                    disabled={busyId === review.id}
                    onClick={() => moderate(review, true)}
                  >
                    <Check size={14} />
                    Approve
                  </button>
                )}

                {review.is_approved && (
                  <button
                    type="button"
                    className="admin-ghost-button small"
                    disabled={busyId === review.id}
                    onClick={() => moderate(review, false)}
                  >
                    <X size={14} />
                    Unapprove
                  </button>
                )}

              </div>

            </article>

          ))}

        </div>

      )}

    </>

  );

}


/* =========================================================
   ACTIVITY
========================================================= */

function Activity() {

  const {
    data,
    loading,
    error,
    reload
  } = useAdminData("list_audit", {}, []);


  const entries =
    data?.entries || [];


  return (

    <>

      <PageHead
        eyebrow="Platform"
        title="Admin activity"
        description="Every action any admin has taken."
        onReload={reload}
      />


      {error && (
        <div className="admin-error">{error}</div>
      )}


      {loading ? (

        <Loading />

      ) : !entries.length ? (

        <Empty
          icon={ScrollText}
          title="No activity yet"
          text="Admin actions will be recorded here."
        />

      ) : (

        <div className="admin-list">

          {entries.map(entry => (

            <div
              key={entry.id}
              className="admin-list-row static"
            >

              <div className="admin-list-main">

                <div className="admin-row-top">
                  <strong>
                    {entry.action.replace(/_/g, " ")}
                  </strong>
                </div>

                <span className="admin-row-sub">
                  {entry.admin_email || "unknown admin"}
                  {" · "}
                  {formatDate(entry.created_at)}
                  {entry.detail?.reason
                    ? ` · ${entry.detail.reason}`
                    : ""}
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </>

  );

}


/* =========================================================
   DRAWER
========================================================= */

function Drawer({
  title,
  eyebrow,
  onClose,
  children
}) {

  useEffect(
    () => {

      function onKey(event) {
        if (event.key === "Escape") {
          onClose();
        }
      }

      window.addEventListener("keydown", onKey);

      return () => {
        window.removeEventListener("keydown", onKey);
      };

    },
    [onClose]
  );


  return (

    <div className="admin-drawer-layer">

      <button
        type="button"
        className="admin-drawer-backdrop"
        aria-label="Close"
        onClick={onClose}
      />

      <aside className="admin-drawer">

        <header>
          <div>
            {eyebrow && (
              <span className="admin-eyebrow">
                {eyebrow}
              </span>
            )}
            <h2>{title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </header>

        <div className="admin-drawer-body">
          {children}
        </div>

      </aside>

    </div>

  );

}


function Field({ label, children }) {

  return (
    <div className="admin-field">
      <label>{label}</label>
      <div>{children}</div>
    </div>
  );

}