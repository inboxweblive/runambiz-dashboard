import {
  useEffect,
  useState
} from "react";

import {
  Bell,
  Bot,
  CheckCheck,
  CreditCard,
  Loader2,
  MessageCircle,
  Package,
  ShoppingBag,
  X
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


export default function NotificationDrawer({

  open,

  business,

  onClose,

  onNavigate,

  onUnreadChange

}) {


  const [
    loading,
    setLoading
  ] =
    useState(false);


  const [
    notifications,
    setNotifications
  ] =
    useState([]);


  const [
    error,
    setError
  ] =
    useState("");



  async function loadNotifications() {

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

      const {
        data,
        error:
          notificationError
      } =
        await supabase
          .from(
            "notifications"
          )
          .select(`
            id,
            type,
            title,
            message,
            order_id,
            customer_id,
            channel,
            delivery_status,
            is_read,
            read_at,
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
          .limit(
            40
          );


      if (
        notificationError
      ) {

        throw notificationError;

      }


      const rows =
        data ||
        [];


      setNotifications(
        rows
      );


      if (
        onUnreadChange
      ) {

        onUnreadChange(

          rows.filter(
            item =>
              item.is_read !==
              true
          ).length

        );

      }


    } catch (
      err
    ) {

      setError(
        err?.message ||
        "We couldn't load notifications."
      );

    } finally {

      setLoading(
        false
      );

    }

  }



  useEffect(
    () => {

      if (
        open
      ) {

        loadNotifications();

      }

    },
    [
      open,
      business?.id
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
            `runambiz-notification-drawer-${business.id}`
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
            () => {

              if (
                open
              ) {

                loadNotifications();

              }

            }
          )
          .subscribe();


      return () => {

        supabase
          .removeChannel(
            channel
          );

      };

    },
    [
      business?.id,
      open
    ]
  );



  async function markRead(
    notification
  ) {

    if (
      notification.is_read
    ) {

      return;

    }


    const {
      error:
        updateError
    } =
      await supabase
        .from(
          "notifications"
        )
        .update({

          is_read:
            true,

          read_at:
            new Date()
              .toISOString()

        })
        .eq(
          "id",
          notification.id
        )
        .eq(
          "business_id",
          business.id
        );


    if (
      updateError
    ) {

      console.error(
        "Notification read error:",
        updateError
      );

      return;

    }


    const next =
      notifications.map(
        item =>
          item.id ===
            notification.id

            ? {
                ...item,
                is_read:
                  true
              }

            : item
      );


    setNotifications(
      next
    );


    onUnreadChange?.(

      next.filter(
        item =>
          item.is_read !==
          true
      ).length

    );

  }



  async function markAllRead() {

    if (
      !business?.id
    ) {

      return;

    }


    const {
      error:
        updateError
    } =
      await supabase
        .from(
          "notifications"
        )
        .update({

          is_read:
            true,

          read_at:
            new Date()
              .toISOString()

        })
        .eq(
          "business_id",
          business.id
        )
        .eq(
          "is_read",
          false
        );


    if (
      updateError
    ) {

      setError(
        updateError.message
      );

      return;

    }


    setNotifications(
      current =>
        current.map(
          item => ({

            ...item,

            is_read:
              true

          })
        )
    );


    onUnreadChange?.(
      0
    );

  }



  async function openNotification(
    notification
  ) {

    await markRead(
      notification
    );


    const type =
      String(
        notification.type ||
        ""
      )
        .toLowerCase();


    if (
      notification.order_id
    ) {

      onNavigate?.(
        "Orders"
      );

    } else if (
      type.includes(
        "payment"
      )
    ) {

      onNavigate?.(
        "Payments"
      );

    } else if (
      type.includes(
        "message"
      )
      ||
      type.includes(
        "whatsapp"
      )
    ) {

      onNavigate?.(
        "Messages"
      );

    } else if (
      type.includes(
        "ai"
      )
    ) {

      onNavigate?.(
        "AI Assistant"
      );

    } else if (
      type.includes(
        "stock"
      )
    ) {

      onNavigate?.(
        "Products"
      );

    }


    onClose?.();

  }



  if (
    !open
  ) {

    return null;

  }


  return (

    <div className="notification-layer">


      <button

        type="button"

        className="notification-backdrop"

        aria-label="Close notifications"

        onClick={
          onClose
        }

      />


      <aside className="notification-drawer">


        <header>


          <div>

            <span>
              ACTIVITY
            </span>

            <h2>
              Notifications
            </h2>

          </div>


          <button

            type="button"

            className="notification-close"

            onClick={
              onClose
            }

          >

            <X
              size={19}
            />

          </button>


        </header>



        <div className="notification-toolbar">


          <span>

            {notifications.filter(
              item =>
                !item.is_read
            ).length}
            {" "}
            unread

          </span>


          <button

            type="button"

            onClick={
              markAllRead
            }

          >

            <CheckCheck
              size={14}
            />

            Mark all read

          </button>


        </div>



        <div className="notification-content">


          {loading ? (

            <div className="notification-loading">

              <Loader2
                size={22}
                className="spin"
              />

              Loading activity...

            </div>

          ) : error ? (

            <div className="notification-error">

              {error}

            </div>

          ) : !notifications.length ? (

            <div className="notification-empty">


              <Bell
                size={27}
              />


              <strong>
                You're all caught up.
              </strong>


              <span>
                Orders, payments, messages and AI
                handovers will appear here.
              </span>


            </div>

          ) : (

            notifications.map(
              notification => {

                const Icon =
                  getNotificationIcon(
                    notification.type
                  );


                return (

                  <button

                    type="button"

                    key={
                      notification.id
                    }

                    className={
                      notification.is_read
                        ? "notification-item"
                        : "notification-item unread"
                    }

                    onClick={() =>
                      openNotification(
                        notification
                      )
                    }

                  >


                    <div className="notification-item-icon">

                      <Icon
                        size={17}
                      />

                    </div>


                    <div className="notification-item-copy">


                      <strong>

                        {notification.title ||
                          "Runambiz notification"}

                      </strong>


                      {notification.message && (

                        <p>
                          {notification.message}
                        </p>

                      )}


                      <span>

                        {formatRelativeTime(
                          notification.created_at
                        )}

                      </span>


                    </div>


                    {!notification.is_read && (

                      <span className="notification-unread-dot" />

                    )}


                  </button>

                );

              }
            )

          )}


        </div>


      </aside>


    </div>

  );

}



function getNotificationIcon(
  type
) {

  const value =
    String(
      type ||
      ""
    )
      .toLowerCase();


  if (
    value.includes(
      "order"
    )
  ) {

    return ShoppingBag;

  }


  if (
    value.includes(
      "payment"
    )
  ) {

    return CreditCard;

  }


  if (
    value.includes(
      "message"
    )
    ||
    value.includes(
      "whatsapp"
    )
  ) {

    return MessageCircle;

  }


  if (
    value.includes(
      "ai"
    )
  ) {

    return Bot;

  }


  if (
    value.includes(
      "stock"
    )
  ) {

    return Package;

  }


  return Bell;

}



function formatRelativeTime(
  value
) {

  if (
    !value
  ) {

    return "";

  }


  const date =
    new Date(
      value
    );


  const seconds =
    Math.max(
      0,
      Math.floor(
        (
          Date.now() -
          date.getTime()
        )
        /
        1000
      )
    );


  if (
    seconds <
    60
  ) {

    return "Just now";

  }


  const minutes =
    Math.floor(
      seconds /
      60
    );


  if (
    minutes <
    60
  ) {

    return `${minutes}m ago`;

  }


  const hours =
    Math.floor(
      minutes /
      60
    );


  if (
    hours <
    24
  ) {

    return `${hours}h ago`;

  }


  const days =
    Math.floor(
      hours /
      24
    );


  if (
    days <
    7
  ) {

    return `${days}d ago`;

  }


  return date.toLocaleDateString();

}