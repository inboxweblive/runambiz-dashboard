import {
  useEffect
} from "react";


import {
  supabase
} from "../../lib/supabase";


export function useBillingRealtime({
  businessId,
  onSubscriptionChange,
  onWalletChange
}) {


  useEffect(
    () => {


      if (
        !businessId
      ) {

        return;

      }


      let active =
        true;



      /* =====================================================
         LOAD LATEST SERVER STATE

         We deliberately re-query instead of trusting only
         payload.new.

         That gives every part of the dashboard the same
         authoritative database state.
      ====================================================== */

      async function refreshBilling() {


        try {


          const [
            subscriptionResult,
            walletResult
          ] =
            await Promise.all([


              supabase
                .from(
                  "business_subscriptions"
                )
                .select(`
                  business_id,
                  plan_code,
                  status,
                  provider,
                  provider_subscription_id,
                  current_period_start,
                  current_period_end,
                  next_payment_date,
                  cancel_at_period_end,
                  last_payment_at,
                  last_paid_plan_code,
                  subscription_ended_at,
                  subscription_end_reason
                `)
                .eq(
                  "business_id",
                  businessId
                )
                .maybeSingle(),


              supabase
                .from(
                  "ai_wallets"
                )
                .select(`
                  business_id,
                  daily_balance,
                  daily_allowance,
                  daily_reset_at,
                  plan_balance,
                  plan_allowance,
                  plan_period_start,
                  plan_period_end,
                  bonus_balance,
                  purchased_balance,
                  lifetime_purchased,
                  lifetime_used
                `)
                .eq(
                  "business_id",
                  businessId
                )
                .maybeSingle()


            ]);


          if (
            !active
          ) {

            return;

          }


          if (
            !subscriptionResult.error
          ) {

            onSubscriptionChange?.(
              subscriptionResult.data ||
              null
            );

          } else {

            console.error(
              "Realtime subscription refresh:",
              subscriptionResult.error
            );

          }


          if (
            !walletResult.error
          ) {

            onWalletChange?.(
              walletResult.data ||
              null
            );

          } else {

            console.error(
              "Realtime wallet refresh:",
              walletResult.error
            );

          }


        } catch (
          error
        ) {


          console.error(
            "Billing realtime refresh error:",
            error
          );


        }

      }



      /* =====================================================
         REALTIME CHANNEL
      ====================================================== */

      const channel =
        supabase
          .channel(
            `runambiz-billing-${businessId}`
          )


          /* SUBSCRIPTION CHANGED */

          .on(

            "postgres_changes",

            {

              event:
                "*",

              schema:
                "public",

              table:
                "business_subscriptions",

              filter:
                `business_id=eq.${businessId}`

            },

            () => {


              refreshBilling();

            }

          )


          /* WALLET CHANGED */

          .on(

            "postgres_changes",

            {

              event:
                "*",

              schema:
                "public",

              table:
                "ai_wallets",

              filter:
                `business_id=eq.${businessId}`

            },

            () => {


              refreshBilling();

            }

          )


          /* CREDIT LEDGER CHANGED */

          .on(

            "postgres_changes",

            {

              event:
                "*",

              schema:
                "public",

              table:
                "ai_credit_transactions",

              filter:
                `business_id=eq.${businessId}`

            },

            () => {


              refreshBilling();

            }

          )


          /* SUBSCRIPTION PAYMENT */

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
                `business_id=eq.${businessId}`

            },

            () => {


              refreshBilling();

            }

          )


          .subscribe(
            status => {


              if (
                status ===
                "SUBSCRIBED"
              ) {

                console.log(
                  "Runambiz billing realtime connected"
                );

              }

            }
          );



      /* =====================================================
         PWA RESUME SAFETY

         Browsers/mobile OS can suspend sockets.

         Whenever the PWA becomes visible again,
         pull fresh state from Supabase.
      ====================================================== */

      function handleVisibility() {


        if (
          document.visibilityState ===
          "visible"
        ) {

          refreshBilling();

        }

      }


      function handleFocus() {


        refreshBilling();

      }


      document.addEventListener(
        "visibilitychange",
        handleVisibility
      );


      window.addEventListener(
        "focus",
        handleFocus
      );



      /* =====================================================
         CLEANUP
      ====================================================== */

      return () => {


        active =
          false;


        document.removeEventListener(
          "visibilitychange",
          handleVisibility
        );


        window.removeEventListener(
          "focus",
          handleFocus
        );


        supabase.removeChannel(
          channel
        );

      };


    },
    [
      businessId,
      onSubscriptionChange,
      onWalletChange
    ]
  );

}