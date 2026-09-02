import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  CreditCard,
  Loader2,
  ShoppingBag,
  TrendingUp,
  Users
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";

import {
  formatAmount
} from "../../lib/countries";


export default function Analytics({

  business

}) {


  const [
    range,
    setRange
  ] =
    useState(30);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    orders,
    setOrders
  ] =
    useState([]);


  const [
    newCustomers,
    setNewCustomers
  ] =
    useState(0);


  const [
    error,
    setError
  ] =
    useState("");



  async function loadAnalytics() {

    if (
      !business?.id
    ) {

      return;

    }


    setLoading(
      true
    );

    setError("");


    const startDate =
      new Date();


    startDate.setDate(
      startDate.getDate() -
      range
    );


    try {

      const [
        ordersResult,
        customersResult
      ] =
        await Promise.all([


          supabase
            .from(
              "orders"
            )
            .select(`
              id,
              order_number,
              total,
              currency,
              status,
              payment_status,
              channel,
              created_at
            `)
            .eq(
              "business_id",
              business.id
            )
            .gte(
              "created_at",
              startDate
                .toISOString()
            )
            .order(
              "created_at",
              {
                ascending:
                  true
              }
            ),


          supabase
            .from(
              "customers"
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
            .gte(
              "created_at",
              startDate
                .toISOString()
            )

        ]);


      if (
        ordersResult.error
      ) {

        throw ordersResult.error;

      }


      if (
        customersResult.error
      ) {

        throw customersResult.error;

      }


      setOrders(
        ordersResult.data ||
        []
      );


      setNewCustomers(
        customersResult.count ||
        0
      );


    } catch (
      err
    ) {

      setError(
        err?.message ||
        "We couldn't load analytics."
      );

    } finally {

      setLoading(
        false
      );

    }

  }



  useEffect(
    () => {

      loadAnalytics();

    },
    [
      business?.id,
      range
    ]
  );



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
            `runambiz-analytics-${business.id}`
          )
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
                `business_id=eq.${business.id}`

            },
            loadAnalytics
          )
          .subscribe();


      function refreshWhenVisible() {

        if (
          document.visibilityState ===
          "visible"
        ) {

          loadAnalytics();

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
      range
    ]
  );



  const analytics =
    useMemo(
      () => {


        const paidOrders =
          orders.filter(
            order =>
              order.payment_status ===
              "paid"
          );


        const totalSales =
          paidOrders.reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.total ||
                0
              ),
            0
          );


        const averageOrder =
          paidOrders.length

            ? totalSales /
              paidOrders.length

            : 0;


        const paymentSubmitted =
          orders.filter(
            order =>
              order.payment_status ===
                "awaiting_confirmation"

              ||

              order.status ===
                "payment_submitted"
          ).length;


        const unpaid =
          orders.filter(
            order =>
              order.payment_status ===
              "unpaid"
          ).length;


        return {

          paidOrders,

          totalSales,

          averageOrder,

          paymentSubmitted,

          unpaid

        };


      },
      [
        orders
      ]
    );



  const chartData =
    useMemo(
      () => {


        const days =
          [];


        for (
          let offset =
            range - 1;

          offset >= 0;

          offset--
        ) {


          const date =
            new Date();


          date.setHours(
            0,
            0,
            0,
            0
          );


          date.setDate(
            date.getDate() -
            offset
          );


          const key =
            date
              .toISOString()
              .slice(
                0,
                10
              );


          days.push({

            key,

            label:
              date.toLocaleDateString(
                undefined,
                {
                  month:
                    "short",

                  day:
                    "numeric"
                }
              ),

            value:
              0

          });

        }


        const map =
          new Map(
            days.map(
              day => [
                day.key,
                day
              ]
            )
          );


        analytics
          .paidOrders
          .forEach(
            order => {


              const key =
                String(
                  order.created_at
                )
                  .slice(
                    0,
                    10
                  );


              const bucket =
                map.get(
                  key
                );


              if (
                bucket
              ) {

                bucket.value +=
                  Number(
                    order.total ||
                    0
                  );

              }

            }
          );


        return days;


      },
      [
        analytics.paidOrders,
        range
      ]
    );


  const maxChartValue =
    Math.max(
      1,
      ...chartData.map(
        item =>
          item.value
      )
    );


  function money(
    value
  ) {

    return formatAmount(

      value,

      business?.country_code,

      business?.currency

    );

  }



  return (

    <main className="dashboard-content analytics-page">


      <header className="analytics-header">


        <div>

          <span className="dashboard-eyebrow">
            Performance
          </span>

          <h1>
            Analytics
          </h1>

          <p>
            Real sales, orders and customer activity
            from your Runambiz business.
          </p>

        </div>


        <div className="analytics-range">

          {[7, 30, 90].map(
            days => (

              <button

                type="button"

                key={
                  days
                }

                className={
                  range === days
                    ? "active"
                    : ""
                }

                onClick={() =>
                  setRange(
                    days
                  )
                }

              >

                {days}D

              </button>

            )
          )}

        </div>


      </header>



      {loading ? (

        <div className="analytics-loading">

          <Loader2
            size={23}
            className="spin"
          />

          Loading analytics...

        </div>

      ) : error ? (

        <div className="analytics-error">
          {error}
        </div>

      ) : (

        <>


          <section className="analytics-metrics">


            <AnalyticsMetric

              icon={
                TrendingUp
              }

              label="Paid sales"

              value={
                money(
                  analytics.totalSales
                )
              }

            />


            <AnalyticsMetric

              icon={
                ShoppingBag
              }

              label="Orders"

              value={
                orders.length
                  .toLocaleString()
              }

            />


            <AnalyticsMetric

              icon={
                Users
              }

              label="New customers"

              value={
                newCustomers
                  .toLocaleString()
              }

            />


            <AnalyticsMetric

              icon={
                CreditCard
              }

              label="Average paid order"

              value={
                money(
                  analytics.averageOrder
                )
              }

            />


          </section>



          <section className="analytics-card">


            <div className="analytics-card-header">


              <div>

                <span>
                  SALES
                </span>

                <h2>
                  Sales over time
                </h2>

              </div>


              <strong>
                {money(
                  analytics.totalSales
                )}
              </strong>


            </div>


            <div className="analytics-chart-scroll">


              <div className="analytics-chart">


                {chartData.map(
                  item => (

                    <div

                      key={
                        item.key
                      }

                      className="analytics-chart-column"

                      title={
                        `${item.label}: ${money(
                          item.value
                        )}`
                      }

                    >


                      <div className="analytics-chart-track">


                        <div

                          className="analytics-chart-bar"

                          style={{

                            height:
                              `${
                                Math.max(
                                  item.value > 0
                                    ? 5
                                    : 0,

                                  (
                                    item.value /
                                    maxChartValue
                                  ) *
                                  100
                                )
                              }%`

                          }}

                        />


                      </div>


                      {(range <= 30) && (

                        <span>
                          {item.label}
                        </span>

                      )}


                    </div>

                  )
                )}


              </div>


            </div>


          </section>



          <section className="analytics-two-column">


            <article className="analytics-card">


              <div className="analytics-card-header">

                <div>

                  <span>
                    PAYMENTS
                  </span>

                  <h2>
                    Payment status
                  </h2>

                </div>

              </div>


              <AnalyticsStatus

                label="Paid"

                value={
                  analytics.paidOrders.length
                }

              />


              <AnalyticsStatus

                label="Awaiting confirmation"

                value={
                  analytics.paymentSubmitted
                }

              />


              <AnalyticsStatus

                label="Unpaid"

                value={
                  analytics.unpaid
                }

              />


            </article>



            <article className="analytics-card">


              <div className="analytics-card-header">

                <div>

                  <span>
                    CHANNELS
                  </span>

                  <h2>
                    Where orders came from
                  </h2>

                </div>

              </div>


              {getChannelCounts(
                orders
              ).map(
                item => (

                  <AnalyticsStatus

                    key={
                      item.label
                    }

                    label={
                      item.label
                    }

                    value={
                      item.value
                    }

                  />

                )
              )}


              {!orders.length && (

                <p className="analytics-empty-text">
                  No orders in this period yet.
                </p>

              )}


            </article>


          </section>


        </>

      )}


    </main>

  );

}



function AnalyticsMetric({

  icon: Icon,

  label,

  value

}) {

  return (

    <article className="analytics-metric">


      <div>

        <Icon
          size={18}
        />

      </div>


      <span>
        {label}
      </span>


      <strong>
        {value}
      </strong>


    </article>

  );

}



function AnalyticsStatus({

  label,

  value

}) {

  return (

    <div className="analytics-status">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );

}



function getChannelCounts(
  orders
) {

  const map =
    new Map();


  orders.forEach(
    order => {


      const label =
        String(
          order.channel ||
          "Other"
        )
          .trim()
          .toLowerCase();


      map.set(

        label,

        (
          map.get(
            label
          ) ||
          0
        ) +
        1

      );

    }
  );


  return [
    ...map.entries()
  ]
    .map(
      (
        [
          label,
          value
        ]
      ) => ({

        label:
          label
            .charAt(0)
            .toUpperCase()
          +
          label.slice(
            1
          ),

        value

      })
    )
    .sort(
      (
        a,
        b
      ) =>
        b.value -
        a.value
    );

}