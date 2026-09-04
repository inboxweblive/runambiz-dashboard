import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,

  Globe2,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  
  MessageCircle,
  Package,
  Palette,
  Phone,
  Save,
  Settings2,
  ShoppingBag,
  Store as StoreIcon,
  Trash2,
    BadgeCheck,
  Clock3,
  HelpCircle,
  Link2,
  Megaphone,
  
  Plus,
  Share2,
  Sparkles,
  X,
  Upload
} from "lucide-react";

import {
  supabase
} from "../../lib/supabase";


import StoreAiAssistant
  from "../components/StoreAiAssistant";   


import CustomDomainSection
  from "../components/CustomDomainSection";

import {
  RUNAMBIZ_COUNTRIES_UNIQUE,
  getCountryByCode,
  getCurrencyForCountry
} from "../../lib/countries";


const fieldStyle = {
  width: "100%",
  height: "44px",
  padding: "0 13px",
  border: "1px solid var(--border)",
  borderRadius: "11px",
  outline: 0,
  background: "var(--field-bg)",
  color: "var(--ink)",
  fontFamily: "inherit",
  fontSize: "12.5px",
  fontWeight: 500,
  letterSpacing: "-.006em",
  transition: "border-color .24s var(--ease), box-shadow .24s ease, background .24s ease"
};

/* ---- brand marks (lucide removed these) ---- */

const brandProps = size => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  xmlns: "http://www.w3.org/2000/svg"
});

const Instagram = ({ size = 16, ...rest }) => (
  <svg {...brandProps(size)} {...rest}>
    <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.18a6.66 6.66 0 1 0 0 13.32 6.66 6.66 0 0 0 0-13.32Zm0 10.98a4.32 4.32 0 1 1 0-8.64 4.32 4.32 0 0 1 0 8.64Zm8.48-11.24a1.56 1.56 0 1 1-3.11 0 1.56 1.56 0 0 1 3.11 0Z" />
  </svg>
);

const TikTok = ({ size = 16, ...rest }) => (
  <svg {...brandProps(size)} {...rest}>
    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-4.66 1.55 2.59 2.59 0 0 1 2.6-4.03V9.79a5.68 5.68 0 1 0 4.71 5.6V9.01a7.34 7.34 0 0 0 4.29 1.37V7.29a4.28 4.28 0 0 1-2.79-1.47Z" />
  </svg>
);

const Facebook = ({ size = 16, ...rest }) => (
  <svg {...brandProps(size)} {...rest}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
  </svg>
);

const XLogo = ({ size = 16, ...rest }) => (
  <svg {...brandProps(size)} {...rest}>
    <path d="M18.24 2.25h3.31l-7.23 8.26L22.82 21.75h-6.66l-5.22-6.82-5.97 6.82H1.66l7.73-8.84L1.18 2.25h6.83l4.71 6.23 5.52-6.23Zm-1.16 17.52h1.83L7.05 4.13H5.08l12 15.64Z" />
  </svg>
);

const focusField = event => {
  event.target.style.borderColor = "var(--field-focus)";
  event.target.style.background = "var(--field-bg-focus)";
  event.target.style.boxShadow = "0 0 0 3px var(--field-ring)";
};

const blurField = event => {
  event.target.style.borderColor = "var(--border)";
  event.target.style.background = "var(--field-bg)";
  event.target.style.boxShadow = "none";
};

const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram",   icon: Instagram, placeholder: "https://instagram.com/..." },
  { key: "tiktok",    label: "TikTok",      icon: TikTok,    placeholder: "https://tiktok.com/@..." },
  { key: "facebook",  label: "Facebook",    icon: Facebook,  placeholder: "https://facebook.com/..." },
  { key: "x",         label: "X / Twitter", icon: XLogo,     placeholder: "https://x.com/..." }
];






/* =========================================================
   STORE PAGE
========================================================= */

export default function Store({
  business,
  onBusinessChanged,
  planAccess
}) {


  /* =======================================================
     BUSINESS DETAILS
  ======================================================= */

  const [
    storeName,
    setStoreName
  ] =
    useState("");


  const [
    description,
    setDescription
  ] =
    useState("");


  const [
    location,
    setLocation
  ] =
    useState("");


  const [
    countryCode,
    setCountryCode
  ] =
    useState("NG");


  const [
    currency,
    setCurrency
  ] =
    useState("NGN");



  /* =======================================================
     CONTACT
  ======================================================= */

  const [
    whatsapp,
    setWhatsapp
  ] =
    useState("");


  const [
    supportEmail,
    setSupportEmail
  ] =
    useState("");


  const [
    supportPhone,
    setSupportPhone
  ] =
    useState("");



  /* =======================================================
     APPEARANCE
  ======================================================= */

  const [
    logoUrl,
    setLogoUrl
  ] =
    useState("");


  const [
    logoPath,
    setLogoPath
  ] =
    useState("");


  const [
    coverUrl,
    setCoverUrl
  ] =
    useState("");


  const [
    coverPath,
    setCoverPath
  ] =
    useState("");


  const [
    primaryColor,
    setPrimaryColor
  ] =
    useState(
      "#5B21B6"
    );


  const [
    accentColor,
    setAccentColor
  ] =
    useState(
      "#A3E635"
    );


  const [
    template,
    setTemplate
  ] =
    useState(
      "modern"
    );



  /* =======================================================
     STOREFRONT SETTINGS
  ======================================================= */

  const [
    showOutOfStock,
    setShowOutOfStock
  ] =
    useState(true);


  const [
    showFeatured,
    setShowFeatured
  ] =
    useState(true);


  const [
    showCategories,
    setShowCategories
  ] =
    useState(true);


  const [
    deliveryInformation,
    setDeliveryInformation
  ] =
    useState("");


  const [
    paymentInformation,
    setPaymentInformation
  ] =
    useState("");


  const [
    storePolicy,
    setStorePolicy
  ] =
    useState("");


      /* =======================================================
     WEBSITE CONTENT
  ======================================================= */

  const [
    businessHours,
    setBusinessHours
  ] =
    useState("");


  const [
    announcementEnabled,
    setAnnouncementEnabled
  ] =
    useState(false);


  const [
    announcementText,
    setAnnouncementText
  ] =
    useState("");


  const [
    aboutTitle,
    setAboutTitle
  ] =
    useState("");


  const [
    aboutText,
    setAboutText
  ] =
    useState("");


  const [
    faqs,
    setFaqs
  ] =
    useState([]);


  const [
    socialLinks,
    setSocialLinks
  ] =
    useState({

      instagram: "",

      tiktok: "",

      facebook: "",

      x: ""

    });


  const [
    showContactSection,
    setShowContactSection
  ] =
    useState(true);



  /* =======================================================
     LINK IN BIO
  ======================================================= */

  const [
    linkInBioEnabled,
    setLinkInBioEnabled
  ] =
    useState(false);


  const [
    linkInBioTitle,
    setLinkInBioTitle
  ] =
    useState("");


  const [
    linkInBioLinks,
    setLinkInBioLinks
  ] =
    useState([]);



  /* =======================================================
     RUNAMBIZ DISCOVERY
  ======================================================= */

  const [
    hideRunambizPromotions,
    setHideRunambizPromotions
  ] =
    useState(false);



  /* =======================================================
     PUBLISHING
  ======================================================= */

  const [
    isPublished,
    setIsPublished
  ] =
    useState(false);


  const [
    activeProductCount,
    setActiveProductCount
  ] =
    useState(0);


  const [
    paymentMethodCount,
    setPaymentMethodCount
  ] =
    useState(0);



  /* =======================================================
     UI
  ======================================================= */

  const [
    saving,
    setSaving
  ] =
    useState(false);


  const [
    loadingReadiness,
    setLoadingReadiness
  ] =
    useState(false);


  const [
    uploadingLogo,
    setUploadingLogo
  ] =
    useState(false);


  const [
    uploadingCover,
    setUploadingCover
  ] =
    useState(false);


      const [
    uploadingLinkIndex,
    setUploadingLinkIndex
  ] =
    useState(null);

  const [
    copied,
    setCopied
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    success,
    setSuccess
  ] =
    useState("");



    const [
  storeAiOpen,
  setStoreAiOpen
] =
  useState(false);


const aiSetupComplete =
  business
    ?.store_ai_setup_status ===
  "completed";


const aiSetupInProgress =
  business
    ?.store_ai_setup_status ===
  "in_progress";


  
  const [featuredPostEnabled, setFeaturedPostEnabled] = useState(false);
  const [featuredPostImageUrl, setFeaturedPostImageUrl] = useState("");
  const [featuredPostImagePath, setFeaturedPostImagePath] = useState("");
  const [featuredPostEyebrow, setFeaturedPostEyebrow] = useState("");
  const [featuredPostTitle, setFeaturedPostTitle] = useState("");
  const [featuredPostLink, setFeaturedPostLink] = useState("");
  const [uploadingFeaturedPost, setUploadingFeaturedPost] = useState(false);
 

      /* =======================================================
     PLAN / MEMBERSHIP BENEFITS
  ======================================================= */

  const isPaidMember =
    planAccess?.can?.(
      "paid_member_badge"
    ) === true;


  const promotionEligible =
    planAccess?.can?.(
      "promotion_eligible"
    ) === true;


  const canHideRunambizPromotions =
    planAccess?.can?.(
      "hide_runambiz_promotions"
    ) === true;


  const promotionWeight =
    planAccess?.limit?.(
      "promotion_weight",
      0
    ) || 0;



  /* =======================================================
     LOAD BUSINESS
  ======================================================= */

  useEffect(() => {

    if (!business) {
      return;
    }


    setStoreName(
      business.name ||
      ""
    );


    setDescription(
      business.description ||
      ""
    );


    setLocation(
      business.location ||
      ""
    );


    const currentCountry =
      business.country_code ||
      "NG";


    setCountryCode(
      currentCountry
    );


    setCurrency(
      business.currency ||
      getCurrencyForCountry(
        currentCountry
      )
    );


    setWhatsapp(
      business.contact_whatsapp ||
      ""
    );


    setSupportEmail(
      business.contact_email ||
      ""
    );


    setSupportPhone(
      business.contact_phone ||
      ""
    );


    setLogoUrl(
      business.logo_url ||
      ""
    );


    setLogoPath(
      business.logo_path ||
      ""
    );


    setCoverUrl(
      business.cover_url ||
      ""
    );


    setCoverPath(
      business.cover_path ||
      ""
    );


    setPrimaryColor(
      business.primary_color ||
      "#5B21B6"
    );


    setAccentColor(
      business.accent_color ||
      "#A3E635"
    );


    setTemplate(
      business.store_template ||
      "modern"
    );


    setShowOutOfStock(
      business.show_out_of_stock ??
      true
    );


    setShowFeatured(
      business.show_featured_products ??
      true
    );


    setShowCategories(
      business.show_categories ??
      true
    );


    setDeliveryInformation(
      business.delivery_information ||
      ""
    );


    setPaymentInformation(
      business.payment_information ||
      ""
    );


      setStorePolicy(
      business.store_policy ||
      ""
    );


    /* =====================================================
       WEBSITE CONTENT
    ===================================================== */

    setBusinessHours(
      business.business_hours_text ||
      ""
    );


    setAnnouncementEnabled(
      business.announcement_enabled ===
      true
    );


    setAnnouncementText(
      business.announcement_text ||
      ""
    );


    setAboutTitle(
      business.about_title ||
      ""
    );


    setAboutText(
      business.about_text ||
      ""
    );


    setFaqs(

      Array.isArray(
        business.store_faqs
      )

        ? business.store_faqs

        : []

    );


    setSocialLinks({

      instagram:
        business
          ?.social_links
          ?.instagram ||
        "",

      tiktok:
        business
          ?.social_links
          ?.tiktok ||
        "",

      facebook:
        business
          ?.social_links
          ?.facebook ||
        "",

      x:
        business
          ?.social_links
          ?.x ||
        ""

    });


    setShowContactSection(
      business.show_contact_section ??
      true
    );



    /* =====================================================
       LINK IN BIO
    ===================================================== */

    setLinkInBioEnabled(
      business.link_in_bio_enabled ===
      true
    );


    setLinkInBioTitle(
      business.link_in_bio_title ||
      ""
    );


    setLinkInBioLinks(

      Array.isArray(
        business.link_in_bio_links
      )

        ? business.link_in_bio_links

        : []

    );



    /* =====================================================
       RUNAMBIZ PROMOTIONS
    ===================================================== */

    setHideRunambizPromotions(

      canHideRunambizPromotions

        ? business
            .hide_runambiz_promotions ===
          true

        : false

    );



    setIsPublished(
      business.is_published ===
      true
    );


 setFeaturedPostEnabled(
      business.featured_post_enabled === true
    );
 
    setFeaturedPostImageUrl(
      business.featured_post_image_url || ""
    );
 
    setFeaturedPostImagePath(
      business.featured_post_image_path || ""
    );
 
    setFeaturedPostEyebrow(
      business.featured_post_eyebrow || ""
    );
 
    setFeaturedPostTitle(
      business.featured_post_title || ""
    );
 
    setFeaturedPostLink(
      business.featured_post_link || ""
    );

}, [
  business,
  canHideRunambizPromotions
]);



  /* =======================================================
     LOAD STORE READINESS
  ======================================================= */

  useEffect(() => {

    if (!business?.id) {
      return;
    }


    loadReadiness();


  }, [
    business?.id
  ]);



  async function loadReadiness() {

    if (!business?.id) {
      return;
    }


    setLoadingReadiness(
      true
    );


    try {


      const [
        productsResult,
        paymentsResult
      ] =
        await Promise.all([


          supabase
            .from(
              "products"
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
              "status",
              "active"
            ),


          supabase
            .from(
              "payment_methods"
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
        productsResult.error
      ) {

        throw productsResult.error;

      }


      if (
        paymentsResult.error
      ) {

        throw paymentsResult.error;

      }


      setActiveProductCount(
        productsResult.count ||
        0
      );


      setPaymentMethodCount(
        paymentsResult.count ||
        0
      );


    } catch (err) {

      console.error(
        "Store readiness error:",
        err
      );


    } finally {

      setLoadingReadiness(
        false
      );

    }

  }



  /* =======================================================
     UNIQUE CURRENCIES
  ======================================================= */

  const currencyOptions =
    useMemo(() => {

      return [
        ...new Set(
          RUNAMBIZ_COUNTRIES_UNIQUE
            .map(
              country =>
                country.currency
            )
        )
      ]
        .sort();

    }, []);



 const storefrontUrl = useMemo(() => {

  if (!business?.slug) {
    return "";
  }

  const hostname = window.location.hostname;

  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1";

  if (isLocal) {
    return `${window.location.origin}/store.html?store=${business.slug}`;
  }

  /* store.html is served by this deployment, so the
     storefront lives under the same origin. */

  return `https://app.runambiz.com/store/${business.slug}`;

}, [business?.slug]);


const linkInBioUrl = useMemo(() => {

  if (!storefrontUrl) {
    return "";
  }

  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  return isLocal
    ? `${storefrontUrl}&view=links`
    : `${storefrontUrl}/links`;

}, [storefrontUrl]);



  /* =======================================================
     READINESS
  ======================================================= */

  const hasBusinessName =
    Boolean(
      storeName.trim()
    );


  const hasCountry =
    Boolean(
      countryCode &&
      currency
    );


  const hasProduct =
    activeProductCount >
    0;


  const hasPayment =
    paymentMethodCount >
    0;


  const readyToPublish =
    hasBusinessName &&
    hasCountry &&
    hasProduct &&
    hasPayment;



  /* =======================================================
     COUNTRY CHANGE
  ======================================================= */

  function handleCountryChange(
    nextCountry
  ) {

    setCountryCode(
      nextCountry
    );


    setCurrency(
      getCurrencyForCountry(
        nextCountry
      )
    );


    clearMessages();

  }



  /* =======================================================
     SAVE ALL STORE SETTINGS
  ======================================================= */

  async function saveStore(
    event
  ) {

    event?.preventDefault();


    if (!business?.id) {

      setError(
        "Business information is missing."
      );

      return;

    }


    clearMessages();


    if (
      !storeName.trim()
    ) {

      setError(
        "Enter your store name."
      );

      return;

    }


    if (
      supportEmail.trim()

      &&

      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
          supportEmail.trim()
        )
    ) {

      setError(
        "Enter a valid support email."
      );

      return;

    }


    if (
      isPublished &&
      !readyToPublish
    ) {

      setError(
        "Complete the publishing checklist before publishing your store."
      );

      return;

    }


    setSaving(
      true
    );


    try {


      const country =
        getCountryByCode(
          countryCode
        );


      const {
        data,
        error:
          updateError
      } =
        await supabase
          .from(
            "businesses"
          )
          .update({

            name:
              storeName.trim(),

            description:
              description.trim() ||
              null,

            location:
              location.trim() ||
              null,

            country_code:
              countryCode,

            country_name:
              country?.name ||
              null,

            currency:

              currency,

            contact_whatsapp:
              whatsapp.trim() ||
              null,

            contact_email:
              supportEmail.trim() ||
              null,

            contact_phone:
              supportPhone.trim() ||
              null,

            primary_color:
              primaryColor,

            accent_color:
              accentColor,

            store_template:
              template,

            show_out_of_stock:
              showOutOfStock,

            show_featured_products:
              showFeatured,

            show_categories:
              showCategories,

            delivery_information:
              deliveryInformation
                .trim() ||
              null,

            payment_information:
              paymentInformation
                .trim() ||
              null,

                      store_policy:
              storePolicy.trim() ||
              null,


            /* ===============================================
               WEBSITE CONTENT
            ================================================ */

            business_hours_text:
              businessHours.trim() ||
              null,


            announcement_enabled:
              announcementEnabled,


            announcement_text:
              announcementText.trim() ||
              null,


            about_title:
              aboutTitle.trim() ||
              null,


            about_text:
              aboutText.trim() ||
              null,


            store_faqs:
              faqs
                .map(
                  item => ({

                    question:
                      String(
                        item.question ||
                        ""
                      ).trim(),

                    answer:
                      String(
                        item.answer ||
                        ""
                      ).trim()

                  })
                )
                .filter(
                  item =>
                    item.question &&
                    item.answer
                )
                .slice(
                  0,
                  12
                ),


            social_links: {

              instagram:
                socialLinks.instagram
                  ?.trim() ||
                "",

              tiktok:
                socialLinks.tiktok
                  ?.trim() ||
                "",

              facebook:
                socialLinks.facebook
                  ?.trim() ||
                "",

              x:
                socialLinks.x
                  ?.trim() ||
                ""

            },


            show_contact_section:
              showContactSection,



            /* ===============================================
               LINK IN BIO
            ================================================ */

            link_in_bio_enabled:
              linkInBioEnabled,


            link_in_bio_title:
              linkInBioTitle.trim() ||
              null,


                        link_in_bio_links:
              linkInBioLinks
                .map(
                  item => ({

                    label:
                      String(
                        item.label ||
                        ""
                      ).trim(),

                    url:
                      String(
                        item.url ||
                        ""
                      ).trim(),

                    imageUrl:
                      String(
                        item.imageUrl ||
                        ""
                      ).trim(),

                    imagePath:
                      String(
                        item.imagePath ||
                        ""
                      ).trim()

                  })
                )
                .filter(
                  item =>
                    item.label &&
                    item.url
                )
                .slice(
                  0,
                  12
                ),

                       featured_post_enabled:
              featuredPostEnabled,
 
            featured_post_image_url:
              featuredPostImageUrl.trim() ||
              null,
 
            featured_post_image_path:
              featuredPostImagePath.trim() ||
              null,
 
            featured_post_eyebrow:
              featuredPostEyebrow.trim() ||
              null,
 
            featured_post_title:
              featuredPostTitle.trim() ||
              null,
 
            featured_post_link:
              featuredPostLink.trim() ||
              null,


            /* ===============================================
               RUNAMBIZ DISCOVERY

               Free merchants cannot activate this
               preference through the normal UI.
            ================================================ */

            hide_runambiz_promotions:

              canHideRunambizPromotions

                ? hideRunambizPromotions

                : false,


            is_published:
              isPublished,

            updated_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            business.id
          )
          .select()
          .single();


      if (
        updateError
      ) {

        throw updateError;

      }


      setSuccess(
        "Store settings saved successfully."
      );


      if (
        onBusinessChanged
      ) {

        await onBusinessChanged(
          data
        );

      }


    } catch (err) {


      console.error(
        "Save store error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't save your store."
      );


    } finally {

      setSaving(
        false
      );

    }

  }



  /* =======================================================
     PUBLISH / UNPUBLISH
  ======================================================= */

  async function changePublishStatus(
    nextValue
  ) {


    clearMessages();


    if (
      nextValue &&
      !readyToPublish
    ) {

      setError(
        "Your store needs at least one active product and one active payment method before publishing."
      );

      return;

    }


    setSaving(
      true
    );


    try {


      const {
        data,
        error:
          publishError
      } =
        await supabase
          .from(
            "businesses"
          )
          .update({

            is_published:
              nextValue,

            updated_at:
              new Date()
                .toISOString()

          })
          .eq(
            "id",
            business.id
          )
          .select()
          .single();


      if (
        publishError
      ) {

        throw publishError;

      }


      setIsPublished(
        nextValue
      );


      setSuccess(

        nextValue

          ? "Your storefront is now published."

          : "Your storefront has been unpublished."

      );


      if (
        onBusinessChanged
      ) {

        await onBusinessChanged(
          data
        );

      }


    } catch (err) {


      setError(
        err?.message ||
        "We couldn't change your store status."
      );


    } finally {

      setSaving(
        false
      );

    }

  }



  /* =======================================================
     IMAGE UPLOAD
  ======================================================= */

  async function uploadStoreAsset(
    file,
    type
  ) {


    if (!file) {
      return;
    }


    if (
      !file.type
        .startsWith(
          "image/"
        )
    ) {

      setError(
        "Please choose an image file."
      );

      return;

    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      setError(
        "Image must be smaller than 5MB."
      );

      return;

    }


    const setUploading =
      type === "logo"
        ? setUploadingLogo
        : setUploadingCover;


    setUploading(
      true
    );


    clearMessages();


    let newPath =
      "";


    try {


      const {
        data:
          authData,

        error:
          authError
      } =
        await supabase.auth
          .getUser();


      if (
        authError
      ) {

        throw authError;

      }


      const userId =
        authData?.user?.id;


      if (!userId) {

        throw new Error(
          "You need to sign in again."
        );

      }


      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";


      const safeExtension =
        extension
          .replace(
            /[^a-z0-9]/g,
            ""
          )
          .slice(
            0,
            5
          ) ||
        "jpg";


      newPath =
        `${userId}/${type}/` +
        `${crypto.randomUUID()}.${safeExtension}`;


      const {
        error:
          uploadError
      } =
        await supabase.storage
          .from(
            "store-assets"
          )
          .upload(
            newPath,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false
            }
          );


      if (
        uploadError
      ) {

        throw uploadError;

      }


      const {
        data:
          publicUrlData
      } =
        supabase.storage
          .from(
            "store-assets"
          )
          .getPublicUrl(
            newPath
          );


      const publicUrl =
        publicUrlData
          ?.publicUrl;


      if (!publicUrl) {

        throw new Error(
          "Could not create image URL."
        );

      }


      const oldPath =
        type === "logo"
          ? logoPath
          : coverPath;


      const updatePayload =
        type === "logo"

          ? {
              logo_url:
                publicUrl,

              logo_path:
                newPath
            }

          : {
              cover_url:
                publicUrl,

              cover_path:
                newPath
            };


      const {
        data:
          updatedBusiness,

        error:
          databaseError
      } =
        await supabase
          .from(
            "businesses"
          )
          .update(
            updatePayload
          )
          .eq(
            "id",
            business.id
          )
          .select()
          .single();


      if (
        databaseError
      ) {

        await supabase.storage
          .from(
            "store-assets"
          )
          .remove(
            [
              newPath
            ]
          );


        throw databaseError;

      }


      if (
        type ===
        "logo"
      ) {

        setLogoUrl(
          publicUrl
        );

        setLogoPath(
          newPath
        );

      } else {

        setCoverUrl(
          publicUrl
        );

        setCoverPath(
          newPath
        );

      }


      /*
        Remove previous image only after
        the new one saved successfully.
      */

      if (
        oldPath &&
        oldPath !==
          newPath
      ) {

        await supabase.storage
          .from(
            "store-assets"
          )
          .remove(
            [
              oldPath
            ]
          );

      }


      setSuccess(

        type === "logo"

          ? "Store logo updated."

          : "Store cover updated."

      );


      if (
        onBusinessChanged
      ) {

        await onBusinessChanged(
          updatedBusiness
        );

      }


    } catch (err) {


      console.error(
        "Store asset upload error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't upload this image."
      );


    } finally {

      setUploading(
        false
      );

    }

  }



  /* =======================================================
     REMOVE ASSET
  ======================================================= */

  async function removeStoreAsset(
    type
  ) {


    const currentPath =
      type === "logo"
        ? logoPath
        : coverPath;


    const fields =
      type === "logo"

        ? {
            logo_url:
              null,

            logo_path:
              null
          }

        : {
            cover_url:
              null,

            cover_path:
              null
          };


    clearMessages();


    try {


      const {
        data,
        error
      } =
        await supabase
          .from(
            "businesses"
          )
          .update(
            fields
          )
          .eq(
            "id",
            business.id
          )
          .select()
          .single();


      if (error) {
        throw error;
      }


      if (
        currentPath
      ) {

        await supabase.storage
          .from(
            "store-assets"
          )
          .remove(
            [
              currentPath
            ]
          );

      }


      if (
        type === "logo"
      ) {

        setLogoUrl("");

        setLogoPath("");

      } else {

        setCoverUrl("");

        setCoverPath("");

      }


      setSuccess(
        `${type === "logo" ? "Logo" : "Cover"} removed.`
      );


      if (
        onBusinessChanged
      ) {

        await onBusinessChanged(
          data
        );

      }


    } catch (err) {


      setError(
        err?.message ||
        "We couldn't remove this image."
      );

    }

  }


    /* =======================================================
     LINK IN BIO IMAGE
  ======================================================= */

  async function uploadLinkImage(index, file) {

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Link image must be smaller than 2MB.");
      return;
    }

    clearMessages();

    setUploadingLinkIndex(index);

    try {

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      const userId = authData?.user?.id;

      if (!userId) {
        throw new Error("You need to sign in again.");
      }

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const safeExtension =
        extension.replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";

      const newPath =
        `${userId}/link/${crypto.randomUUID()}.${safeExtension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("store-assets")
          .upload(newPath, file, {
            cacheControl: "3600",
            upsert: false
          });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("store-assets")
          .getPublicUrl(newPath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        throw new Error("Could not create image URL.");
      }

      updateLinkInBioItem(index, "imageUrl", publicUrl);

      updateLinkInBioItem(index, "imagePath", newPath);

    } catch (err) {

      console.error("Link image upload error:", err);

      setError(
        err?.message || "We couldn't upload this image."
      );

    } finally {

      setUploadingLinkIndex(null);

    }

  }


  async function uploadFeaturedPostImage(file) {
 
    if (!file) {
      return;
    }
 
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
 
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }
 
    clearMessages();
 
    setUploadingFeaturedPost(true);
 
    try {
 
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
 
      if (authError) {
        throw authError;
      }
 
      const userId = authData?.user?.id;
 
      if (!userId) {
        throw new Error("You need to sign in again.");
      }
 
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";
 
      const safeExtension =
        extension.replace(/[^a-z0-9]/g, "").slice(0, 5) || "jpg";
 
      const newPath =
        `${userId}/featured/${crypto.randomUUID()}.${safeExtension}`;
 
      const { error: uploadError } =
        await supabase.storage
          .from("store-assets")
          .upload(newPath, file, {
            cacheControl: "3600",
            upsert: false
          });
 
      if (uploadError) {
        throw uploadError;
      }
 
      const { data: publicUrlData } =
        supabase.storage
          .from("store-assets")
          .getPublicUrl(newPath);
 
      const publicUrl = publicUrlData?.publicUrl;
 
      if (!publicUrl) {
        throw new Error("Could not create image URL.");
      }
 
      /* Clear the previous file only after the new one is
         safely uploaded — otherwise a failure mid-way leaves
         the merchant with nothing. */
 
      const oldPath = featuredPostImagePath;
 
      setFeaturedPostImageUrl(publicUrl);
      setFeaturedPostImagePath(newPath);
 
      if (oldPath && oldPath !== newPath) {
        await supabase.storage
          .from("store-assets")
          .remove([oldPath]);
      }
 
    } catch (err) {
 
      console.error("Featured post upload error:", err);
 
      setError(err?.message || "We couldn't upload this image.");
 
    } finally {
 
      setUploadingFeaturedPost(false);
 
    }
 
  }
 

  /* =======================================================
     COPY LINK
  ======================================================= */

  async function copyStorefrontUrl() {


    if (!storefrontUrl) {
      return;
    }


    try {


      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {

        await navigator.clipboard
          .writeText(
            storefrontUrl
          );

      } else {


        const textarea =
          document.createElement(
            "textarea"
          );


        textarea.value =
          storefrontUrl;


        textarea.style.position =
          "fixed";


        textarea.style.opacity =
          "0";


        document.body
          .appendChild(
            textarea
          );


        textarea.select();


        document.execCommand(
          "copy"
        );


        textarea.remove();

      }


      setCopied(
        true
      );


      setTimeout(
        () => {

          setCopied(
            false
          );

        },
        1500
      );


    } catch (err) {

      console.error(
        "Copy URL error:",
        err
      );

    }

  }



  function openStorefront() {

    if (
      !storefrontUrl ||
      !isPublished
    ) {

      return;
    }


    window.open(
      storefrontUrl,
      "_blank",
      "noopener,noreferrer"
    );

  }



  function clearMessages() {

    setError("");

    setSuccess("");

  }



  /* =========================================================
   FIRST-TIME AI STORE SETUP

   New merchants don't need to see dozens
   of Store settings before AI helps them.
========================================================= */

if (
  !aiSetupComplete
) {

  return (

    <main className="dashboard-content store-page">


    <StoreAiAssistant

  business={
    business
  }

  open={
    storeAiOpen
  }

  onClose={() =>
    setStoreAiOpen(
      false
    )
  }

  onBusinessChanged={
    onBusinessChanged
  }

/>



      <section className="store-ai-first">


        <div className="store-ai-first-glow">
          <Sparkles
            size={29}
          />
        </div>


        <span className="dashboard-eyebrow">
          Runambiz AI
        </span>


        <h1>
          Your Store is almost ready.
        </h1>


        <p>
          Don't fill a long list of settings.
          Runambiz already knows some information
          about your business. Answer a few simple
          questions and AI will prepare the rest.
        </p>


        <div className="store-ai-first-grid">


          <div>
            <CheckCircle2
              size={17}
            />

            <span>
              Business description
            </span>
          </div>


          <div>
            <CheckCircle2
              size={17}
            />

            <span>
              About section
            </span>
          </div>


          <div>
            <CheckCircle2
              size={17}
            />

            <span>
              FAQs and policies
            </span>
          </div>


          <div>
            <CheckCircle2
              size={17}
            />

            <span>
              Delivery information
            </span>
          </div>


          <div>
            <CheckCircle2
              size={17}
            />

            <span>
              Business hours
            </span>
          </div>


          <div>
            <CheckCircle2
              size={17}
            />

            <span>
              AI customer behaviour
            </span>
          </div>


        </div>


        <div className="store-ai-first-images">

          <ImagePlus
            size={19}
          />

          <div>

            <strong>
              Images remain manual.
            </strong>

            <span>
              After AI builds the Store, you can
              upload your own logo, cover and product
              images from the normal Store settings.
            </span>

          </div>

        </div>


        <button

          type="button"

          className="store-ai-first-button"

          onClick={() =>
            setStoreAiOpen(
              true
            )
          }

        >

          <Sparkles
            size={18}
          />

          {aiSetupInProgress
            ? "Continue building my Store"
            : "Build my Store with AI"}

          <span>
            20 Credits
          </span>

        </button>


        <small className="store-ai-first-note">

          One charge covers the complete
          first-time AI Store setup.

        </small>


      </section>


    </main>

  );

}



    /* =======================================================
     FAQ EDITOR
  ======================================================= */

  function addFaq() {


    setFaqs(
      current => [

        ...current,

        {
          question: "",
          answer: ""
        }

      ]
    );


  }


  function updateFaq(
    index,
    field,
    value
  ) {


    setFaqs(

      current =>
        current.map(
          (
            item,
            itemIndex
          ) => {


            if (
              itemIndex !==
              index
            ) {

              return item;

            }


            return {

              ...item,

              [field]:
                value

            };


          }
        )

    );


  }


  function removeFaq(
    index
  ) {


    setFaqs(

      current =>
        current.filter(
          (
            _,
            itemIndex
          ) =>
            itemIndex !==
            index
        )

    );


  }



  /* =======================================================
     LINK IN BIO EDITOR
  ======================================================= */

  function addLinkInBioItem() {


    setLinkInBioLinks(
      current => [

        ...current,

              {
          label: "",
          url: "",
          imageUrl: "",
          imagePath: ""
        }

      ]
    );


  }


  function updateLinkInBioItem(
    index,
    field,
    value
  ) {


    setLinkInBioLinks(

      current =>
        current.map(
          (
            item,
            itemIndex
          ) => {


            if (
              itemIndex !==
              index
            ) {

              return item;

            }


            return {

              ...item,

              [field]:
                value

            };


          }
        )

    );


  }


  function removeLinkInBioItem(
    index
  ) {


    setLinkInBioLinks(

      current =>
        current.filter(
          (
            _,
            itemIndex
          ) =>
            itemIndex !==
            index
        )

    );


  }


  return (

    <main className="dashboard-content store-page">


      {/* ===================================================
          HEADER
      ==================================================== */}

      <header className="store-page-header">


        <div>


          <span className="dashboard-eyebrow">
            Commerce
          </span>


          <h1>
            Store
          </h1>


          <p>
            Manage everything customers see
            and use on your storefront.
          </p>


        </div>


<div className="store-header-actions">


<button

  type="button"

  className="store-ai-main-button"

  onClick={() =>
    setStoreAiOpen(
      true
    )
  }

>

  <Sparkles
    size={17}
  />

  Ask Runambiz AI

</button>


    <button

          type="button"

          className="store-save-main"

          disabled={
            saving
          }

          onClick={
            saveStore
          }
        >

          {saving ? (

            <>
              <Loader2
                size={17}
                className="spin"
              />

              Saving
            </>

          ) : (

            <>
              <Save
                size={17}
              />

              Save changes
            </>

          )}

        </button>

</div>

      

      </header>



      {/* ===================================================
          OVERVIEW
      ==================================================== */}

      <section className="store-overview-card">


        <div className="store-overview-main">


          <div
            className={
              isPublished
                ? "store-status-icon live"
                : "store-status-icon draft"
            }
          >

            {isPublished ? (

              <Globe2
                size={22}
              />

            ) : (

              <EyeOff
                size={22}
              />

            )}

          </div>


          <div>


            <div className="store-overview-title-row">


              <h2>
                Storefront
              </h2>


              <span
                className={
                  isPublished
                    ? "store-status-badge published"
                    : "store-status-badge unpublished"
                }
              >

                {isPublished
                  ? "Published"
                  : "Unpublished"}

              </span>


            </div>


              {isPaidMember && (

                <span className="runambiz-member-badge">

                  <BadgeCheck
                    size={14}
                  />

                  Runambiz Member

                </span>

              )}


            <p>
              Your public customer-facing
              shopping website.
            </p>


          </div>


        </div>



        <div className="store-url-box">


          <span>
            STOREFRONT URL
          </span>


          <div className="store-url-value">


            <Globe2
              size={15}
            />


            <strong>
  {business?.slug
    ? `app.runambiz.com/store/${business.slug}`
    : "app.runambiz.com/store/yourstore"}
</strong>


          </div>


          <div className="store-url-actions">


            <button
              type="button"
              onClick={
                copyStorefrontUrl
              }
            >

              {copied ? (

                <>
                  <Check
                    size={15}
                  />

                  Copied
                </>

              ) : (

                <>
                  <Copy
                    size={15}
                  />

                  Copy link
                </>

              )}

            </button>


            <button

              type="button"

              className="preview-storefront-button"

              disabled={
                !isPublished
              }

              onClick={
                openStorefront
              }
            >

              <ExternalLink
                size={15}
              />

              {isPublished
                ? "Preview storefront"
                : "Publish to preview"}

            </button>


          </div>


        </div>


      </section>



      {/* ===================================================
          READINESS
      ==================================================== */}

      <section className="store-readiness">


        <div className="store-readiness-heading">


          <div>

            <h2>
              Store readiness
            </h2>

            <p>
              Complete these before publishing.
            </p>

          </div>


          {readyToPublish && (

            <span className="ready-badge">

              <CheckCircle2
                size={14}
              />

              Ready

            </span>

          )}


        </div>



        <div className="store-readiness-grid">


          <ReadinessItem
            done={
              hasBusinessName
            }
            label="Store details"
          />


          <ReadinessItem
            done={
              hasCountry
            }
            label="Country & currency"
          />


          <ReadinessItem
            done={
              hasProduct
            }
            label={
              loadingReadiness
                ? "Checking products..."
                : `${activeProductCount} active product${activeProductCount === 1 ? "" : "s"}`
            }
          />


          <ReadinessItem
            done={
              hasPayment
            }
            label={
              loadingReadiness
                ? "Checking payments..."
                : `${paymentMethodCount} payment method${paymentMethodCount === 1 ? "" : "s"}`
            }
          />


        </div>


      </section>



      <form
        onSubmit={
          saveStore
        }
        className="store-settings-stack"
      >


        {/* =================================================
            STORE DETAILS
        ================================================== */}

        <StoreSection

          icon={
            <StoreIcon
              size={19}
            />
          }

          title="Store details"

          description="Basic information customers see on your storefront."
        >


          <div className="store-fields-two">


            <StoreField
              label="Business / store name"
            >

             <input
  value={storeName}

  onChange={
    event =>
      setStoreName(
        event.target.value
      )
  }

  placeholder="e.g. Wumight Collection"

  style={{
   
    padding: "14px 16px",
    fontSize: "14px",
    fontFamily: "'Manrope', sans-serif",
    color: "var(--ink)",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s var(--ease)"
  }}
/>

            </StoreField>



            <StoreField
              label="Location"
            >

              <div className="store-input-icon">

                <MapPin
                  size={16}
                />

                <input
                  value={
                    location
                  }

                  onChange={
                    event =>
                      setLocation(
                        event.target.value
                      )
                  }

                  placeholder="e.g. Lagos"
                />

              </div>

            </StoreField>


          </div>



          <StoreField
            label="Store description"
          >

            <textarea
              value={
                description
              }

              maxLength="700"

              rows="4"

              placeholder="Tell customers about your business..."

              onChange={
                event =>
                  setDescription(
                    event.target.value
                  )
              }
            />

          </StoreField>



          <div className="store-fields-two">


            <StoreField
              label="Country"
            >

              <select
                value={
                  countryCode
                }

                onChange={
                  event =>
                    handleCountryChange(
                      event.target.value
                    )
                }
              >

                {RUNAMBIZ_COUNTRIES_UNIQUE.map(
                  country => (

                    <option
                      key={
                        country.code
                      }

                      value={
                        country.code
                      }
                    >

                      {country.name}

                    </option>

                  )
                )}

              </select>

            </StoreField>



            <StoreField
              label="Currency"
            >

              <select
                value={
                  currency
                }

                onChange={
                  event =>
                    setCurrency(
                      event.target.value
                    )
                }
              >

                {currencyOptions.map(
                  code => (

                    <option
                      key={
                        code
                      }

                      value={
                        code
                      }
                    >

                      {code}

                    </option>

                  )
                )}

              </select>


              <small>
                Changing currency does not
                convert existing product prices.
              </small>

            </StoreField>


          </div>


        </StoreSection>



        {/* =================================================
            CUSTOMER CONTACT
        ================================================== */}

        <StoreSection

          icon={
            <MessageCircle
              size={19}
            />
          }

          title="Customer contact"

          description="How customers can reach your business."
        >


          <div className="store-fields-three">


            <StoreField
              label="WhatsApp number"
            >

              <div className="store-input-icon">

                <MessageCircle
                  size={16}
                />

                <input
                  type="tel"

                  value={
                    whatsapp
                  }

                  placeholder="+234..."
                  onChange={
                    event =>
                      setWhatsapp(
                        event.target.value
                      )
                  }
                />

              </div>


              <small>
                Used by the Contact Seller button.
              </small>

            </StoreField>



            <StoreField
              label="Support email"
            >

              <div className="store-input-icon">

                <Mail
                  size={16}
                />

                <input
                  type="email"

                  value={
                    supportEmail
                  }

                  placeholder="support@business.com"

                  onChange={
                    event =>
                      setSupportEmail(
                        event.target.value
                      )
                  }
                />

              </div>

            </StoreField>



            <StoreField
              label="Phone number"
            >

              <div className="store-input-icon">

                <Phone
                  size={16}
                />

                <input
                  type="tel"

                  value={
                    supportPhone
                  }

                  placeholder="+234..."

                  onChange={
                    event =>
                      setSupportPhone(
                        event.target.value
                      )
                  }
                />

              </div>

            </StoreField>


          </div>

          <StoreField
            label="Business hours"
          >

            <div className="store-input-icon">

              <Clock3
                size={16}
              />

              <input

                type="text"

                value={
                  businessHours
                }

                placeholder="e.g. Mon - Sat, 8am - 6pm"

                onChange={
                  event =>
                    setBusinessHours(
                      event.target.value
                    )
                }

              />

            </div>


            <small>
              Customers will see when your
              business is normally available.
            </small>

          </StoreField>

        </StoreSection>


        {/* =================================================
            WEBSITE CONTENT
        ================================================== */}

        <StoreSection

          icon={
            <Globe2
              size={19}
            />
          }

          title="Website content"

          description="Build the information sections customers see on your full storefront."
        >


          {/* ANNOUNCEMENT */}

          <div className="store-toggle-list">

            <StoreToggle

              icon={
                <Megaphone
                  size={17}
                />
              }

              title="Announcement bar"

              description="Show an offer, delivery notice or important message at the top of your storefront."

              checked={
                announcementEnabled
              }

              onChange={
                setAnnouncementEnabled
              }

            />

          </div>


          {announcementEnabled && (

            <StoreField
              label="Announcement message"
            >

              <input

                type="text"

                value={
                  announcementText
                }

                maxLength="180"

                placeholder="e.g. Free delivery in Lagos on orders above ₦50,000"

                onChange={
                  event =>
                    setAnnouncementText(
                      event.target.value
                    )
                }

              />

              <small>
                Keep this short so it looks
                clean on mobile devices.
              </small>

            </StoreField>

          )}



          {/* ABOUT */}

          <div className="store-subsection">

            <div className="store-subsection-heading">

              <div>

                <strong>
                  About your business
                </strong>

                <span>
                  Help customers understand who
                  they're buying from.
                </span>

              </div>

            </div>


            <StoreField
              label="About heading"
            >

              <input

                type="text"

                value={
                  aboutTitle
                }

                placeholder={
                  `About ${
                    storeName ||
                    "our business"
                  }`
                }

                onChange={
                  event =>
                    setAboutTitle(
                      event.target.value
                    )
                }

              />

            </StoreField>


            <StoreField
              label="About text"
            >

              <textarea

                rows="5"

                maxLength="2000"

                value={
                  aboutText
                }

                placeholder="Tell customers your story, what you sell and what makes your business different."

                onChange={
                  event =>
                    setAboutText(
                      event.target.value
                    )
                }

              />

            </StoreField>

          </div>



          {/* FAQ */}

          <div className="store-subsection">

            <div className="store-subsection-heading">

              <div>

                <strong>
                  Frequently asked questions
                </strong>

                <span>
                  Answer questions customers
                  repeatedly ask.
                </span>

              </div>


              <button

                type="button"

                className="store-mini-button"

                onClick={
                  addFaq
                }
              >

                <Plus
                  size={14}
                />

                Add FAQ

              </button>

            </div>


            {!faqs.length ? (

              <div className="store-editor-empty">

                <HelpCircle
                  size={20}
                />

                <strong>
                  No FAQs yet
                </strong>

                <span>
                  Add questions such as delivery,
                  payment or return information.
                </span>

              </div>

            ) : (

              <div className="store-repeat-list">

                {faqs.map(
                  (
                    faq,
                    index
                  ) => (

                    <div
                      key={
                        `faq-${index}`
                      }
                      className="store-repeat-card"
                    >


                      <div className="store-repeat-heading">

                        <strong>
                          FAQ {index + 1}
                        </strong>


                        <button

                          type="button"

                          aria-label="Remove FAQ"

                          onClick={() =>
                            removeFaq(
                              index
                            )
                          }
                        >

                          <Trash2
                            size={14}
                          />

                        </button>

                      </div>


                      <StoreField
                        label="Question"
                      >

                        <input

                          type="text"

                          value={
                            faq.question ||
                            ""
                          }

                          placeholder="Do you deliver nationwide?"

                          onChange={
                            event =>
                              updateFaq(
                                index,
                                "question",
                                event.target.value
                              )
                          }

                        />

                      </StoreField>


                      <StoreField
                        label="Answer"
                      >

                        <textarea

                          rows="3"

                          value={
                            faq.answer ||
                            ""
                          }

                          placeholder="Yes. Delivery time depends on your location."

                          onChange={
                            event =>
                              updateFaq(
                                index,
                                "answer",
                                event.target.value
                              )
                          }

                        />

                      </StoreField>


                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* SOCIAL LINKS */}

          <div className="store-subsection">

            <div className="store-subsection-heading">
              <div>
                <strong>Social media</strong>
                <span>
                  Add the profiles customers can visit from your storefront.
                </span>
              </div>
            </div>

            <div
              className="store-fields-two"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
                gap: "14px"
              }}
            >
              {SOCIAL_FIELDS.map(field => {
                const Icon = field.icon;

                return (
                  <StoreField key={field.key} label={field.label}>
                    <div style={{ position: "relative" }}>

                      <Icon
                        size={16}
                        style={{
                          position: "absolute",
                          left: "13px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          color: "var(--muted)",
                          transition: "color .24s ease"
                        }}
                      />

                      <input
                        type="url"
                        value={socialLinks[field.key]}
                        placeholder={field.placeholder}
                        onChange={event =>
                          setSocialLinks(current => ({
                            ...current,
                            [field.key]: event.target.value
                          }))
                        }
                        style={{ ...fieldStyle, paddingLeft: "39px" }}
                        onFocus={event => {
                          focusField(event);
                          event.target.previousSibling.style.color = "var(--field-focus)";
                        }}
                        onBlur={event => {
                          blurField(event);
                          event.target.previousSibling.style.color = "var(--muted)";
                        }}
                      />

                    </div>
                  </StoreField>
                );
              })}
            </div>

          </div>

        </StoreSection>




         <StoreSection
 
          icon={<ImagePlus size={19} />}
 
          title="Featured post"
 
          description="Highlight one piece of recent work or a product you want customers to see first."
        >
 
          <div className="store-toggle-list">
 
            <StoreToggle
 
              icon={<ImagePlus size={17} />}
 
              title="Show featured post"
 
              description="Appears between your store header and your products."
 
              checked={featuredPostEnabled}
 
              onChange={setFeaturedPostEnabled}
 
            />
 
          </div>
 
 
          {featuredPostEnabled && (
            <>
 
              <div className="store-asset-card">
 
                <div className="store-asset-preview cover">
                  {featuredPostImageUrl ? (
                    <img src={featuredPostImageUrl} alt="Featured post" />
                  ) : (
                    <ImagePlus size={24} />
                  )}
                </div>
 
                <div className="store-asset-info">
 
                  <strong>Featured image</strong>
 
                  <span>Landscape or square both work.</span>
 
                  <div className="store-asset-actions">
 
                    <label
                      htmlFor="featured-post-upload"
                      className="store-upload-button"
                    >
                      {uploadingFeaturedPost ? (
                        <>
                          <Loader2 size={14} className="spin" />
                          Uploading
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          {featuredPostImageUrl ? "Replace" : "Upload"}
                        </>
                      )}
                    </label>
 
                    <input
                      id="featured-post-upload"
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadingFeaturedPost}
                      onChange={event => {
                        const file = event.target.files?.[0];
                        if (file) uploadFeaturedPostImage(file);
                        event.target.value = "";
                      }}
                    />
 
                    {featuredPostImageUrl && (
                      <button
                        type="button"
                        className="store-remove-asset"
                        onClick={() => {
                          setFeaturedPostImageUrl("");
                          setFeaturedPostImagePath("");
                        }}
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    )}
 
                  </div>
 
                </div>
 
              </div>
 
 
              <div className="store-fields-two">
 
                <StoreField label="Small label">
                  <input
                    type="text"
                    value={featuredPostEyebrow}
                    maxLength="40"
                    placeholder="e.g. Recent work"
                    onChange={event =>
                      setFeaturedPostEyebrow(event.target.value)
                    }
                    style={fieldStyle}
                    onFocus={focusField}
                    onBlur={blurField}
                  />
                </StoreField>
 
 
                <StoreField label="Caption">
                  <input
                    type="text"
                    value={featuredPostTitle}
                    maxLength="90"
                    placeholder="e.g. Copper water curls · 16 inches"
                    onChange={event =>
                      setFeaturedPostTitle(event.target.value)
                    }
                    style={fieldStyle}
                    onFocus={focusField}
                    onBlur={blurField}
                  />
                </StoreField>
 
              </div>
 
 
              <StoreField label="Link (optional)">
                <input
                  type="url"
                  value={featuredPostLink}
                  placeholder="https://instagram.com/p/..."
                  onChange={event =>
                    setFeaturedPostLink(event.target.value)
                  }
                  style={fieldStyle}
                  onFocus={focusField}
                  onBlur={blurField}
                />
                <small>
                  Where customers go when they tap the post.
                  Leave empty to make it a plain image.
                </small>
              </StoreField>
 
            </>
          )}
 
        </StoreSection>
 


        {/* =================================================
            LINK IN BIO
        ================================================== */}

        <StoreSection
          icon={<Link2 size={19} />}
          title="Link in bio"
          description="Create a simple mobile page for Instagram, TikTok, WhatsApp and social profiles."
        >

          <div className="store-toggle-list">
            <StoreToggle
              icon={<Share2 size={17} />}
              title="Enable Link in Bio"
              description="Create a lightweight page using your existing Runambiz storefront."
              checked={linkInBioEnabled}
              onChange={setLinkInBioEnabled}
            />
          </div>

          {linkInBioEnabled && (
            <>

              <StoreField label="Link in Bio heading">
                <input
                  value={linkInBioTitle}
                  placeholder={storeName || "My links"}
                  onChange={event => setLinkInBioTitle(event.target.value)}
                  style={fieldStyle}
                  onFocus={focusField}
                  onBlur={blurField}
                />
              </StoreField>

              <div className="store-link-preview">
                <Link2 size={15} />
                <span>
                  {linkInBioUrl || "Your Link in Bio URL will appear here"}
                </span>
              </div>

              <div className="store-subsection-heading">
                <div>
                  <strong>Custom links</strong>
                  <span>
                    Add booking pages, catalogues, portfolios or other useful links.
                  </span>
                </div>

                <button
                  type="button"
                  className="store-mini-button"
                  onClick={addLinkInBioItem}
                >
                  <Plus size={14} />
                  Add link
                </button>
              </div>

              {!linkInBioLinks.length ? (

                <div className="store-editor-empty">
                  <Link2 size={20} />
                  <strong>No custom links</strong>
                  <span>Your Shop button will still appear automatically.</span>
                </div>

              ) : (

                <div className="store-repeat-list">
                  {linkInBioLinks.map((item, index) => (

                    <div key={`bio-link-${index}`} className="store-repeat-card">

                      <div className="store-repeat-heading">
                        <strong>Link {index + 1}</strong>

                        <button
                          type="button"
                          aria-label="Remove link"
                          onClick={() => removeLinkInBioItem(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>

                                           <div className="store-link-row">

                        <div className="store-link-thumb">

                          {item.imageUrl ? (
                            <>
                              <img src={item.imageUrl} alt="" />

                              <button
                                type="button"
                                className="store-link-thumb-clear"
                                aria-label="Remove image"
                                onClick={() =>
                                  updateLinkInBioItem(index, "imageUrl", "")
                                }
                              >
                                <X size={11} />
                              </button>
                            </>
                          ) : (
                            <span className="store-link-thumb-empty">
                              {uploadingLinkIndex === index ? (
                                <Loader2 size={16} className="spin" />
                              ) : (
                                <ImagePlus size={16} />
                              )}
                            </span>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            aria-label={`Upload image for link ${index + 1}`}
                            disabled={uploadingLinkIndex === index}
                            onChange={event => {
                              const file = event.target.files?.[0];
                              if (file) {
                                uploadLinkImage(index, file);
                              }
                              event.target.value = "";
                            }}
                          />

                        </div>


                        <div className="store-fields-two store-link-fields">

                          <StoreField label="Button label">
                            <input
                              value={item.label || ""}
                              placeholder="Book a consultation"
                              onChange={event =>
                                updateLinkInBioItem(index, "label", event.target.value)
                              }
                              style={fieldStyle}
                              onFocus={focusField}
                              onBlur={blurField}
                            />
                          </StoreField>

                          <StoreField label="Destination URL">
                            <input
                              type="url"
                              value={item.url || ""}
                              placeholder="https://..."
                              onChange={event =>
                                updateLinkInBioItem(index, "url", event.target.value)
                              }
                              style={fieldStyle}
                              onFocus={focusField}
                              onBlur={blurField}
                            />
                          </StoreField>

                        </div>

                      </div>

                    </div>

                  ))}
                </div>

              )}

            </>
          )}

        </StoreSection>




        {/* =================================================
            APPEARANCE
        ================================================== */}

        <StoreSection

          icon={
            <Palette
              size={19}
            />
          }

          title="Appearance"

          description="Customize how your customer-facing storefront looks."
        >


          {/* LOGO */}

          <div className="store-media-grid">


            <AssetUploader

              type="logo"

              label="Store logo"

              description="Square image works best."

              url={
                logoUrl
              }

              loading={
                uploadingLogo
              }

              onUpload={
                file =>
                  uploadStoreAsset(
                    file,
                    "logo"
                  )
              }

              onRemove={() =>
                removeStoreAsset(
                  "logo"
                )
              }

            />


            <AssetUploader

              type="cover"

              label="Cover / banner"

              description="Wide landscape image works best."

              url={
                coverUrl
              }

              loading={
                uploadingCover
              }

              onUpload={
                file =>
                  uploadStoreAsset(
                    file,
                    "cover"
                  )
              }

              onRemove={() =>
                removeStoreAsset(
                  "cover"
                )
              }

            />


          </div>



          {/* COLORS */}

          <div className="store-fields-two">


            <StoreField
              label="Primary colour"
            >

              <div className="store-color-input">

                <input
                  type="color"

                  value={
                    primaryColor
                  }

                  onChange={
                    event =>
                      setPrimaryColor(
                        event.target.value
                      )
                  }
                />


                <input
                  type="text"

                  value={
                    primaryColor
                  }

                  onChange={
                    event =>
                      setPrimaryColor(
                        event.target.value
                      )
                  }
                />

              </div>

            </StoreField>



            <StoreField
              label="Accent colour"
            >

              <div className="store-color-input">

                <input
                  type="color"

                  value={
                    accentColor
                  }

                  onChange={
                    event =>
                      setAccentColor(
                        event.target.value
                      )
                  }
                />


                <input
                  type="text"

                  value={
                    accentColor
                  }

                  onChange={
                    event =>
                      setAccentColor(
                        event.target.value
                      )
                  }
                />

              </div>

            </StoreField>


          </div>



          {/* TEMPLATES */}

          <StoreField
            label="Store template"
          >

            <div className="store-template-grid">


              <TemplateOption
                value="modern"
                current={
                  template
                }
                title="Modern"
                description="Clean SaaS-style shop."
                onChoose={
                  setTemplate
                }
              />


              <TemplateOption
                value="minimal"
                current={
                  template
                }
                title="Minimal"
                description="Simple and product-focused."
                onChoose={
                  setTemplate
                }
              />


              <TemplateOption
                value="boutique"
                current={
                  template
                }
                title="Boutique"
                description="Fashion and lifestyle feel."
                onChoose={
                  setTemplate
                }
              />


              <TemplateOption
                value="bold"
                current={
                  template
                }
                title="Bold"
                description="Strong visual storefront."
                onChoose={
                  setTemplate
                }
              />


            </div>

          </StoreField>


        </StoreSection>



        {/* =================================================
            STOREFRONT SETTINGS
        ================================================== */}

        <StoreSection

          icon={
            <Settings2
              size={19}
            />
          }

          title="Storefront settings"

          description="Choose what your customers see when browsing."
        >


          <div className="store-toggle-list">


            <StoreToggle

              icon={
                <Package
                  size={17}
                />
              }

              title="Show out-of-stock products"

              description="Customers can still see sold-out products."

              checked={
                showOutOfStock
              }

              onChange={
                setShowOutOfStock
              }

            />


            <StoreToggle

              icon={
                <ShoppingBag
                  size={17}
                />
              }

              title="Featured products"

              description="Show products marked as featured."

              checked={
                showFeatured
              }

              onChange={
                setShowFeatured
              }

            />


            <StoreToggle

              icon={
                <StoreIcon
                  size={17}
                />
              }

              title="Product categories"

              description="Allow customers to browse by category."

              checked={
                showCategories
              }

              onChange={
                setShowCategories
              }

            />

                        <StoreToggle

              icon={
                <MessageCircle
                  size={17}
                />
              }

              title="Customer contact section"

              description="Show WhatsApp, phone and email contact buttons on your storefront."

              checked={
                showContactSection
              }

              onChange={
                setShowContactSection
              }

            />


          </div>



          <StoreField
            label="Delivery information"
          >

            <textarea

              rows="4"

              value={
                deliveryInformation
              }

              placeholder="Example: Same-day delivery in Lagos. Outside Lagos takes 2–5 working days."

              onChange={
                event =>
                  setDeliveryInformation(
                    event.target.value
                  )
              }

            />

          </StoreField>



          <StoreField
            label="Payment information"
          >

            <textarea

              rows="4"

              value={
                paymentInformation
              }

              placeholder="Example: Payment is verified before orders are processed."

              onChange={
                event =>
                  setPaymentInformation(
                    event.target.value
                  )
              }

            />


            <small>
              Your actual bank/account details
              remain in Payments.
            </small>

          </StoreField>



          <StoreField
            label="Store policies"
          >

            <textarea

              rows="5"

              value={
                storePolicy
              }

              placeholder="Returns, exchanges, cancellations, custom orders or other store policies..."

              onChange={
                event =>
                  setStorePolicy(
                    event.target.value
                  )
              }

            />

          </StoreField>


        </StoreSection>


        {/* =================================================
            RUNAMBIZ DISCOVERY
        ================================================== */}

        <StoreSection

          icon={
            <Sparkles
              size={19}
            />
          }

          title="Runambiz Discovery"

          description="Manage membership, promotion eligibility and Runambiz recommendation settings."
        >


          <div className="store-discovery-grid">


            <div className="store-discovery-stat">

              <div className="store-discovery-icon">

                <BadgeCheck
                  size={18}
                />

              </div>


              <span>
                MEMBERSHIP
              </span>


              <strong>

                {isPaidMember
                  ? "Runambiz Member"
                  : "Free"}

              </strong>


              <small>

                {isPaidMember

                  ? "Member badge appears on your storefront."

                  : "Your storefront remains fully usable without a paid membership."}

              </small>

            </div>



            <div className="store-discovery-stat">

              <div className="store-discovery-icon">

                <Megaphone
                  size={18}
                />

              </div>


              <span>
                PRODUCT PROMOTION
              </span>


              <strong>

                {promotionEligible
                  ? "Eligible"
                  : "Not eligible"}

              </strong>


              <small>

                {promotionEligible

                  ? "Your products can be considered for Runambiz promotion and discovery."

                  : "Paid members can have products promoted across Runambiz."}

              </small>

            </div>



            <div className="store-discovery-stat">

              <div className="store-discovery-icon">

                <Sparkles
                  size={18}
                />

              </div>


              <span>
                PROMOTION WEIGHT
              </span>


              <strong>
                {promotionWeight}
              </strong>


              <small>

                {promotionWeight === 0
                  ? "Free plan"
                  : `Your current plan promotion weight is ${promotionWeight}.`}

              </small>

            </div>


          </div>



          <div className="store-toggle-list">

            <StoreToggle

              icon={
                <EyeOff
                  size={17}
                />
              }

              title="Hide Runambiz recommendations"

              description={

                canHideRunambizPromotions

                  ? "Turn off Runambiz promotional and recommended-product placements for your business."

                  : "Paid members can disable Runambiz promotional recommendations."

              }

              checked={

                canHideRunambizPromotions

                  ? hideRunambizPromotions

                  : false

              }

              disabled={
                !canHideRunambizPromotions
              }

              onChange={
                setHideRunambizPromotions
              }

            />

          </div>



          {!isPaidMember && (

            <div className="store-free-explanation">

              <StoreIcon
                size={17}
              />


              <div>

                <strong>
                  Free does not mean restricted selling.
                </strong>


                <span>
                  You can still use your storefront,
                  products, orders, payments,
                  WhatsApp automation and AI.
                  Paid membership mainly adds
                  visibility, status and extra benefits.
                </span>

              </div>

            </div>

          )}


        </StoreSection>



        {/* =================================================
            PUBLISHING
        ================================================== */}

        <StoreSection

          icon={
            <Globe2
              size={19}
            />
          }

          title="Publishing"

          description="Control whether customers can access and order from your storefront."
        >


          <div className="store-publishing-card">


            <div>


              <span className="store-publishing-label">
                STORE STATUS
              </span>


              <h3>
                {isPublished
                  ? "Your store is live"
                  : "Your store is currently unpublished"}
              </h3>


              <p>

                {isPublished

                  ? "Customers can browse products and place orders."

                  : readyToPublish

                    ? "Everything is ready. You can publish your storefront."

                    : "Complete the readiness checklist before publishing."}

              </p>


            </div>



            <button

              type="button"

              className={
                isPublished
                  ? "store-publish-button unpublish"
                  : "store-publish-button publish"
              }

              disabled={
                saving ||
                (
                  !isPublished &&
                  !readyToPublish
                )
              }

              onClick={() =>
                changePublishStatus(
                  !isPublished
                )
              }
            >

              {isPublished ? (

                <>
                  <EyeOff
                    size={16}
                  />

                  Unpublish
                </>

              ) : (

                <>
                  <Eye
                    size={16}
                  />

                  Publish store
                </>

              )}

            </button>


          </div>


        </StoreSection>


<CustomDomainSection
  business={business}
  onBusinessChanged={onBusinessChanged}
/>


        {/* =================================================
            MESSAGE
        ================================================== */}

        {error && (

          <div className="store-page-error">

            {error}

          </div>

        )}


        {success && (

          <div className="store-page-success">

            <CheckCircle2
              size={17}
            />

            {success}

          </div>

        )}



        <button
          type="submit"
          className="store-save-bottom"
          disabled={
            saving
          }
        >

          {saving ? (

            <>
              <Loader2
                size={17}
                className="spin"
              />

              Saving...
            </>

          ) : (

            <>
              <Save
                size={17}
              />

              Save store settings
            </>

          )}

        </button>


      </form>


    </main>

  );

}


/* =========================================================
   SECTION COMPONENT
========================================================= */

function StoreSection({
  icon,
  title,
  description,
  children
}) {

  return (

    <section className="store-section-card">


      <div className="store-section-heading">


        <div className="store-section-icon">

          {icon}

        </div>


        <div>

          <h2>
            {title}
          </h2>


          <p>
            {description}
          </p>

        </div>


      </div>


      <div className="store-section-content">

        {children}

      </div>


    </section>

  );

}


/* =========================================================
   FIELD
========================================================= */

function StoreField({
  label,
  children
}) {

  return (

    <div className="store-field">


      <label>
        {label}
      </label>


      {children}


    </div>

  );

}


/* =========================================================
   READINESS
========================================================= */

function ReadinessItem({
  done,
  label
}) {

  return (

    <div
      className={
        done
          ? "readiness-item done"
          : "readiness-item"
      }
    >

      <div className="readiness-check">

        {done && (

          <Check
            size={13}
          />

        )}

      </div>


      <span>
        {label}
      </span>


    </div>

  );

}


/* =========================================================
   TOGGLE
========================================================= */

function StoreToggle({

  icon,

  title,

  description,

  checked,

  disabled = false,

  onChange

}) {


  return (

    <div
      className={

        disabled

          ? "store-toggle-row disabled"

          : "store-toggle-row"

      }
    >


      <div className="store-toggle-info">


        <div className="store-toggle-icon">

          {icon}

        </div>


        <div>

          <strong>
            {title}
          </strong>


          <span>
            {description}
          </span>

        </div>


      </div>



      <label className="store-switch">


        <input

          type="checkbox"

          checked={
            checked
          }

          disabled={
            disabled
          }

          onChange={
            event =>
              onChange(
                event.target.checked
              )
          }

        />


        <span></span>


      </label>


    </div>

  );

}

/* =========================================================
   TEMPLATE
========================================================= */

function TemplateOption({
  value,
  current,
  title,
  description,
  onChoose
}) {

  const selected =
    current ===
    value;


  return (

    <button

      type="button"

      className={
        selected
          ? "store-template-option selected"
          : "store-template-option"
      }

      onClick={() =>
        onChoose(
          value
        )
      }
    >


      <div className={`template-preview ${value}`}>

        <div></div>
        <div></div>
        <div></div>

      </div>


      <strong>
        {title}
      </strong>


      <span>
        {description}
      </span>


      {selected && (

        <div className="template-selected-check">

          <Check
            size={13}
          />

        </div>

      )}


    </button>

  );

}


/* =========================================================
   ASSET UPLOADER
========================================================= */

function AssetUploader({
  type,
  label,
  description,
  url,
  loading,
  onUpload,
  onRemove
}) {

  const inputId =
    `store-${type}-upload`;


  return (

    <div className="store-asset-card">


      <div className={`store-asset-preview ${type}`}>


        {url ? (

          <img
            src={
              url
            }

            alt={
              label
            }
          />

        ) : (

          <ImagePlus
            size={24}
          />

        )}


      </div>


      <div className="store-asset-info">


        <strong>
          {label}
        </strong>


        <span>
          {description}
        </span>


        <div className="store-asset-actions">


          <label
            htmlFor={
              inputId
            }
            className="store-upload-button"
          >

            {loading ? (

              <>
                <Loader2
                  size={14}
                  className="spin"
                />

                Uploading
              </>

            ) : (

              <>
                <Upload
                  size={14}
                />

                {url
                  ? "Replace"
                  : "Upload"}

              </>

            )}


          </label>


          <input
            id={
              inputId
            }

            type="file"

            accept="image/*"

            hidden

            disabled={
              loading
            }

            onChange={
              event => {

                const file =
                  event.target
                    .files?.[0];


                if (file) {

                  onUpload(
                    file
                  );

                }


                event.target.value =
                  "";

              }
            }
          />


          {url && (

            <button

              type="button"

              className="store-remove-asset"

              onClick={
                onRemove
              }
            >

              <Trash2
                size={14}
              />

              Remove

            </button>

          )}


        </div>


      </div>


    </div>

  );

}