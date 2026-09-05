import {
  useEffect,
  useState
} from "react";


import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Sparkles,
  ChevronRight,
  Eye,
  Bot,
  ExternalLink,
  CheckCircle2,
  Circle,
  Zap,
  Store
} from "lucide-react";


import {
  supabase
} from "../lib/supabase";

import InstallModal
  from "./components/InstallModal";


import {
  usePwaInstall
} from "./hooks/usePwaInstall";


import Sidebar
  from "./components/Sidebar";


import Topbar
  from "./components/Topbar";


import MobileBottomNav
  from "./components/MobileBottomNav";


import {
  useTheme
} from "./hooks/useTheme";

import Products
  from "./pages/Products";

import Orders
  from "./pages/Orders";

import Payments
  from "./pages/Payments";


  import Customers
  from "./pages/Customers";


  import Messages
  from "./pages/Messages";


import useBusinessRealtime
  from "./hooks/useBusinessRealtime";


import StorePage
  from "./pages/Store";


  import WalletPage from "./pages/Wallet";


import PlansBilling
  from "./pages/PlansBilling";


  import {
  useBillingRealtime
} from "./hooks/useBillingRealtime";


import {
  usePlanAccess
} from "./hooks/usePlanAccess";


import AiAssistant
  from "./pages/AiAssistant";


  import NotificationDrawer
  from "./components/NotificationDrawer";

import SettingsPage
  from "./pages/Settings";

import AnalyticsPage
  from "./pages/Analytics";



import HelpSupportPage
  from "./pages/HelpSupport";

  import Reviews from "./pages/Reviews";

  import Channels from "./pages/Channels";

/* =========================================================
   APP
========================================================= */

export default function App() {


  /* =========================================================
     THEME
  ========================================================= */

  const {
    theme,
    toggleTheme
  } = useTheme();


    /* =========================================
     PWA HOOK
  ========================================= */

  const {
    canInstall,
    installed,
    isIOS,
    installApp
  } = usePwaInstall();



  /* =========================================================
     STATE
  ========================================================= */

    const [installModalOpen, setInstallModalOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);


  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  const [
  activePage,
  setActivePage
] =
  useState(() => {


    const params =
      new URLSearchParams(
        window.location.search
      );


    if (
      params.get(
        "subscription_payment"
      ) ===
      "return"
    ) {

      return "Plans & Billing";

    }


    return "Overview";

  });


  const [user, setUser] =
    useState(null);


  const [profile, setProfile] =
    useState(null);


  const [business, setBusiness] =
    useState(null);


    const [
  subscription,
  setSubscription
] =
  useState(null);

  const [
  billingWallet,
  setBillingWallet
] =
  useState(null);



  const [error, setError] =
    useState("");

    const [dashboardStats, setDashboardStats] =
  useState({
    products: 0,
    orders: 0,
    customers: 0,
    totalSales: 0
  });


  const [
  recentOrders,
  setRecentOrders
] =
  useState([]);
  

  const [
  notificationsOpen,
  setNotificationsOpen
] =
  useState(false);


const [
  unreadNotifications,
  setUnreadNotifications
] =
  useState(0);

  useEffect(() => {

  if (!sidebarOpen) return;

  /* iOS ignores overflow:hidden on body, so pin the scroll
     position with position:fixed and restore it on close. */

  const scrollY = window.scrollY;

  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";

  return () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, scrollY);
  };

}, [sidebarOpen]);


  /* =========================================================
     LOAD DASHBOARD ACCOUNT
  ========================================================= */

  useEffect(() => {


    let isMounted =
      true;



    async function loadDashboard() {


      try {


        /* =========================================
           1. CHECK AUTH SESSION
        ========================================== */

        const {
          data: sessionData,
          error: sessionError
        } =
          await supabase.auth
            .getSession();



        if (sessionError) {

          throw sessionError;

        }



        const session =
          sessionData?.session;



        /* =========================================
           NOT LOGGED IN
        ========================================== */

        if (!session) {


         window.location.href = "https://www.runambiz.com/auth?mode=login";


          return;

        }



        const currentUser =
          session.user;



        if (isMounted) {

          setUser(
            currentUser
          );

        }




        /* =========================================
           2. LOAD PROFILE
        ========================================== */

        const {
          data: profileData,
          error: profileError
        } =
          await supabase
            .from("profiles")
            .select("*")
            .eq(
              "id",
              currentUser.id
            )
            .maybeSingle();



        if (profileError) {

          throw profileError;

        }



        /* =========================================
           USER HAS NOT COMPLETED ONBOARDING
        ========================================== */

        if (
          !profileData ||
          profileData.onboarding_completed !== true
        ) {


                  window.location.replace(
          "https://www.runambiz.com/onboarding.html"
        );


          return;

        }



        if (isMounted) {

          setProfile(
            profileData
          );

        }


        /* =========================================
           3. LOAD BUSINESS

           ?store=<id> opens a specific business you
           own. That is how an outreach store is
           edited with the real dashboard instead of
           a stripped-down admin form.

           Without the parameter we load your own
           business and deliberately skip outreach
           stores, so they never hijack your normal
           dashboard.
        ========================================== */

        const requestedStoreId =
          new URLSearchParams(
            window.location.search
          ).get("store");


        let businessQuery =
          supabase
            .from("businesses")
            .select("*")
            .eq(
              "owner_id",
              currentUser.id
            );


        if (requestedStoreId) {

          businessQuery =
            businessQuery.eq(
              "id",
              requestedStoreId
            );

        } else {

          businessQuery =
            businessQuery.eq(
              "is_outreach",
              false
            );

        }


        const {
          data: businessRows,
          error: businessError
        } =
          await businessQuery
            .order(
              "created_at",
              { ascending: true }
            )
            .limit(1);



        if (businessError) {

          throw businessError;

        }


        const businessData =
          (businessRows || [])[0] ||
          null;



        /* =========================================
           USER HAS NO BUSINESS YET
        ========================================== */

        if (!businessData) {


          /*
            A missing ?store means the id was wrong or
            somebody else owns it. Send them to their
            own dashboard rather than onboarding.
          */

          if (requestedStoreId) {

            window.location.replace(
              "dashboard.html"
            );

            return;

          }


          window.location.replace(
            "onboarding.html"
          );


          return;

        }


 if (
  isMounted
) {

  setBusiness(
    businessData
  );

}


/* =========================================
   LOAD SUBSCRIPTION
========================================= */

const {
  data:
    subscriptionData,

  error:
    subscriptionError
} =
  await supabase
    .from(
      "business_subscriptions"
    )
    .select(`
      business_id,
      plan_code,
      status,
      current_period_end,
      subscription_plans (
        code,
        name,
        is_paid,
        features
      )
    `)
    .eq(
      "business_id",
      businessData.id
    )
    .maybeSingle();


if (
  subscriptionError
) {

  throw subscriptionError;

}


if (
  isMounted
) {

  setSubscription(
    subscriptionData
  );

}


await loadDashboardStats(
  businessData.id
);







      } catch (err) {


        console.error(
          "Dashboard load error:",
          err
        );



        if (isMounted) {

          setError(
            err?.message ||
            "We couldn't load your dashboard."
          );

        }



      } finally {


        if (isMounted) {

          setLoading(
            false
          );

        }


      }


    }



    loadDashboard();



    return function cleanup() {

      isMounted =
        false;

    };


  }, []);


  /* =========================================================
   LOAD DASHBOARD STATS
========================================================= */

async function loadDashboardStats(
  businessId
) {

  if (!businessId) {
    return;
  }


  try {

   const [
  productsResult,
  ordersResult,
  customersResult,
  salesResult,
  recentOrdersResult
] =
  await Promise.all([


        /* PRODUCTS */

        supabase
          .from("products")
          .select(
            "*",
            {
              count: "exact",
              head: true
            }
          )
          .eq(
            "business_id",
            businessId
          ),


        /* ORDERS */

        supabase
          .from("orders")
          .select(
            "*",
            {
              count: "exact",
              head: true
            }
          )
          .eq(
            "business_id",
            businessId
          ),


        /* CUSTOMERS */

        supabase
          .from("customers")
          .select(
            "*",
            {
              count: "exact",
              head: true
            }
          )
          .eq(
            "business_id",
            businessId
          ),


        /* PAID SALES */

        supabase
          .from("orders")
          .select(
            "total"
          )
          .eq(
            "business_id",
            businessId
          )
          .eq(
            "payment_status",
            "paid"
          )

          ,


/* RECENT ORDERS */

supabase
  .from(
    "orders"
  )
  .select(`
    id,
    order_number,
    customer_name,
    total,
    currency,
    status,
    payment_status,
    channel,
    created_at
  `)
  .eq(
    "business_id",
    businessId
  )
  .order(
    "created_at",
    {
      ascending:
        false
    }
  )
  .limit(
    4
  )

      ]);


    if (productsResult.error) {
      throw productsResult.error;
    }

    if (ordersResult.error) {
      throw ordersResult.error;
    }

    if (customersResult.error) {
      throw customersResult.error;
    }

    if (salesResult.error) {
      throw salesResult.error;
    }

if (
  recentOrdersResult.error
) {

  throw recentOrdersResult.error;

}


    const totalSales =
      (salesResult.data || [])
        .reduce(
          (
            total,
            order
          ) =>
            total +
            Number(
              order.total || 0
            ),
          0
        );


        setRecentOrders(
  recentOrdersResult.data ||
  []
);

    setDashboardStats({
      products:
        productsResult.count || 0,

      orders:
        ordersResult.count || 0,

      customers:
        customersResult.count || 0,

      totalSales
    });


  } catch (err) {

    console.error(
      "Dashboard stats error:",
      err
    );

  }

}


const realtimeVersion =
  useBusinessRealtime(
    business?.id
  );


  /* =========================================================
   NOTIFICATION COUNT — REALTIME + PWA RESUME
========================================================= */

useEffect(
  () => {

    if (
      !business?.id
    ) {

      setUnreadNotifications(
        0
      );

      return;

    }


    let mounted =
      true;


    async function loadUnread() {

      const {
        count,
        error:
          notificationError
      } =
        await supabase
          .from(
            "notifications"
          )
          .select(
            "id",
            {
              count:
                "exact",

              head:
                true
            }
          )
          .eq(
            "business_id",
            business.id
          )
          .eq(
            "is_read",
            false
          );


      if (
        notificationError
      ) {

        console.error(
          "Unread notifications error:",
          notificationError
        );

        return;

      }


      if (
        mounted
      ) {

        setUnreadNotifications(
          count ||
          0
        );

      }

    }


    loadUnread();


    const channel =
      supabase
        .channel(
          `runambiz-notifications-${business.id}`
        )
        .on(
          "postgres_changes",
          {

            event:
              "*",

            schema:
              "public",

            table:
              "notifications",

            filter:
              `business_id=eq.${business.id}`

          },
          loadUnread
        )
        .subscribe();



    function refreshWhenVisible() {

      if (
        document.visibilityState ===
        "visible"
      ) {

        loadUnread();

      }

    }


    document.addEventListener(
      "visibilitychange",
      refreshWhenVisible
    );


    window.addEventListener(
      "focus",
      loadUnread
    );


    return () => {

      mounted =
        false;


      document.removeEventListener(
        "visibilitychange",
        refreshWhenVisible
      );


      window.removeEventListener(
        "focus",
        loadUnread
      );


      supabase.removeChannel(
        channel
      );

    };

  },
  [
    business?.id
  ]
);

  useEffect(() => {

  if (!business?.id) {
    return;
  }


  loadDashboardStats(
    business.id
  );


}, [
  business?.id,
  realtimeVersion
]);




  /* =========================================================
     LOG OUT
  ========================================================= */

 async function handleLogout() {


  const confirmed =
    window.confirm(
      "Are you sure you want to sign out of Runambiz?"
    );


  if (
    !confirmed
  ) {

    return;

  }


  try {


    const {
      error:
        logoutError
    } =
      await supabase
        .auth
        .signOut();


    if (
      logoutError
    ) {

      throw logoutError;

    }


    window.location.replace(
      "index.html"
    );


  } catch (
    err
  ) {


    console.error(
      "Logout error:",
      err
    );


    setError(

      err?.message ||

      "We couldn't sign you out. Please try again."

    );


  }


}


  /* =========================================================
     CHANGE DASHBOARD PAGE
  ========================================================= */

  function navigateTo(page) {


    setActivePage(
      page
    );


    setSidebarOpen(
      false
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


  }



  useBillingRealtime({

  businessId:
    business?.id,

  onSubscriptionChange:
    setSubscription,

  onWalletChange:
    setBillingWallet

});


/* =========================================================
   PLAN ACCESS

   Core Runambiz features remain available to Free users.
   Paid plans mainly add promotion/member/growth benefits.
========================================================= */

const planAccess =
  usePlanAccess({

    subscription

  });


  /* =========================================================
     LOADING SCREEN
  ========================================================= */

  if (loading) {


    return (

      <div className="dashboard-loading">


        <div className="dashboard-loader-mark">
             <img
            src="/icons/icon-192.png"
            alt="" className="install-brand-icon"
          />

          

        </div>


        <div className="dashboard-spinner"></div>


        <p>
          Loading your business...
        </p>


      </div>

    );


  }



  /* =========================================================
     ERROR SCREEN
  ========================================================= */

  if (error) {


    return (

      <div className="dashboard-error-page">


        <div>


          <div className="dashboard-error-icon">

            <Zap size={25} />

          </div>


          <h1>
            We couldn't load Runambiz
          </h1>


          <p>
            {error}
          </p>


          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >

            Try again

          </button>


        </div>


      </div>

    );


  }



  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const fullName =
    profile?.full_name?.trim() ||
    "Runambiz User";


  const firstName =
    fullName
      .split(/\s+/)[0] ||
    "there";


  const businessName =
    business?.name?.trim() ||
    "Your business";


    const currentPlanCode =
  planAccess
    ?.effectivePlanCode ||
  subscription?.plan_code ||
  "free";


const currentPlanName =
  planAccess
    ?.plan
    ?.name ||
  subscription
    ?.subscription_plans
    ?.name ||
  "Free";


const isFreePlan =
  currentPlanCode ===
  "free";



    /* =========================================================
   SETUP PROGRESS
========================================================= */

const setupStatus = {

  business:
    Boolean(
      business?.id
    ),

  product:
    dashboardStats.products >
    0,

  ai:
    business
      ?.store_ai_setup_status ===
    "completed",

  published:
    business
      ?.is_published ===
    true

};


const completedSetupSteps =
  Object.values(setupStatus)
    .filter(Boolean)
    .length;


const setupProgress =
  Math.round(
    (
      completedSetupSteps /
      Object.keys(setupStatus).length
    ) * 100
  );




  /* =========================================================
     DASHBOARD
  ========================================================= */

  return (

  <div
  className={
    `dashboard-app theme-${theme}`
  }
>



      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}

      {sidebarOpen && (

        <button
          type="button"
          className="sidebar-overlay"
          aria-label="Close navigation"

          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}



      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar

        open={
          sidebarOpen
        }

        activePage={
          activePage
        }

        business={
          business
        }

        onClose={() =>
          setSidebarOpen(false)
        }

        onSelect={
          navigateTo
        }

        onLogout={
          handleLogout
        }

        planAccess={
          planAccess
        }

      />


      <NotificationDrawer

  open={
    notificationsOpen
  }

  business={
    business
  }

  onClose={() =>
    setNotificationsOpen(
      false
    )
  }

  onNavigate={
    navigateTo
  }

  onUnreadChange={
    setUnreadNotifications
  }

/>

      <button
        type="button"
        className="dashboard-float-help"
        aria-label="Help and support"
        title="Help & support"
        onClick={() => navigateTo("Help & Support")}
      >
        <Bot size={24} />
      </button>



      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <main className="dashboard-main">



{business?.is_outreach && (

  <div className="outreach-editing-banner">

    <strong>Outreach store</strong>

    <span>
      You're editing {business.name} for a prospect.
      Changes are live on their preview link.
    </span>

    <a href="/admin.html">
      Back to admin
    </a>

  </div>

)}


        {/* ===================================================
            TOPBAR
        ==================================================== */}

        <Topbar

  theme={theme}

  profile={profile}

  user={user}

  business={
  business
}

notificationCount={
  unreadNotifications
}

onNotificationsOpen={() =>
  setNotificationsOpen(
    true
  )
}

onProfileOpen={() =>
  navigateTo(
    "Settings"
  )
}

  installed={installed}

  onMenuOpen={() =>
    setSidebarOpen(true)
  }

  onThemeToggle={
    toggleTheme
  }
    onHelpOpen={() => navigateTo("Help & Support")}

  onInstallOpen={() =>
    setInstallModalOpen(true)
  }

  

/>

{isFreePlan && (

  <section className="dashboard-upgrade-strip">


    <div className="dashboard-upgrade-strip-icon">

      <Sparkles
        size={17}
      />

    </div>


    <div className="dashboard-upgrade-strip-copy">

      <strong>
        You're on the Free plan
      </strong>

      <span>
        Keep the core Runambiz tools free.
        Upgrade for promotion, member benefits
        and higher plan capacity.
      </span>

    </div>


    <button

      type="button"

    onClick={() =>
 navigateTo("Plans & Billing")
}
    >

      Upgrade plan

      <ChevronRight
        size={15}
      />

    </button>


  </section>

)}



        {/* ===================================================
            OVERVIEW PAGE
        ==================================================== */}

        {activePage === "Overview" ? (

          <div className="dashboard-content">



            {/* =================================================
                WELCOME
            ================================================== */}

            <section className="dashboard-heading">


              <div>


                <span className="dashboard-eyebrow">

                  Overview

                </span>


                <h1>

                  Good to see you,{" "}
                  {firstName}.

                </h1>


                <p>

                  Here's what's happening with{" "}
                  {businessName} today.

                </p>


              </div>



              <button
                type="button"
                className="primary-dashboard-button"

                onClick={() =>
                  navigateTo("Products")
                }
              >

                <Plus size={17} />

                <span>
                  Add product
                </span>

              </button>


            </section>



            {/* =================================================
                METRICS
            ================================================== */}

            <section className="metric-grid">


              <MetricCard

  label="Total sales"

  value={
    new Intl.NumberFormat(
      "en-NG",
      {
        style: "currency",
        currency:
          business?.currency ||
          "NGN",

        maximumFractionDigits: 0
      }
    ).format(
      dashboardStats.totalSales
    )
  }

  note={
    dashboardStats.totalSales > 0
      ? "Confirmed payments"
      : "No sales yet"
  }

  icon={
    TrendingUp
  }

/>



<MetricCard

  label="Orders"

  value={String(dashboardStats.orders)}

  note={
    dashboardStats.orders > 0
      ? `${dashboardStats.orders} order${
          dashboardStats.orders === 1 ? "" : "s"
        } received`
      : "No orders yet"
  }

  icon={ShoppingBag}

/>



            <MetricCard

  label="Customers"

  value={
    String(
      dashboardStats.customers
    )
  }

  note={
    dashboardStats.customers > 0
      ? `${dashboardStats.customers} customer${
          dashboardStats.customers === 1
            ? ""
            : "s"
        }`
      : "Build your customer list"
  }

  icon={
    Users
  }

/>




             <MetricCard

  label="Products"

  value={
    String(
      dashboardStats.products
    )
  }

  note={
    dashboardStats.products > 0
      ? `${dashboardStats.products} product${
          dashboardStats.products === 1
            ? ""
            : "s"
        } in your catalog`
      : "Add your first product"
  }

  icon={
    Package
  }

/>


            </section>



            {/* =================================================
                MAIN GRID
            ================================================== */}

            <section className="dashboard-grid">



              {/* ===============================================
                  GET STARTED
              ================================================ */}

              <article className="dashboard-panel getting-started">



                               <div className="panel-heading">


                  <div>


                    <span className="panel-kicker">

                      GET STARTED

                    </span>


                    <h2>

                      {setupProgress === 100
                        ? "Runambiz is set up"
                        : "Finish setting up Runambiz"}

                    </h2>


                    <p>

                      {setupProgress === 100
                        ? "Everything is ready. Your store is live for customers."
                        : "Complete these steps before publishing your store."}

                    </p>


                  </div>



                  <span className="setup-percent">

  {setupProgress}%

</span>


                </div>



               <div className="setup-progress">

  <span
    style={{
      width:
        `${setupProgress}%`
    }}
  ></span>

</div>


                <SetupItem

                  complete

                  title="Create your business"

                  description={
                    businessName +
                    " is ready."
                  }

                />


<SetupItem

  complete={
    setupStatus.product
  }

  title="Add your first product"

  description={
    setupStatus.product
      ? `${dashboardStats.products} product${
          dashboardStats.products === 1
            ? ""
            : "s"
        } added to your catalog.`
      : "Add photos, pricing and stock."
  }

  onClick={() =>
    navigateTo("Products")
  }

/>



         <SetupItem

  complete={
    setupStatus.ai
  }

  title="Train your AI assistant"

  description={
    setupStatus.ai

      ? "Your Runambiz AI Brain is ready."

      : business
          ?.store_ai_setup_status ===
        "in_progress"

        ? "Continue your AI business setup."

        : "Let AI learn your business and build your Store."
  }

  onClick={() =>
    navigateTo(
      "AI Assistant"
    )
  }

/>



               <SetupItem

  complete={
    setupStatus.published
  }

  title="Publish your storefront"

  description={
    setupStatus.published
      ? "Your storefront is live."
      : "Make your store available to customers."
  }

  onClick={() =>
    navigateTo(
      "Store"
    )
  }

/>




              </article>



              {/* ===============================================
                  STORE STATUS
              ================================================ */}

              <article className="dashboard-panel store-status">



                <div className="panel-heading compact">


                  <div>


                    <span className="panel-kicker">

                      YOUR STOREFRONT

                    </span>


                    <h2>

                      {businessName}

                    </h2>


                  </div>



                  <span
                    className={
                      business?.is_published

                        ? "status-badge published"

                        : "status-badge"
                    }
                  >


                    <span></span>


                    {
                      business?.is_published

                        ? "Published"

                        : "Unpublished"
                    }


                  </span>


                </div>



                <div className="store-preview">



                  <div className="store-preview-top">


                   <div className="store-preview-logo">


  {business?.logo_url ? (

    <img

      src={
        business.logo_url
      }

      alt={
        businessName
      }

    />

  ) : (

    businessName
      .charAt(0)
      .toUpperCase()

  )}


</div>


                  </div>



                  <strong>

                    {businessName}

                  </strong>



                  <span>

                    {
                      business?.location ||
                      "Location not added"
                    }

                  </span>



                  <p>

                    {
                      business?.description ||

                      "Your business description will appear here."
                    }

                  </p>


                </div>



                <button
                  type="button"
                  className="panel-button"

                  onClick={() =>
                    navigateTo(
                      "Storefront"
                    )
                  }
                >

                  <Eye size={16} />

                  Preview store

                  <ExternalLink
                    size={14}
                  />

                </button>


              </article>


            </section>



            {/* =================================================
                AI ASSISTANT
            ================================================== */}

          <section className="ai-dashboard-card">


  <div className="ai-card-icon">

    <Sparkles size={22} />

  </div>


  <div className="ai-card-copy">


    <span>
      RUNAMBIZ AI
    </span>


    <h2>

      {business
        ?.store_ai_setup_status ===
        "completed"

        ? "Your AI Brain is ready."

        : business
            ?.store_ai_setup_status ===
          "in_progress"

          ? "Your AI setup is in progress."

          : "Your AI store manager is waiting."}

    </h2>


    <p>

      {business
        ?.store_ai_setup_status ===
        "completed"

        ? "Runambiz now understands your approved Store information and initial business knowledge."

        : business
            ?.store_ai_setup_status ===
          "in_progress"

          ? "Continue answering a few questions so Runambiz can finish preparing your Store and AI Brain."

          : "Answer a few questions and Runambiz AI will prepare your Store and learn the important parts of your business."}

    </p>


  </div>


  <button

    type="button"

    onClick={() =>
      navigateTo(
        "AI Assistant"
      )
    }

  >

    {business
      ?.store_ai_setup_status ===
      "completed"

      ? "Open AI Brain"

      : business
          ?.store_ai_setup_status ===
        "in_progress"

        ? "Continue setup"

        : "Set up AI"}

    <ChevronRight size={17} />

  </button>


</section>



            {/* =================================================
                RECENT ORDERS
            ================================================== */}

            <section className="dashboard-panel recent-orders">



              <div className="panel-heading compact">


                <div>


                  <span className="panel-kicker">

                    ORDERS

                  </span>


                  <h2>

                    Recent orders

                  </h2>


                </div>



                <button
                  type="button"
                  className="text-action"

                  onClick={() =>
                    navigateTo(
                      "Orders"
                    )
                  }
                >

                  View all

                  <ChevronRight size={15} />

                </button>


              </div>



              {recentOrders.length ? (

  <div className="dashboard-recent-order-list">


    {recentOrders.map(
      order => {


        const paid =
          order.payment_status ===
          "paid";


        const awaitingConfirmation =

          order.payment_status ===
            "awaiting_confirmation"

          ||

          order.status ===
            "payment_submitted";


        const statusLabel =

          paid

            ? "Paid"

            : awaitingConfirmation

              ? "Confirm payment"

              : String(
                  order.status ||
                  "pending"
                )
                  .replace(
                    /_/g,
                    " "
                  );


        return (

          <button

            type="button"

            key={
              order.id
            }

            className="dashboard-recent-order"

            onClick={() =>
              navigateTo(
                "Orders"
              )
            }

          >


            <div className="dashboard-recent-order-icon">

              <ShoppingBag
                size={16}
              />

            </div>



            <div className="dashboard-recent-order-copy">


              <div>

                <strong>

                  {order.order_number ||
                    "Order"}

                </strong>


                <span
                  className={
                    paid
                      ? "recent-order-status paid"
                      : awaitingConfirmation
                        ? "recent-order-status attention"
                        : "recent-order-status"
                  }
                >

                  {statusLabel}

                </span>

              </div>


              <p>

                {order.customer_name ||
                  "Customer"}

              </p>


              <small>

                {order.channel
                  ? `${order.channel} · `
                  : ""}

                {new Date(
                  order.created_at
                )
                  .toLocaleDateString(
                    undefined,
                    {
                      month:
                        "short",

                      day:
                        "numeric"
                    }
                  )}

              </small>


            </div>



            <div className="dashboard-recent-order-total">

              <strong>

                {order.currency ||
                  business?.currency ||
                  "NGN"}

                {" "}

                {Number(
                  order.total ||
                  0
                )
                  .toLocaleString()}

              </strong>


              <ChevronRight
                size={15}
              />

            </div>


          </button>

        );

      }
    )}


  </div>

) : (

  <div className="empty-state">


    <div className="empty-state-icon">

      <ShoppingBag
        size={24}
      />

    </div>


    <h3>
      No orders yet
    </h3>


    <p>
      Orders will appear here once
      customers begin buying from
      your store.
    </p>


  </div>

)}

            </section>


                   </div>


      ) : activePage === "Products" ? (

  <Products

  business={
    business
  }

  user={
    user
  }

  refreshKey={
    realtimeVersion
  }

  onProductsChanged={
    async () => {

      if (
        business?.id
      ) {

        await loadDashboardStats(
          business.id
        );

      }

    }
  }

/>





) : activePage === "Orders" ? (

 <Orders

  business={
    business
  }

  refreshKey={
    realtimeVersion
  }

  onOrdersChanged={
    async () => {

      if (
        business?.id
      ) {

        await loadDashboardStats(
          business.id
        );

      }

    }
  }

/>

) : activePage === "Reviews" ? (
 
  <Reviews
    business={business}
    refreshKey={realtimeVersion}
  />

) : activePage === "Wallet" ? (

  <WalletPage
    business={
      business
    }

    refreshKey={
      realtimeVersion
    }
  />


  ) : activePage === "Plans & Billing" ? (

  <PlansBilling

    business={business}

    liveSubscription={
      subscription
    }

    liveWallet={
      billingWallet
    }

    planAccess={
      planAccess
    }

  />



) : activePage === "Customers" ? (

 <Customers

  business={
    business
  }

  refreshKey={
    realtimeVersion
  }

/>


  ) : activePage === "Messages" ? (

  <Messages
    business={
      business
    }
  />




) : activePage === "Payments" ? (

 <Payments

  business={
    business
  }

  refreshKey={
    realtimeVersion
  }

/>

) : (
  activePage === "Store" ||
  activePage === "Storefront"
) ? (

  <StorePage

    business={
      business
    }

    planAccess={
      planAccess
    }

    onBusinessChanged={
      async updatedBusiness => {

        setBusiness(
          updatedBusiness
        );

        if (
          updatedBusiness?.id
        ) {

          await loadDashboardStats(
            updatedBusiness.id
          );

        }

      }
    }

  />

) : activePage ===
  "AI Assistant" ? (

  <AiAssistant

    business={
      business
    }

    onBusinessChanged={
      async updatedBusiness => {

        setBusiness(
          updatedBusiness
        );

        if (
          updatedBusiness?.id
        ) {

          await loadDashboardStats(
            updatedBusiness.id
          );

        }

      }
    }

  />

  ) : activePage ===
  "Analytics" ? (

  <AnalyticsPage

    business={
      business
    }

  />

) : activePage ===
  "Settings" ? (

  <SettingsPage

    profile={
      profile
    }

    user={
      user
    }

    business={
      business
    }

    subscription={
      subscription
    }

    billingWallet={
      billingWallet
    }

    theme={
      theme
    }

    onThemeToggle={
      toggleTheme
    }

    onProfileChanged={
      updatedProfile =>
        setProfile(
          updatedProfile
        )
    }

    onNavigate={
      navigateTo
    }

  />



  ) : activePage ===
  "Help & Support" ? (

  <HelpSupportPage

  business={
    business
  }

  user={
    user
  }

  profile={
    profile
  }

  onNavigate={
    navigateTo
  }

  onBusinessChanged={
    async updatedBusiness => {

      setBusiness(
        updatedBusiness
      );

      if (
        updatedBusiness?.id
      ) {

        await loadDashboardStats(
          updatedBusiness.id
        );

      }

    }
  }

/>

) : activePage === "Channels" ? (

  <Channels
    business={business}
    onNavigate={setActivePage}
  />


) : (



  <ComingSoonPage
    page={activePage}
    onBack={() =>
      navigateTo("Overview")
    }
  />

)}



      </main>


<InstallModal

  open={
    installModalOpen
  }

  canInstall={
    canInstall
  }

  installed={
    installed
  }

  isIOS={
    isIOS
  }

  onClose={() =>
    setInstallModalOpen(false)
  }

  onInstall={
    async function () {

      const result =
        await installApp();


      if (
        result.outcome === "accepted"
      ) {

        setInstallModalOpen(
          false
        );

      }

    }
  }

/>


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <MobileBottomNav

        activePage={
          activePage
        }

        onSelect={
          navigateTo
        }

        onMore={() =>
          setSidebarOpen(true)
        }

      />


    </div>

  );

}



/* =========================================================
   METRIC CARD
========================================================= */

function MetricCard({
  label,
  value,
  note,
  icon: Icon
}) {


  return (

    <article className="metric-card">



      <div className="metric-top">


        <span>

          {label}

        </span>



        <div className="metric-icon">

          <Icon size={18} />

        </div>


      </div>



      <strong>

        {value}

      </strong>



      <p>

        {note}

      </p>


    </article>

  );

}



/* =========================================================
   SETUP ITEM
========================================================= */

function SetupItem({
  complete = false,
  title,
  description,
  onClick
}) {


  return (

    <button

      type="button"

      className={
        complete

          ? "setup-item completed"

          : "setup-item"
      }

      onClick={
        complete
          ? undefined
          : onClick
      }

      disabled={
        complete
      }

    >



      <div
        className={
          complete

            ? "setup-check complete"

            : "setup-check"
        }
      >


        {complete ? (

          <CheckCircle2 size={20} />

        ) : (

          <Circle size={20} />

        )}


      </div>



      <div>


        <strong>

          {title}

        </strong>


        <span>

          {description}

        </span>


      </div>



      {!complete && (

        <ChevronRight size={17} />

      )}


    </button>

  );

}



/* =========================================================
   COMING SOON PAGE
========================================================= */

function ComingSoonPage({
  page,
  onBack
}) {


  return (

    <div className="dashboard-content">



      <section className="module-placeholder">



        <div className="module-icon">

          <Zap size={25} />

        </div>



        <span>

          RUNAMBIZ

        </span>



        <h1>

          {page}

        </h1>



        <p>

          The {page.toLowerCase()} module
          will be connected next.

        </p>



        <button
          type="button"
          className="module-back-button"
          onClick={onBack}
        >

          Back to overview

        </button>


      </section>


    </div>

  );

}
