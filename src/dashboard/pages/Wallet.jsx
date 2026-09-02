import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock3,
  Coins,
  CreditCard,
  Gift,
  Loader2,
  RefreshCw,
  Sparkles,
  WalletCards,
  Zap
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";

import {
  formatAmount
} from "../../lib/countries";


export default function Wallet({
  business,
  refreshKey
}) {

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    error,
    setError
  ] =
    useState("");

  const [
    wallet,
    setWallet
  ] =
    useState(null);

  const [
    subscription,
    setSubscription
  ] =
    useState(null);

  const [
    plan,
    setPlan
  ] =
    useState(null);

  const [
    transactions,
    setTransactions
  ] =
    useState([]);

  const [
    packages,
    setPackages
  ] =
    useState([]);

  const [
    aiPrices,
    setAiPrices
  ] =
    useState([]);
    
    const [
  purchasingPackage,
  setPurchasingPackage
] =
  useState(null);



const [
  paymentNotice,
  setPaymentNotice
] =
  useState(null);


const [
  verifyingPayment,
  setVerifyingPayment
] =
  useState(false);




  /* =========================================================
     LOAD WALLET
  ========================================================= */

  async function loadWallet() {

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

        walletResult,

        subscriptionResult,

        transactionResult,

        packageResult,

        packagePricesResult,

        aiPriceResult

      ] =
        await Promise.all([


          supabase
            .from(
              "ai_wallets"
            )
            .select("*")
            .eq(
              "business_id",
              business.id
            )
            .single(),


          supabase
            .from(
              "business_subscriptions"
            )
            .select(`
              *,
              subscription_plans (
                code,
                name,
                description,
                is_paid,
                included_monthly_credits,
                features
              )
            `)
            .eq(
              "business_id",
              business.id
            )
            .single(),


          supabase
            .from(
              "ai_credit_transactions"
            )
            .select(`
              id,
              type,
              bucket,
              amount,
              balance_after,
              description,
              reference,
              metadata,
              created_at
            `)
            .eq(
              "business_id",
              business.id
            )
            .order(
              "created_at",
              {
                ascending:
                  false
              }
            )
            .limit(20),


          supabase
            .from(
              "credit_packages"
            )
            .select(`
              code,
              name,
              credits,
              sort_order
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


          supabase
            .from(
              "credit_package_prices"
            )
            .select(`
              package_code,
              currency,
              amount
            `)
            .eq(
              "is_active",
              true
            ),


          supabase
            .from(
              "ai_task_prices"
            )
            .select(`
              task_type,
              label,
              credits_cost,
              description
            `)
            .eq(
              "is_active",
              true
            )
            .order(
              "credits_cost",
              {
                ascending:
                  true
              }
            )

        ]);


      if (
        walletResult.error
      ) {

        throw walletResult.error;

      }


      if (
        subscriptionResult.error
      ) {

        throw subscriptionResult.error;

      }


      if (
        transactionResult.error
      ) {

        throw transactionResult.error;

      }


      if (
        packageResult.error
      ) {

        throw packageResult.error;

      }


      if (
        packagePricesResult.error
      ) {

        throw packagePricesResult.error;

      }


      if (
        aiPriceResult.error
      ) {

        throw aiPriceResult.error;

      }


      const currentSubscription =
        subscriptionResult.data;


      setWallet(
        walletResult.data
      );


      setSubscription(
        currentSubscription
      );


      setPlan(
        currentSubscription
          ?.subscription_plans ||
        null
      );


      setTransactions(
        transactionResult.data ||
        []
      );


      setAiPrices(
        aiPriceResult.data ||
        []
      );


      const prices =
        packagePricesResult.data ||
        [];


/*
  Store currency and Runambiz billing
  currency are deliberately separate.

  Prefer:
  1. Merchant currency if Runambiz has a price
  2. NGN billing
  3. USD billing
  4. Any available package price
*/

const businessCurrency =
  business?.currency ||
  "NGN";


const mergedPackages =
  (
    packageResult.data ||
    []
  )
    .map(
      item => {

        const packagePrices =
          prices.filter(
            currentPrice =>
              currentPrice.package_code ===
              item.code
          );


        const price =
          packagePrices.find(
            currentPrice =>
              currentPrice.currency ===
              businessCurrency
          )

          ||

          packagePrices.find(
            currentPrice =>
              currentPrice.currency ===
              "NGN"
          )

          ||

          packagePrices.find(
            currentPrice =>
              currentPrice.currency ===
              "USD"
          )

          ||

          packagePrices[0]

          ||

          null;


        return {

          ...item,

          price

        };

      }
    );

      setPackages(
        mergedPackages
      );


    } catch (
      err
    ) {

      console.error(
        "Wallet load error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't load your Runambiz Credits."
      );


    } finally {

      setLoading(
        false
      );

    }

  }


  useEffect(() => {

    loadWallet();

  }, [
    business?.id,
    refreshKey
  ]);


  useEffect(() => {


  if (
    !business?.id
  ) {

    return;

  }


  const params =
    new URLSearchParams(
      window.location.search
    );


  const returnedFromPayment =
    params.get(
      "credit_payment"
    ) ===
    "return";


  const reference =
    params.get(
      "reference"
    );


  if (
    returnedFromPayment &&
    reference
  ) {

    verifyReturnedPayment(
      reference
    );

  }


}, [
  business?.id
]);

  /* =========================================================
     TOTAL BALANCE
  ========================================================= */

   const totalCredits =
  useMemo(
    () => {

      return (

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
        )

      );

    },
    [
      wallet
    ]
  );


  /* =========================================================
     NEXT RESET
  ========================================================= */

  function formatResetTime() {

    if (
      !wallet
        ?.daily_reset_at
    ) {

      return "—";

    }


    const date =
      new Date(
        wallet.daily_reset_at
      );


    return new Intl.DateTimeFormat(
      undefined,
      {
        dateStyle:
          "medium",

        timeStyle:
          "short"
      }
    )
      .format(
        date
      );

  }


  /* =========================================================
     MONEY
  ========================================================= */

  function formatPackagePrice(
    item
  ) {

    if (
      !item?.price
    ) {

      return null;

    }


    return formatAmount(

      item.price.amount,

      business
        ?.country_code,

      item.price.currency

    );

  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading
  ) {

    return (

      <main className="dashboard-content wallet-page">

        <div className="wallet-loading">

          <Loader2
            size={24}
            className="spin"
          />

          <span>
            Loading Runambiz Credits...
          </span>

        </div>

      </main>

    );

  }


  async function buyCredits(
  item
) {

  if (
    !item?.code
  ) {

    return;

  }


  setError("");

  setPurchasingPackage(
    item.code
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
          "create-credit-checkout",
          {

            body: {

              packageCode:
                item.code

            }

          }
        );


    if (
      checkoutError
    ) {

      throw checkoutError;

    }


    if (
      !data?.success ||
      !data?.checkoutUrl
    ) {

      throw new Error(
        data?.error ||
        "Could not start Paystack checkout."
      );

    }


    /*
      Redirect merchant to secure
      Paystack hosted checkout.
    */

    window.location.href =
      data.checkoutUrl;


  } catch (
    err
  ) {


    console.error(
      "Buy credits error:",
      err
    );


    setError(
      err?.message ||
      "We couldn't start the payment."
    );


  } finally {


    setPurchasingPackage(
      null
    );

  }

}


async function verifyReturnedPayment(
  reference
) {

  if (
    !reference
  ) {

    return;

  }


  setVerifyingPayment(
    true
  );


  setPaymentNotice({
    type:
      "loading",

    message:
      "Confirming your Paystack payment..."
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
          "verify-credit-payment",
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
        "Payment could not be confirmed."
      );

    }



    /*
      Reload actual wallet balances from Supabase.
    */

    await loadWallet();



    setPaymentNotice({

      type:
        "success",

      message:
        `${Number(
          data.creditsAdded ||
          0
        ).toLocaleString()} Runambiz Credits added successfully.`

    });


  } catch (
    err
  ) {


    console.error(
      "Payment return verification error:",
      err
    );


    setPaymentNotice({

      type:
        "error",

      message:
        err?.message ||
        "We couldn't confirm your payment yet."

    });


  } finally {


    setVerifyingPayment(
      false
    );


    /*
      Remove Paystack query parameters so refreshing
      the Wallet doesn't keep verifying again.
    */

    const cleanUrl =
      `${window.location.pathname}${window.location.hash || ""}`;


    window.history
      .replaceState(
        {},
        document.title,
        cleanUrl
      );

  }

}



  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <main className="dashboard-content wallet-page">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="wallet-page-header">

        <div>

          <span className="dashboard-eyebrow">
            Billing & AI
          </span>

          <h1>
            Runambiz Credits
          </h1>

          <p>
            Manage your AI credits, plan and usage.
          </p>

        </div>


        <button
          type="button"
          className="wallet-refresh-button"
          onClick={
            loadWallet
          }
        >

          <RefreshCw
            size={16}
          />

          Refresh

        </button>

      </header>


      {error && (

        <div className="wallet-error">

          {error}

        </div>

      )}

{paymentNotice && (

  <div
    className={
      `wallet-payment-notice ${paymentNotice.type}`
    }
  >


    {paymentNotice.type ===
      "loading" && (

      <Loader2
        size={18}
        className="spin"
      />

    )}


    {paymentNotice.type ===
      "success" && (

      <CheckCircle2
        size={18}
      />

    )}


    {paymentNotice.type ===
      "error" && (

      <span className="wallet-notice-error-icon">
        !
      </span>

    )}


    <div>

      <strong>

        {paymentNotice.type ===
          "loading"

          ? "Confirming payment"

          : paymentNotice.type ===
              "success"

            ? "Payment successful"

            : "Payment not confirmed"}

      </strong>


      <span>
        {paymentNotice.message}
      </span>

    </div>


  </div>

)}


      {/* =====================================================
          MAIN BALANCE
      ====================================================== */}

      <section className="wallet-balance-card">

        <div className="wallet-balance-icon">

          <WalletCards
            size={27}
          />

        </div>


        <div className="wallet-balance-copy">

          <span>
            AVAILABLE CREDITS
          </span>

          <strong>
            {totalCredits.toLocaleString()}
          </strong>

          <p>
            Use credits whenever Runambiz AI helps
            you create or improve content.
          </p>

        </div>


        <div className="wallet-plan-box">

          <span>
            CURRENT PLAN
          </span>

          <strong>
            {plan?.name || "Free"}
          </strong>

          <small>

            {subscription?.status ===
              "active"
              ? "Active"
              : subscription?.status ||
                "Active"}

          </small>

        </div>

      </section>


      {/* =====================================================
          CREDIT BREAKDOWN
      ====================================================== */}

      <section className="wallet-stat-grid">


        <WalletStat

          icon={
            <Zap
              size={19}
            />
          }

          label="Daily"

          value={
            wallet
              ?.daily_balance ||
            0
          }

          description={
            `${wallet?.daily_allowance || 0} free every day`
          }

        />

        <WalletStat

  icon={
    <Sparkles
      size={19}
    />
  }

  label="Plan"

  value={
    wallet
      ?.plan_balance ||
    0
  }

  description={
    currentPlanCreditsDescription(
      plan,
      wallet
    )
  }

/>


        <WalletStat

          icon={
            <Gift
              size={19}
            />
          }

          label="Bonus"

          value={
            wallet
              ?.bonus_balance ||
            0
          }

          description="Welcome & promotional credits"

        />


        <WalletStat

          icon={
            <CreditCard
              size={19}
            />
          }

          label="Purchased"

          value={
            wallet
              ?.purchased_balance ||
            0
          }

          description="Credits you've purchased"

        />


        <WalletStat

          icon={
            <Bot
              size={19}
            />
          }

          label="Lifetime used"

          value={
            wallet
              ?.lifetime_used ||
            0
          }

          description="Successful AI usage"

        />


      </section>


      {/* =====================================================
          DAILY RESET
      ====================================================== */}

      <section className="wallet-reset-card">

        <div>

          <Clock3
            size={19}
          />

        </div>


        <div>

          <strong>
            Daily credits refresh automatically
          </strong>

          <span>
            Next refresh: {formatResetTime()}
          </span>

        </div>

      </section>

{wallet?.plan_period_end && (

  <section className="wallet-reset-card wallet-plan-reset-card">


    <div>

      <Sparkles
        size={19}
      />

    </div>


    <div>

      <strong>
        Monthly plan credits
      </strong>


      <span>

        Current credits reset on{" "}

        {new Intl.DateTimeFormat(
          undefined,
          {
            dateStyle:
              "medium",

            timeStyle:
              "short"
          }
        )
          .format(
            new Date(
              wallet.plan_period_end
            )
          )}

      </span>

    </div>


  </section>

)}


      {/* =====================================================
          BUY CREDITS
      ====================================================== */}

      <section className="wallet-section-card">


        <div className="wallet-section-heading">

          <div>

            <span>
              TOP UP
            </span>

            <h2>
              Buy more credits
            </h2>

            <p>
              Purchased credits don't expire with your
              daily allowance.
            </p>

          </div>

        </div>


        <div className="credit-package-grid">


          {packages.map(
            item => {

              const formattedPrice =
                formatPackagePrice(
                  item
                );


              return (

                <article
                  className="credit-package-card"
                  key={
                    item.code
                  }
                >


                  <div className="credit-package-icon">

                    <Coins
                      size={20}
                    />

                  </div>


                  <span>
                    {item.name}
                  </span>


                  <strong>

                    {item.credits
                      .toLocaleString()}

                    <small>
                      {" "}credits
                    </small>

                  </strong>


                  {formattedPrice ? (

                    <h3>
                      {formattedPrice}
                    </h3>

                  ) : (

                    <h3 className="credit-price-unavailable">
                      Not available in{" "}
                      {business?.currency || "this currency"}
                    </h3>

                  )}


                <button

  type="button"

  disabled={
    !formattedPrice ||
    purchasingPackage ===
      item.code
  }

  onClick={() =>
    buyCredits(
      item
    )
  }
>

  {purchasingPackage ===
    item.code ? (

    <>

      <Loader2
        size={16}
        className="spin"
      />

      Opening Paystack...

    </>

  ) : (

    <>

      <CreditCard
        size={16}
      />

      Buy credits

    </>

  )}

</button>


                </article>

              );

            }
          )}


        </div>


     <div className="wallet-coming-note">

  <Sparkles
    size={16}
  />

  Runambiz credit purchases may be billed in a
  different currency from your storefront currency.

</div>


      </section>


      {/* =====================================================
          AI COSTS
      ====================================================== */}

      <section className="wallet-section-card">


        <div className="wallet-section-heading">

          <div>

            <span>
              AI PRICING
            </span>

            <h2>
              What credits are used for
            </h2>

            <p>
              Runambiz checks these prices on the server
              before every AI request.
            </p>

          </div>

        </div>


        <div className="ai-credit-price-list">


          {aiPrices.map(
            item => (

              <div
                className="ai-credit-price-row"
                key={
                  item.task_type
                }
              >


                <div>

                  <div className="ai-price-icon">

                    <Sparkles
                      size={15}
                    />

                  </div>


                  <div>

                    <strong>
                      {item.label}
                    </strong>

                    {item.description && (

                      <span>
                        {item.description}
                      </span>

                    )}

                  </div>

                </div>


                <strong className="ai-credit-cost">

                  {item.credits_cost}

                  <span>
                    {" "}credit
                    {item.credits_cost ===
                    1
                      ? ""
                      : "s"}
                  </span>

                </strong>


              </div>

            )
          )}


        </div>


      </section>


      {/* =====================================================
          HISTORY
      ====================================================== */}

      <section className="wallet-section-card">


        <div className="wallet-section-heading">

          <div>

            <span>
              ACTIVITY
            </span>

            <h2>
              Credit history
            </h2>

          </div>

        </div>


        {!transactions.length ? (

          <div className="wallet-empty-history">

            <Coins
              size={25}
            />

            <strong>
              No credit activity yet
            </strong>

            <span>
              Your purchases and AI usage will appear here.
            </span>

          </div>

        ) : (

          <div className="wallet-history-list">


            {transactions.map(
              transaction => {

                const positive =
                  Number(
                    transaction.amount
                  ) > 0;


                return (

                  <div
                    className="wallet-history-row"
                    key={
                      transaction.id
                    }
                  >


                    <div
                      className={
                        positive
                          ? "wallet-history-icon positive"
                          : "wallet-history-icon negative"
                      }
                    >

                      {positive ? (

                        <ArrowDownRight
                          size={16}
                        />

                      ) : (

                        <ArrowUpRight
                          size={16}
                        />

                      )}

                    </div>


                    <div className="wallet-history-copy">

                      <strong>

                        {transaction.description ||
                          formatTransactionType(
                            transaction.type
                          )}

                      </strong>

                      <span>

                        {formatTransactionType(
                          transaction.type
                        )}

                        {" · "}

                        {formatDate(
                          transaction.created_at
                        )}

                      </span>

                    </div>


                    <div className="wallet-history-amount">

                      <strong
                        className={
                          positive
                            ? "positive"
                            : "negative"
                        }
                      >

                        {positive
                          ? "+"
                          : ""}

                        {Number(
                          transaction.amount
                        )
                          .toLocaleString()}

                      </strong>

                      {transaction.balance_after !==
                        null &&
                        transaction.balance_after !==
                        undefined && (

                        <span>

                          Balance{" "}

                          {Number(
                            transaction.balance_after
                          )
                            .toLocaleString()}

                        </span>

                      )}

                    </div>


                  </div>

                );

              }
            )}


          </div>

        )}


      </section>


      {/* =====================================================
          CREDIT RULE
      ====================================================== */}

      <section className="wallet-credit-rule">

        <CheckCircle2
          size={18}
        />

        <p>
          Runambiz Credits are service credits for AI
          features. They aren't cash and can't be withdrawn
          or transferred between businesses.
        </p>

      </section>


    </main>

  );

}


/* =========================================================
   WALLET STAT
========================================================= */

function WalletStat({
  icon,
  label,
  value,
  description
}) {

  return (

    <article className="wallet-stat-card">

      <div className="wallet-stat-icon">
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {Number(
          value ||
          0
        )
          .toLocaleString()}
      </strong>

      <small>
        {description}
      </small>

    </article>

  );

}



function currentPlanCreditsDescription(
  plan,
  wallet
) {

  const allowance =
    Number(
      wallet?.plan_allowance ||
      plan?.included_monthly_credits ||
      0
    );


  if (
    !allowance
  ) {

    return "No monthly credits on Free";

  }


  return `${allowance.toLocaleString()} included each billing month`;

}




/* =========================================================
   HELPERS
========================================================= */

function formatTransactionType(
  type
) {

  const labels = {

    welcome:
      "Welcome bonus",

    daily_reset:
      "Daily refresh",

    purchase:
      "Credit purchase",

    usage:
      "AI usage",

    refund:
      "Credit refund",

    plan_bonus:
      "Plan bonus",

    promotion:
      "Promotion",

    admin_adjustment:
      "Adjustment"

  };


  return (
    labels[type] ||
    type ||
    "Credit activity"
  );

}


function formatDate(
  value
) {

  if (
    !value
  ) {

    return "";

  }


  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle:
        "medium",

      timeStyle:
        "short"
    }
  )
    .format(
      new Date(
        value
      )
    );

}