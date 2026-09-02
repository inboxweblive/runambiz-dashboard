import {
  useEffect,
  useState
} from "react";

import {
  Banknote,
  Check,
  CreditCard,
  Edit3,
  Loader2,
  Plus,
  Smartphone,
  Trash2,
  Wallet,
  X
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


export default function Payments({
  business,
  refreshKey
}) {

  const [methods, setMethods] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editing, setEditing] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);


  /* =========================================================
     LOAD PAYMENT METHODS
  ========================================================= */

  async function loadPaymentMethods() {

    if (!business?.id) {
      return;
    }

    setLoading(true);

    setError("");

    try {

      const {
        data,
        error: loadError
      } =
        await supabase
          .from("payment_methods")
          .select("*")
          .eq(
            "business_id",
            business.id
          )
          .order(
            "is_default",
            {
              ascending: false
            }
          )
          .order(
            "created_at",
            {
              ascending: true
            }
          );


      if (loadError) {
        throw loadError;
      }


      setMethods(
        data || []
      );

    } catch (err) {

      console.error(
        "Payment methods error:",
        err
      );

      setError(
        err?.message ||
        "We couldn't load your payment methods."
      );

    } finally {

      setLoading(false);

    }

  }


 useEffect(() => {

  loadPaymentMethods();

}, [
  business?.id,
  refreshKey
]);

  /* =========================================================
     CREATE
  ========================================================= */

  function openCreate() {

    setEditing(null);

    setModalOpen(true);

  }


  function openEdit(method) {

    setEditing(method);

    setModalOpen(true);

  }


  /* =========================================================
     DELETE
  ========================================================= */

  async function deleteMethod(
    method
  ) {

    const confirmed =
      window.confirm(
        `Delete ${method.provider_name || "this payment method"}?`
      );


    if (!confirmed) {
      return;
    }


    setDeletingId(
      method.id
    );


    try {

      const {
        error: deleteError
      } =
        await supabase
          .from("payment_methods")
          .delete()
          .eq(
            "id",
            method.id
          );


      if (deleteError) {
        throw deleteError;
      }


      await loadPaymentMethods();

    } catch (err) {

      console.error(
        "Delete payment method error:",
        err
      );

      alert(
        err?.message ||
        "We couldn't delete this payment method."
      );

    } finally {

      setDeletingId(null);

    }

  }


  if (loading) {

    return (

      <div className="payments-loading">

        <Loader2
          size={23}
          className="spin"
        />

        Loading payment methods...

      </div>

    );

  }


  return (

    <div className="dashboard-content payments-page">


      {/* HEADER */}

      <section className="payments-heading">


        <div>

          <span className="dashboard-eyebrow">
            Payments
          </span>

          <h1>
            Payment methods
          </h1>

          <p>
            Add the payment details Runambiz can
            securely show customers after they place an order.
          </p>

        </div>


        <button
          type="button"
          className="payments-add-button"
          onClick={openCreate}
        >

          <Plus size={17} />

          <span>
            Add method
          </span>

        </button>


      </section>



      {/* IMPORTANT NOTICE */}

      <div className="payment-safety-note">

        <Wallet size={19} />

        <div>

          <strong>
            Customer payments go directly to you
          </strong>

          <span>
            Runambiz does not hold your customer's money.
            Only add payment information customers are
            allowed to see. Never add PINs, passwords,
            OTPs or card security codes.
          </span>

        </div>

      </div>



      {error && (

        <div className="payments-error">

          {error}

        </div>

      )}



      {!methods.length ? (

        <section className="payments-empty">


          <div className="payments-empty-icon">

            <Banknote size={28} />

          </div>


          <span>
            GET PAID
          </span>


          <h2>
            Add your payment details
          </h2>


          <p>
            Runambiz can send these approved payment
            instructions to customers after an order
            is created.
          </p>


          <button
            type="button"
            onClick={openCreate}
          >

            <Plus size={17} />

            Add payment method

          </button>


        </section>

      ) : (

        <section className="payment-method-grid">


          {methods.map(
            method => (

              <PaymentMethodCard

                key={
                  method.id
                }

                method={
                  method
                }

                deleting={
                  deletingId ===
                  method.id
                }

                onEdit={() =>
                  openEdit(
                    method
                  )
                }

                onDelete={() =>
                  deleteMethod(
                    method
                  )
                }

              />

            )
          )}


        </section>

      )}



      <PaymentMethodModal

        open={
          modalOpen
        }

        method={
          editing
        }

        business={
          business
        }

        saving={
          saving
        }

        setSaving={
          setSaving
        }

        onClose={() => {

          if (!saving) {

            setModalOpen(
              false
            );

          }

        }}

        onSaved={
          async () => {

            setModalOpen(
              false
            );

            setEditing(
              null
            );

            await loadPaymentMethods();

          }
        }

      />


    </div>

  );

}


/* =========================================================
   PAYMENT METHOD CARD
========================================================= */

function PaymentMethodCard({
  method,
  deleting,
  onEdit,
  onDelete
}) {

  const Icon =
    method.type === "mobile_money"
      ? Smartphone
      : method.type === "cash"
        ? Wallet
        : method.type === "custom"
          ? CreditCard
          : Banknote;


  return (

    <article className="payment-method-card">


      <div className="payment-method-top">


        <div className="payment-method-icon">

          <Icon size={20} />

        </div>


        {method.is_default && (

          <span className="default-payment-badge">

            <Check size={11} />

            Default

          </span>

        )}


      </div>


      <span className="payment-method-type">

        {method.type
          .replaceAll(
            "_",
            " "
          )}

      </span>


      <h3>

        {
          method.provider_name ||
          "Payment method"
        }

      </h3>


      {method.account_name && (

        <p>
          {method.account_name}
        </p>

      )}


      {method.account_number && (

        <strong className="payment-account-number">

          {method.account_number}

        </strong>

      )}


      {method.instructions && (

        <p className="payment-method-instructions">

          {method.instructions}

        </p>

      )}


      <div className="payment-method-status">

        <span
          className={
            method.is_active
              ? "active"
              : ""
          }
        ></span>

        {
          method.is_active
            ? "Active"
            : "Inactive"
        }

      </div>


      <div className="payment-method-actions">


        <button
          type="button"
          onClick={onEdit}
        >

          <Edit3 size={15} />

          Edit

        </button>


        <button
          type="button"
          className="danger"
          disabled={deleting}
          onClick={onDelete}
        >

          {deleting ? (

            <Loader2
              size={15}
              className="spin"
            />

          ) : (

            <Trash2 size={15} />

          )}

          Delete

        </button>


      </div>


    </article>

  );

}


/* =========================================================
   MODAL
========================================================= */

function PaymentMethodModal({
  open,
  method,
  business,
  saving,
  setSaving,
  onClose,
  onSaved
}) {

  const editing =
    Boolean(method);


  const [type, setType] =
    useState(
      "bank_transfer"
    );

  const [
    providerName,
    setProviderName
  ] =
    useState("");

  const [
    accountName,
    setAccountName
  ] =
    useState("");

  const [
    accountNumber,
    setAccountNumber
  ] =
    useState("");

  const [
    instructions,
    setInstructions
  ] =
    useState("");

  const [
    isActive,
    setIsActive
  ] =
    useState(true);

  const [
    isDefault,
    setIsDefault
  ] =
    useState(false);

  const [
    formError,
    setFormError
  ] =
    useState("");


  useEffect(() => {

    if (!open) {
      return;
    }


    setFormError("");


    if (method) {

      setType(
        method.type ||
        "bank_transfer"
      );

      setProviderName(
        method.provider_name ||
        ""
      );

      setAccountName(
        method.account_name ||
        ""
      );

      setAccountNumber(
        method.account_number ||
        ""
      );

      setInstructions(
        method.instructions ||
        ""
      );

      setIsActive(
        method.is_active !== false
      );

      setIsDefault(
        method.is_default === true
      );

    } else {

      setType(
        "bank_transfer"
      );

      setProviderName("");

      setAccountName("");

      setAccountNumber("");

      setInstructions("");

      setIsActive(true);

      setIsDefault(false);

    }

  }, [
    open,
    method
  ]);


  async function handleSubmit(
    event
  ) {

    event.preventDefault();

    setFormError("");


    if (
      type === "bank_transfer" &&
      !providerName.trim()
    ) {

      setFormError(
        "Enter your bank name."
      );

      return;

    }


    if (
      type === "bank_transfer" &&
      !accountNumber.trim()
    ) {

      setFormError(
        "Enter your account number."
      );

      return;

    }


    setSaving(true);


    try {

      /*
        If this method becomes default,
        first unset any previous default.
      */

      if (isDefault) {

        let query =
          supabase
            .from(
              "payment_methods"
            )
            .update({
              is_default:
                false
            })
            .eq(
              "business_id",
              business.id
            );


        if (editing) {

          query =
            query.neq(
              "id",
              method.id
            );

        }


        const {
          error: resetError
        } =
          await query;


        if (resetError) {
          throw resetError;
        }

      }


      const payload = {

        business_id:
          business.id,

        type,

        provider_name:
          providerName
            .trim() ||
          null,

        account_name:
          accountName
            .trim() ||
          null,

        account_number:
          accountNumber
            .trim() ||
          null,

        instructions:
          instructions
            .trim() ||
          null,

        is_active:
          isActive,

        is_default:
          isDefault,

        updated_at:
          new Date()
            .toISOString()

      };


      if (editing) {

        const {
          error
        } =
          await supabase
            .from(
              "payment_methods"
            )
            .update(
              payload
            )
            .eq(
              "id",
              method.id
            );


        if (error) {
          throw error;
        }

      } else {

        const {
          error
        } =
          await supabase
            .from(
              "payment_methods"
            )
            .insert(
              payload
            );


        if (error) {
          throw error;
        }

      }


      await onSaved();

    } catch (err) {

      console.error(
        "Save payment method error:",
        err
      );

      setFormError(
        err?.message ||
        "We couldn't save this payment method."
      );

    } finally {

      setSaving(false);

    }

  }


  if (!open) {
    return null;
  }


  return (

    <div className="payment-modal-layer">


      <button
        type="button"
        className="payment-modal-backdrop"
        onClick={onClose}
        aria-label="Close"
      />


      <section className="payment-modal">


        <header className="payment-modal-header">


          <div>

            <span>
              PAYMENT METHOD
            </span>

            <h2>

              {
                editing
                  ? "Edit payment method"
                  : "Add payment method"
              }

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
          className="payment-form"
          onSubmit={handleSubmit}
        >


          <div className="payment-form-group">

            <label>
              Type
            </label>

            <select
              value={type}
              onChange={
                event =>
                  setType(
                    event.target.value
                  )
              }
            >

              <option value="bank_transfer">
                Bank transfer
              </option>

              <option value="mobile_money">
                Mobile money
              </option>

              <option value="cash">
                Cash
              </option>

              <option value="custom">
                Custom
              </option>

            </select>

          </div>


          <div className="payment-form-group">

            <label>
              Provider / Bank name
            </label>

            <input
              value={
                providerName
              }
              placeholder="e.g. GTBank"
              onChange={
                event =>
                  setProviderName(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="payment-form-group">

            <label>
              Account name
            </label>

            <input
              value={
                accountName
              }
              placeholder="e.g. Wumight Collection"
              onChange={
                event =>
                  setAccountName(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="payment-form-group">

            <label>
              Account number / identifier
            </label>

            <input
              value={
                accountNumber
              }
              placeholder="e.g. 0123456789"
              onChange={
                event =>
                  setAccountNumber(
                    event.target.value
                  )
              }
            />

          </div>


          <div className="payment-form-group">

            <label>
              Customer instructions
            </label>

            <textarea
              rows="4"
              maxLength="500"
              value={
                instructions
              }
              placeholder="e.g. Transfer the exact order total and send your payment confirmation."
              onChange={
                event =>
                  setInstructions(
                    event.target.value
                  )
              }
            />

          </div>


          <label className="payment-toggle-row">

            <div>

              <strong>
                Active
              </strong>

              <span>
                Allow Runambiz to show this method to customers.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                isActive
              }
              onChange={
                event =>
                  setIsActive(
                    event.target.checked
                  )
              }
            />

          </label>


          <label className="payment-toggle-row">

            <div>

              <strong>
                Default payment method
              </strong>

              <span>
                Use this method first after a customer orders.
              </span>

            </div>

            <input
              type="checkbox"
              checked={
                isDefault
              }
              onChange={
                event =>
                  setIsDefault(
                    event.target.checked
                  )
              }
            />

          </label>


          {formError && (

            <div className="payment-form-error">

              {formError}

            </div>

          )}


          <footer className="payment-modal-actions">


            <button
              type="button"
              className="payment-cancel-button"
              disabled={saving}
              onClick={onClose}
            >

              Cancel

            </button>


            <button
              type="submit"
              className="payment-save-button"
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

                  Save payment method
                </>

              )}

            </button>


          </footer>


        </form>


      </section>


    </div>

  );

}