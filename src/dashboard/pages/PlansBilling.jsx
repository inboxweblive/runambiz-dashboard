import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";


import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  RefreshCw,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Zap
} from "lucide-react";


import {
  supabase
} from "../../lib/supabase";


/* =========================================================
   FEATURE LABELS
========================================================= */

const PLAN_FEATURES = {

  free: [
    "Store website",
    "AI assistant",
    "Telegram channel",
    "Unlimited products"
  ],

  starter: [
    "Everything in Free",
    "Higher reply limit",
    "Custom store link",
    "Invoices & analytics"
  ],

  business: [
    "Everything in Starter",
    "Dedicated WhatsApp number",
    "Paystack automation",
    "Priority support"
  ],

  pro: [
    "Everything in Business",
    "Multiple stores",
    "Team access",
    "Custom domain & API"
  ]

};



/* =========================================================
   COMPONENT
========================================================= */

export default function PlansBilling({

  business,

  liveSubscription,

  liveWallet

}) {


    useEffect(
  () => {

    if (
      liveSubscription
    ) {

      setSubscription(
        liveSubscription
      );

    }

  },
  [
    liveSubscription
  ]
);


useEffect(
  () => {

    if (
      liveWallet
    ) {

      setWallet(
        liveWallet
      );

    }

  },
  [
    liveWallet
  ]
);

  /* =======================================================
     STATE
  ======================================================= */

  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    plans,
    setPlans
  ] =
    useState([]);


  const [
    subscription,
    setSubscription
  ] =
    useState(null);


  const [
    wallet,
    setWallet
  ] =
    useState(null);


  const [
    checkoutPlan,
    setCheckoutPlan
  ] =
    useState("");


  const [
    verifying,
    setVerifying
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    notice,
    setNotice
  ] =
    useState(null);


  const [
    paymentHistory,
    setPaymentHistory
  ] =
    useState([]);


  const [
    historyLoading,
    setHistoryLoading
  ] =
    useState(false);


  const [
    scheduledChange,
    setScheduledChange
  ] =
    useState(null);


  const [
    planChangePlan,
    setPlanChangePlan
  ] =
    useState("");


  const [
    cancellingPlanChange,
    setCancellingPlanChange
  ] =
    useState(false);


  const returnHandled =
    useRef(false);


    const [
  managingAction,
  setManagingAction
] =
  useState("");


  /* =======================================================
     LOAD BILLING
  ======================================================= */

  const loadBilling =
    useCallback(
      async function () {


        if (
          !business?.id
        ) {

          return;

        }


        setLoading(
          true
        );


        setError("");


        try {


          const [
            plansResult,
            subscriptionResult,
            walletResult,
            paymentsResult,
            planChangeResult
          ] =
            await Promise.all([


              /* ===============================
                 PLANS
              =============================== */

              supabase
                .from(
                  "subscription_plans"
                )
                .select(`
                  code,
                  name,
                  description,
                  is_paid,
                  is_active,
                  sort_order,
                  monthly_price_ngn,
                  billing_interval,
                  included_monthly_credits,
                  daily_credits,
                  features
                `)
                .eq(
                  "is_active",
                  true
                )
                .order(
                  "sort_order",
                  {
                    ascending:
                      true
                  }
                ),


              /* ===============================
                 CURRENT SUBSCRIPTION
              =============================== */

              supabase
                .from(
                  "business_subscriptions"
                )
                .select(`
                  business_id,
                  plan_code,
                  status,
                  current_period_start,
                  current_period_end,
                  next_payment_date,
                  cancel_at_period_end,
                  last_payment_at,
                  last_paid_plan_code,
                  subscription_end_reason
                `)
                .eq(
                  "business_id",
                  business.id
                )
                .maybeSingle(),


              /* ===============================
                 WALLET
              =============================== */

              supabase
                .from(
                  "ai_wallets"
                )
                .select(`
                  daily_balance,
                  daily_allowance,
                  plan_balance,
                  plan_allowance,
                  plan_period_start,
                  plan_period_end,
                  bonus_balance,
                  purchased_balance
                `)
                .eq(
                  "business_id",
                  business.id
                )
                .maybeSingle(),


              /* ===============================
                 SUBSCRIPTION PAYMENT HISTORY
              =============================== */

              supabase
                .from(
                  "subscription_payments"
                )
                .select(`
                  id,
                  plan_code,
                  provider,
                  provider_reference,
                  provider_transaction_id,
                  provider_subscription_code,
                  amount,
                  currency,
                  period_start,
                  period_end,
                  paid_at,
                  created_at
                `)
                .eq(
                  "business_id",
                  business.id
                )
                .order(
                  "paid_at",
                  {
                    ascending:
                      false
                  }
                )
                .limit(20),


              /* ===============================
                 ACTIVE SCHEDULED PLAN CHANGE
              =============================== */

              supabase
                .from(
                  "subscription_plan_changes"
                )
                .select(`
                  id,
                  from_plan_code,
                  to_plan_code,
                  status,
                  effective_at,
                  created_at,
                  updated_at
                `)
                .eq(
                  "business_id",
                  business.id
                )
                .in(
                  "status",
                  [
                    "requested",
                    "scheduling",
                    "scheduled"
                  ]
                )
                .order(
                  "created_at",
                  {
                    ascending:
                      false
                  }
                )
                .limit(1)
                .maybeSingle()


            ]);


          if (
            plansResult.error
          ) {

            throw plansResult.error;

          }


          if (
            subscriptionResult.error
          ) {

            throw subscriptionResult.error;

          }


          if (
            walletResult.error
          ) {

            throw walletResult.error;

          }


          if (
            paymentsResult.error
          ) {

            throw paymentsResult.error;

          }


          if (
            planChangeResult.error
          ) {

            throw planChangeResult.error;

          }


          setPlans(
            plansResult.data ||
            []
          );


          setSubscription(
            subscriptionResult.data ||
            null
          );


          setWallet(
            walletResult.data ||
            null
          );


          setPaymentHistory(
            paymentsResult.data ||
            []
          );


          setScheduledChange(
            planChangeResult.data ||
            null
          );


        } catch (
          err
        ) {


          console.error(
            "Plans billing load error:",
            err
          );


          setError(
            err?.message ||
            "We couldn't load your billing information."
          );


        } finally {


          setLoading(
            false
          );

        }


      },
      [
        business?.id
      ]
    );



  /* =======================================================
     LOAD PAYMENT HISTORY ONLY

     Used by Realtime so a new Paystack payment can appear
     without making the whole Plans page flash/loading again.
  ======================================================= */

  const loadPaymentHistory =
    useCallback(
      async function () {


        if (
          !business?.id
        ) {

          return;

        }


        setHistoryLoading(
          true
        );


        try {


          const {
            data,
            error:
              historyError
          } =
            await supabase
              .from(
                "subscription_payments"
              )
              .select(`
                id,
                plan_code,
                provider,
                provider_reference,
                provider_transaction_id,
                provider_subscription_code,
                amount,
                currency,
                period_start,
                period_end,
                paid_at,
                created_at
              `)
              .eq(
                "business_id",
                business.id
              )
              .order(
                "paid_at",
                {
                  ascending:
                    false
                }
              )
              .limit(20);


          if (
            historyError
          ) {

            throw historyError;

          }


          setPaymentHistory(
            data ||
            []
          );


        } catch (
          err
        ) {


          console.error(
            "Subscription payment history error:",
            err
          );


        } finally {


          setHistoryLoading(
            false
          );

        }


      },
      [
        business?.id
      ]
    );



  /* =======================================================
     LOAD ACTIVE PLAN CHANGE ONLY
  ======================================================= */

  const loadScheduledChange =
    useCallback(
      async function () {


        if (
          !business?.id
        ) {

          return;

        }


        try {


          const {
            data,
            error:
              changeError
          } =
            await supabase
              .from(
                "subscription_plan_changes"
              )
              .select(`
                id,
                from_plan_code,
                to_plan_code,
                status,
                effective_at,
                created_at,
                updated_at
              `)
              .eq(
                "business_id",
                business.id
              )
              .in(
                "status",
                [
                  "requested",
                  "scheduling",
                  "scheduled"
                ]
              )
              .order(
                "created_at",
                {
                  ascending:
                    false
                }
              )
              .limit(1)
              .maybeSingle();


          if (
            changeError
          ) {

            throw changeError;

          }


          setScheduledChange(
            data ||
            null
          );


        } catch (
          err
        ) {


          console.error(
            "Scheduled plan change load error:",
            err
          );

        }


      },
      [
        business?.id
      ]
    );



  /* =======================================================
     FIRST LOAD
  ======================================================= */

  useEffect(
    () => {


      loadBilling();


    },
    [
      loadBilling
    ]
  );



  /* =======================================================
     PAYMENT HISTORY REALTIME + PWA RESUME

     business_subscriptions and ai_wallets are already
     synchronized by the global billing Realtime hook passed
     into this page as liveSubscription / liveWallet.

     This channel keeps the payment-history list live too.
  ======================================================= */

  useEffect(
    () => {


      if (
        !business?.id
      ) {

        return;

      }


      const channel =
        supabase
          .channel(
            `runambiz-plan-payments-${business.id}`
          )
          .on(
            "postgres_changes",
            {
              event:
                "*",

              schema:
                "public",

              table:
                "subscription_payments",

              filter:
                `business_id=eq.${business.id}`
            },
            () => {

              loadPaymentHistory();

            }
          )
          .on(
            "postgres_changes",
            {
              event:
                "*",

              schema:
                "public",

              table:
                "subscription_plan_changes",

              filter:
                `business_id=eq.${business.id}`
            },
            () => {

              loadScheduledChange();

            }
          )
          .subscribe();


      function refreshWhenVisible() {


        if (
          document.visibilityState ===
          "visible"
        ) {

          loadPaymentHistory();
          loadScheduledChange();

        }

      }


      document.addEventListener(
        "visibilitychange",
        refreshWhenVisible
      );


      return () => {


        document.removeEventListener(
          "visibilitychange",
          refreshWhenVisible
        );


        supabase.removeChannel(
          channel
        );

      };


    },
    [
      business?.id,
      loadPaymentHistory,
      loadScheduledChange
    ]
  );



  /* =======================================================
     VERIFY RETURN FROM PAYSTACK
  ======================================================= */

  useEffect(
    () => {


      if (
        !business?.id ||
        returnHandled.current
      ) {

        return;

      }


      const params =
        new URLSearchParams(
          window.location.search
        );


      const returned =
        params.get(
          "subscription_payment"
        ) ===
        "return";


      const reference =
        params.get(
          "reference"
        );


      if (
        !returned ||
        !reference
      ) {

        return;

      }


      returnHandled.current =
        true;


      verifyReturnedSubscription(
        reference
      );


    },
    [
      business?.id
    ]
  );



  /* =======================================================
     VERIFY SUBSCRIPTION PAYMENT
  ======================================================= */

  async function verifyReturnedSubscription(
    reference
  ) {


    setVerifying(
      true
    );


    setNotice({

      type:
        "loading",

      title:
        "Confirming subscription",

      message:
        "We're verifying your Paystack payment."

    });


    try {


      const {
        data,
        error:
          verifyError
      } =
        await supabase
          .functions
          .invoke(
            "verify-subscription-payment",
            {

              body: {

                reference

              }

            }
          );


      if (
        verifyError
      ) {

        throw verifyError;

      }


      if (
        !data?.success
      ) {

        throw new Error(
          data?.error ||
          "Subscription payment could not be confirmed."
        );

      }


      await loadBilling();


      setNotice({

        type:
          "success",

        title:
          `${data.planName || "Runambiz"} activated`,

        message:
          data.alreadyProcessed

            ? "Your subscription is active and your billing information is up to date."

            : `${
                Number(
                  data.planCredits ||
                  0
                )
                  .toLocaleString()
              } monthly Runambiz Credits have been added.`

      });


    } catch (
      err
    ) {


      console.error(
        "Subscription verification error:",
        err
      );


      setNotice({

        type:
          "error",

        title:
          "Payment not confirmed",

        message:
          err?.message ||
          "We couldn't confirm your subscription payment yet."

      });


    } finally {


      setVerifying(
        false
      );


      /*
        Remove Paystack callback parameters.
      */

      window.history
        .replaceState(
          {},
          document.title,
          window.location.pathname
        );

    }

  }



  /* =======================================================
     START SUBSCRIPTION
  ======================================================= */

  async function startSubscription(
    plan
  ) {


    if (
      !plan?.code ||
      plan.code ===
        "free"
    ) {

      return;

    }


    setError("");


    setNotice(null);


    setCheckoutPlan(
      plan.code
    );


    try {


      const {
        data,
        error:
          checkoutError
      } =
        await supabase
          .functions
          .invoke(
            "create-subscription-checkout",
            {

              body: {

                planCode:
                  plan.code

              }

            }
          );


      if (
        checkoutError
      ) {

        throw checkoutError;

      }


      if (
        !data?.success
      ) {


        if (
          data?.code ===
          "ALREADY_ON_PLAN"
        ) {

          await loadBilling();

        }


        throw new Error(
          data?.error ||
          "Subscription checkout could not be created."
        );

      }


      if (
        !data?.checkoutUrl
      ) {

        throw new Error(
          "Paystack checkout URL was not returned."
        );

      }


      window.location.href =
        data.checkoutUrl;


    } catch (
      err
    ) {


      console.error(
        "Subscription checkout error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't start your Paystack checkout."
      );


    } finally {


      setCheckoutPlan("");

    }

  }


  /* =========================================================
     SCHEDULE PAID PLAN CHANGE
  ========================================================= */

  async function schedulePlanChange(
    plan
  ) {


    if (
      !plan?.code ||
      currentPlanCode ===
        "free" ||
      plan.code ===
        currentPlanCode
    ) {

      return;

    }


    if (
      scheduledChange
    ) {

      setError(
        `A change to ${formatPlanName(
          scheduledChange.to_plan_code
        )} is already scheduled. Cancel it before choosing another plan.`
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Switch from ${currentPlan?.name || formatPlanName(
          currentPlanCode
        )} to ${plan.name} at the end of your current billing period? You will keep your current plan until then, and ${plan.name} will start on the scheduled billing date.`
      );


    if (
      !confirmed
    ) {

      return;

    }


    setPlanChangePlan(
      plan.code
    );


    setError("");
    setNotice(null);


    try {


      const {
        data,
        error:
          changeError
      } =
        await supabase
          .functions
          .invoke(
            "schedule-plan-change",
            {

              body: {

                targetPlanCode:
                  plan.code

              }

            }
          );


      if (
        changeError
      ) {

        throw changeError;

      }


      if (
        !data?.success
      ) {

        throw new Error(
          data?.error ||
          "We couldn't schedule your plan change."
        );

      }


      await Promise.all([
        loadScheduledChange(),
        loadBilling()
      ]);


      setNotice({

        type:
          "success",

        title:
          `${plan.name} scheduled`,

        message:
          data.effectiveAt
            ? `Your current plan stays active until ${formatBillingDate(
                data.effectiveAt
              )}. ${plan.name} will begin from that billing date.`
            : `Your switch to ${plan.name} has been scheduled.`

      });


    } catch (
      err
    ) {


      console.error(
        "Schedule plan change error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't schedule your plan change."
      );


    } finally {


      setPlanChangePlan("");

    }

  }



  /* =========================================================
     CANCEL SCHEDULED PLAN CHANGE
  ========================================================= */

  async function cancelScheduledPlanChange() {


    if (
      !scheduledChange
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Cancel your scheduled switch to ${formatPlanName(
          scheduledChange.to_plan_code
        )}? Your current ${formatPlanName(
          scheduledChange.from_plan_code
        )} subscription will resume normal renewal.`
      );


    if (
      !confirmed
    ) {

      return;

    }


    setCancellingPlanChange(
      true
    );


    setError("");
    setNotice(null);


    try {


      const {
        data,
        error:
          cancelError
      } =
        await supabase
          .functions
          .invoke(
            "cancel-plan-change",
            {

              body: {}

            }
          );


      if (
        cancelError
      ) {

        throw cancelError;

      }


      if (
        !data?.success
      ) {

        throw new Error(
          data?.error ||
          "We couldn't cancel the scheduled plan change."
        );

      }


      setScheduledChange(
        null
      );


      await loadBilling();


      setNotice({

        type:
          "success",

        title:
          "Plan change cancelled",

        message:
          data?.message ||
          "Your current subscription will continue renewing normally."

      });


    } catch (
      err
    ) {


      console.error(
        "Cancel scheduled plan change error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't cancel the scheduled plan change."
      );


    } finally {


      setCancellingPlanChange(
        false
      );

    }

  }



  /* =========================================================
   MANAGE ACTIVE SUBSCRIPTION
========================================================= */

async function manageSubscription(
  action
) {


  if (
    !action
  ) {

    return;

  }


  /*
    Confirm destructive action.
  */

  if (
    action === "cancel"
  ) {

    const confirmed =
      window.confirm(
        "Cancel your Runambiz subscription? You will keep your paid plan until the end of your current billing period."
      );


    if (
      !confirmed
    ) {

      return;

    }

  }


  setManagingAction(
    action
  );


  setError("");


  setNotice(null);


  try {


    const {
      data,
      error:
        manageError
    } =
      await supabase
        .functions
        .invoke(
          "manage-subscription",
          {

            body: {

              action

            }

          }
        );


    if (
      manageError
    ) {

      throw manageError;

    }


    if (
      !data?.success
    ) {

      throw new Error(
        data?.error ||
        "We couldn't update your subscription."
      );

    }



    /* =====================================================
       PAYMENT MANAGEMENT

       Paystack hosts this secure page.
    ====================================================== */

    if (
      action ===
      "payment_link"
    ) {


      if (
        !data?.manageUrl
      ) {

        throw new Error(
          "Paystack payment-management link was not returned."
        );

      }


      window.location.href =
        data.manageUrl;


      return;

    }



    /* =====================================================
       FAST LOCAL UPDATE

       Realtime will confirm this with the database.
       This simply makes the UI feel instantaneous.
    ====================================================== */

    if (
      action ===
      "cancel"
    ) {


      setSubscription(
        current => ({

          ...current,

          status:
            "non_renewing",

          cancel_at_period_end:
            true

        })
      );


      setNotice({

        type:
          "success",

        title:
          "Subscription cancelled",

        message:
          data.accessUntil

            ? `Your paid plan stays active until ${formatBillingDate(
                data.accessUntil
              )}.`

            : "Your plan will remain active until the end of the current billing period."

      });

    }



    if (
      action ===
      "resume"
    ) {


      setSubscription(
        current => ({

          ...current,

          status:
            "active",

          cancel_at_period_end:
            false

        })
      );


      setNotice({

        type:
          "success",

        title:
          "Subscription resumed",

        message:
          "Your Runambiz subscription will renew normally."

      });

    }


    /*
      Supabase Realtime will now receive the actual
      database update and synchronize the PWA.
    */


  } catch (
    err
  ) {


    console.error(
      "Manage subscription error:",
      err
    );


    setError(
      err?.message ||
      "We couldn't update your subscription."
    );


  } finally {


    setManagingAction("");

  }

}


  /* =======================================================
     DERIVED
  ======================================================= */

  const currentPlanCode =
    subscription?.plan_code ||
    "free";


  const currentStatus =
    subscription?.status ||
    "active";


    const isPaidPlan =
  currentPlanCode !==
  "free";


const isNonRenewing =
  currentStatus ===
    "non_renewing"
  ||
  subscription
    ?.cancel_at_period_end ===
    true;


const isPastDue =
  currentStatus ===
  "past_due";


const hasScheduledPlanChange =
  Boolean(
    scheduledChange &&
    [
      "requested",
      "scheduling",
      "scheduled"
    ]
      .includes(
        scheduledChange.status
      )
  );


const scheduledTargetPlan =
  useMemo(
    () => {

      if (
        !scheduledChange
      ) {

        return null;

      }

      return (
        plans.find(
          item =>
            item.code ===
            scheduledChange.to_plan_code
        )
        ||
        null
      );

    },
    [
      plans,
      scheduledChange
    ]
  );


const billingPeriodEnd =
  subscription
    ?.current_period_end
  ||
  null;


const nextPaymentDate =
  subscription
    ?.next_payment_date
  ||
  billingPeriodEnd
  ||
  null;



  const currentPlan =
    useMemo(
      () => {


        return (
          plans.find(
            item =>
              item.code ===
              currentPlanCode
          )
          ||
          plans.find(
            item =>
              item.code ===
              "free"
          )
          ||
          null
        );


      },
      [
        plans,
        currentPlanCode
      ]
    );


  const availableCredits =
    Number(
      wallet?.daily_balance ||
      0
    )
    +
    Number(
      wallet?.plan_balance ||
      0
    )
    +
    Number(
      wallet?.bonus_balance ||
      0
    )
    +
    Number(
      wallet?.purchased_balance ||
      0
    );



  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {

    return (

      <div className="dashboard-content">


        <div className="billing-page-loading">

          <Loader2
            size={24}
            className="spin"
          />

          <span>
            Loading plans...
          </span>

        </div>


      </div>

    );

  }



  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="dashboard-content billing-page">


      {/* ===================================================
          HEADING
      ==================================================== */}

      <section className="billing-heading">


        <div>


          <span className="dashboard-eyebrow">
            Plans & Billing
          </span>


          <h1>
            Choose the plan that fits your business.
          </h1>


          <p>
            Keep Runambiz free for as long as you want,
            or upgrade when your business needs more.
          </p>


        </div>


        <button
          type="button"
          className="billing-refresh-button"
          onClick={
            loadBilling
          }
        >

          <RefreshCw
            size={15}
          />

          Refresh

        </button>


      </section>



      {/* ===================================================
          PAYMENT / ERROR NOTICE
      ==================================================== */}

      {notice && (

        <section
          className={
            `billing-notice ${notice.type}`
          }
        >


          <div className="billing-notice-icon">

            {notice.type ===
              "loading"

              ? (
                <Loader2
                  size={19}
                  className="spin"
                />
              )

              : notice.type ===
                  "success"

                ? (
                  <CheckCircle2
                    size={19}
                  />
                )

                : (
                  <AlertCircle
                    size={19}
                  />
                )}

          </div>


          <div>

            <strong>
              {notice.title}
            </strong>

            <span>
              {notice.message}
            </span>

          </div>


        </section>

      )}


      {error && (

        <section className="billing-notice error">


          <div className="billing-notice-icon">

            <AlertCircle
              size={19}
            />

          </div>


          <div>

            <strong>
              Billing error
            </strong>

            <span>
              {error}
            </span>

          </div>


        </section>

      )}



      {/* ===================================================
          CURRENT PLAN
      ==================================================== */}

      <section className="billing-current-card">


        <div className="billing-current-icon">

          <Crown
            size={21}
          />

        </div>


        <div className="billing-current-copy">

          <span>
            Current plan
          </span>

          <strong>
            {currentPlan?.name || "Free"}
          </strong>


          <p>

            {currentPlanCode ===
              "free"

              ? "Your store is running on Runambiz Free."

              : hasScheduledPlanChange

                ? `Your ${currentPlan?.name || "current"} plan stays active until the scheduled switch to ${scheduledTargetPlan?.name || formatPlanName(
                    scheduledChange?.to_plan_code
                  )}.`

                : currentStatus ===
                    "non_renewing"

                  ? "Your subscription is cancelled and will remain active until the end of the paid period."

                  : currentStatus ===
                      "past_due"

                    ? "Your latest subscription payment needs attention."

                    : "Your paid Runambiz subscription is active."}

          </p>

        </div>


        <div className="billing-current-meta">


          <span
            className={
              `billing-status ${currentStatus}`
            }
          >

            {hasScheduledPlanChange
              ? "Switch scheduled"
              : formatStatus(
                  currentStatus
                )}

          </span>


          <strong>

            {availableCredits
              .toLocaleString()}

            <small>
              {" "}credits
            </small>

          </strong>


        </div>


      </section>


{/* ===================================================
    PAID SUBSCRIPTION MANAGEMENT
==================================================== */}

{isPaidPlan && (

  <section
    className={
      `billing-manage-card ${
        isPastDue
          ? "past-due"
          : isNonRenewing
            ? "non-renewing"
            : ""
      }`
    }
  >


    <div className="billing-manage-main">


      <div className="billing-manage-heading">


        <div
          className="billing-manage-icon"
        >

          {isPastDue ? (

            <AlertCircle
              size={20}
            />

          ) : isNonRenewing ? (

            <RefreshCw
              size={20}
            />

          ) : (

            <CreditCard
              size={20}
            />

          )}

        </div>


        <div>


          <strong>

            {isPastDue

              ? "Payment needs attention"

              : hasScheduledPlanChange

                ? `${currentPlan?.name || "Paid"} remains active`

                : isNonRenewing

                  ? `${currentPlan?.name || "Paid"} plan cancelled`

                  : `${currentPlan?.name || "Paid"} subscription`}

          </strong>


          <p>

            {isPastDue

              ? "Your latest renewal payment was not successful. Update your payment method to keep using paid features."

              : hasScheduledPlanChange

                ? `This plan will not renew because ${scheduledTargetPlan?.name || formatPlanName(
                    scheduledChange?.to_plan_code
                  )} is scheduled to replace it at the end of the current billing period.`

                : isNonRenewing

                  ? "Your subscription will not renew, but your paid access stays available until the current period ends."

                  : "Your subscription renews automatically through Paystack."}

          </p>


        </div>


      </div>



      <div className="billing-manage-details">


        {hasScheduledPlanChange ||
          isNonRenewing ? (

          <BillingDetail

            label={
              hasScheduledPlanChange
                ? "Current plan until"
                : "Access until"
            }

            value={
              billingPeriodEnd
                ? formatBillingDate(
                    billingPeriodEnd
                  )
                : "End of billing period"
            }

          />

        ) : (

          <BillingDetail

            label={
              isPastDue
                ? "Billing period"
                : "Next payment"
            }

            value={
              nextPaymentDate
                ? formatBillingDate(
                    nextPaymentDate
                  )
                : "Not available yet"
            }

          />

        )}


        <BillingDetail

          label="Current plan"

          value={
            currentPlan
              ?.name ||
            "Paid"
          }

        />


        <BillingDetail

          label="Monthly AI credits"

          value={
            Number(
              currentPlan
                ?.included_monthly_credits ||
              0
            )
              .toLocaleString()
          }

        />


        <BillingDetail

          label="Plan credits remaining"

          value={
            Number(
              wallet
                ?.plan_balance ||
              0
            )
              .toLocaleString()
          }

        />


      </div>


    </div>



    <div className="billing-manage-actions">


      {/* ===============================================
          PAST DUE
      ================================================ */}

      {isPastDue && (

        <button

          type="button"

          className="billing-manage-primary"

          disabled={
            Boolean(
              managingAction
            )
          }

          onClick={() =>
            manageSubscription(
              "payment_link"
            )
          }
        >

          {managingAction ===
            "payment_link" ? (

            <Loader2
              size={16}
              className="spin"
            />

          ) : (

            <CreditCard
              size={16}
            />

          )}

          Fix payment method

        </button>

      )}



      {/* ===============================================
          NORMAL ACTIVE SUBSCRIPTION
      ================================================ */}

      {!isPastDue &&
        !isNonRenewing &&
        !hasScheduledPlanChange && (

        <>

          <button

            type="button"

            className="billing-manage-secondary"

            disabled={
              Boolean(
                managingAction
              )
            }

            onClick={() =>
              manageSubscription(
                "payment_link"
              )
            }
          >

            {managingAction ===
              "payment_link" ? (

              <Loader2
                size={16}
                className="spin"
              />

            ) : (

              <CreditCard
                size={16}
              />

            )}

            Manage payment method

          </button>


          <button

            type="button"

            className="billing-cancel-button"

            disabled={
              Boolean(
                managingAction
              )
            }

            onClick={() =>
              manageSubscription(
                "cancel"
              )
            }
          >

            {managingAction ===
              "cancel" ? (

              <Loader2
                size={16}
                className="spin"
              />

            ) : null}

            Cancel subscription

          </button>

        </>

      )}



      {/* ===============================================
          SCHEDULED PLAN SWITCH

          Do not expose "Resume subscription" here because
          the replacement subscription already exists.
          Cancelling the scheduled change uses the dedicated
          backend flow that stops the replacement first and
          then safely resumes the current subscription.
      ================================================ */}

      {hasScheduledPlanChange && (

        <button

          type="button"

          className="billing-manage-secondary"

          disabled={
            Boolean(
              managingAction
            ) ||
            cancellingPlanChange
          }

          onClick={() =>
            manageSubscription(
              "payment_link"
            )
          }
        >

          {managingAction ===
            "payment_link" ? (

            <Loader2
              size={16}
              className="spin"
            />

          ) : (

            <CreditCard
              size={16}
            />

          )}

          Manage payment method

        </button>

      )}



      {/* ===============================================
          CANCELLED / NON-RENEWING
      ================================================ */}

      {isNonRenewing &&
        !hasScheduledPlanChange && (

        <>

          <button

            type="button"

            className="billing-manage-primary"

            disabled={
              Boolean(
                managingAction
              )
            }

            onClick={() =>
              manageSubscription(
                "resume"
              )
            }
          >

            {managingAction ===
              "resume" ? (

              <Loader2
                size={16}
                className="spin"
              />

            ) : (

              <RefreshCw
                size={16}
              />

            )}

            Resume subscription

          </button>


          <button

            type="button"

            className="billing-manage-secondary"

            disabled={
              Boolean(
                managingAction
              )
            }

            onClick={() =>
              manageSubscription(
                "payment_link"
              )
            }
          >

            <CreditCard
              size={16}
            />

            Manage payment

          </button>

        </>

      )}


    </div>


  </section>

)}




      {/* ===================================================
          SCHEDULED PLAN CHANGE
      ==================================================== */}

      {hasScheduledPlanChange && (

        <section className="billing-switch-card">


          <div className="billing-switch-icon">

            <RefreshCw
              size={20}
            />

          </div>


          <div className="billing-switch-copy">


            <span className="dashboard-eyebrow">
              Scheduled plan change
            </span>


            <div className="billing-switch-route">


              <strong>
                {currentPlan?.name ||
                  formatPlanName(
                    scheduledChange.from_plan_code
                  )}
              </strong>


              <ArrowRight
                size={16}
              />


              <strong>
                {scheduledTargetPlan?.name ||
                  formatPlanName(
                    scheduledChange.to_plan_code
                  )}
              </strong>


            </div>


            <p>

              Your current plan remains available until{" "}

              <strong>
                {formatBillingDate(
                  scheduledChange.effective_at
                )}
              </strong>

              . The new plan starts from that billing date
              after its Paystack payment succeeds.

            </p>


          </div>


          <div className="billing-switch-side">


            <div className="billing-switch-price">

              <span>
                New monthly price
              </span>

              <strong>

                {scheduledTargetPlan
                  ? formatNaira(
                      scheduledTargetPlan.monthly_price_ngn
                    )
                  : "—"}

              </strong>

            </div>


            <button
              type="button"
              className="billing-cancel-switch-button"
              disabled={
                cancellingPlanChange
              }
              onClick={
                cancelScheduledPlanChange
              }
            >

              {cancellingPlanChange ? (

                <Loader2
                  size={15}
                  className="spin"
                />

              ) : null}

              Cancel scheduled change

            </button>


          </div>


        </section>

      )}



      {/* ===================================================
          PAYMENT HISTORY
      ==================================================== */}

      <section className="billing-history-card">


        <div className="billing-history-heading">


          <div>


            <span className="dashboard-eyebrow">
              Payment history
            </span>


            <h2>
              Subscription payments
            </h2>


            <p>
              Successful Runambiz plan payments recorded for
              this business.
            </p>


          </div>


          <div className="billing-history-heading-icon">

            {historyLoading ? (

              <Loader2
                size={18}
                className="spin"
              />

            ) : (

              <ReceiptText
                size={18}
              />

            )}

          </div>


        </div>


        {paymentHistory.length ===
          0 ? (

          <div className="billing-history-empty">


            <ReceiptText
              size={22}
            />


            <strong>
              No subscription payments yet
            </strong>


            <span>

              {currentPlanCode ===
                "free"

                ? "Your successful paid-plan transactions will appear here after you upgrade."

                : "Your successful subscription transactions will appear here automatically."}

            </span>


          </div>

        ) : (

          <div className="billing-history-list">


            {paymentHistory.map(
              payment => {


                const paymentPlan =
                  plans.find(
                    plan =>
                      plan.code ===
                      payment.plan_code
                  );


                return (

                  <article
                    key={
                      payment.id
                    }
                    className="billing-history-row"
                  >


                    <div className="billing-history-plan">


                      <div className="billing-history-plan-icon">

                        <PlanIcon
                          code={
                            payment.plan_code
                          }
                        />

                      </div>


                      <div>

                        <strong>
                          {paymentPlan?.name ||
                            formatPlanName(
                              payment.plan_code
                            )}
                        </strong>

                        <span>
                          {formatBillingDate(
                            payment.paid_at ||
                            payment.created_at
                          )}
                        </span>

                      </div>


                    </div>


                    <div className="billing-history-period">

                      <span>
                        Billing period
                      </span>

                      <strong>

                        {formatBillingPeriod(
                          payment.period_start,
                          payment.period_end
                        )}

                      </strong>

                    </div>


                    <div className="billing-history-reference">

                      <span>
                        Reference
                      </span>

                      <strong
                        title={
                          payment.provider_reference ||
                          ""
                        }
                      >

                        {shortReference(
                          payment.provider_reference
                        )}

                      </strong>

                    </div>


                    <div className="billing-history-amount">

                      <strong>

                        {formatBillingMoney(
                          payment.amount,
                          payment.currency
                        )}

                      </strong>

                      <span className="billing-paid-chip">
                        Paid
                      </span>

                    </div>


                  </article>

                );

              }
            )}


          </div>

        )}


      </section>



      {/* ===================================================
          PLAN CARDS
      ==================================================== */}

      <section className="billing-plan-grid">


        {plans.map(
          plan => {


            const isCurrent =
              currentPlanCode ===
              plan.code;


            const starter =
              plan.code ===
              "starter";


            const paidAccount =
              currentPlanCode !==
              "free";


            const anotherPaidPlan =
              paidAccount &&
              !isCurrent &&
              plan.code !==
                "free";


            const busy =
              checkoutPlan ===
              plan.code;


            const switching =
              planChangePlan ===
              plan.code;


            const isScheduledTarget =
              hasScheduledPlanChange &&
              scheduledChange
                ?.to_plan_code ===
                plan.code;


            return (

              <article
                key={
                  plan.code
                }
                className={[
                  "billing-plan-card",

                  starter
                    ? "featured"
                    : "",

                  isCurrent
                    ? "current"
                    : ""

                ]
                  .filter(
                    Boolean
                  )
                  .join(" ")
                }
              >


                {starter && (

                  <div className="billing-popular-label">
                    Most vendors start here
                  </div>

                )}



                <div className="billing-plan-top">


                  <div>

                    <span className="billing-plan-name">
                      {plan.name}
                    </span>


                    {isCurrent && (

                      <span className="billing-current-chip">
                        Current
                      </span>

                    )}


                    {isScheduledTarget && (

                      <span className="billing-scheduled-chip">
                        Scheduled
                      </span>

                    )}

                  </div>


                  <PlanIcon
                    code={
                      plan.code
                    }
                  />


                </div>



                <div className="billing-plan-price">


                  {plan.code ===
                    "free"

                    ? (
                      <>

                        <strong>
                          ₦0
                        </strong>

                        <span>
                          forever
                        </span>

                      </>
                    )

                    : (
                      <>

                        <strong>

                          {formatNaira(
                            plan.monthly_price_ngn
                          )}

                        </strong>

                        <span>
                          /month
                        </span>

                      </>
                    )}


                </div>



                {Number(
                  plan.included_monthly_credits ||
                  0
                ) > 0 && (

                  <div className="billing-credit-benefit">

                    <Sparkles
                      size={14}
                    />

                    <span>

                      <strong>

                        {Number(
                          plan.included_monthly_credits
                        )
                          .toLocaleString()}

                      </strong>

                      {" "}AI credits every month

                    </span>

                  </div>

                )}



                <div className="billing-plan-features">


                  {(
                    PLAN_FEATURES[
                      plan.code
                    ]
                    ||
                    []
                  )
                    .map(
                      feature => (

                        <div
                          key={
                            feature
                          }
                          className="billing-feature"
                        >

                          <Check
                            size={15}
                          />

                          <span>
                            {feature}
                          </span>

                        </div>

                      )
                    )}


                </div>



                <div className="billing-plan-footer">


                  {plan.code ===
                    "free"

                    ? (

                      <button
                        type="button"
                        className="billing-plan-button secondary"
                        disabled
                      >

                        {isCurrent
                          ? "Current plan"
                          : "Free plan"}

                      </button>

                    )

                    : isCurrent

                      ? (

                        <button
                          type="button"
                          className="billing-plan-button current-plan-button"
                          disabled
                        >

                          <CheckCircle2
                            size={16}
                          />

                          Current plan

                        </button>

                      )

                      : anotherPaidPlan

                        ? (

                          <button
                            type="button"
                            className="billing-plan-button secondary"
                            disabled={
                              switching ||
                              verifying ||
                              isPastDue ||
                              (
                                hasScheduledPlanChange &&
                                !isScheduledTarget
                              )
                            }
                            title={
                              isPastDue
                                ? "Fix your current subscription payment before changing plans."
                                : hasScheduledPlanChange &&
                                    !isScheduledTarget
                                  ? "Cancel the existing scheduled plan change before choosing another plan."
                                  : undefined
                            }
                            onClick={() =>
                              schedulePlanChange(
                                plan
                              )
                            }
                          >

                            {switching ? (

                              <>

                                <Loader2
                                  size={16}
                                  className="spin"
                                />

                                Scheduling...

                              </>

                            ) : isScheduledTarget ? (

                              <>

                                <CheckCircle2
                                  size={16}
                                />

                                Scheduled

                              </>

                            ) : (

                              <>
                                Change plan
                              </>

                            )}

                          </button>

                        )

                        : (

                          <button
                            type="button"
                            className={
                              starter
                                ? "billing-plan-button primary"
                                : "billing-plan-button secondary"
                            }
                            disabled={
                              busy ||
                              verifying
                            }
                            onClick={() =>
                              startSubscription(
                                plan
                              )
                            }
                          >

                            {busy ? (

                              <>

                                <Loader2
                                  size={16}
                                  className="spin"
                                />

                                Opening Paystack...

                              </>

                            ) : currentStatus ===
                                "past_due" ? (

                              <>
                                <CreditCard
                                  size={16}
                                />

                                Retry {plan.name}
                              </>

                            ) : (

                              <>
                                Upgrade to {plan.name}
                              </>

                            )}

                          </button>

                        )}


                </div>


              </article>

            );

          }
        )}


      </section>



      {/* ===================================================
          CREDIT EXPLANATION
      ==================================================== */}

      <section className="billing-credit-info">


        <div className="billing-credit-info-icon">

          <Zap
            size={20}
          />

        </div>


        <div>

          <strong>
            Plans and Runambiz Credits are separate
          </strong>

          <p>
            Your subscription unlocks plan features
            and includes monthly AI credits.
            You can still purchase additional credits
            at any time without changing your plan.
          </p>

        </div>


        <div className="billing-secure">

          <ShieldCheck
            size={16}
          />

          Payments secured by Paystack

        </div>


      </section>


    </div>

  );

}


/* =========================================================
   BILLING DETAIL
========================================================= */

function BillingDetail({
  label,
  value
}) {


  return (

    <div className="billing-detail">


      <span>
        {label}
      </span>


      <strong>
        {value}
      </strong>


    </div>

  );

}



/* =========================================================
   PLAN ICON
========================================================= */

function PlanIcon({
  code
}) {


  if (
    code ===
    "pro"
  ) {

    return (
      <Crown
        size={19}
      />
    );

  }


  if (
    code ===
    "business"
  ) {

    return (
      <ShieldCheck
        size={19}
      />
    );

  }


  if (
    code ===
    "starter"
  ) {

    return (
      <Sparkles
        size={19}
      />
    );

  }


  return (
    <Zap
      size={19}
    />
  );

}



function formatBillingDate(
  value
) {


  if (
    !value
  ) {

    return "—";

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "—";

  }


  return new Intl.DateTimeFormat(
    undefined,
    {

      dateStyle:
        "medium"

    }
  )
    .format(
      date
    );

}


function formatBillingMoney(
  amount,
  currency = "NGN"
) {


  const normalizedCurrency =
    String(
      currency ||
      "NGN"
    )
      .trim()
      .toUpperCase();


  try {


    return new Intl.NumberFormat(
      undefined,
      {
        style:
          "currency",

        currency:
          normalizedCurrency,

        minimumFractionDigits:
          0,

        maximumFractionDigits:
          2
      }
    )
      .format(
        Number(
          amount ||
          0
        )
      );


  } catch {


    return (
      `${normalizedCurrency} ${Number(
        amount ||
        0
      ).toLocaleString()}`
    );

  }

}



function formatBillingPeriod(
  start,
  end
) {


  if (
    !start &&
    !end
  ) {

    return "—";

  }


  if (
    start &&
    end
  ) {

    return (
      `${formatBillingDate(start)} – ${formatBillingDate(end)}`
    );

  }


  return formatBillingDate(
    start ||
    end
  );

}



function formatPlanName(
  code
) {


  if (
    !code
  ) {

    return "Runambiz plan";

  }


  return String(
    code
  )
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\b\w/g,
      character =>
        character.toUpperCase()
    );

}



function shortReference(
  reference
) {


  const value =
    String(
      reference ||
      ""
    );


  if (
    !value
  ) {

    return "—";

  }


  if (
    value.length <=
    22
  ) {

    return value;

  }


  return (
    `${value.slice(0, 12)}…${value.slice(-7)}`
  );

}



/* =========================================================
   HELPERS
========================================================= */

function formatNaira(
  value
) {


  return new Intl.NumberFormat(
    "en-NG",
    {

      style:
        "currency",

      currency:
        "NGN",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        0

    }
  )
    .format(
      Number(
        value ||
        0
      )
    );

}


function formatStatus(
  status
) {


  switch (
    status
  ) {


    case "active":

      return "Active";


    case "non_renewing":

      return "Cancels at period end";


    case "past_due":

      return "Payment due";


    case "trialing":

      return "Trial";


    case "cancelled":

      return "Cancelled";


    case "expired":

      return "Expired";


    default:

      return (
        status ||
        "Active"
      );

  }

}