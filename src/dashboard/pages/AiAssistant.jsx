import {
  useEffect,
  useState
} from "react";

import {
  Brain,
  CheckCircle2,
  Database,
  Loader2,
  MessageCircle,
  Package,
  Sparkles,
  Store
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";

import StoreAiAssistant
  from "../components/StoreAiAssistant";


export default function AiAssistant({

  business,

  onBusinessChanged

}) {


  const [
    modalOpen,
    setModalOpen
  ] =
    useState(false);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    brain,
    setBrain
  ] =
    useState(null);


  const [
    knowledgeCount,
    setKnowledgeCount
  ] =
    useState(0);


  const [
    error,
    setError
  ] =
    useState("");


  const setupComplete =
    business
      ?.store_ai_setup_status ===
    "completed";


  const setupInProgress =
    business
      ?.store_ai_setup_status ===
    "in_progress";



  async function loadBrain() {

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
        brainResult,
        knowledgeResult
      ] =
        await Promise.all([

          supabase
            .from(
              "ai_brain_profiles"
            )
            .select("*")
            .eq(
              "business_id",
              business.id
            )
            .maybeSingle(),

          supabase
            .from(
              "ai_knowledge_entries"
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
            .eq(
              "is_active",
              true
            )

        ]);


      if (
        brainResult.error
      ) {

        throw brainResult.error;

      }


      if (
        knowledgeResult.error
      ) {

        throw knowledgeResult.error;

      }


      setBrain(
        brainResult.data ||
        null
      );


      setKnowledgeCount(
        knowledgeResult.count ||
        0
      );


    } catch (
      err
    ) {

      setError(
        err?.message ||
        "We couldn't load your AI Brain."
      );

    } finally {

      setLoading(
        false
      );

    }

  }



  useEffect(
    () => {

      loadBrain();

    },
    [
      business?.id,
      business?.store_ai_setup_status
    ]
  );



  return (

    <main className="dashboard-content ai-brain-page">


      <StoreAiAssistant

        business={
          business
        }

        open={
          modalOpen
        }

        onClose={() =>
          setModalOpen(
            false
          )
        }

        onBusinessChanged={
          onBusinessChanged
        }

        onCompleted={
          loadBrain
        }

      />


      <header className="ai-brain-header">


        <div>

          <span className="dashboard-eyebrow">
            Runambiz AI
          </span>

          <h1>
            AI Brain
          </h1>

          <p>
            One business brain powers your Store,
            customer conversations and future
            automations.
          </p>

        </div>


        <button

          type="button"

          className="ai-brain-primary"

          onClick={() =>
            setModalOpen(
              true
            )
          }

        >

          <Sparkles
            size={17}
          />

          {setupComplete
            ? "Open Runambiz AI"
            : setupInProgress
              ? "Continue AI setup"
              : "Set up my AI"}

        </button>


      </header>



      {!setupComplete ? (

        <section className="ai-brain-welcome">


          <div className="ai-brain-big-icon">

            <Brain
              size={31}
            />

          </div>


          <span>
            YOUR BUSINESS BRAIN
          </span>


          <h2>
            Let Runambiz learn your business.
          </h2>


          <p>
            Runambiz already reads information you've
            saved about your business and products.
            Answer a few questions and it will create
            the remaining Store content and prepare
            how your AI should help customers.
          </p>


          <div className="ai-brain-source-grid">


            <BrainSource
              icon={Store}
              title="Store"
              text="About, FAQs, delivery and policies"
            />


            <BrainSource
              icon={Package}
              title="Products"
              text="Names, categories, prices and inventory"
            />


            <BrainSource
              icon={Database}
              title="Business data"
              text="Hours, contact details and payment configuration"
            />


            <BrainSource
              icon={MessageCircle}
              title="AI behaviour"
              text="Tone, sales style and handover rules"
            />


          </div>


          <button

            type="button"

            className="ai-brain-build-button"

            onClick={() =>
              setModalOpen(
                true
              )
            }

          >

            <Sparkles
              size={18}
            />

            {setupInProgress
              ? "Continue building my AI"
              : "Build my business with AI"}

          </button>


        </section>

      ) : loading ? (

        <div className="ai-brain-loading">

          <Loader2
            size={22}
            className="spin"
          />

          Loading AI Brain...

        </div>

      ) : (

        <>


          <section className="ai-brain-status">


            <div className="ai-brain-active">

              <div>

                <CheckCircle2
                  size={21}
                />

              </div>


              <section>

                <span>
                  STATUS
                </span>

                <strong>
                  AI Brain active
                </strong>

                <p>
                  Your approved Store information and
                  business knowledge are available to
                  Runambiz AI.
                </p>

              </section>

            </div>


            <BrainStat
              label="Tone"
              value={
                formatLabel(
                  brain?.tone ||
                  "friendly_professional"
                )
              }
            />


            <BrainStat
              label="Reply style"
              value={
                formatLabel(
                  brain?.response_style ||
                  "concise"
                )
              }
            />


            <BrainStat
              label="Extra knowledge"
              value={
                `${knowledgeCount} fact${
                  knowledgeCount === 1
                    ? ""
                    : "s"
                }`
              }
            />


          </section>



          <section className="ai-brain-knowledge-card">


            <div className="ai-brain-knowledge-icon">

              <Database
                size={22}
              />

            </div>


            <div>

              <span>
                WHAT YOUR AI KNOWS
              </span>

              <h2>
                Your business stays connected.
              </h2>

              <p>
                Store information, products, prices,
                stock and payment methods remain in
                their real Runambiz databases. Your AI
                reads the current values instead of
                keeping outdated duplicate copies.
              </p>

            </div>


          </section>


          {error && (

            <div className="ai-brain-error">
              {error}
            </div>

          )}


        </>

      )}


    </main>

  );

}



function BrainSource({

  icon: Icon,

  title,

  text

}) {

  return (

    <article>

      <div>

        <Icon
          size={17}
        />

      </div>

      <strong>
        {title}
      </strong>

      <span>
        {text}
      </span>

    </article>

  );

}



function BrainStat({

  label,

  value

}) {

  return (

    <article className="ai-brain-stat">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </article>

  );

}



function formatLabel(
  value
) {

  return String(
    value ||
    ""
  )
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    );

}