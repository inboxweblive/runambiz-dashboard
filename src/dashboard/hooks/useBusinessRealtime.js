import {
  useEffect,
  useState
} from "react";

import {
  supabase
} from "../../lib/supabase";


export default function useBusinessRealtime(
  businessId
) {

  const [
    revision,
    setRevision
  ] =
    useState(0);


  useEffect(() => {


    if (!businessId) {
      return;
    }


    /*
      Whenever one of these business tables
      changes, increment revision.

      Pages watching revision will then
      refresh their data automatically.
    */

    const changed =
      () => {

        setRevision(
          current =>
            current + 1
        );

      };


    const channel =
      supabase
        .channel(
          `runambiz-live-${businessId}`
        )


        /* PRODUCTS */

        .on(
          "postgres_changes",
          {

            event:
              "*",

            schema:
              "public",

            table:
              "products",

            filter:
              `business_id=eq.${businessId}`

          },
          changed
        )


        /* ORDERS */

        .on(
          "postgres_changes",
          {

            event:
              "*",

            schema:
              "public",

            table:
              "orders",

            filter:
              `business_id=eq.${businessId}`

          },
          changed
        )


        /* ORDER ITEMS */

        .on(
          "postgres_changes",
          {

            event:
              "*",

            schema:
              "public",

            table:
              "order_items",

            filter:
              `business_id=eq.${businessId}`

          },
          changed
        )


        /* CUSTOMERS */

        .on(
          "postgres_changes",
          {

            event:
              "*",

            schema:
              "public",

            table:
              "customers",

            filter:
              `business_id=eq.${businessId}`

          },
          changed
        )


        /* PAYMENT METHODS */

        .on(
          "postgres_changes",
          {

            event:
              "*",

            schema:
              "public",

            table:
              "payment_methods",

            filter:
              `business_id=eq.${businessId}`

          },
          changed
        )


        /* NOTIFICATIONS */

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
              `business_id=eq.${businessId}`

          },
          changed
        )


        /* BUSINESS SETTINGS */

        .on(
          "postgres_changes",
          {

            event:
              "UPDATE",

            schema:
              "public",

            table:
              "businesses",

            filter:
              `id=eq.${businessId}`

          },
          changed
        )


        .subscribe(
          status => {

            if (
              status ===
              "SUBSCRIBED"
            ) {

              console.log(
                "Runambiz realtime connected"
              );

            }

          }
        );


    return () => {

      supabase
        .removeChannel(
          channel
        );

    };


  }, [
    businessId
  ]);


  return revision;

}