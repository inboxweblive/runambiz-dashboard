import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Coins,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  Store,
  Sun,
  UserRound
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


export default function Settings({

  profile,

  user,

  business,

  subscription,

  billingWallet,

  theme,

  onThemeToggle,

  onProfileChanged,

  onNavigate

}) {


  const [
    fullName,
    setFullName
  ] =
    useState("");


  const [
    phone,
    setPhone
  ] =
    useState("");


  const [
    saving,
    setSaving
  ] =
    useState(false);


  const [
    profileMessage,
    setProfileMessage
  ] =
    useState("");


  const [
    profileError,
    setProfileError
  ] =
    useState("");


  const [
    password,
    setPassword
  ] =
    useState("");


  const [
    confirmPassword,
    setConfirmPassword
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword
  ] =
    useState(false);


  const [
    changingPassword,
    setChangingPassword
  ] =
    useState(false);


  const [
    passwordMessage,
    setPasswordMessage
  ] =
    useState("");


  const [
    passwordError,
    setPasswordError
  ] =
    useState("");



  useEffect(
    () => {

      setFullName(
        profile?.full_name ||
        ""
      );


      setPhone(
        profile?.phone ||
        ""
      );

    },
    [
      profile
    ]
  );



  const availableCredits =
    useMemo(
      () => {

        return (

          Number(
            billingWallet
              ?.daily_balance ||
            0
          )

          +

          Number(
            billingWallet
              ?.plan_balance ||
            0
          )

          +

          Number(
            billingWallet
              ?.bonus_balance ||
            0
          )

          +

          Number(
            billingWallet
              ?.purchased_balance ||
            0
          )

        );

      },
      [
        billingWallet
      ]
    );


  const planName =
    subscription
      ?.subscription_plans
      ?.name
    ||
    subscription
      ?.plan_code
    ||
    "Free";



  async function saveProfile(
    event
  ) {

    event.preventDefault();


    if (
      !fullName.trim()
    ) {

      setProfileError(
        "Enter your full name."
      );

      return;

    }


    setSaving(
      true
    );

    setProfileError("");

    setProfileMessage("");


    try {

      const {
        data,
        error
      } =
        await supabase
          .from(
            "profiles"
          )
          .update({

            full_name:
              fullName.trim(),

            phone:
              phone.trim() ||
              null

          })
          .eq(
            "id",
            user.id
          )
          .select()
          .single();


      if (
        error
      ) {

        throw error;

      }


      onProfileChanged?.(
        data
      );


      setProfileMessage(
        "Profile updated."
      );


    } catch (
      err
    ) {

      setProfileError(
        err?.message ||
        "We couldn't update your profile."
      );

    } finally {

      setSaving(
        false
      );

    }

  }



  async function changePassword(
    event
  ) {

    event.preventDefault();


    setPasswordError("");

    setPasswordMessage("");


    if (
      password.length <
      8
    ) {

      setPasswordError(
        "Use at least 8 characters."
      );

      return;

    }


    if (
      password !==
      confirmPassword
    ) {

      setPasswordError(
        "The passwords do not match."
      );

      return;

    }


    setChangingPassword(
      true
    );


    try {

      const {
        error
      } =
        await supabase
          .auth
          .updateUser({

            password

          });


      if (
        error
      ) {

        throw error;

      }


      setPassword("");

      setConfirmPassword("");


      setPasswordMessage(
        "Password changed successfully."
      );


    } catch (
      err
    ) {

      setPasswordError(
        err?.message ||
        "We couldn't change your password."
      );

    } finally {

      setChangingPassword(
        false
      );

    }

  }



  return (

    <main className="dashboard-content settings-page">


      <header className="settings-header">


        <div>

          <span className="dashboard-eyebrow">
            Account
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Manage your personal account, security
            and Runambiz preferences.
          </p>

        </div>


      </header>



      <div className="settings-layout">


        <section className="settings-card">


          <div className="settings-card-heading">


            <div className="settings-heading-icon">

              <UserRound
                size={19}
              />

            </div>


            <div>

              <h2>
                Profile
              </h2>

              <p>
                Your personal Runambiz account details.
              </p>

            </div>


          </div>


          <form
            onSubmit={
              saveProfile
            }
          >


            <SettingsField
              label="Full name"
            >

              <input

                type="text"

                value={
                  fullName
                }

                onChange={
                  event =>
                    setFullName(
                      event.target.value
                    )
                }

              />

            </SettingsField>


            <SettingsField
              label="Phone number"
            >

              <input

                type="tel"

                value={
                  phone
                }

                placeholder="Your phone number"

                onChange={
                  event =>
                    setPhone(
                      event.target.value
                    )
                }

              />

            </SettingsField>


            <SettingsField
              label="Login email"
            >

              <input

                value={
                  user?.email ||
                  ""
                }

                disabled

              />

              <small>
                Your authentication email is managed
                securely by your Runambiz account.
              </small>

            </SettingsField>


            {profileError && (

              <div className="settings-error">
                {profileError}
              </div>

            )}


            {profileMessage && (

              <div className="settings-success">
                {profileMessage}
              </div>

            )}


            <button

              type="submit"

              className="settings-primary-button"

              disabled={
                saving
              }

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

                  <Save
                    size={16}
                  />

                  Save profile

                </>

              )}

            </button>


          </form>


        </section>



        <section className="settings-card">


          <div className="settings-card-heading">


            <div className="settings-heading-icon">

              <Store
                size={19}
              />

            </div>


            <div>

              <h2>
                Business identity
              </h2>

              <p>
                Your customer-facing business identity.
              </p>

            </div>


          </div>


          <div className="settings-business-preview">


            {business?.cover_url && (

              <div

                className="settings-business-cover"

                style={{

                  backgroundImage:
                    `url("${business.cover_url}")`

                }}

              />

            )}


            <div className="settings-business-main">


              <div className="settings-business-logo">


                {business?.logo_url ? (

                  <img

                    src={
                      business.logo_url
                    }

                    alt={
                      business.name
                    }

                  />

                ) : (

                  <span>

                    {business?.name
                      ?.charAt(0)
                      ?.toUpperCase()
                      ||
                      "R"}

                  </span>

                )}


              </div>


              <div>

                <strong>
                  {business?.name}
                </strong>

                <span>
                  {business?.slug
                    ? `${business.slug}.runambiz.com`
                    : "Runambiz business"}
                </span>

              </div>


            </div>


          </div>


          <div className="settings-note">

            <Palette
              size={17}
            />

            <div>

              <strong>
                Business branding stays in Store.
              </strong>

              <span>
                Logo, cover image, Store colours and
                storefront appearance use one shared
                source so they don't get out of sync.
              </span>

            </div>

          </div>


          <button

            type="button"

            className="settings-secondary-button"

            onClick={() =>
              onNavigate?.(
                "Store"
              )
            }

          >

            <Store
              size={16}
            />

            Manage Store branding

          </button>


        </section>



        <section className="settings-card">


          <div className="settings-card-heading">


            <div className="settings-heading-icon">

              <LockKeyhole
                size={19}
              />

            </div>


            <div>

              <h2>
                Password & security
              </h2>

              <p>
                Protect access to your business.
              </p>

            </div>


          </div>


          <form
            onSubmit={
              changePassword
            }
          >


            <SettingsField
              label="New password"
            >

              <div className="settings-password-input">


                <input

                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  value={
                    password
                  }

                  placeholder="Minimum 8 characters"

                  onChange={
                    event =>
                      setPassword(
                        event.target.value
                      )
                  }

                />


                <button

                  type="button"

                  onClick={() =>
                    setShowPassword(
                      value =>
                        !value
                    )
                  }

                >

                  {showPassword ? (

                    <EyeOff
                      size={16}
                    />

                  ) : (

                    <Eye
                      size={16}
                    />

                  )}

                </button>


              </div>

            </SettingsField>


            <SettingsField
              label="Confirm new password"
            >

              <input

                type={
                  showPassword
                    ? "text"
                    : "password"
                }

                value={
                  confirmPassword
                }

                onChange={
                  event =>
                    setConfirmPassword(
                      event.target.value
                    )
                }

              />

            </SettingsField>


            {passwordError && (

              <div className="settings-error">
                {passwordError}
              </div>

            )}


            {passwordMessage && (

              <div className="settings-success">
                {passwordMessage}
              </div>

            )}


            <button

              type="submit"

              className="settings-primary-button"

              disabled={
                changingPassword
              }

            >

              {changingPassword ? (

                <>

                  <Loader2
                    size={16}
                    className="spin"
                  />

                  Updating...

                </>

              ) : (

                <>

                  <ShieldCheck
                    size={16}
                  />

                  Change password

                </>

              )}

            </button>


          </form>


        </section>



        <section className="settings-card">


          <div className="settings-card-heading">


            <div className="settings-heading-icon">

              {theme === "dark"
                ? <Moon size={19} />
                : <Sun size={19} />}

            </div>


            <div>

              <h2>
                Appearance
              </h2>

              <p>
                Choose how Runambiz looks to you.
              </p>

            </div>


          </div>


          <div className="settings-preference-row">


            <div>

              <strong>
                {theme === "dark"
                  ? "Dark mode"
                  : "Light mode"}
              </strong>

              <span>
                This affects your Runambiz dashboard,
                not your customer's Store theme.
              </span>

            </div>


            <button

              type="button"

              className="settings-secondary-button"

              onClick={
                onThemeToggle
              }

            >

              {theme === "dark"
                ? <Sun size={15} />
                : <Moon size={15} />}

              Switch to {
                theme === "dark"
                  ? "light"
                  : "dark"
              }

            </button>


          </div>


        </section>



        <section className="settings-card settings-billing-card">


          <div className="settings-card-heading">


            <div className="settings-heading-icon">

              <CreditCard
                size={19}
              />

            </div>


            <div>

              <h2>
                Plan & AI Credits
              </h2>

              <p>
                Your Runambiz account capacity.
              </p>

            </div>


          </div>


          <div className="settings-account-stats">


            <div>

              <CreditCard
                size={17}
              />

              <span>
                Current plan
              </span>

              <strong>
                {planName}
              </strong>

            </div>


            <div>

              <Coins
                size={17}
              />

              <span>
                Available credits
              </span>

              <strong>
                {availableCredits.toLocaleString()}
              </strong>

            </div>


          </div>


          <button

            type="button"

            className="settings-secondary-button"

            onClick={() =>
              onNavigate?.(
                "Plans & Billing"
              )
            }

          >

            <CreditCard
              size={16}
            />

            Manage plan & billing

          </button>


        </section>


      </div>


    </main>

  );

}



function SettingsField({

  label,

  children

}) {

  return (

    <label className="settings-field">

      <span>
        {label}
      </span>

      {children}

    </label>

  );

}