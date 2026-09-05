import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import {
  Check,
  CheckCircle2,
  Circle,
  Coins,
  Loader2,
  Send,
  ChevronDown,
  Sparkles,
  Store,
  X
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


const CHECKLIST_LABELS = {

  business_description:
    "Business description",

  about:
    "About your business",

  faq:
    "Frequently asked questions",

  business_hours:
    "Business hours",

  delivery:
    "Delivery information",

  policy:
    "Store / refund policy",

  announcement:
    "Store announcement",

  contact:
    "Customer contact details",

  catalog_display:
    "Product & category display",

  appearance:
    "Store appearance",

  social_links:
    "Social media links",

  link_in_bio:
    "Link in Bio",

  ai_behavior:
    "AI customer behaviour",

  extra_knowledge:
    "Extra AI business knowledge"

};


async function invokeStoreAi(
  body
) {

  const {
    data,
    error
  } =
    await supabase
      .functions
      .invoke(
        "store-ai-assistant",
        {
          body
        }
      );


  if (
    error
  ) {

    let message =
      error.message ||
      "Runambiz AI couldn't respond.";


    try {

      if (
        error.context
      ) {

        const response =

          typeof error.context.clone ===
            "function"

            ? error.context.clone()

            : error.context;


        const details =
          await response.json();


        if (
          details?.error
        ) {

          message =
            details.error;

        }

      }

    } catch {

      // Keep original error.

    }


    throw new Error(
      message
    );

  }


  if (
    data?.success ===
    false
  ) {

    throw new Error(

      data.error ||

      "Runambiz AI couldn't complete this request."

    );

  }


  return data;

}



export default function StoreAiAssistant({

  business,

  open,

  onClose,

  onBusinessChanged,

  onCompleted

}) {


  const [
    loading,
    setLoading
  ] =
    useState(false);


  const [
    starting,
    setStarting
  ] =
    useState(false);


  const [
    sending,
    setSending
  ] =
    useState(false);


  const [
    applying,
    setApplying
  ] =
    useState(false);


  const [
    setupStatus,
    setSetupStatus
  ] =
    useState(
      business
        ?.store_ai_setup_status ||
      "not_started"
    );


  const [
    setupCost,
    setSetupCost
  ] =
    useState(20);


  const [
    availableCredits,
    setAvailableCredits
  ] =
    useState(0);


  const [
    messages,
    setMessages
  ] =
    useState([]);


  const [
    setupReady,
    setSetupReady
  ] =
    useState(false);


  const [
    checklist,
    setChecklist
  ] =
    useState({});


  const [
    needsUpgrade,
    setNeedsUpgrade
  ] =
    useState(false);


  const [
    isUpgrade,
    setIsUpgrade
  ] =
    useState(false);


  const [
    input,
    setInput
  ] =
    useState("");


  const [
    error,
    setError
  ] =
    useState("");


  const chatEndRef =
    useRef(null);

const [progressOpen, setProgressOpen] = useState(false);

  const checklistItems =
    useMemo(
      () => {

        return Object
          .entries(
            CHECKLIST_LABELS
          )
          .map(
            (
              [
                key,
                label
              ]
            ) => ({

              key,

              label,

              status:
                checklist[key] ||
                "needs_input"

            })
          );

      },
      [
        checklist
      ]
    );



  const completedCount =
    checklistItems
      .filter(
        item =>
          item.status ===
            "complete"

          ||

          item.status ===
            "skipped"
      )
      .length;



  const progress =
    checklistItems.length

      ? Math.round(

          (
            completedCount /
            checklistItems.length
          )

          *
          100

        )

      : 0;



  async function loadState() {


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


      const data =
        await invokeStoreAi({

          action:
            "get",

          businessId:
            business.id

        });


      setSetupStatus(
        data.setupStatus ||
        "not_started"
      );


      setSetupCost(
        Number(
          data.setupCost ??
          20
        )
      );


      setAvailableCredits(
        Number(
          data.availableCredits ||
          0
        )
      );


      setMessages(
        Array.isArray(
          data.messages
        )
          ? data.messages
          : []
      );


      setSetupReady(
        data.setupReady ===
        true
      );


      setChecklist(
        data.checklist ||
        {}
      );


      setNeedsUpgrade(
        data.needsUpgrade ===
        true
      );


      setIsUpgrade(
        data.isUpgrade ===
        true
      );


    } catch (
      err
    ) {


      setError(

        err?.message ||

        "Runambiz AI couldn't load your setup."

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

        loadState();

      }

    },
    [
      open,
      business?.id
    ]
  );



  useEffect(
    () => {

      chatEndRef
        .current
        ?.scrollIntoView({

          behavior:
            "smooth"

        });

    },
    [
      messages,
      sending,
      setupReady
    ]
  );



  async function startSetup() {


    if (
      !business?.id
    ) {

      return;

    }


    setStarting(
      true
    );

    setError("");


    try {


      const data =
        await invokeStoreAi({

          action:
            "start",

          businessId:
            business.id

        });


      setSetupStatus(
        data.setupStatus ||
        "in_progress"
      );


      setAvailableCredits(
        Number(
          data.availableCredits ??
          availableCredits
        )
      );


      setMessages(
        Array.isArray(
          data.messages
        )
          ? data.messages
          : []
      );


      setSetupReady(
        data.setupReady ===
        true
      );


      setChecklist(
        data.checklist ||
        {}
      );


      setNeedsUpgrade(
        false
      );


      setIsUpgrade(
        data.isUpgrade ===
        true
      );


    } catch (
      err
    ) {


      setError(

        err?.message ||

        "Runambiz AI couldn't start your setup."

      );


    } finally {


      setStarting(
        false
      );

    }


  }



  async function sendMessage(
    event
  ) {


    event.preventDefault();


    const message =
      input.trim();


    if (
      !message ||
      sending
    ) {

      return;

    }


    const messageId =
      crypto.randomUUID();


    setMessages(
      current => [

        ...current,

        {

          id:
            messageId,

          role:
            "user",

          content:
            message,

          created_at:
            new Date()
              .toISOString()

        }

      ]
    );


    setInput("");

    setSending(
      true
    );

    setError("");


    try {


      const data =
        await invokeStoreAi({

          action:
            "message",

          businessId:
            business.id,

          message,

          messageId

        });


      if (
        data.assistantMessage
      ) {


        setMessages(
          current => [

            ...current,

            {

              id:
                crypto.randomUUID(),

              role:
                "assistant",

              content:
                data.assistantMessage,

              created_at:
                new Date()
                  .toISOString()

            }

          ]
        );


      }


      setSetupReady(
        data.setupReady ===
        true
      );


      setChecklist(
        data.checklist ||
        {}
      );


    } catch (
      err
    ) {


      setError(

        err?.message ||

        "Runambiz AI couldn't send that message."

      );


    } finally {


      setSending(
        false
      );

    }


  }



  async function applySetup() {


    if (
      !setupReady ||
      applying
    ) {

      return;

    }


    setApplying(
      true
    );

    setError("");


    try {


      const data =
        await invokeStoreAi({

          action:
            "apply",

          businessId:
            business.id

        });


      setSetupStatus(
        "completed"
      );


      setSetupReady(
        true
      );


      setNeedsUpgrade(
        false
      );


      if (
        data.business &&
        onBusinessChanged
      ) {

        await onBusinessChanged(
          data.business
        );

      }


      if (
        onCompleted
      ) {

        await onCompleted(
          data
        );

      }


    } catch (
      err
    ) {


      setError(

        err?.message ||

        "Runambiz couldn't finish your Store setup."

      );


    } finally {


      setApplying(
        false
      );

    }


  }



  if (
    !open
  ) {

    return null;

  }



  const completelyFinished =

    setupStatus ===
      "completed"

    &&

    !needsUpgrade;



  return (

    <div className="store-ai-layer">


      <button

        type="button"

        className="store-ai-backdrop"

        onClick={
          onClose
        }

        aria-label="Close Runambiz AI"

      />



      <section

        className={

          completelyFinished

            ? "store-ai-modal is-complete"

            : "store-ai-modal"

        }

      >



        <header className="store-ai-modal-header">


          <div className="store-ai-modal-brand">


            <div className="store-ai-logo">

              <Sparkles
                size={19}
              />

            </div>


            <div>

              <span>
                RUNAMBIZ AI
              </span>

              <h2>
                Store Assistant
              </h2>

            </div>


          </div>



          <div className="store-ai-header-right">


            {!completelyFinished && (

              <span className="store-ai-credit-pill">

                <Coins
                  size={14}
                />

                {availableCredits}
                {" "}
                credits

              </span>

            )}


            <button

              type="button"

              className="store-ai-close"

              onClick={
                onClose
              }

              aria-label="Close"

            >

              <X
                size={19}
              />

            </button>


          </div>


        </header>



        {loading ? (

          <div className="store-ai-loading">


            <Loader2
              size={25}
              className="spin"
            />


            <strong>
              Loading your Store AI...
            </strong>


          </div>

        ) : completelyFinished ? (

          <div className="store-ai-complete">


            <div className="store-ai-complete-icon">

              <CheckCircle2
                size={31}
              />

            </div>


            <span>
              STORE + AI BRAIN READY
            </span>


            <h2>
              Your AI setup is complete.
            </h2>


            <p>

              Runambiz has prepared your Store
              information and initial business AI
              knowledge.

            </p>



            <div className="store-ai-complete-list">


              <div>

                <CheckCircle2
                  size={15}
                />

                Store information prepared

              </div>


              <div>

                <CheckCircle2
                  size={15}
                />

                FAQs and policies configured

              </div>


              <div>

                <CheckCircle2
                  size={15}
                />

                Social and Link-in-Bio choices handled

              </div>


              <div>

                <CheckCircle2
                  size={15}
                />

                AI Brain initialized

              </div>


            </div>



            <div className="store-ai-complete-note">

              Logo, cover image, product images,
              product prices, stock and payment
              details remain under your manual
              control.

            </div>



            <button

              type="button"

              onClick={
                onClose
              }

            >

              <Store
                size={16}
              />

              Back to Store

            </button>


          </div>

        ) : messages.length ===
          0 ? (

          <div className="store-ai-intro">


            <div className="store-ai-intro-icon">

              <Sparkles
                size={28}
              />

            </div>


            <span>
              AI-POWERED SETUP
            </span>


            <h2>

              {needsUpgrade

                ? "Finish your complete Store setup"

                : "Build your Store with Runambiz AI"}

            </h2>


            <p>

              {needsUpgrade

                ? "You already paid for your original AI setup. This improved setup will finish the remaining Store and AI Brain sections without charging another 20 Credits."

                : "Runambiz reads what you've already entered, asks only for important missing information, then prepares your full Store and initial AI Brain."}

            </p>



            <div className="store-ai-cost">


              <div>

                <span>

                  {needsUpgrade
                    ? "SETUP V2 UPGRADE"
                    : "COMPLETE FIRST SETUP"}

                </span>


                <strong>

                  {needsUpgrade
                    ? "FREE"
                    : `${setupCost} Credits`}

                </strong>

              </div>


              <small>

                {needsUpgrade

                  ? "You will not be charged again."

                  : "One charge covers the complete setup conversation."}

              </small>


            </div>



            <div className="store-ai-intro-points">

              <div>
                <CheckCircle2 size={16} />
                About, description and FAQ
              </div>

              <div>
                <CheckCircle2 size={16} />
                Hours, delivery and policies
              </div>

              <div>
                <CheckCircle2 size={16} />
                Store appearance and display
              </div>

              <div>
                <CheckCircle2 size={16} />
                Social links and Link in Bio
              </div>

              <div>
                <CheckCircle2 size={16} />
                AI customer behaviour
              </div>

              <div>
                <CheckCircle2 size={16} />
                Extra AI business knowledge
              </div>

            </div>



            <div className="store-ai-image-reminder">

              <Store
                size={17}
              />

              <div>

                <strong>
                  Images and sensitive commerce data stay manual.
                </strong>

                <span>
                  Runambiz AI will never invent your logo,
                  product images, prices, stock or payment
                  account details.
                </span>

              </div>

            </div>



            {error && (

              <div className="store-ai-error">
                {error}
              </div>

            )}



            <button

              type="button"

              className="store-ai-start"

              disabled={
                starting
              }

              onClick={
                startSetup
              }

            >

              {starting ? (

                <>

                  <Loader2
                    size={17}
                    className="spin"
                  />

                  Preparing your business...

                </>

              ) : (

                <>

                  <Sparkles
                    size={17}
                  />

                  {needsUpgrade
                    ? "Continue complete setup"
                    : "Build my Store with AI"}

                </>

              )}

            </button>


          </div>

        ) : (

          <>


            <div className={
  progressOpen
    ? "store-ai-progress-panel is-open"
    : "store-ai-progress-panel"
}>

  <button
    type="button"
    className="store-ai-progress-heading"
    aria-expanded={progressOpen}
    onClick={() => setProgressOpen(open => !open)}
  >
    <div>
      <span>COMPLETE STORE SETUP</span>
      <strong>{percent}% ready</strong>
    </div>

    <small>{done}/{total}</small>

    <ChevronDown size={16} className="store-ai-progress-chevron" />
  </button>

              </div>


              <div className="store-ai-progress-bar">

                <span

                  style={{
                    width:
                      `${progress}%`
                  }}

                />

              </div>


              <div className="store-ai-checklist">


                {checklistItems.map(
                  item => {


                    const finished =

                      item.status ===
                        "complete"

                      ||

                      item.status ===
                        "skipped";


                    return (

                      <div

                        key={
                          item.key
                        }

                        className={
                          finished
                            ? "done"
                            : ""
                        }

                      >


                        {finished ? (

                          <Check
                            size={13}
                          />

                        ) : (

                          <Circle
                            size={13}
                          />

                        )}


                        <span>
                          {item.label}
                        </span>


                        {item.status ===
                          "skipped" && (

                          <small>
                            skipped
                          </small>

                        )}


                      </div>

                    );

                  }
                )}


              </div>


            </div>



            <div className="store-ai-chat">


              <div className="store-ai-chat-context">

                <Sparkles
                  size={15}
                />

                <span>

                  Answer naturally. Short answers are
                  fine. You can say “none” or “skip”
                  when an optional section does not
                  apply.

                </span>

              </div>



              {messages.map(
                message => (

                  <div

                    key={
                      message.id
                    }

                    className={

                      message.role ===
                        "user"

                        ? "store-ai-message user"

                        : "store-ai-message assistant"

                    }

                  >


                    {message.role ===
                      "assistant" && (

                      <div className="store-ai-message-avatar">

                        <Sparkles
                          size={14}
                        />

                      </div>

                    )}


                    <div className="store-ai-message-bubble">

                      {message.content}

                    </div>


                  </div>

                )
              )}



              {sending && (

                <div className="store-ai-message assistant">


                  <div className="store-ai-message-avatar">

                    <Sparkles
                      size={14}
                    />

                  </div>


                  <div className="store-ai-message-bubble thinking">

                    <Loader2
                      size={14}
                      className="spin"
                    />

                    Thinking...

                  </div>


                </div>

              )}


              <div
                ref={
                  chatEndRef
                }
              />


            </div>



            {setupReady && (

              <div className="store-ai-ready">


                <CheckCircle2
                  size={21}
                />


                <div>

                  <strong>
                    Your complete Store setup is ready.
                  </strong>

                  <span>
                    All required sections have either
                    been configured or explicitly
                    skipped.
                  </span>

                </div>


                <button

                  type="button"

                  disabled={
                    applying
                  }

                  onClick={
                    applySetup
                  }

                >

                  {applying ? (

                    <>

                      <Loader2
                        size={15}
                        className="spin"
                      />

                      Building...

                    </>

                  ) : (

                    <>

                      <Sparkles
                        size={15}
                      />

                      Finish setup

                    </>

                  )}

                </button>


              </div>

            )}



            {error && (

              <div className="store-ai-error chat-error">

                {error}

              </div>

            )}



            <form

              className="store-ai-input"

              onSubmit={
                sendMessage
              }

            >


              <textarea

                rows="2"

                value={
                  input
                }

                maxLength="2500"

                disabled={
                  sending
                }

                placeholder="Reply to Runambiz AI..."

                onChange={
                  event =>
                    setInput(
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
                  sending ||
                  !input.trim()
                }

                aria-label="Send"

              >

                {sending ? (

                  <Loader2
                    size={18}
                    className="spin"
                  />

                ) : (

                  <Send
                    size={18}
                  />

                )}

              </button>


            </form>


          </>

        )}


      </section>


    </div>

  );

}
