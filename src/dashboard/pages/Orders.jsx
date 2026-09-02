import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  Package,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


/* =========================================================
   STATUS LABELS

   One source of truth. Used by the badges and by the
   customer email, so they can never disagree.
========================================================= */

const STATUS_LABELS = {

  pending:
    "Pending",

  awaiting_payment:
    "Awaiting payment",

  payment_submitted:
    "Payment submitted",

  paid:
    "Paid",

  processing:
    "Processing",

  shipped:
    "Shipped",

  delivered:
    "Delivered",

  cancelled:
    "Cancelled",

  refunded:
    "Refunded"

};


const PAYMENT_LABELS = {

  unpaid:
    "Unpaid",

  awaiting_confirmation:
    "Verify payment",

  paid:
    "Paid",

  refunded:
    "Refunded"

};


/* =========================================================
   ORDERS PAGE
========================================================= */

export default function Orders({
  business,
  onOrdersChanged,
  refreshKey
}) {

  const [orders, setOrders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [updatingId, setUpdatingId] =
    useState(null);


  /* =========================================================
     LOAD ORDERS
  ========================================================= */

  async function loadOrders() {

    if (!business?.id) {
      return;
    }

    setLoading(true);

    setError("");

    try {

      const {
        data,
        error: ordersError
      } =
        await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              id,
              product_id,
              product_name,
              variant_name,
              sku,
              quantity,
              unit_price,
              total_price,
              product_image_url
            ),
            customer:customers (
              id,
              full_name,
              phone,
              email,
              whatsapp_number
            )
          `)
          .eq(
            "business_id",
            business.id
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (ordersError) {
        throw ordersError;
      }

      setOrders(
        data || []
      );

    } catch (err) {

      console.error(
        "Orders load error:",
        err
      );

      setError(
        err?.message ||
        "We couldn't load your orders."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadOrders();

  }, [
    business?.id,
    refreshKey
  ]);


  /* =========================================================
     FILTERED ORDERS
  ========================================================= */

  const filteredOrders =
    useMemo(() => {

      const term =
        search
          .trim()
          .toLowerCase();

      return orders.filter(
        function(order) {

          const matchesSearch =
            !term ||

            order.order_number
              ?.toLowerCase()
              .includes(term)

            ||

            order.customer_name
              ?.toLowerCase()
              .includes(term)

            ||

            order.customer_phone
              ?.toLowerCase()
              .includes(term)

            ||

            order.customer?.full_name
              ?.toLowerCase()
              .includes(term);


          const matchesStatus =
            statusFilter === "all"
              ? true
              : order.status === statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      orders,
      search,
      statusFilter
    ]);


  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalOrders =
    orders.length;


  const awaitingPayment =
    orders.filter(
      order =>
        order.payment_status ===
          "awaiting_confirmation"

        ||

        order.status ===
          "awaiting_payment"
    ).length;


  const processingOrders =
    orders.filter(
      order =>
        order.status === "processing"

        ||

        order.status === "paid"
    ).length;


  const completedOrders =
    orders.filter(
      order =>
        order.status === "delivered"
    ).length;


  /* =========================================================
     FORMAT MONEY
  ========================================================= */

  function formatMoney(
    value,
    currency = "NGN"
  ) {

    try {

      return new Intl.NumberFormat(
        "en-NG",
        {
          style: "currency",
          currency,
          maximumFractionDigits: 0
        }
      ).format(
        Number(value || 0)
      );

    } catch {

      return `${currency} ${Number(
        value || 0
      ).toLocaleString()}`;

    }

  }


  /* =========================================================
     UPDATE ORDER

     Returns true only when the database actually accepted
     the change. Callers use that to decide whether to
     email the customer — never email on a failed update.
  ========================================================= */

  async function updateOrder(
    orderId,
    updates
  ) {

    setUpdatingId(
      orderId
    );

    try {

      const {
        data,
        error: updateError
      } =
        await supabase
          .from("orders")
          .update({
            ...updates,
            updated_at:
              new Date()
                .toISOString()
          })
          .eq(
            "id",
            orderId
          )
          .select(`
            *,
            order_items (
              id,
              product_id,
              product_name,
              variant_name,
              sku,
              quantity,
              unit_price,
              total_price,
              product_image_url
            ),
            customer:customers (
              id,
              full_name,
              phone,
              email,
              whatsapp_number
            )
          `)
          .single();


      if (updateError) {
        throw updateError;
      }


      setOrders(
        current =>
          current.map(
            order =>
              order.id === orderId
                ? data
                : order
          )
      );


      setSelectedOrder(
        current =>
          current?.id === orderId
            ? data
            : current
      );


      if (onOrdersChanged) {

        await onOrdersChanged();

      }


      return true;


    } catch (err) {

      console.error(
        "Order update error:",
        err
      );

      alert(
        err?.message ||
        "We couldn't update this order."
      );

      return false;


    } finally {

      setUpdatingId(null);

    }

  }


  /* =========================================================
     CUSTOMER EMAIL

     Fire and forget. A mail failure must never make the
     merchant think the order didn't update.
  ========================================================= */

  async function sendOrderEmail(
    orderId,
    event,
    statusLabel
  ) {

    try {

      await supabase
        .functions
        .invoke(
          "send-order-email",
          {
            body: {
              orderId,
              event,
              statusLabel
            }
          }
        );

    } catch (err) {

      console.error(
        "Order email failed:",
        err
      );

    }

  }


  /* =========================================================
     CONFIRM PAYMENT
  ========================================================= */

  async function confirmPayment(
    order
  ) {

    const confirmed =
      window.confirm(
        `Confirm payment for ${order.order_number}?`
      );


    if (!confirmed) {
      return;
    }


    const updated =
      await updateOrder(
        order.id,
        {
          payment_status:
            "paid",

          status:
            "paid"
        }
      );


    if (!updated) {
      return;
    }


    await sendOrderEmail(
      order.id,
      "payment_confirmed",
      STATUS_LABELS.paid
    );

  }


  /* =========================================================
     CHANGE STATUS
  ========================================================= */

  async function changeStatus(
    order,
    nextStatus
  ) {

    const updates = {
      status:
        nextStatus
    };


    if (
      nextStatus === "paid"
    ) {

      updates.payment_status =
        "paid";

    }


    const updated =
      await updateOrder(
        order.id,
        updates
      );


    if (!updated) {
      return;
    }


    const event =
      nextStatus === "cancelled"

        ? "order_cancelled"

        : nextStatus === "paid"

          ? "payment_confirmed"

          : "status_changed";


    await sendOrderEmail(
      order.id,
      event,
      STATUS_LABELS[nextStatus] ||
      nextStatus
    );

  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="orders-loading">

        <Loader2
          size={24}
          className="spin"
        />

        <span>
          Loading orders...
        </span>

      </div>

    );

  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="dashboard-content orders-page">


      {/* HEADER */}

      <section className="orders-heading">


        <div>

          <span className="dashboard-eyebrow">
            Sales
          </span>

          <h1>
            Orders
          </h1>

          <p>
            Manage website and AI-assisted
            customer orders in one place.
          </p>

        </div>


      </section>



      {/* SUMMARY */}

      <section className="orders-summary">


        <OrderSummaryCard
          label="Total orders"
          value={totalOrders}
          icon={ShoppingBag}
        />


        <OrderSummaryCard
          label="Awaiting payment"
          value={awaitingPayment}
          icon={Banknote}
          lime
        />


        <OrderSummaryCard
          label="Processing"
          value={processingOrders}
          icon={Package}
        />


        <OrderSummaryCard
          label="Completed"
          value={completedOrders}
          icon={CheckCircle2}
        />


      </section>



      {/* TOOLBAR */}

      <section className="orders-toolbar">


        <div className="orders-search">

          <Search size={17} />

          <input
            type="search"
            value={search}
            placeholder="Search order, customer or phone..."

            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
          />

        </div>


        <div className="orders-filter">

          <select
            value={statusFilter}

            onChange={
              event =>
                setStatusFilter(
                  event.target.value
                )
            }
          >

            <option value="all">
              All orders
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="awaiting_payment">
              Awaiting payment
            </option>

            <option value="payment_submitted">
              Payment submitted
            </option>

            <option value="paid">
              Paid
            </option>

            <option value="processing">
              Processing
            </option>

            <option value="shipped">
              Shipped
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>

          <ChevronDown size={16} />

        </div>


      </section>



      {/* ERROR */}

      {error && (

        <div className="orders-error">

          {error}

        </div>

      )}



      {/* EMPTY */}

      {!orders.length ? (

        <section className="orders-empty">


          <div className="orders-empty-icon">

            <ShoppingBag size={29} />

          </div>


          <span>
            RUNAMBIZ ORDERS
          </span>


          <h2>
            No orders yet
          </h2>


          <p>
            Orders from your storefront and
            AI-powered chat sales will appear
            here automatically.
          </p>


        </section>

      ) : filteredOrders.length === 0 ? (

        <section className="orders-empty small">

          <Search size={25} />

          <h2>
            No matching orders
          </h2>

          <p>
            Try changing your search or filter.
          </p>

        </section>

      ) : (

        <section className="orders-table-card">


          <div className="orders-table-wrap">


            <table className="orders-table">


              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Channel
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredOrders.map(
                  order => (

                    <OrderRow
                      key={order.id}

                      order={order}

                      formatMoney={
                        formatMoney
                      }

                      onOpen={() =>
                        setSelectedOrder(
                          order
                        )
                      }
                    />

                  )
                )}

              </tbody>


            </table>


          </div>


        </section>

      )}



      {/* ORDER DETAILS */}

      <OrderDetails
        order={
          selectedOrder
        }

        updating={
          updatingId ===
          selectedOrder?.id
        }

        formatMoney={
          formatMoney
        }

        onClose={() =>
          setSelectedOrder(null)
        }

        onConfirmPayment={
          confirmPayment
        }

        onChangeStatus={
          changeStatus
        }
      />


    </div>

  );

}


/* =========================================================
   SUMMARY CARD
========================================================= */

function OrderSummaryCard({
  label,
  value,
  icon: Icon,
  lime = false
}) {

  return (

    <article
      className={
        lime
          ? "order-summary-card lime"
          : "order-summary-card"
      }
    >

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>


      <div className="order-summary-icon">

        <Icon size={18} />

      </div>


    </article>

  );

}


/* =========================================================
   TABLE ROW
========================================================= */

function OrderRow({
  order,
  formatMoney,
  onOpen
}) {

  const customerName =
    order.customer_name ||
    order.customer?.full_name ||
    "Customer";


  return (

    <tr
      className="order-row"
      onClick={onOpen}
    >


      <td>

        <div className="order-number-cell">

          <strong>
            {order.order_number}
          </strong>

          <span>
            {order.order_items?.length || 0}
            {" "}
            item
            {
              order.order_items?.length === 1
                ? ""
                : "s"
            }
          </span>

        </div>

      </td>


      <td>

        <div className="order-customer-cell">

          <div className="order-customer-avatar">

            {customerName
              .charAt(0)
              .toUpperCase()}

          </div>

          <div>

            <strong>
              {customerName}
            </strong>

            <span>
              {
                order.customer_phone ||
                order.customer?.phone ||
                order.customer?.whatsapp_number ||
                "No phone"
              }
            </span>

          </div>

        </div>

      </td>


      <td>

        <ChannelBadge
          channel={
            order.channel
          }
        />

      </td>


      <td>

        <strong className="order-total">

          {formatMoney(
            order.total,
            order.currency
          )}

        </strong>

      </td>


      <td>

        <PaymentBadge
          status={
            order.payment_status
          }
        />

      </td>


      <td>

        <OrderStatusBadge
          status={
            order.status
          }
        />

      </td>


      <td>

        <span className="order-date">

          {new Date(
            order.created_at
          ).toLocaleDateString(
            "en-NG",
            {
              day: "2-digit",
              month: "short",
              year: "numeric"
            }
          )}

        </span>

      </td>


    </tr>

  );

}


/* =========================================================
   ORDER DETAILS
========================================================= */

function OrderDetails({
  order,
  updating,
  formatMoney,
  onClose,
  onConfirmPayment,
  onChangeStatus
}) {

  if (!order) {
    return null;
  }


  const customerName =
    order.customer_name ||
    order.customer?.full_name ||
    "Customer";


  return (

    <div className="order-details-layer">


      <button
        type="button"
        className="order-details-backdrop"
        onClick={onClose}
        aria-label="Close order"
      />


      <aside className="order-details-panel">


        <header className="order-details-header">


          <div>

            <span>
              ORDER
            </span>

            <h2>
              {order.order_number}
            </h2>

          </div>


          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
          >

            <X size={20} />

          </button>


        </header>



        <div className="order-details-content">


          {/* STATUS */}

          <section className="order-detail-section">


            <div className="order-detail-status-row">

              <OrderStatusBadge
                status={
                  order.status
                }
              />

              <PaymentBadge
                status={
                  order.payment_status
                }
              />

              <ChannelBadge
                channel={
                  order.channel
                }
              />

            </div>


          </section>



          {/* CUSTOMER */}

          <section className="order-detail-section">


            <div className="order-detail-title">

              <User size={16} />

              Customer

            </div>


            <div className="order-customer-details">

              <strong>
                {customerName}
              </strong>

              <span>
                {
                  order.customer_phone ||
                  order.customer?.phone ||
                  order.customer?.whatsapp_number ||
                  "Phone not supplied"
                }
              </span>

              {order.customer_email ? (

                <span>
                  {order.customer_email}
                </span>

              ) : (

                <span className="order-no-email">
                  No email — this customer won't
                  receive order updates
                </span>

              )}

            </div>


          </section>



          {/* DELIVERY */}

          {(order.delivery_address ||
            order.delivery_city ||
            order.delivery_state) && (

            <section className="order-detail-section">


              <div className="order-detail-title">

                <Truck size={16} />

                Delivery

              </div>


              <p className="order-delivery-address">

                {[
                  order.delivery_address,
                  order.delivery_city,
                  order.delivery_state,
                  order.delivery_country
                ]
                  .filter(Boolean)
                  .join(", ")}

              </p>


              {order.delivery_notes && (

                <p className="order-delivery-note">

                  {order.delivery_notes}

                </p>

              )}


            </section>

          )}



          {/* ITEMS */}

          <section className="order-detail-section">


            <div className="order-detail-title">

              <Package size={16} />

              Items

            </div>


            <div className="order-items-list">


              {(order.order_items || []).map(
                item => (

                  <div
                    key={item.id}
                    className="order-item"
                  >


                    <div className="order-item-image">

                      {item.product_image_url ? (

                        <img
                          src={
                            item.product_image_url
                          }
                          alt={
                            item.product_name
                          }
                          loading="lazy"
                        />

                      ) : (

                        <Package size={19} />

                      )}

                    </div>


                    <div className="order-item-copy">

                      <strong>
                        {item.product_name}
                      </strong>

                      <span>

                        Qty {item.quantity}

                        {item.variant_name
                          ? ` · ${item.variant_name}`
                          : ""}

                      </span>

                    </div>


                    <strong className="order-item-price">

                      {formatMoney(
                        item.total_price,
                        order.currency
                      )}

                    </strong>


                  </div>

                )
              )}


            </div>


          </section>



          {/* TOTALS */}

          <section className="order-detail-section">


            <div className="order-total-lines">


              <div>

                <span>
                  Subtotal
                </span>

                <strong>

                  {formatMoney(
                    order.subtotal,
                    order.currency
                  )}

                </strong>

              </div>


              <div>

                <span>
                  Delivery
                </span>

                <strong>

                  {formatMoney(
                    order.delivery_fee,
                    order.currency
                  )}

                </strong>

              </div>


              {Number(
                order.discount_amount
              ) > 0 && (

                <div>

                  <span>
                    Discount
                  </span>

                  <strong>

                    -
                    {formatMoney(
                      order.discount_amount,
                      order.currency
                    )}

                  </strong>

                </div>

              )}


              <div className="grand-total">

                <span>
                  Total
                </span>

                <strong>

                  {formatMoney(
                    order.total,
                    order.currency
                  )}

                </strong>

              </div>


            </div>


          </section>



          {/* CUSTOMER NOTE */}

          {order.customer_note && (

            <section className="order-detail-section">

              <div className="order-detail-title">

                Customer note

              </div>

              <p className="order-note">

                {order.customer_note}

              </p>

            </section>

          )}



          {/* ACTIONS */}

          <section className="order-detail-actions">


            {order.payment_status !== "paid" &&
              order.status !== "cancelled" && (

                <button
                  type="button"
                  className="order-action-primary"
                  disabled={updating}

                  onClick={() =>
                    onConfirmPayment(
                      order
                    )
                  }
                >

                  {updating ? (

                    <Loader2
                      size={17}
                      className="spin"
                    />

                  ) : (

                    <Banknote size={17} />

                  )}

                  Confirm payment

                </button>

            )}


            {order.payment_status === "paid" &&
              (
                order.status === "paid" ||
                order.status === "pending"
              ) && (

                <button
                  type="button"
                  className="order-action-primary"
                  disabled={updating}

                  onClick={() =>
                    onChangeStatus(
                      order,
                      "processing"
                    )
                  }
                >

                  <Package size={17} />

                  Start processing

                </button>

            )}


            {order.status === "processing" && (

              <button
                type="button"
                className="order-action-primary"
                disabled={updating}

                onClick={() =>
                  onChangeStatus(
                    order,
                    "shipped"
                  )
                }
              >

                <Truck size={17} />

                Mark shipped

              </button>

            )}


            {order.status === "shipped" && (

              <button
                type="button"
                className="order-action-primary"
                disabled={updating}

                onClick={() =>
                  onChangeStatus(
                    order,
                    "delivered"
                  )
                }
              >

                <CheckCircle2 size={17} />

                Mark delivered

              </button>

            )}


            {![
              "cancelled",
              "delivered",
              "refunded"
            ].includes(
              order.status
            ) && (

              <button
                type="button"
                className="order-action-danger"
                disabled={updating}

                onClick={() => {

                  const confirmed =
                    window.confirm(
                      `Cancel ${order.order_number}?`
                    );

                  if (confirmed) {

                    onChangeStatus(
                      order,
                      "cancelled"
                    );

                  }

                }}
              >

                <XCircle size={17} />

                Cancel order

              </button>

            )}


          </section>


        </div>


      </aside>


    </div>

  );

}


/* =========================================================
   BADGES
========================================================= */

function OrderStatusBadge({
  status
}) {

  return (

    <span
      className={
        `order-status-badge ${status}`
      }
    >

      {STATUS_LABELS[status] || status}

    </span>

  );

}


function PaymentBadge({
  status
}) {

  return (

    <span
      className={
        `payment-status-badge ${status}`
      }
    >

      {status === "paid" && (
        <Check size={11} />
      )}

      {status === "awaiting_confirmation" && (
        <Clock3 size={11} />
      )}

      {PAYMENT_LABELS[status] || status}

    </span>

  );

}


function ChannelBadge({
  channel
}) {

  return (

    <span
      className={
        `order-channel-badge ${channel}`
      }
    >

      {channel === "whatsapp"
        ? "WhatsApp"
        : channel === "telegram"
          ? "Telegram"
          : channel === "manual"
            ? "Manual"
            : "Website"}

    </span>

  );

}