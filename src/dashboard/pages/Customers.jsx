import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Check,
  Edit3,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  User,
  Users,
  Wallet,
  X
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


/* =========================================================
   CUSTOMERS PAGE
========================================================= */

export default function Customers({
  business,
  refreshKey
}) {
  const [customers, setCustomers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [editingCustomer, setEditingCustomer] =
    useState(null);


  /* =========================================================
     LOAD CUSTOMERS
  ========================================================= */

  async function loadCustomers() {

    if (!business?.id) {
      return;
    }

    setLoading(true);

    setError("");

    try {

      const {
        data,
        error: customersError
      } =
        await supabase
          .from("customers")
          .select(`
            *,
            orders (
              id,
              order_number,
              total,
              currency,
              status,
              payment_status,
              channel,
              created_at
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


      if (customersError) {
        throw customersError;
      }


      setCustomers(
        data || []
      );


      /*
        Keep drawer fresh if a customer
        was already selected.
      */

      if (selectedCustomer) {

        const refreshed =
          (data || [])
            .find(
              customer =>
                customer.id ===
                selectedCustomer.id
            );


        if (refreshed) {

          setSelectedCustomer(
            refreshed
          );

        }

      }


    } catch (err) {

      console.error(
        "Customers load error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't load your customers."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

  loadCustomers();

}, [
  business?.id,
  refreshKey
]);


  /* =========================================================
     CUSTOMER HELPERS
  ========================================================= */

  function getCustomerOrders(
    customer
  ) {

    return [
      ...(customer.orders || [])
    ].sort(
      (a, b) =>
        new Date(
          b.created_at
        ) -
        new Date(
          a.created_at
        )
    );

  }


  function getPaidTotal(
    customer
  ) {

    return (
      customer.orders || []
    )
      .filter(
        order =>
          order.payment_status ===
            "paid"
      )
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

  }


  function getChannel(
    customer
  ) {

    if (
      customer.whatsapp_number
    ) {

      return "whatsapp";

    }


    if (
      customer.telegram_user_id
    ) {

      return "telegram";

    }


    return "website";

  }


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredCustomers =
    useMemo(() => {

      const term =
        search
          .trim()
          .toLowerCase();


      if (!term) {

        return customers;

      }


      return customers.filter(
        customer => {

          const values = [

            customer.full_name,

            customer.phone,

            customer.email,

            customer.whatsapp_number,

            customer.city,

            customer.state

          ]
            .filter(Boolean)
            .map(
              value =>
                String(value)
                  .toLowerCase()
            );


          return values.some(
            value =>
              value.includes(
                term
              )
          );

        }
      );


    }, [
      customers,
      search
    ]);


  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalCustomers =
    customers.length;


  const customersWithOrders =
    customers.filter(
      customer =>
        (customer.orders || [])
          .length > 0
    ).length;


  const whatsappCustomers =
    customers.filter(
      customer =>
        Boolean(
          customer.whatsapp_number
        )
    ).length;


  const totalCustomerRevenue =
    customers.reduce(
      (
        total,
        customer
      ) =>
        total +
        getPaidTotal(
          customer
        ),
      0
    );


  /* =========================================================
     FORMAT MONEY
  ========================================================= */

  function formatMoney(
    value,
    currency =
      business?.currency ||
      "NGN"
  ) {

    try {

      return new Intl.NumberFormat(
        "en-NG",
        {
          style:
            "currency",

          currency,

          maximumFractionDigits:
            0
        }
      ).format(
        Number(
          value || 0
        )
      );

    } catch {

      return (
        `${currency} ` +
        Number(
          value || 0
        ).toLocaleString()
      );

    }

  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="customers-loading">

        <Loader2
          size={24}
          className="spin"
        />

        <span>
          Loading customers...
        </span>

      </div>

    );

  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="dashboard-content customers-page">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="customers-heading">


        <div>

          <span className="dashboard-eyebrow">
            Audience
          </span>


          <h1>
            Customers
          </h1>


          <p>
            Customers from your storefront and
            AI-assisted sales appear here automatically.
          </p>

        </div>


      </section>



      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <section className="customers-summary">


        <CustomerSummaryCard

          label="Total customers"

          value={
            totalCustomers
          }

          icon={
            Users
          }

        />


        <CustomerSummaryCard

          label="With orders"

          value={
            customersWithOrders
          }

          icon={
            ShoppingBag
          }

        />


        <CustomerSummaryCard

          label="WhatsApp"

          value={
            whatsappCustomers
          }

          icon={
            MessageCircle
          }

          lime

        />


        <CustomerSummaryCard

          label="Paid sales"

          value={
            formatMoney(
              totalCustomerRevenue
            )
          }

          icon={
            Wallet
          }

        />


      </section>



      {/* =====================================================
          SEARCH
      ====================================================== */}

      <section className="customers-toolbar">


        <div className="customers-search">

          <Search size={17} />

          <input

            type="search"

            value={
              search
            }

            placeholder="Search customer, phone, email or location..."

            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }

          />

        </div>


      </section>



      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="customers-error">

          {error}

        </div>

      )}



      {/* =====================================================
          EMPTY
      ====================================================== */}

      {!customers.length ? (

        <section className="customers-empty">


          <div className="customers-empty-icon">

            <Users size={29} />

          </div>


          <span>
            YOUR CUSTOMERS
          </span>


          <h2>
            No customers yet
          </h2>


          <p>
            Customers will be created automatically
            when someone orders from your storefront
            or starts buying through Runambiz AI.
          </p>


        </section>


      ) : filteredCustomers.length === 0 ? (

        <section className="customers-empty small">


          <Search size={25} />


          <h2>
            No customers found
          </h2>


          <p>
            Try another name, phone number,
            email or location.
          </p>


        </section>


      ) : (

        <section className="customers-grid">


          {filteredCustomers.map(
            customer => {


              const orders =
                getCustomerOrders(
                  customer
                );


              const paidTotal =
                getPaidTotal(
                  customer
                );


              const latestOrder =
                orders[0];


              const channel =
                getChannel(
                  customer
                );


              return (

                <CustomerCard

                  key={
                    customer.id
                  }

                  customer={
                    customer
                  }

                  orderCount={
                    orders.length
                  }

                  paidTotal={
                    paidTotal
                  }

                  latestOrder={
                    latestOrder
                  }

                  channel={
                    channel
                  }

                  formatMoney={
                    formatMoney
                  }

                  onOpen={() =>
                    setSelectedCustomer(
                      customer
                    )
                  }

                />

              );

            }
          )}


        </section>

      )}



      {/* =====================================================
          CUSTOMER DETAILS
      ====================================================== */}

      <CustomerDetails

        customer={
          selectedCustomer
        }

        business={
          business
        }

        formatMoney={
          formatMoney
        }

        getPaidTotal={
          getPaidTotal
        }

        getCustomerOrders={
          getCustomerOrders
        }

        getChannel={
          getChannel
        }

        onClose={() =>
          setSelectedCustomer(
            null
          )
        }

        onEdit={() =>
          setEditingCustomer(
            selectedCustomer
          )
        }

      />



      {/* =====================================================
          EDIT CUSTOMER
      ====================================================== */}

      <EditCustomerModal

        customer={
          editingCustomer
        }

        onClose={() =>
          setEditingCustomer(
            null
          )
        }

        onSaved={
          async () => {

            setEditingCustomer(
              null
            );

            await loadCustomers();

          }
        }

      />


    </div>

  );

}


/* =========================================================
   SUMMARY CARD
========================================================= */

function CustomerSummaryCard({
  label,
  value,
  icon: Icon,
  lime = false
}) {

  return (

    <article
      className={
        lime
          ? "customer-summary-card lime"
          : "customer-summary-card"
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


      <div className="customer-summary-icon">

        <Icon size={18} />

      </div>


    </article>

  );

}


/* =========================================================
   CUSTOMER CARD
========================================================= */

function CustomerCard({
  customer,
  orderCount,
  paidTotal,
  latestOrder,
  channel,
  formatMoney,
  onOpen
}) {

  const name =
    customer.full_name ||
    "Customer";


  return (

    <button
      type="button"
      className="customer-card"
      onClick={onOpen}
    >


      <div className="customer-card-top">


        <div className="customer-card-avatar">

          {name
            .charAt(0)
            .toUpperCase()}

        </div>


        <ChannelBadge
          channel={
            channel
          }
        />


      </div>


      <div className="customer-card-copy">


        <h3>
          {name}
        </h3>


        <span>

          {
            customer.phone ||
            customer.whatsapp_number ||
            "No phone"
          }

        </span>


        {customer.email && (

          <span>
            {customer.email}
          </span>

        )}


      </div>


      <div className="customer-card-stats">


        <div>

          <span>
            Orders
          </span>

          <strong>
            {orderCount}
          </strong>

        </div>


        <div>

          <span>
            Paid
          </span>

          <strong>

            {formatMoney(
              paidTotal
            )}

          </strong>

        </div>


      </div>


      {latestOrder && (

        <div className="customer-latest-order">


          <span>
            Latest
          </span>


          <strong>
            {latestOrder.order_number}
          </strong>


          <span>
            {formatMoney(
              latestOrder.total,
              latestOrder.currency
            )}
          </span>


        </div>

      )}


    </button>

  );

}


/* =========================================================
   CUSTOMER DETAILS
========================================================= */

function CustomerDetails({
  customer,
  formatMoney,
  getPaidTotal,
  getCustomerOrders,
  getChannel,
  onClose,
  onEdit
}) {

  if (!customer) {
    return null;
  }


  const name =
    customer.full_name ||
    "Customer";


  const orders =
    getCustomerOrders(
      customer
    );


  const paidTotal =
    getPaidTotal(
      customer
    );


  const channel =
    getChannel(
      customer
    );


  return (

    <div className="customer-details-layer">


      <button
        type="button"
        className="customer-details-backdrop"
        aria-label="Close customer details"
        onClick={onClose}
      />


      <aside className="customer-details-panel">


        <header className="customer-details-header">


          <div>

            <span>
              CUSTOMER
            </span>

            <h2>
              {name}
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



        <div className="customer-details-content">


          {/* PROFILE */}

          <section className="customer-profile-block">


            <div className="customer-profile-avatar">

              {name
                .charAt(0)
                .toUpperCase()}

            </div>


            <div>

              <h3>
                {name}
              </h3>

              <ChannelBadge
                channel={
                  channel
                }
              />

            </div>


            <button
              type="button"
              className="customer-edit-button"
              onClick={onEdit}
            >

              <Edit3 size={14} />

              Edit

            </button>


          </section>



          {/* CONTACT */}

          <section className="customer-detail-section">


            <h4>
              Contact
            </h4>


            <CustomerInfoRow
              icon={Phone}
              label="Phone"
              value={
                customer.phone ||
                customer.whatsapp_number ||
                "Not provided"
              }
            />


            <CustomerInfoRow
              icon={Mail}
              label="Email"
              value={
                customer.email ||
                "Not provided"
              }
            />


            {(customer.default_address ||
              customer.city ||
              customer.state) && (

              <CustomerInfoRow

                icon={
                  MapPin
                }

                label="Address"

                value={
                  [
                    customer.default_address,
                    customer.city,
                    customer.state,
                    customer.country
                  ]
                    .filter(Boolean)
                    .join(", ")
                }

              />

            )}


          </section>



          {/* CUSTOMER VALUE */}

          <section className="customer-detail-section">


            <h4>
              Customer value
            </h4>


            <div className="customer-value-grid">


              <div>

                <span>
                  Total orders
                </span>

                <strong>
                  {orders.length}
                </strong>

              </div>


              <div>

                <span>
                  Paid sales
                </span>

                <strong>

                  {formatMoney(
                    paidTotal
                  )}

                </strong>

              </div>


            </div>


          </section>



          {/* NOTES */}

          {customer.notes && (

            <section className="customer-detail-section">


              <h4>
                Merchant notes
              </h4>


              <p className="customer-notes">

                {customer.notes}

              </p>


            </section>

          )}



          {/* ORDERS */}

          <section className="customer-detail-section">


            <h4>
              Order history
            </h4>


            {!orders.length ? (

              <div className="customer-no-orders">

                <ShoppingBag size={20} />

                <span>
                  No orders yet
                </span>

              </div>

            ) : (

              <div className="customer-orders-list">


                {orders.map(
                  order => (

                    <div
                      key={
                        order.id
                      }
                      className="customer-order-row"
                    >


                      <div>

                        <strong>
                          {order.order_number}
                        </strong>

                        <span>

                          {new Date(
                            order.created_at
                          )
                            .toLocaleDateString(
                              "en-NG",
                              {
                                day:
                                  "2-digit",

                                month:
                                  "short",

                                year:
                                  "numeric"
                              }
                            )}

                        </span>

                      </div>


                      <div>

                        <strong>

                          {formatMoney(
                            order.total,
                            order.currency
                          )}

                        </strong>

                        <span
                          className={
                            `customer-order-status ${order.status}`
                          }
                        >

                          {order.status
                            ?.replaceAll(
                              "_",
                              " "
                            )}

                        </span>

                      </div>


                    </div>

                  )
                )}


              </div>

            )}


          </section>


        </div>


      </aside>


    </div>

  );

}


/* =========================================================
   INFO ROW
========================================================= */

function CustomerInfoRow({
  icon: Icon,
  label,
  value
}) {

  return (

    <div className="customer-info-row">


      <div className="customer-info-icon">

        <Icon size={15} />

      </div>


      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>


    </div>

  );

}


/* =========================================================
   CHANNEL
========================================================= */

function ChannelBadge({
  channel
}) {

  return (

    <span
      className={
        `customer-channel-badge ${channel}`
      }
    >

      {channel === "whatsapp"
        ? "WhatsApp"
        : channel === "telegram"
          ? "Telegram"
          : "Website"}

    </span>

  );

}


/* =========================================================
   EDIT CUSTOMER MODAL
========================================================= */

function EditCustomerModal({
  customer,
  onClose,
  onSaved
}) {

  const [name, setName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {

    if (!customer) {
      return;
    }


    setName(
      customer.full_name ||
      ""
    );

    setPhone(
      customer.phone ||
      ""
    );

    setEmail(
      customer.email ||
      ""
    );

    setAddress(
      customer.default_address ||
      ""
    );

    setCity(
      customer.city ||
      ""
    );

    setState(
      customer.state ||
      ""
    );

    setCountry(
      customer.country ||
      ""
    );

    setNotes(
      customer.notes ||
      ""
    );

    setError("");


  }, [
    customer
  ]);


  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    if (!customer) {
      return;
    }


    if (!name.trim()) {

      setError(
        "Enter the customer's name."
      );

      return;

    }


    setSaving(true);

    setError("");


    try {

      const {
        error: updateError
      } =
        await supabase
          .from("customers")
          .update({

            full_name:
              name.trim(),

            phone:
              phone.trim() ||
              null,

            email:
              email.trim() ||
              null,

            default_address:
              address.trim() ||
              null,

            city:
              city.trim() ||
              null,

            state:
              state.trim() ||
              null,

            country:
              country.trim() ||
              null,

            notes:
              notes.trim() ||
              null,

            updated_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            customer.id
          );


      if (updateError) {
        throw updateError;
      }


      await onSaved();


    } catch (err) {

      console.error(
        "Customer update error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't update this customer."
      );

    } finally {

      setSaving(false);

    }

  }


  if (!customer) {
    return null;
  }


  return (

    <div className="customer-edit-layer">


      <button
        type="button"
        className="customer-edit-backdrop"
        onClick={onClose}
        aria-label="Close"
      />


      <section className="customer-edit-modal">


        <header>


          <div>

            <span>
              CUSTOMER
            </span>

            <h2>
              Edit customer
            </h2>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={saving}
          >

            <X size={20} />

          </button>


        </header>


        <form
          onSubmit={
            handleSubmit
          }
        >


          <div className="customer-form-group">

            <label>
              Full name
            </label>

            <input
              value={name}
              onChange={
                event =>
                  setName(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="customer-form-grid">


            <div className="customer-form-group">

              <label>
                Phone
              </label>

              <input
                value={phone}
                onChange={
                  event =>
                    setPhone(
                      event.target.value
                    )
                }
              />

            </div>


            <div className="customer-form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={
                  event =>
                    setEmail(
                      event.target.value
                    )
                }
              />

            </div>


          </div>


          <div className="customer-form-group">

            <label>
              Address
            </label>

            <input
              value={address}
              onChange={
                event =>
                  setAddress(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="customer-form-grid">


            <div className="customer-form-group">

              <label>
                City
              </label>

              <input
                value={city}
                onChange={
                  event =>
                    setCity(
                      event.target.value
                    )
                }
              />

            </div>


            <div className="customer-form-group">

              <label>
                State
              </label>

              <input
                value={state}
                onChange={
                  event =>
                    setState(
                      event.target.value
                    )
                }
              />

            </div>


          </div>


          <div className="customer-form-group">

            <label>
              Country
            </label>

            <input
              value={country}
              onChange={
                event =>
                  setCountry(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="customer-form-group">

            <label>
              Private merchant notes
            </label>

            <textarea
              rows="4"
              maxLength="1000"
              value={notes}
              placeholder="e.g. Repeat customer, prefers evening delivery..."
              onChange={
                event =>
                  setNotes(
                    event.target.value
                  )
              }
            />

          </div>


          {error && (

            <div className="customer-form-error">

              {error}

            </div>

          )}


          <footer>


            <button
              type="button"
              className="customer-cancel-button"
              onClick={onClose}
              disabled={saving}
            >

              Cancel

            </button>


            <button
              type="submit"
              className="customer-save-button"
              disabled={saving}
            >

              {saving ? (

                <>

                  <Loader2
                    size={16}
                    className="spin"
                  />

                  Saving...

                </>

              ) : (

                <>

                  <Check size={16} />

                  Save changes

                </>

              )}

            </button>


          </footer>


        </form>


      </section>


    </div>

  );

}