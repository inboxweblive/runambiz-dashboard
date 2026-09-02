import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";


import {
  Bot,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  LifeBuoy,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Store,
  Wrench
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


/* =========================================================
   BUILDER CONTACT

   Change here later if Runambiz gets
   dedicated support contacts.
========================================================= */

const BUILDER_NAME =
  "HoblemercyTech";


const BUILDER_EMAIL =
  "hoblemercytech@gmail.com";


const BUILDER_WHATSAPP =
  "2349064748799";



/* =========================================================
   RUNAMBIZ FAQ
========================================================= */

const FAQS = [

  {
    category: "Getting started",
    question:
      "What is Runambiz?",
    answer:
      "Runambiz is an AI-powered business manager that helps you manage your Store, products, customers, orders, payments and automated customer conversations from one place."
  },

  {
    category: "Getting started",
    question:
      "Is Runambiz free?",
    answer:
      "Yes. Runambiz has a Free plan with the core tools needed to start running your business. Paid plans add more capacity and additional business benefits."
  },

  {
    category: "Store",
    question:
      "How do I create my Store?",
    answer:
      "Open Store and use Runambiz AI to complete your first Store setup. The AI reads information you already entered and asks only for important missing information."
  },

  {
    category: "Store",
    question:
      "How do I upload my logo or cover image?",
    answer:
      "Open Store and go to Appearance. Business images remain under your control and are uploaded manually."
  },

  {
    category: "Store",
    question:
      "How do I publish my Store?",
    answer:
      "Complete the required Store information, add at least one active product and make sure your Store is ready. Then use the Publish control inside Store."
  },

  {
    category: "Store",
    question:
      "Can I change my Store after publishing?",
    answer:
      "Yes. You can continue editing your Store, products, policies, colours and other information after publishing."
  },

  {
    category: "Products",
    question:
      "How do I add products?",
    answer:
      "Open Products from your dashboard and select Add product. Add the name, price, stock, category, images and other product information."
  },

  {
    category: "Products",
    question:
      "What happens when a product is out of stock?",
    answer:
      "If inventory tracking is enabled, Runambiz uses your stored stock quantity to prevent customers from ordering unavailable stock."
  },

  {
    category: "Orders",
    question:
      "Where can I see customer orders?",
    answer:
      "Open Orders. Orders placed through your Runambiz Store and supported automated sales channels are stored there."
  },

  {
    category: "Payments",
    question:
      "Does Runambiz hold my customer's money?",
    answer:
      "No. Customer payment details belong to your business. Runambiz helps customers follow your payment instructions, while you remain responsible for confirming that payment was actually received."
  },

  {
    category: "Payments",
    question:
      "Why is an order waiting for payment confirmation?",
    answer:
      "A customer can tell Runambiz that payment was submitted, but Runambiz does not automatically mark the order paid. You must confirm the payment after checking your account."
  },

  {
    category: "AI",
    question:
      "What is the AI Brain?",
    answer:
      "The AI Brain controls how Runambiz AI understands and represents your business. It combines Store information, products, policies, customer-service behaviour and additional business knowledge."
  },

  {
    category: "AI",
    question:
      "Can Runambiz AI change my business information?",
    answer:
      "AI can prepare or suggest changes. Actions that materially change your business should be shown to you before execution when confirmation is required."
  },

  {
    category: "AI",
    question:
      "What are Runambiz Credits?",
    answer:
      "Runambiz Credits are service credits used for AI-powered operations. They are not money and cannot be withdrawn or transferred."
  },

  {
    category: "AI",
    question:
      "What happens when my AI Credits finish?",
    answer:
      "Your normal Store and dashboard remain available. Credit-consuming AI actions pause until you receive another allowance or purchase more credits."
  },

  {
    category: "Plans",
    question:
      "Does buying AI Credits upgrade my plan?",
    answer:
      "No. Your subscription plan and your AI Credit balance are separate."
  },

  {
    category: "WhatsApp",
    question:
      "Will Runambiz work with WhatsApp?",
    answer:
      "Runambiz is designed to use AI for customer conversations, sales and order handling on supported messaging channels. Your dashboard remains the main source of business information."
  },

  {
    category: "Security",
    question:
      "Can Runambiz AI invent my payment details?",
    answer:
      "No. Payment instructions should come from the payment information you stored for your business. AI should never invent or alter account information."
  },

  {
    category: "Account",
    question:
      "How do I change my password?",
    answer:
      "Open Settings, go to Password & Security and enter your new password."
  },

  {
    category: "Account",
    question:
      "How do I change my personal information?",
    answer:
      "Open Settings to update your Runambiz profile. Business-facing information is managed separately from your Store."
  },

  {
    category: "PWA",
    question:
      "Can I install Runambiz like an app?",
    answer:
      "Yes. When your browser supports installation, use the Install button in the dashboard to install the Runambiz PWA."
  }

];



export default function HelpSupport({

  business,
  user,
  profile,
  onNavigate,
  onBusinessChanged

}) {


  const [
    search,
    setSearch
  ] =
    useState("");


  const [
    selectedCategory,
    setSelectedCategory
  ] =
    useState("All");


  const [
    category,
    setCategory
  ] =
    useState("technical");


  const [
    subject,
    setSubject
  ] =
    useState("");


  const [
    message,
    setMessage
  ] =
    useState("");


  const [
    email,
    setEmail
  ] =
    useState(
      user?.email ||
      ""
    );


  const [
    submitting,
    setSubmitting
  ] =
    useState(false);


  const [
    enquiryError,
    setEnquiryError
  ] =
    useState("");


  const [
    enquirySuccess,
    setEnquirySuccess
  ] =
    useState("");


  const [
    aiOpen,
    setAiOpen
  ] =
    useState(false);


  const [
    conversationId,
    setConversationId
  ] =
    useState(null);


  const [
    aiInput,
    setAiInput
  ] =
    useState("");


  const [
    aiSending,
    setAiSending
  ] =
    useState(false);


    const [
  supportSessionLoading,
  setSupportSessionLoading
] =
  useState(false);


  const [
    aiError,
    setAiError
  ] =
    useState("");


    const [
  pendingAction,
  setPendingAction
] =
  useState(null);


const [
  aiSources,
  setAiSources
] =
  useState([]);


const [
  escalation,
  setEscalation
] =
  useState(null); 

  const [
  actionRunning,
  setActionRunning
] = useState(false);


  const [
    aiMessages,
    setAiMessages
  ] =
    useState([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi! I'm Runambiz Support AI. Ask me anything about your dashboard, Store, products, orders, payments, plans, AI Credits or how to use Runambiz."
      }
    ]);



  const faqCategories =
    useMemo(
      () => [

        "All",

        ...new Set(
          FAQS.map(
            item =>
              item.category
          )
        )

      ],
      []
    );



  const filteredFaqs =
    useMemo(
      () => {

        const query =
          search
            .trim()
            .toLowerCase();


        return FAQS.filter(
          item => {


            const categoryMatch =

              selectedCategory ===
                "All"

              ||

              item.category ===
                selectedCategory;


            if (
              !categoryMatch
            ) {

              return false;

            }


            if (
              !query
            ) {

              return true;

            }


            return (

              item.question
                .toLowerCase()
                .includes(
                  query
                )

              ||

              item.answer
                .toLowerCase()
                .includes(
                  query
                )

            );

          }
        );

      },
      [
        search,
        selectedCategory
      ]
    );



  async function submitEnquiry(
    event
  ) {

    event.preventDefault();


    setEnquiryError("");

    setEnquirySuccess("");


    if (
      !subject.trim()
      ||
      !message.trim()
      ||
      !email.trim()
    ) {

      setEnquiryError(
        "Complete the subject, message and email fields."
      );

      return;

    }


    setSubmitting(
      true
    );


    try {

      const {
        error
      } =
        await supabase
          .from(
            "support_enquiries"
          )
          .insert({

            business_id:
              business.id,

            user_id:
              user.id,

            name:
              profile?.full_name ||
              business?.name ||
              "Runambiz user",

            email:
              email.trim(),

            category,

            subject:
              subject.trim(),

            message:
              message.trim(),

            status:
              "open"

          });


      if (
        error
      ) {

        throw error;

      }


      setSubject("");

      setMessage("");


      setEnquirySuccess(
        "Your enquiry has been submitted. Our support team will review it and respond using the email you provided."
      );


    } catch (
      err
    ) {

      setEnquiryError(
        err?.message ||
        "We couldn't submit your enquiry."
      );

    } finally {

      setSubmitting(
        false
      );

    }

  }


  /* =========================================================
   LOAD EXISTING SUPPORT SESSION

   The database is the source of truth.

   Closing the modal, navigating elsewhere or
   refreshing the PWA will not lose the chat.
========================================================= */

async function loadSupportSession() {


  if (
    !business?.id ||
    !user?.id
  ) {

    return;

  }


  setSupportSessionLoading(
    true
  );


  try {


    const {
      data:
        conversation,

      error:
        conversationError
    } =
      await supabase
        .from(
          "support_conversations"
        )
        .select(`
          id,
          status,
          escalated_to_human,
          summary,
          created_at,
          updated_at
        `)
        .eq(
          "business_id",
          business.id
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "status",
          "active"
        )
        .order(
          "updated_at",
          {
            ascending:
              false
          }
        )
        .limit(
          1
        )
        .maybeSingle();


    if (
      conversationError
    ) {

      throw conversationError;

    }



    /* =====================================================
       NO SESSION YET
    ====================================================== */

    if (
      !conversation
    ) {


      setConversationId(
        null
      );


      setAiMessages([
        {

          id:
            "welcome",

          role:
            "assistant",

          content:
            "Hi! I'm Runambiz Support AI. Ask me anything about your dashboard, Store, products, orders, payments, plans, AI Credits or how to use Runambiz."

        }
      ]);


      setPendingAction(
        null
      );


      setAiSources([]);


      setEscalation(
        null
      );


      return;

    }



    setConversationId(
      conversation.id
    );



    /* =====================================================
       LOAD COMPLETE CHAT HISTORY
    ====================================================== */

    const {
      data:
        messages,

      error:
        messagesError
    } =
      await supabase
        .from(
          "support_messages"
        )
        .select(`
          id,
          role,
          content,
          metadata,
          created_at
        `)
        .eq(
          "conversation_id",
          conversation.id
        )
        .order(
          "created_at",
          {
            ascending:
              true
          }
        );


    if (
      messagesError
    ) {

      throw messagesError;

    }


    const rows =
      messages ||
      [];


    if (
      rows.length
    ) {


      setAiMessages(

        rows.map(
          item => ({

            id:
              item.id,

            role:
              item.role,

            content:
              item.content,

            created_at:
              item.created_at

          })
        )

      );


    } else {


      setAiMessages([
        {

          id:
            "welcome",

          role:
            "assistant",

          content:
            "Hi! I'm Runambiz Support AI. How can I help you today?"

        }
      ]);

    }



    /* =====================================================
       RESTORE LAST AI ACTION / SOURCES / ESCALATION
    ====================================================== */

    const lastAssistantMessage =
      [...rows]
        .reverse()
        .find(
          item =>
            item.role ===
            "assistant"
        );


    const metadata =
      lastAssistantMessage
        ?.metadata ||
      {};


    setAiSources(

      Array.isArray(
        metadata.webSources
      )

        ? metadata.webSources

        : []

    );


    setEscalation(
      metadata.escalation ||
      null
    );


    if (
      metadata
        .actionProposal
        ?.requiresConfirmation ===
      true
    ) {

      setPendingAction(
        metadata.actionProposal
      );

    } else {

      setPendingAction(
        null
      );

    }


  } catch (
    err
  ) {


    console.error(
      "Support session load error:",
      err
    );


    setAiError(
      err?.message ||
      "We couldn't restore your Support AI conversation."
    );


  } finally {


    setSupportSessionLoading(
      false
    );

  }


}

useEffect(
  () => {

    loadSupportSession();

  },
  [
    business?.id,
    user?.id
  ]
);




useEffect(
  () => {

    if (
      aiOpen
    ) {

      loadSupportSession();

    }

  },
  [
    aiOpen
  ]
);




  async function sendAiMessage(
    event
  ) {

    event.preventDefault();


    const text =
      aiInput.trim();


    if (
      !text ||
      aiSending
    ) {

      return;

    }


    setAiError("");


    setAiInput("");



setAiSources(
  []
);


setEscalation(
  null
);


    setAiMessages(
      current => [

        ...current,

        {
          id:
            crypto.randomUUID(),

          role:
            "user",

          content:
            text
        }

      ]
    );


    setAiSending(
      true
    );


    try {

      const {
        data,
        error
      } =
        await supabase
          .functions
          .invoke(
            "support-ai-assistant",
            {

              body: {

                businessId:
                  business.id,

                conversationId,

                message:
                  text

              }

            }
          );


      if (
        error
      ) {

        throw error;

      }


      if (
        !data?.success
      ) {

        throw new Error(
          data?.error ||
          "Support AI couldn't respond."
        );

      }

if (
  data.conversationId
) {

  setConversationId(
    data.conversationId
  );

}


/* =====================================================
   SAVE AI REPLY
===================================================== */

setAiMessages(
  current => [

    ...current,

    {
      id:
        crypto.randomUUID(),

      role:
        "assistant",

      content:
        data.reply
    }

  ]
);



/* =====================================================
   WEB SOURCES

   Only appears when Support AI actually
   used web search.
===================================================== */

setAiSources(
  Array.isArray(
    data.sources
  )

    ? data.sources

    : []
);



/* =====================================================
   HUMAN ESCALATION
===================================================== */

if (
  data.intent ===
    "escalate"

  &&
  data.escalation
) {

  setEscalation(
    data.escalation
  );


  if (
    data.escalation
      .suggestedCategory
  ) {

    setCategory(
      data.escalation
        .suggestedCategory
    );

  }

} else {

  setEscalation(
    null
  );

}



/* =====================================================
   DASHBOARD ACTION
===================================================== */

if (
  data.intent ===
    "action_proposal"

  &&

  data.actionProposal
) {


  const proposal =
    data.actionProposal;


  if (
    proposal.actionType ===
      "navigate"

    &&

    proposal.targetPage
  ) {


    setPendingAction(
      null
    );


    setTimeout(
      () => {

        setAiOpen(
          false
        );


        onNavigate?.(
          proposal.targetPage
        );

      },
      400
    );


  } else {


    setPendingAction(
      proposal
    );

  }


} else {


  setPendingAction(
    null
  );
}



    } catch (
      err
    ) {

      setAiError(
        err?.message ||
        "Runambiz Support AI is temporarily unavailable."
      );

    } finally {

      setAiSending(
        false
      );

    }

  }


  function cancelPendingAction() {

  setPendingAction(
    null
  );


  setAiMessages(
    current => [

      ...current,

      {
        id:
          crypto.randomUUID(),

        role:
          "assistant",

        content:
          "No problem. I won't make that change."
      }

    ]
  );

}

  async function confirmPendingAction() {

    if (
      !pendingAction ||
      actionRunning ||
      pendingAction.executable !== true
    ) {

      return;

    }


    setAiError("");

    setActionRunning(true);

    
    setAiError("");

    setActionRunning(true);

    console.log("Sending:", {
      businessId: business.id,
      conversationId,
      actionType: pendingAction.actionType
    });





    try {

      const {
        data,
        error
      } =
        await supabase
          .functions
          .invoke(
            "support-ai-action",
            {

                           body: {

                businessId:
                  business.id,

                conversationId,

                actionType:
                  pendingAction.actionType

              }

            }
          );


      if (error) {
        throw error;
      }


      if (!data?.success) {

        throw new Error(
          data?.error ||
          "We couldn't complete that action."
        );

      }


      setPendingAction(null);


      setAiMessages(
        current => [

          ...current,

          {
            id:
              crypto.randomUUID(),

            role:
              "assistant",

            content:
              data.reply ||
              `Done. ${pendingAction.label} completed.`
          }

        ]
      );


      /*
        The action may have changed business
        settings, so refresh the dashboard copy.
      */

      if (
        data.business &&
        onBusinessChanged
      ) {

        await onBusinessChanged(
          data.business
        );

      }


      if (
        data.targetPage
      ) {

        setTimeout(
          () => {

            setAiOpen(false);

            onNavigate?.(
              data.targetPage
            );

          },
          600
        );

      }


    } catch (err) {


      console.error(
        "Support AI action error:",
        err
      );

      if (err?.context) {
        const body = await err.context.text().catch(() => "");
        console.error("Response body:", body);
      }


      setAiError(
        err?.message ||
        "We couldn't complete that action."
      );


    } finally {

      setActionRunning(false);

    }

  }

  return (

    <main className="dashboard-content help-support-page">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="support-header">


        <div>

          <span className="dashboard-eyebrow">
            Support Center
          </span>


          <h1>
            How can we help?
          </h1>


          <p>
            Get an instant answer from Runambiz AI,
            browse common questions or send an enquiry
            to the support team.
          </p>

        </div>


      </header>



      {/* =====================================================
          AI SUPPORT
      ====================================================== */}

      <section className="support-ai-hero">


        <div className="support-ai-icon">

          <Sparkles
            size={25}
          />

        </div>


        <div className="support-ai-copy">


          <span>
            RUNAMBIZ SUPPORT AI
          </span>


          <h2>
            Get help without waiting.
          </h2>


          <p>
            Ask questions about any Runambiz feature.
            Support AI can understand your account,
            explain what to do and later perform
            approved dashboard actions for you.
          </p>


          <div className="support-ai-features">


            <span>
              <CheckCircle2 size={14} />
              Product help
            </span>


            <span>
              <CheckCircle2 size={14} />
              Dashboard guidance
            </span>


            <span>
              <CheckCircle2 size={14} />
              Current web research when needed
            </span>


            <span>
              <CheckCircle2 size={14} />
              AI-powered actions
            </span>


          </div>


        </div>



        <button

          type="button"

          className="support-ai-button"

          onClick={() =>
            setAiOpen(
              true
            )
          }

        >

          <MessageCircle
            size={17}
          />

          Chat with Support AI

          <ChevronRight
            size={16}
          />

        </button>


      </section>



      <div className="support-notice">


        <Bot
          size={18}
        />


        <div>

          <strong>
            Asking for help is free.
          </strong>

          <span>
            If Support AI wants to perform a
            credit-consuming action on your business,
            it should show the cost and ask for your
            approval before running it.
          </span>

        </div>


      </div>



      {/* =====================================================
          FAQ
      ====================================================== */}

      <section className="support-section">


        <div className="support-section-heading">


          <div>

            <span>
              KNOWLEDGE BASE
            </span>

            <h2>
              Frequently asked questions
            </h2>

            <p>
              Search common Runambiz questions.
            </p>

          </div>


          <div className="support-faq-search">

            <Search
              size={16}
            />

            <input

              type="search"

              value={
                search
              }

              placeholder="Search help..."

              onChange={
                event =>
                  setSearch(
                    event.target.value
                  )
              }

            />

          </div>


        </div>



        <div className="support-category-tabs">


          {faqCategories.map(
            item => (

              <button

                type="button"

                key={
                  item
                }

                className={
                  selectedCategory ===
                    item

                    ? "active"

                    : ""
                }

                onClick={() =>
                  setSelectedCategory(
                    item
                  )
                }

              >

                {item}

              </button>

            )
          )}


        </div>



        <div className="support-faq-list">


          {filteredFaqs.map(
            (
              faq,
              index
            ) => (

              <details
                key={
                  `${faq.question}-${index}`
                }
              >


                <summary>

                  <div>

                    <small>
                      {faq.category}
                    </small>

                    <strong>
                      {faq.question}
                    </strong>

                  </div>


                  <HelpCircle
                    size={17}
                  />


                </summary>


                <p>
                  {faq.answer}
                </p>


              </details>

            )
          )}


          {!filteredFaqs.length && (

            <div className="support-no-results">

              <Search
                size={24}
              />

              <strong>
                No FAQ matched that search.
              </strong>

              <span>
                Ask Support AI instead.
              </span>

            </div>

          )}


        </div>


      </section>



      {/* =====================================================
          ENQUIRY + BUILDER
      ====================================================== */}

      <section className="support-bottom-grid">


        <article className="support-enquiry-card">


          <div className="support-card-icon">

            <LifeBuoy
              size={20}
            />

          </div>


          <span>
            CONTACT SUPPORT
          </span>


          <h2>
            Report a problem
          </h2>


          <p>
            If Support AI cannot solve the issue,
            send an enquiry. A human can review your
            account and respond using the email below.
          </p>



          <form
            onSubmit={
              submitEnquiry
            }
          >


            <label>

              <span>
                Category
              </span>


              <select

                value={
                  category
                }

                onChange={
                  event =>
                    setCategory(
                      event.target.value
                    )
                }

              >

                <option value="technical">
                  Technical problem
                </option>

                <option value="billing">
                  Billing & subscription
                </option>

                <option value="payment">
                  Payment issue
                </option>

                <option value="ai">
                  AI problem
                </option>

                <option value="store">
                  Store problem
                </option>

                <option value="account">
                  Account & security
                </option>

                <option value="feature">
                  Feature request
                </option>

                <option value="general">
                  General enquiry
                </option>

              </select>

            </label>



            <label>

              <span>
                Subject
              </span>


              <input

                value={
                  subject
                }

                placeholder="Briefly describe the problem"

                maxLength="200"

                onChange={
                  event =>
                    setSubject(
                      event.target.value
                    )
                }

              />

            </label>



            <label>

              <span>
                Your email
              </span>


              <input

                type="email"

                value={
                  email
                }

                onChange={
                  event =>
                    setEmail(
                      event.target.value
                    )
                }

              />

            </label>



            <label>

              <span>
                Tell us what happened
              </span>


              <textarea

                rows="6"

                value={
                  message
                }

                maxLength="5000"

                placeholder="Explain the problem, what you were trying to do and any error message you saw."

                onChange={
                  event =>
                    setMessage(
                      event.target.value
                    )
                }

              />

            </label>



            {enquiryError && (

              <div className="support-form-error">
                {enquiryError}
              </div>

            )}


            {enquirySuccess && (

              <div className="support-form-success">

                <CheckCircle2
                  size={16}
                />

                {enquirySuccess}

              </div>

            )}



            <button

              type="submit"

              disabled={
                submitting
              }

            >

              {submitting ? (

                <>

                  <Loader2
                    size={16}
                    className="spin"
                  />

                  Sending...

                </>

              ) : (

                <>

                  <Send
                    size={16}
                  />

                  Submit enquiry

                </>

              )}

            </button>


          </form>



          <small className="support-response-time">

            Human enquiries should normally receive
            a response within 24 hours through the
            email provided.

          </small>


        </article>



        <article className="support-builder-card">


          <div className="support-card-icon">

            <Wrench
              size={20}
            />

          </div>


          <span>
            BUILDER
          </span>


          <h2>
            Contact the developer
          </h2>


          <p>
            For partnership discussions, custom
            development, technical escalation or
            direct enquiries about Runambiz.
          </p>



          <div className="support-builder-brand">


            <div>

              <Store
                size={21}
              />

            </div>


            <section>

              <strong>
                {BUILDER_NAME}
              </strong>

              <span>
                Runambiz developer
              </span>

            </section>


          </div>



          <a

            href={
              `mailto:${BUILDER_EMAIL}`
            }

          >

            <Mail
              size={16}
            />

            {BUILDER_EMAIL}

            <ExternalLink
              size={14}
            />

          </a>



          <a

            href={
              `https://wa.me/${BUILDER_WHATSAPP}?text=${encodeURIComponent(
                "Hello HoblemercyTech, I'm contacting you from Runambiz."
              )}`
            }

            target="_blank"

            rel="noreferrer"

          >

            <MessageCircle
              size={16}
            />

            Chat on WhatsApp

            <ExternalLink
              size={14}
            />

          </a>


        </article>


      </section>



      {/* =====================================================
          AI SUPPORT MODAL
      ====================================================== */}

      {aiOpen && (

        <div className="support-ai-layer">


          <button

            type="button"

            className="support-ai-backdrop"

            aria-label="Close Support AI"

            onClick={() =>
              setAiOpen(
                false
              )
            }

          />


          <section className="support-ai-modal">


            <header>


              <div>

                <div className="support-ai-avatar">

                  <Sparkles
                    size={17}
                  />

                </div>


                <section>

                  <span>
                    RUNAMBIZ
                  </span>

                  <strong>
                    Support AI
                  </strong>

                </section>

              </div>


              <button

                type="button"

                onClick={() =>
                  setAiOpen(
                    false
                  )
                }

              >

                ×

              </button>


            </header>



            <div className="support-ai-messages">

{supportSessionLoading && (

  <div className="support-ai-session-loading">

    <Loader2
      size={16}
      className="spin"
    />

    Restoring your conversation...

  </div>

)}



              {aiMessages.map(
                item => (

                  <div

                    key={
                      item.id
                    }

                    className={
                      item.role ===
                        "user"

                        ? "support-ai-message user"

                        : "support-ai-message assistant"
                    }

                  >

                    <div>
                      {item.content}
                    </div>

                  </div>

                )
              )}



              {aiSending && (

                <div className="support-ai-message assistant">

                  <div className="support-ai-thinking">

                    <Loader2
                      size={14}
                      className="spin"
                    />

                    Thinking...

                  </div>

                </div>

              )}

{/* =====================================================
    PROPOSED DASHBOARD ACTION
===================================================== */}

{pendingAction && (

  <div className="support-action-card">


    <div className="support-action-card-top">


      <div className="support-action-icon">

        <Sparkles
          size={17}
        />

      </div>


      <div>

        <span>
          RUNAMBIZ AI ACTION
        </span>


        <strong>
          {pendingAction.label}
        </strong>

      </div>


    </div>



    {pendingAction.description && (

      <p>
        {pendingAction.description}
      </p>

    )}



    {pendingAction.requestedChange && (

      <div className="support-action-request">


        <span>
          REQUEST
        </span>


        <p>
          {pendingAction.requestedChange}
        </p>


      </div>

    )}



    <div className="support-action-meta">


      {pendingAction.targetPage && (

        <span>

          Page

          <strong>
            {pendingAction.targetPage}
          </strong>

        </span>

      )}


      <span>

        Cost

        <strong>

          {pendingAction.creditsCost ===
            0

            ? "Free"

            : `${pendingAction.creditsCost} Credits`}

        </strong>

      </span>


    </div>



    <div className="support-action-buttons">


      <button

        type="button"

        className="support-action-cancel"

        onClick={
          cancelPendingAction
        }

      >

        Cancel

      </button>



      <button
  type="button"
  className="support-action-confirm"
  disabled={
    actionRunning ||
    pendingAction.executable !==
      true
  }
  onClick={
    confirmPendingAction
  }
>

  {actionRunning ? (

    <>
      <Loader2
        size={15}
        className="spin"
      />
      Running...
    </>

  ) : (

    <>
      <Sparkles size={15} />

      Confirm & Run

      {pendingAction.creditsCost >
        0 && (
        <span>
          · {pendingAction.creditsCost}
          {" "}
          Credits
        </span>
      )}
    </>

  )}

</button>


    </div>



    {pendingAction.executable !==
      true && (

      <small className="support-action-coming">

        Secure action execution is being
        connected next. No credits have been
        deducted.

      </small>

    )}


  </div>

)}

{/* =====================================================
    WEB SOURCES
===================================================== */}

{aiSources.length > 0 && (

  <div className="support-ai-sources">


    <span>
      SOURCES
    </span>


    {aiSources.map(
      (
        source,
        index
      ) => (

        <a

          key={
            `${source.url}-${index}`
          }

          href={
            source.url
          }

          target="_blank"

          rel="noreferrer"

        >

          <ExternalLink
            size={13}
          />

          {source.title ||
            source.url}

        </a>

      )
    )}


  </div>

)}


{/* =====================================================
    HUMAN SUPPORT ESCALATION
===================================================== */}

{escalation && (

  <div className="support-escalation-card">


    <div>

      <LifeBuoy
        size={18}
      />

    </div>


    <section>

      <span>
        HUMAN SUPPORT
      </span>


      <strong>
        This needs further review.
      </strong>


      <p>
        {escalation.reason}
      </p>


      <button

        type="button"

        onClick={() => {

          setAiOpen(
            false
          );


          setTimeout(
            () => {

              document
                .querySelector(
                  ".support-enquiry-card"
                )
                ?.scrollIntoView({

                  behavior:
                    "smooth",

                  block:
                    "start"

                });

            },
            150
          );

        }}

      >

        Submit an enquiry

        <ChevronRight
          size={14}
        />

      </button>


    </section>


  </div>

)}

            </div>



            {aiError && (

              <div className="support-ai-error">
                {aiError}
              </div>

            )}



            <form

              className="support-ai-input"

              onSubmit={
                sendAiMessage
              }

            >


              <textarea

                rows="2"

                value={
                  aiInput
                }

                placeholder="Ask anything about Runambiz..."

                onChange={
                  event =>
                    setAiInput(
                      event.target.value
                    )
                }

                onKeyDown={
                  event => {

                    if (
                      event.key ===
                        "Enter"

                      &&

                      !event.shiftKey
                    ) {

                      event.preventDefault();

                      event.currentTarget
                        .form
                        ?.requestSubmit();

                    }

                  }
                }

              />


              <button

                type="submit"

                disabled={
                  aiSending ||
                  !aiInput.trim()
                }

              >

                {aiSending ? (

                  <Loader2
                    size={17}
                    className="spin"
                  />

                ) : (

                  <Send
                    size={17}
                  />

                )}

              </button>


            </form>


          </section>


        </div>

      )}


    </main>

  );

}