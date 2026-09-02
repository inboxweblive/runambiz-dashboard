import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Bot,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Search,
  Send,
  UserRound,
  UsersRound
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


/* =========================================================
   MESSAGES PAGE
========================================================= */

export default function Messages({
  business
}) {

  const [
    conversations,
    setConversations
  ] =
    useState([]);


  const [
    selectedConversation,
    setSelectedConversation
  ] =
    useState(null);


  const [
    messages,
    setMessages
  ] =
    useState([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    messagesLoading,
    setMessagesLoading
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    search,
    setSearch
  ] =
    useState("");


  const [
    filter,
    setFilter
  ] =
    useState("all");


  const [
    updatingConversation,
    setUpdatingConversation
  ] =
    useState(false);

      const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);



  /* =========================================================
     LOAD CONVERSATIONS
  ========================================================= */

  async function loadConversations() {

    if (!business?.id) {
      return;
    }


    setLoading(true);

    setError("");


    try {

      const {
        data,
        error: conversationError
      } =
        await supabase
          .from(
            "conversations"
          )
          .select(`
            *,
            customer:customers (
              id,
              full_name,
              phone,
              email,
              whatsapp_number,
              telegram_user_id
            )
          `)
          .eq(
            "business_id",
            business.id
          )
          .order(
            "last_message_at",
            {
              ascending:
                false
            }
          );


      if (
        conversationError
      ) {

        throw conversationError;

      }


      const next =
        data || [];


      setConversations(
        next
      );


      /*
        If current selected conversation
        still exists, refresh it.
      */

      if (
        selectedConversation
      ) {

        const refreshed =
          next.find(
            item =>
              item.id ===
              selectedConversation.id
          );


        if (refreshed) {

          setSelectedConversation(
            refreshed
          );

        } else {

          setSelectedConversation(
            next[0] ||
            null
          );

        }

      } else if (
        next.length
      ) {

        setSelectedConversation(
          next[0]
        );

      }


    } catch (err) {

      console.error(
        "Conversations load error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't load your conversations."
      );


    } finally {

      setLoading(false);

    }

  }



  /* =========================================================
     LOAD MESSAGES
  ========================================================= */

  async function loadMessages(
    conversationId
  ) {

    if (!conversationId) {

      setMessages([]);

      return;

    }


    setMessagesLoading(true);


    try {

      const {
        data,
        error: messageError
      } =
        await supabase
          .from(
            "messages"
          )
          .select("*")
          .eq(
            "conversation_id",
            conversationId
          )
          .order(
            "sent_at",
            {
              ascending:
                true
            }
          );


      if (
        messageError
      ) {

        throw messageError;

      }


      setMessages(
        data || []
      );


    } catch (err) {

      console.error(
        "Messages load error:",
        err
      );


    } finally {

      setMessagesLoading(
        false
      );

    }

  }



  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {

    loadConversations();

  }, [
    business?.id
  ]);



  /* =========================================================
     SELECTED CONVERSATION MESSAGES
  ========================================================= */

  useEffect(() => {

    loadMessages(
      selectedConversation?.id
    );

  }, [
    selectedConversation?.id
  ]);



  /* =========================================================
     REALTIME
  ========================================================= */

  useEffect(() => {

    if (!business?.id) {
      return;
    }


    const channel =
      supabase
        .channel(
          `runambiz-messages-${business.id}`
        )


        /* =========================================
           NEW / UPDATED MESSAGES
        ========================================== */

        .on(
          "postgres_changes",
          {
            event:
              "*",

            schema:
              "public",

            table:
              "messages",

            filter:
              `business_id=eq.${business.id}`
          },

          async payload => {

            const changedMessage =
              payload.new;


            /*
              Refresh conversation list
              so last activity stays correct.
            */

            await loadConversations();


            /*
              Refresh open chat only when
              message belongs to it.
            */

            if (
              changedMessage
                ?.conversation_id ===
              selectedConversation?.id
            ) {

              await loadMessages(
                selectedConversation.id
              );

            }

          }
        )


        /* =========================================
           CONVERSATION STATUS CHANGES
        ========================================== */

        .on(
          "postgres_changes",
          {
            event:
              "*",

            schema:
              "public",

            table:
              "conversations",

            filter:
              `business_id=eq.${business.id}`
          },

          async () => {

            await loadConversations();

          }
        )


        .subscribe();


    return () => {

      supabase
        .removeChannel(
          channel
        );

    };


  }, [
    business?.id,
    selectedConversation?.id
  ]);



  /* =========================================================
     FILTER CONVERSATIONS
  ========================================================= */

  const filteredConversations =
    useMemo(() => {

      const term =
        search
          .trim()
          .toLowerCase();


      return conversations.filter(
        conversation => {


          const customerName =
            conversation.customer
              ?.full_name ||
            "";


          const customerPhone =
            conversation.customer
              ?.phone ||
            conversation.customer
              ?.whatsapp_number ||
            "";


          const matchesSearch =
            !term ||

            customerName
              .toLowerCase()
              .includes(
                term
              )

            ||

            customerPhone
              .toLowerCase()
              .includes(
                term
              );


          let matchesFilter =
            true;


          if (
            filter === "ai"
          ) {

            matchesFilter =
              conversation
                .ai_enabled ===
              true;

          }


          if (
            filter === "human"
          ) {

            matchesFilter =
              conversation.status ===
                "human_takeover"

              ||

              conversation
                .ai_enabled ===
                false;

          }


          if (
            filter === "whatsapp"
          ) {

            matchesFilter =
              conversation.channel ===
              "whatsapp";

          }


          if (
            filter === "telegram"
          ) {

            matchesFilter =
              conversation.channel ===
              "telegram";

          }


          if (
            filter === "website"
          ) {

            matchesFilter =
              conversation.channel ===
              "website";

          }


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );


    }, [
      conversations,
      search,
      filter
    ]);



  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalConversations =
    conversations.length;


  const aiConversations =
    conversations.filter(
      conversation =>
        conversation.ai_enabled ===
        true
    ).length;


  const humanTakeovers =
    conversations.filter(
      conversation =>
        conversation.status ===
          "human_takeover"

        ||

        conversation.ai_enabled ===
          false
    ).length;



  /* =========================================================
     TAKE OVER
  ========================================================= */

  async function takeOverConversation() {

    if (
      !selectedConversation
    ) {

      return;

    }


    setUpdatingConversation(
      true
    );


    try {

      const {
        data,
        error: updateError
      } =
        await supabase
          .from(
            "conversations"
          )
          .update({

            ai_enabled:
              false,

            status:
              "human_takeover",

            updated_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            selectedConversation.id
          )
          .select(`
            *,
            customer:customers (
              id,
              full_name,
              phone,
              email,
              whatsapp_number,
              telegram_user_id
            )
          `)
          .single();


      if (
        updateError
      ) {

        throw updateError;

      }


      setSelectedConversation(
        data
      );


      setConversations(
        current =>
          current.map(
            conversation =>
              conversation.id ===
                data.id
                ? data
                : conversation
          )
      );


    } catch (err) {

      console.error(
        "Conversation takeover error:",
        err
      );


      alert(
        err?.message ||
        "We couldn't take over this conversation."
      );


    } finally {

      setUpdatingConversation(
        false
      );

    }

  }


    async function sendReply(event) {

    event?.preventDefault();

    const text = replyText.trim();

    if (!text || sendingReply || !selectedConversation) {
      return;
    }

    setSendingReply(true);

    try {

      const { data, error: sendError } =
        await supabase
          .functions
          .invoke("telegram-send", {
            body: {
              businessId: business.id,
              mode: "reply",
              conversationId: selectedConversation.id,
              text
            }
          });

      if (sendError) {
        throw sendError;
      }

      if (!data?.success) {
        throw new Error(
          data?.error || "We couldn't send that message."
        );
      }

      setReplyText("");

    } catch (err) {
      setError(
        err?.message || "We couldn't send that message."
      );
    } finally {
      setSendingReply(false);
    }

  }

  {selectedConversation && (

  <div className="conversation-composer">

    <form onSubmit={sendReply}>

      <input
        type="text"
        value={replyText}
        disabled={
          sendingReply ||
          selectedConversation.channel !== "telegram"
        }
        placeholder={
          selectedConversation.channel === "telegram"
            ? "Type your reply..."
            : "Manual replies unlock once this channel is connected"
        }
        onChange={event => setReplyText(event.target.value)}
      />

      <button
        type="submit"
        disabled={sendingReply || !replyText.trim()}
      >
        {sendingReply
          ? <Loader2 size={17} className="spin" />
          : <Send size={17} />}
      </button>

    </form>

  </div>

)}


  /* =========================================================
     RETURN TO AI
  ========================================================= */

  async function returnToAi() {

    if (
      !selectedConversation
    ) {

      return;

    }


    setUpdatingConversation(
      true
    );


    try {

      const {
        data,
        error: updateError
      } =
        await supabase
          .from(
            "conversations"
          )
          .update({

            ai_enabled:
              true,

            status:
              "active",

            updated_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            selectedConversation.id
          )
          .select(`
            *,
            customer:customers (
              id,
              full_name,
              phone,
              email,
              whatsapp_number,
              telegram_user_id
            )
          `)
          .single();


      if (
        updateError
      ) {

        throw updateError;

      }


      setSelectedConversation(
        data
      );


      setConversations(
        current =>
          current.map(
            conversation =>
              conversation.id ===
                data.id
                ? data
                : conversation
          )
      );


    } catch (err) {

      console.error(
        "Return to AI error:",
        err
      );


      alert(
        err?.message ||
        "We couldn't return this conversation to AI."
      );


    } finally {

      setUpdatingConversation(
        false
      );

    }

  }




  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <div className="messages-page-loading">


        <Loader2
          size={24}
          className="spin"
        />


        <span>
          Loading conversations...
        </span>


      </div>

    );

  }



  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="dashboard-content messages-page">


      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="messages-heading">


        <div>

          <span className="dashboard-eyebrow">

            Inbox

          </span>


          <h1>
            Messages
          </h1>


          <p>
            Watch Runambiz AI conversations and
            take over whenever a customer needs you.
          </p>

        </div>


      </section>



      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <section className="messages-summary">


        <MessageSummaryCard

          label="Conversations"

          value={
            totalConversations
          }

          icon={
            MessagesSquare
          }

        />


        <MessageSummaryCard

          label="AI handling"

          value={
            aiConversations
          }

          icon={
            Bot
          }

          lime

        />


        <MessageSummaryCard

          label="Human takeover"

          value={
            humanTakeovers
          }

          icon={
            UsersRound
          }

        />


      </section>



      {error && (

        <div className="messages-page-error">

          {error}

        </div>

      )}



      {/* =====================================================
          MAIN INBOX
      ====================================================== */}

      <section className="messages-shell">


        {/* =================================================
            LEFT SIDE
        ================================================== */}

        <aside className="conversation-sidebar">


          <div className="conversation-search">


            <Search size={16} />


            <input

              type="search"

              placeholder="Search customers..."

              value={
                search
              }

              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }

            />


          </div>



          <div className="conversation-filters">


            <FilterButton

              active={
                filter === "all"
              }

              onClick={() =>
                setFilter(
                  "all"
                )
              }

            >
              All
            </FilterButton>


            <FilterButton

              active={
                filter === "ai"
              }

              onClick={() =>
                setFilter(
                  "ai"
                )
              }

            >
              AI
            </FilterButton>


            <FilterButton

              active={
                filter === "human"
              }

              onClick={() =>
                setFilter(
                  "human"
                )
              }

            >
              Human
            </FilterButton>


            <FilterButton

              active={
                filter ===
                "whatsapp"
              }

              onClick={() =>
                setFilter(
                  "whatsapp"
                )
              }

            >
              WhatsApp
            </FilterButton>


          </div>



          <div className="conversation-list">


            {!filteredConversations
              .length ? (

              <div className="conversation-list-empty">


                <MessageCircle
                  size={24}
                />


                <strong>
                  No conversations
                </strong>


                <span>
                  Customer chats will appear here.
                </span>


              </div>

            ) : (

              filteredConversations
                .map(
                  conversation => (

                    <ConversationItem

                      key={
                        conversation.id
                      }

                      conversation={
                        conversation
                      }

                      active={
                        selectedConversation
                          ?.id ===
                        conversation.id
                      }

                      onClick={() =>
                        setSelectedConversation(
                          conversation
                        )
                      }

                    />

                  )
                )

            )}


          </div>


        </aside>



        {/* =================================================
            RIGHT CHAT
        ================================================== */}

        <section className="conversation-main">


          {!selectedConversation ? (

            <div className="conversation-empty-state">


              <div>

                <MessagesSquare
                  size={30}
                />

              </div>


              <h2>
                Your AI inbox
              </h2>


              <p>
                Select a customer conversation
                to view messages.
              </p>


            </div>

          ) : (

            <>


              {/* =========================================
                  CONVERSATION HEADER
              ========================================== */}

              <ConversationHeader

                conversation={
                  selectedConversation
                }

                updating={
                  updatingConversation
                }

                onTakeOver={
                  takeOverConversation
                }

                onReturnToAi={
                  returnToAi
                }

              />



              {/* =========================================
                  MESSAGES
              ========================================== */}

              <div className="conversation-messages">


                {messagesLoading ? (

                  <div className="conversation-loading">


                    <Loader2
                      size={21}
                      className="spin"
                    />


                    Loading messages...


                  </div>

                ) : !messages.length ? (

                  <div className="conversation-no-messages">


                    <MessageCircle
                      size={25}
                    />


                    <strong>
                      No messages yet
                    </strong>


                    <span>
                      Messages in this conversation
                      will appear here.
                    </span>


                  </div>

                ) : (

                  messages.map(
                    message => (

                      <MessageBubble

                        key={
                          message.id
                        }

                        message={
                          message
                        }

                      />

                    )
                  )

                )}


              </div>



              {/* =========================================
                  COMPOSER
              ========================================== */}

              <div className="conversation-composer">


                <div className="composer-disabled">


                  <input

                    type="text"

                    disabled

                    placeholder={
                      selectedConversation.channel ===
                        "whatsapp"

                        ? "Manual replies unlock after WhatsApp is connected"

                        : "Manual channel replies will be connected next"
                    }

                  />


                  <button
                    type="button"
                    disabled
                  >

                    <Send
                      size={17}
                    />

                  </button>


                </div>


                <span>

                  {
                    selectedConversation
                      .ai_enabled

                      ? "Runambiz AI is currently handling this conversation."

                      : "AI is paused. We will enable manual channel replies when the channel connection is built."
                  }

                </span>


              </div>


            </>

          )}


        </section>


      </section>


    </div>

  );

}



/* =========================================================
   SUMMARY
========================================================= */

function MessageSummaryCard({
  label,
  value,
  icon: Icon,
  lime = false
}) {

  return (

    <article
      className={
        lime
          ? "message-summary-card lime"
          : "message-summary-card"
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


      <div className="message-summary-icon">

        <Icon size={18} />

      </div>


    </article>

  );

}



/* =========================================================
   FILTER BUTTON
========================================================= */

function FilterButton({
  active,
  children,
  onClick
}) {

  return (

    <button

      type="button"

      className={
        active
          ? "conversation-filter active"
          : "conversation-filter"
      }

      onClick={
        onClick
      }

    >

      {children}

    </button>

  );

}



/* =========================================================
   CONVERSATION ITEM
========================================================= */

function ConversationItem({
  conversation,
  active,
  onClick
}) {

  const customerName =
    conversation.customer
      ?.full_name ||
    "Customer";


  const phone =
    conversation.customer
      ?.phone ||

    conversation.customer
      ?.whatsapp_number ||

    "";


  return (

    <button

      type="button"

      className={
        active
          ? "conversation-item active"
          : "conversation-item"
      }

      onClick={
        onClick
      }

    >


      <div className="conversation-avatar">

        {customerName
          .charAt(0)
          .toUpperCase()}

      </div>


      <div className="conversation-item-copy">


        <div className="conversation-item-top">


          <strong>
            {customerName}
          </strong>


          <span>

            {formatTime(
              conversation.last_message_at
            )}

          </span>


        </div>


        <div className="conversation-item-bottom">


          <span>

            {phone ||
              formatChannel(
                conversation.channel
              )}

          </span>


          <span
            className={
              conversation.ai_enabled
                ? "conversation-mode ai"
                : "conversation-mode human"
            }
          >

            {conversation.ai_enabled
              ? "AI"
              : "Human"}

          </span>


        </div>


      </div>


    </button>

  );

}



/* =========================================================
   CONVERSATION HEADER
========================================================= */

function ConversationHeader({
  conversation,
  updating,
  onTakeOver,
  onReturnToAi
}) {

  const customerName =
    conversation.customer
      ?.full_name ||
    "Customer";


  const phone =
    conversation.customer
      ?.phone ||

    conversation.customer
      ?.whatsapp_number ||

    "";


  const aiActive =
    conversation.ai_enabled ===
      true;


  return (

    <header className="conversation-header">


      <div className="conversation-header-person">


        <div className="conversation-avatar large">

          {customerName
            .charAt(0)
            .toUpperCase()}

        </div>


        <div>


          <h3>
            {customerName}
          </h3>


          <div className="conversation-header-meta">


            <ChannelBadge

              channel={
                conversation.channel
              }

            />


            {phone && (

              <span>
                {phone}
              </span>

            )}


          </div>


        </div>


      </div>



      <div className="conversation-control">


        <span
          className={
            aiActive
              ? "conversation-control-status ai"
              : "conversation-control-status human"
          }
        >


          {aiActive ? (

            <>
              <Bot size={13} />
              AI active
            </>

          ) : (

            <>
              <UserRound size={13} />
              Human control
            </>

          )}


        </span>


        {aiActive ? (

          <button

            type="button"

            className="takeover-button"

            disabled={
              updating
            }

            onClick={
              onTakeOver
            }

          >

            {updating ? (

              <Loader2
                size={15}
                className="spin"
              />

            ) : (

              <UserRound
                size={15}
              />

            )}

            Take over

          </button>

        ) : (

          <button

            type="button"

            className="return-ai-button"

            disabled={
              updating
            }

            onClick={
              onReturnToAi
            }

          >

            {updating ? (

              <Loader2
                size={15}
                className="spin"
              />

            ) : (

              <Bot
                size={15}
              />

            )}

            Return to AI

          </button>

        )}


      </div>


    </header>

  );

}



/* =========================================================
   MESSAGE BUBBLE
========================================================= */

function MessageBubble({
  message
}) {

  const sender =
    message.sender_type ||
    "system";


  const isCustomer =
    sender ===
    "customer";


  const isAi =
    sender ===
    "ai";


  const isMerchant =
    sender ===
    "merchant";


  return (

    <div
      className={
        [
          "message-row",

          isCustomer
            ? "customer"
            : "outbound",

          isAi
            ? "ai"
            : "",

          isMerchant
            ? "merchant"
            : "",

          sender === "system"
            ? "system"
            : ""

        ]
          .filter(Boolean)
          .join(" ")
      }
    >


      {sender !== "system" && (

        <div className="message-sender-icon">


          {isCustomer ? (

            <UserRound
              size={14}
            />

          ) : isAi ? (

            <Bot
              size={14}
            />

          ) : (

            <UserRound
              size={14}
            />

          )}


        </div>

      )}


      <div className="message-bubble">


        {sender !== "system" && (

          <span className="message-author">


            {isCustomer
              ? "Customer"
              : isAi
                ? "Runambiz AI"
                : "You"}


          </span>

        )}


        <p>

          {message.content ||
            messageTypeLabel(
              message.message_type
            )}

        </p>


        <div className="message-meta">


          <span>

            {formatMessageTime(
              message.sent_at
            )}

          </span>


          {message.ai_generated && (

            <span className="ai-message-label">

              <Bot size={10} />

              AI

            </span>

          )}


        </div>


      </div>


    </div>

  );

}



/* =========================================================
   CHANNEL BADGE
========================================================= */

function ChannelBadge({
  channel
}) {

  return (

    <span
      className={
        `message-channel-badge ${channel}`
      }
    >

      {formatChannel(
        channel
      )}

    </span>

  );

}



/* =========================================================
   HELPERS
========================================================= */

function formatChannel(
  channel
) {

  if (
    channel === "whatsapp"
  ) {

    return "WhatsApp";

  }


  if (
    channel === "telegram"
  ) {

    return "Telegram";

  }


  return "Website";

}


function messageTypeLabel(
  type
) {

  const labels = {

    image:
      "📷 Image",

    audio:
      "🎤 Voice message",

    video:
      "🎥 Video",

    document:
      "📄 Document",

    product:
      "🛍 Product",

    order:
      "📦 Order",

    interactive:
      "Interactive message",

    system:
      "System message"

  };


  return (
    labels[type] ||
    "Message"
  );

}


function formatTime(
  value
) {

  if (!value) {
    return "";
  }


  const date =
    new Date(
      value
    );


  const now =
    new Date();


  const sameDay =
    date
      .toDateString() ===
    now
      .toDateString();


  if (sameDay) {

    return date
      .toLocaleTimeString(
        "en-NG",
        {
          hour:
            "2-digit",

          minute:
            "2-digit"
        }
      );

  }


  return date
    .toLocaleDateString(
      "en-NG",
      {
        day:
          "2-digit",

        month:
          "short"
      }
    );

}


function formatMessageTime(
  value
) {

  if (!value) {
    return "";
  }


  return new Date(
    value
  )
    .toLocaleTimeString(
      "en-NG",
      {
        hour:
          "2-digit",

        minute:
          "2-digit"
      }
    );

}