import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  CreditCard,
  ExternalLink,
  Globe2,
  Loader2,
  Mail,
  Clock,
  ArrowUpRight,
  
  Link as LinkIcon,
  MapPin,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  Trash2,
  Truck,
  X
} from "lucide-react";



import {
  supabase
} from "../lib/supabase";



import {
  formatAmount
} from "../lib/countries";



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


const SOCIAL_ICONS = {
  instagram: Instagram,
  tiktok: TikTok,
  facebook: Facebook,
  x: XLogo
};

/* =========================================================
   PUBLIC STORE
========================================================= */

export default function PublicStore() {

function getStoreSlug() {

  const hostname =
    window.location.hostname
      .toLowerCase();


 

  if (
    hostname.endsWith(
      ".runambiz.com"
    )
  ) {

    const subdomain =
      hostname.replace(
        ".runambiz.com",
        ""
      );


    if (
      subdomain &&
      subdomain !== "www"
    ) {

      return subdomain;

    }

  }


  

  const params =
    new URLSearchParams(
      window.location.search
    );


  return params.get(
    "store"
  );

}


const storeSlug =
  getStoreSlug();



  const [
    business,
    setBusiness
  ] =
    useState(null);


  const [
    products,
    setProducts
  ] =
    useState([]);

const [
  discoveryBusinesses,
  setDiscoveryBusinesses
] =
  useState([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


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
    category,
    setCategory
  ] =
    useState("all");


  const [
    sort,
    setSort
  ] =
    useState(
      "featured"
    );


  const [
    selectedProduct,
    setSelectedProduct
  ] =
    useState(null);


  const [
    access,
    setAccess
  ] =
    useState({

      paidMember:
        false,

      memberLabel:
        null,

      promotionEligible:
        false,

      promotionWeight:
        0,

      showRunambizPromotions:
        true

    });


  const [
    cart,
    setCart
  ] =
    useState([]);



  const [
    cartOpen,
    setCartOpen
  ] =
    useState(false);


  const [
    checkoutOpen,
    setCheckoutOpen
  ] =
    useState(false);


  const [
    orderResult,
    setOrderResult
  ] =
    useState(null);



  /* =========================================================
     LOAD CART
  ========================================================= */

  useEffect(() => {

    if (!storeSlug) {
      return;
    }


    try {

      const saved =
        localStorage.getItem(
          `runambiz_cart_${storeSlug}`
        );


      if (saved) {

        setCart(
          JSON.parse(
            saved
          )
        );

      }

    } catch {

      /*
        Ignore damaged local cart.
      */

    }

  }, [
    storeSlug
  ]);



  /* =========================================================
     SAVE CART
  ========================================================= */

  useEffect(() => {

    if (!storeSlug) {
      return;
    }


    localStorage.setItem(
      `runambiz_cart_${storeSlug}`,
      JSON.stringify(
        cart
      )
    );

  }, [
    cart,
    storeSlug
  ]);



  /* =========================================================
     LOAD STORE
  ========================================================= */

  useEffect(() => {

    loadStore();

  }, [
    storeSlug
  ]);


  async function loadStore() {


    if (!storeSlug) {

      setError(
        "Store link is incomplete."
      );

      setLoading(
        false
      );

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
          functionError
      } =
        await supabase
          .functions
          .invoke(
            "get-storefront",
            {
              body: {

                businessSlug:
                  storeSlug

              }
            }
          );


      if (
        functionError
      ) {

        throw functionError;

      }


      if (
        !data?.business
      ) {

        throw new Error(
          "This store is not available."
        );

      }


         const nextProducts =
        data.products ||
        [];


      setBusiness(
        data.business
      );


      setProducts(
        nextProducts
      );

      setDiscoveryBusinesses(

  Array.isArray(
    data.discovery
  )

    ? data.discovery

    : []

);

      setAccess({

        paidMember:
          data.access
            ?.paidMember ===
          true,


        memberLabel:
          data.access
            ?.memberLabel ||
          null,


        promotionEligible:
          data.access
            ?.promotionEligible ===
          true,


        promotionWeight:
          Number(
            data.access
              ?.promotionWeight ||
            0
          ),


        showRunambizPromotions:
          data.access
            ?.showRunambizPromotions !==
          false

      });



      /*
        Support direct product links such as:

        ?store=wumight&product=red-dress-x7ds2
      */

      const params =
        new URLSearchParams(
          window.location.search
        );


      const requestedProduct =
        params.get(
          "product"
        );


      if (
        requestedProduct
      ) {


        const matchingProduct =
          nextProducts.find(
            product =>
              product.slug ===
              requestedProduct
          );


        if (
          matchingProduct
        ) {

          setSelectedProduct(
            matchingProduct
          );

        }


      }


      document.title =
        `${data.business.name} · Runambiz`;


    } catch (err) {


      console.error(
        "Store load error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't load this store."
      );


    } finally {


      setLoading(
        false
      );

    }

  }



  /* =========================================================
     STOREFRONT PRODUCTS
  ========================================================= */

  const visibleProducts =
    useMemo(
      () => {


        return products.filter(
          product => {


            if (
              business
                ?.show_out_of_stock !==
              false
            ) {

              return true;

            }


            const soldOut =
              product
                .track_inventory ===
                true

              &&

              Number(
                product
                  .stock_quantity ||
                0
              ) <= 0;


            return !soldOut;


          }
        );


      },
      [
        products,
        business
          ?.show_out_of_stock
      ]
    );



  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories =
    useMemo(
      () => {


        return [

          ...new Set(

            visibleProducts
              .map(
                product =>
                  String(
                    product.category ||
                    ""
                  )
                    .trim()
              )
              .filter(
                Boolean
              )

          )

        ]
          .sort(
            (
              a,
              b
            ) =>
              a.localeCompare(
                b
              )
          );


      },
      [
        visibleProducts
      ]
    );



  /* =========================================================
     FEATURED PRODUCTS
  ========================================================= */

  const featuredProducts =
    useMemo(
      () => {


        if (
          business
            ?.show_featured_products ===
          false
        ) {

          return [];

        }


        return visibleProducts
          .filter(
            product =>
              product
                .is_featured ===
              true
          )
          .slice(
            0,
            8
          );


      },
      [
        visibleProducts,
        business
          ?.show_featured_products
      ]
    );



  /* =========================================================
     SEARCH + CATEGORY + SORT
  ========================================================= */

  const filteredProducts =
    useMemo(
      () => {


        const term =
          search
            .trim()
            .toLowerCase();


        let next =
          visibleProducts.filter(
            product => {


              const productName =
                String(
                  product.name ||
                  ""
                )
                  .toLowerCase();


              const productCategory =
                String(
                  product.category ||
                  ""
                )
                  .toLowerCase();


              const productDescription =
                String(
                  product.description ||
                  ""
                )
                  .toLowerCase();


              const matchesSearch =

                !term

                ||

                productName.includes(
                  term
                )

                ||

                productCategory.includes(
                  term
                )

                ||

                productDescription.includes(
                  term
                );


              const matchesCategory =

                category ===
                  "all"

                ||

                product.category ===
                  category;


              return (

                matchesSearch

                &&

                matchesCategory

              );


            }
          );



        if (
          sort ===
          "price-low"
        ) {


          next =
            [...next]
              .sort(
                (
                  a,
                  b
                ) =>

                  Number(
                    a.price ||
                    0
                  )

                  -

                  Number(
                    b.price ||
                    0
                  )

              );


        } else if (
          sort ===
          "price-high"
        ) {


          next =
            [...next]
              .sort(
                (
                  a,
                  b
                ) =>

                  Number(
                    b.price ||
                    0
                  )

                  -

                  Number(
                    a.price ||
                    0
                  )

              );


        } else if (
          sort ===
          "newest"
        ) {


          next =
            [...next]
              .sort(
                (
                  a,
                  b
                ) =>

                  new Date(
                    b.created_at ||
                    0
                  ).getTime()

                  -

                  new Date(
                    a.created_at ||
                    0
                  ).getTime()

              );


        } else {


          /*
            Default:
            featured products first.
          */

          next =
            [...next]
              .sort(
                (
                  a,
                  b
                ) =>

                  Number(
                    b.is_featured ===
                    true
                  )

                  -

                  Number(
                    a.is_featured ===
                    true
                  )

              );


        }


        return next;


      },
      [
        visibleProducts,
        search,
        category,
        sort
      ]
    );



  /* =========================================================
     MONEY

     We KEEP your existing shared country formatter.

     No Intl.NumberFormat is needed here.
  ========================================================= */

  function formatMoney(
    value
  ) {


    return formatAmount(

      value,

      business
        ?.country_code,

      business
        ?.currency

    );


  }



  /* =========================================================
     STOREFRONT THEME
  ========================================================= */

  const storefrontStyle = {

    "--store-primary":
      business
        ?.primary_color ||
      "#5B21B6",

    "--store-accent":
      business
        ?.accent_color ||
      "#A3E635"

  };


  const storefrontTemplate =
    business
      ?.store_template ||
    "modern";



  /* =========================================================
     STORE URLS
  ========================================================= */

  const hostname =
    window.location.hostname
      .toLowerCase();


  const runningOnSubdomain =

    hostname.endsWith(
      ".runambiz.com"
    )

    &&

    hostname !==
      "www.runambiz.com";


  const storeHomeHref =

    runningOnSubdomain

      ? "/"

      : `/store.html?store=${
          business?.slug ||
          storeSlug
        }`;


  const linkInBioHref =

    runningOnSubdomain

      ? "/links"

      : `${storeHomeHref}&view=links`;



  /* =========================================================
     PRODUCT URL
  ========================================================= */

  function openProduct(
    product
  ) {


    setSelectedProduct(
      product
    );


    if (
      !product?.slug
    ) {

      return;

    }


    const url =
      new URL(
        window.location.href
      );


    url.searchParams.set(
      "product",
      product.slug
    );


    window.history
      .pushState(
        {},
        "",
        url
      );


  }


  function closeProduct() {


    setSelectedProduct(
      null
    );


    const url =
      new URL(
        window.location.href
      );


    url.searchParams.delete(
      "product"
    );


    window.history
      .replaceState(
        {},
        "",
        url
      );


  }



  /* =========================================================
     GENERAL CONTACT SELLER
  ========================================================= */

  function contactStore() {


    openSellerContact(
      business
    );


  }






  /* =========================================================
     CART
  ========================================================= */

  function addToCart(
    product
  ) {


    const soldOut =
      product.track_inventory &&
      Number(
        product.stock_quantity
      ) <= 0;


    if (soldOut) {
      return;
    }


    setCart(
      current => {


        const existing =
          current.find(
            item =>
              item.productId ===
              product.id
          );


        if (existing) {


          const maxStock =
            product.track_inventory
              ? Number(
                  product.stock_quantity
                )
              : 100;


          return current.map(
            item =>
              item.productId ===
                product.id

                ? {
                    ...item,

                    quantity:
                      Math.min(
                        item.quantity +
                        1,

                        maxStock
                      )
                  }

                : item
          );

        }


        return [
          ...current,

          {
            productId:
              product.id,

            name:
              product.name,

            price:
              Number(
                product.price ||
                0
              ),

            image:
              getProductImage(
                product
              ),

            quantity:
              1,

            trackInventory:
              product.track_inventory,

            stock:
              Number(
                product.stock_quantity ||
                0
              )
          }
        ];

      }
    );


    setCartOpen(
      true
    );

  }



  function changeQuantity(
    productId,
    nextQuantity
  ) {

    setCart(
      current =>
        current
          .map(
            item => {


              if (
                item.productId !==
                productId
              ) {

                return item;

              }


              const max =
                item.trackInventory
                  ? Math.max(
                      1,
                      item.stock
                    )
                  : 100;


              return {
                ...item,

                quantity:
                  Math.max(
                    1,
                    Math.min(
                      nextQuantity,
                      max
                    )
                  )
              };

            }
          )
    );

  }



  function removeFromCart(
    productId
  ) {

    setCart(
      current =>
        current.filter(
          item =>
            item.productId !==
            productId
        )
    );

  }



  const cartCount =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );


  const cartTotal =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          item.price *
          item.quantity
        ),
      0
    );



  /* =========================================================
     CHECKOUT
  ========================================================= */

  function startCheckout() {

    if (!cart.length) {
      return;
    }


    setCartOpen(
      false
    );


    setCheckoutOpen(
      true
    );


    setOrderResult(
      null
    );

  }



   /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading
  ) {


    return (

      <div className="public-store-loading">


        <div className="store-loading-logo">

          <Store
            size={28}
          />

        </div>


        <Loader2

          size={22}

          className="spin"

        />


        <span>
          Opening store...
        </span>


      </div>

    );


  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {

    return (

      <div className="public-store-error">


        <div>

          <Store size={30} />

        </div>


        <h1>
          Store unavailable
        </h1>


        <p>
          {error}
        </p>


        <a href="/">
          Visit Runambiz
        </a>


      </div>

    );

  }


    /* =========================================================
     WEBSITE CONTENT
  ========================================================= */

  const socials =
    business
      ?.social_links ||
    {};


  const faqs =
    Array.isArray(
      business
        ?.store_faqs
    )

      ? business.store_faqs

      : [];


  const linkInBioLinks =
    Array.isArray(
      business
        ?.link_in_bio_links
    )

      ? business
          .link_in_bio_links

      : [];


  const params =
    new URLSearchParams(
      window.location.search
    );


  const linkView =

    business
      ?.link_in_bio_enabled ===
      true

    &&

    (
      params.get(
        "view"
      ) ===
        "links"

      ||

      window.location.pathname
        .replace(
          /\/+$/,
          ""
        )
        .endsWith(
          "/links"
        )
    );



  /* =========================================================
     LINK IN BIO VIEW
  ========================================================= */

  if (
    linkView
  ) {


    let whatsappNumber =
      String(
        business
          ?.contact_whatsapp ||
        ""
      )
        .replace(
          /\D/g,
          ""
        );


    /*
      Convert Nigerian local numbers:

      090...
      →
      23490...
    */

    if (
      business
        ?.country_code ===
        "NG"

      &&

      whatsappNumber
        .startsWith(
          "0"
        )
    ) {

      whatsappNumber =
        `234${whatsappNumber.slice(
          1
        )}`;

    }


    if (
      whatsappNumber
        .startsWith(
          "00"
        )
    ) {

      whatsappNumber =
        whatsappNumber.slice(
          2
        );

    }


        const coverStyle = business.cover_url
      ? { ...storefrontStyle, "--link-cover": `url("${business.cover_url}")` }
      : storefrontStyle;

    return (
      <div className={business.cover_url ? "runambiz-link-page has-cover" : "runambiz-link-page"} style={coverStyle}>

        <div className="runambiz-link-backdrop" aria-hidden="true" />

        <main className="runambiz-link-card">

          <div className="runambiz-link-banner" aria-hidden="true">
            {business.cover_url && (
              <img src={business.cover_url} alt="" loading="eager" decoding="async" />
            )}
          </div>

          <div className="runambiz-link-logo">
            {business.logo_url ? (
              <img src={business.logo_url} alt={business.name} loading="eager" decoding="async" />
            ) : (
              business.name.charAt(0).toUpperCase()
            )}

            {access.paidMember && (
              <span className="runambiz-link-verified" title="Runambiz Member">
                <BadgeCheck size={13} />
              </span>
            )}
          </div>

          <div className="runambiz-link-identity">
            <h1>{business.link_in_bio_title || business.name}</h1>

            {business.business_type && (
              <span className="runambiz-link-role">{business.business_type}</span>
            )}

            {business.description && (
              <p>{business.description}</p>
            )}
          </div>

          <div className="runambiz-link-chips">

            {Object.entries(socials)
              .filter(([, url]) => Boolean(url))
              .map(([platform, url]) => {
                const Icon = SOCIAL_ICONS[platform] || Globe2;

                return (
                  <a key={platform} className="runambiz-chip" href={url} target="_blank" rel="noreferrer">
                    <Icon size={13} />
                    <span>{platform}</span>
                  </a>
                );
              })}

            {whatsappNumber && (
              <a className="runambiz-chip" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
                <MessageCircle size={13} />
                <span>WhatsApp</span>
              </a>
            )}

            {business.contact_phone && (
              <a className="runambiz-chip" href={`tel:${business.contact_phone}`}>
                <Phone size={13} />
                <span>Call</span>
              </a>
            )}

            {business.contact_email && (
              <a className="runambiz-chip" href={`mailto:${business.contact_email}`}>
                <Mail size={13} />
                <span>Email</span>
              </a>
            )}

          </div>

          {linkInBioLinks.length > 0 && (
            <div className="runambiz-link-list">
              {linkInBioLinks.map((item, index) => (
                <a key={`${item.url}-${index}`} className="runambiz-link-item" href={item.url} target="_blank" rel="noreferrer">
                  <span className="runambiz-link-thumb">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" loading="lazy" decoding="async" />
                    ) : (
                      <LinkIcon size={17} />
                    )}
                  </span>

                  <span className="runambiz-link-text">{item.label}</span>

                  <ArrowUpRight size={16} className="runambiz-link-arrow" />
                </a>
              ))}
            </div>
          )}

          <a className="runambiz-link-shop" href={storeHomeHref}>
            <ShoppingBag size={17} />
            Shop products
            <ArrowUpRight size={15} />
          </a>

          <span className="runambiz-link-powered">
            Powered by Runambiz
          </span>

        </main>

      </div>
    );
  }





  return (

    <div
      className={`public-store template-${storefrontTemplate}`}
      style={storefrontStyle}
    >


      {/* =====================================================
          ANNOUNCEMENT
      ====================================================== */}

      {business.announcement_enabled === true &&
        business.announcement_text && (

        <div className="store-announcement" role="status">
          {business.announcement_text}
        </div>

      )}


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="store-header">

  <div className="store-header-inner">

    <a className="store-brand" href={storeHomeHref}>

      <div className="store-business-mark">
        {business.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.name}
            loading="eager"
            decoding="async"
          />
        ) : (
          business.name.charAt(0).toUpperCase()
        )}
      </div>

      <div className="store-brand-copy">
        <div className="store-brand-name">
          <strong>{business.name}</strong>

          {access.paidMember && (
            <span className="store-member-badge">
              <BadgeCheck size={12} />
              Member
            </span>
          )}
        </div>
      </div>

    </a>


    <nav className="store-public-nav" aria-label="Store sections">
      <a href="#shop">Shop</a>
      {business.about_text && <a href="#about">About</a>}
      {faqs.length > 0 && <a href="#faq">FAQ</a>}
      {business.link_in_bio_enabled === true && (
        <a href={linkInBioHref}>Links</a>
      )}
    </nav>


    <button
      type="button"
      className="store-cart-button"
      aria-label={
        cartCount > 0
          ? `Open cart, ${cartCount} item(s)`
          : "Open cart"
      }
      onClick={() => setCartOpen(true)}
    >
      <ShoppingBag size={18} />
      <span>Cart</span>
      {cartCount > 0 && <strong>{cartCount}</strong>}
    </button>

  </div>


  {/* mobile-only second row */}
  <nav className="store-mobile-nav" aria-label="Store sections">
    <a href="#shop">Shop</a>
    {business.about_text && <a href="#about">About</a>}
    {faqs.length > 0 && <a href="#faq">FAQ</a>}
    {business.link_in_bio_enabled === true && (
      <a href={linkInBioHref}>Links</a>
    )}
  </nav>

</header>

      {/* =====================================================
          BUSINESS HERO
      ====================================================== */}

      <section
        className={
          business.cover_url
            ? "store-business-hero has-cover"
            : "store-business-hero"
        }
        style={
          business.cover_url
            ? {
                backgroundImage:
                  `linear-gradient(
                    90deg,
                    rgba(15,23,42,.88),
                    rgba(15,23,42,.48)
                  ),
                  url("${business.cover_url}")`
              }
            : undefined
        }
      >

        <div className="store-business-hero-inner">


          <div className="store-hero-logo">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt=""
                loading="eager"
                decoding="async"
              />
            ) : (
              business.name.charAt(0).toUpperCase()
            )}
          </div>


          <span className="store-business-type">
            {business.business_type || "Online Store"}
          </span>


          <h1>{business.name}</h1>


          {business.description && (
            <p>{business.description}</p>
          )}


          <div className="store-hero-meta">

            {business.location && (
              <span>
                <MapPin size={15} />
                {business.location}
              </span>
            )}

            {business.country_name && (
              <span>
                <Globe2 size={15} />
                {business.country_name}
              </span>
            )}

          </div>


          {business.business_hours_text && (
            <div className="store-location">
              <Clock size={15} />
              {business.business_hours_text}
            </div>
          )}


          <div className="store-hero-actions">

            <a
              className="store-shop-now"
              href="#shop"
            >
              Shop now
              <ChevronRight size={16} />
            </a>


            {(business.contact_whatsapp ||
              business.contact_email ||
              business.contact_phone) && (

              <button
                type="button"
                className="store-hero-contact"
                onClick={contactStore}
              >
                <MessageCircle size={16} />
                Contact seller
              </button>

            )}

          </div>


        </div>

      </section>


      {/* =====================================================
          SHOP
      ====================================================== */}

      <main
        className="store-main"
        id="shop"
      >


        {/* ================================================
            ABOUT
        ================================================= */}

        {business.about_text && (

          <section
            id="about"
            className="store-about-section"
          >

            <span>About</span>

            <h2>
              {business.about_title || `About ${business.name}`}
            </h2>

            <p>{business.about_text}</p>

          </section>

        )}


        {/* ================================================
            FEATURED
        ================================================= */}

        {featuredProducts.length > 0 && (

          <section className="store-featured-products">

            <div className="store-products-heading">
              <div>
                <span>Featured</span>
                <h2>Featured products</h2>
              </div>
            </div>


            <div className="store-product-grid">

              {featuredProducts.map(product => (
                <PublicProductCard
                  key={`featured-${product.id}`}
                  product={product}
                  formatMoney={formatMoney}
                  onOpen={() => openProduct(product)}
                  onAdd={() => addToCart(product)}
                />
              ))}

            </div>

          </section>

        )}


        {/* ================================================
            SHOP HEADING + CONTROLS
        ================================================= */}

        <div className="store-products-heading">

          <div>
            <span>Shop</span>
            <h2>Products</h2>
          </div>


          <div className="store-shop-controls">

            <div className="store-product-search">

              <Search size={16} />

              <input
                type="search"
                value={search}
                placeholder="Search products..."
                aria-label="Search products"
                onChange={event => setSearch(event.target.value)}
              />

            </div>


            <div className="store-product-sort">

              <SlidersHorizontal size={15} />

              <select
                value={sort}
                aria-label="Sort products"
                onChange={event => setSort(event.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

            </div>

          </div>

        </div>


        {/* ================================================
            CATEGORIES
        ================================================= */}

        {business.show_categories !== false &&
          categories.length > 0 && (

          <div
            className="store-category-tabs"
            role="group"
            aria-label="Filter by category"
          >

            <button
              type="button"
              className={category === "all" ? "active" : ""}
              aria-pressed={category === "all"}
              onClick={() => setCategory("all")}
            >
              All
            </button>


            {categories.map(item => (
              <button
                key={item}
                type="button"
                className={category === item ? "active" : ""}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}

          </div>

        )}


        {/* ================================================
            PRODUCTS
        ================================================= */}

        {!visibleProducts.length ? (

          <section className="store-empty-products">

            <Package size={29} />

            <h3>No products yet</h3>

            <p>
              This store hasn&apos;t added anything for sale.
              Check back soon.
            </p>

          </section>

        ) : !filteredProducts.length ? (

          <section className="store-empty-products">

            <Search size={27} />

            <h3>No products found</h3>

            <p>
              Nothing matches that search. Try a different
              word or clear the filters.
            </p>

          </section>

        ) : (

          <section className="store-product-grid">

            {filteredProducts.map(product => (
              <PublicProductCard
                key={product.id}
                product={product}
                formatMoney={formatMoney}
                onOpen={() => openProduct(product)}
                onAdd={() => addToCart(product)}
              />
            ))}

          </section>

        )}


        {/* ================================================
            STORE INFORMATION
        ================================================= */}

        {(business.delivery_information ||
  business.payment_information ||
  business.store_policy) && (

  <section className="store-info-panel">

    <div className="store-products-heading">
      <div>
        <span>Store details</span>
        <h2>Before you order</h2>
      </div>
    </div>

    <div className="store-info-accordion">

      {business.delivery_information && (
        <StoreInfoCard
          icon={<Truck size={17} />}
          title="Delivery"
          text={business.delivery_information}
          defaultOpen
        />
      )}

      {business.payment_information && (
        <StoreInfoCard
          icon={<CreditCard size={17} />}
          title="Payment"
          text={business.payment_information}
        />
      )}

      {business.store_policy && (
        <StoreInfoCard
          icon={<ShieldCheck size={17} />}
          title="Store policy"
          text={business.store_policy}
        />
      )}

    </div>

  </section>

)}


        {/* ================================================
            FAQ
        ================================================= */}

        {faqs.length > 0 && (

          <section
            id="faq"
            className="store-faq-section"
          >

            <div className="store-products-heading">
              <div>
                <span>FAQ</span>
                <h2>Frequently asked questions</h2>
              </div>
            </div>


            <div className="store-faq-list">

              {faqs.map((faq, index) => (
                <details key={`faq-${index}`}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}

            </div>

          </section>

        )}


        {/* ================================================
            CONTACT
        ================================================= */}

        {business.show_contact_section !== false && (

          <section className="store-contact-section">

            <div>

              <span>Contact</span>

              <h2>Need help before ordering?</h2>

              <p>
                Message {business.name} directly and get an
                answer before you pay.
              </p>

            </div>


            <div className="store-contact-buttons">

              {business.contact_whatsapp && (
                <a
                  href={`https://wa.me/${String(
                    business.contact_whatsapp
                  ).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
              )}


              {business.contact_phone && (
                <a href={`tel:${business.contact_phone}`}>
                  <Phone size={16} />
                  Call
                </a>
              )}


              {business.contact_email && (
                <a href={`mailto:${business.contact_email}`}>
                  <Mail size={16} />
                  Email
                </a>
              )}

            </div>

          </section>

        )}


        {/* ================================================
            SOCIAL MEDIA
        ================================================= */}

        {Object.values(socials).some(Boolean) && (

          <section className="store-social-section">

            <strong>Follow {business.name}</strong>

            <div>

  {Object.entries(socials)
    .filter(([, url]) => Boolean(url))
    .map(([platform, url]) => {

            const Icon = SOCIAL_ICONS[platform] || Globe2;

      return (
        <a key={platform} href={url} target="_blank" rel="noreferrer">
          <Icon size={14} />
          {platform}
        </a>
      );
    })}

</div>
          </section>

        )}


       {access.showRunambizPromotions && discoveryBusinesses.length > 0 && (
  <section className="store-discovery">
    <div className="store-products-heading">
      <div>
        <span>Runambiz discovery</span>
        <h2>Discover other businesses</h2>
        <p>Verified stores from Runambiz Members.</p>
      </div>
    </div>

    <div className="store-discovery-grid">
      {discoveryBusinesses.map(item => {
        const storeUrl = getDiscoveryStoreUrl(item.slug);

        return (
          <article key={item.id} className="store-discovery-card">
            <a className="store-discovery-cover" href={storeUrl} tabIndex={-1} aria-hidden="true">
              {item.coverUrl ? (
                <img src={item.coverUrl} alt="" loading="lazy" decoding="async" />
              ) : (
                <div className="store-discovery-cover-fallback">
                  <Store size={31} />
                </div>
              )}

              <span className="store-discovery-member">
                <BadgeCheck size={13} />
                Member
              </span>

              <div className="store-discovery-logo">
                {item.logoUrl ? (
                  <img src={item.logoUrl} alt="" loading="lazy" decoding="async" />
                ) : (
                  item.name?.charAt(0)?.toUpperCase() || "R"
                )}
              </div>
            </a>

            <div className="store-discovery-copy">
              {item.businessType && (
                <span className="store-discovery-type">{item.businessType}</span>
              )}

              <h3>
                <a className="store-discovery-link" href={storeUrl}>{item.name}</a>
              </h3>

              {item.description && <p>{item.description}</p>}

              {item.location && (
                <small>
                  <MapPin size={12} />
                  {item.location}
                </small>
              )}

              <span className="store-discovery-view">
                View store
                <ArrowUpRight size={14} />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  </section>
)}

      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="store-footer">

        <div>

          <span>Powered by</span>

          <strong>
            <a
              href="https://runambiz.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Runambiz
            </a>
          </strong>

        </div>

        <p>Smart commerce for modern businesses.</p>

      </footer>


      {/* =====================================================
          PRODUCT DETAIL
      ====================================================== */}

      <ProductDetails
        product={selectedProduct}
        formatMoney={formatMoney}
        onClose={closeProduct}
        onAdd={() => {
          if (selectedProduct) {
            addToCart(selectedProduct);
          }
        }}
      />


      {/* =====================================================
          CART
      ====================================================== */}

      <CartDrawer
        open={cartOpen}
        cart={cart}
        cartTotal={cartTotal}
        formatMoney={formatMoney}
        onClose={() => setCartOpen(false)}
        onQuantity={changeQuantity}
        onRemove={removeFromCart}
        onCheckout={startCheckout}
      />


      {/* =====================================================
          CHECKOUT
      ====================================================== */}

      <CheckoutModal
        open={checkoutOpen}
        business={business}
        cart={cart}
        cartTotal={cartTotal}
        orderResult={orderResult}
        setOrderResult={setOrderResult}
        formatMoney={formatMoney}
        onClose={() => {
          setCheckoutOpen(false);
          setOrderResult(null);
        }}
        onSuccess={() => {
          setCart([]);
        }}
      />


    </div>

  );

}


/* =========================================================
   PRODUCT CARD
========================================================= */

function PublicProductCard({
  product,
  formatMoney,
  onAdd,
  onOpen
}) {


  const image = getProductImage(product);


  const soldOut =
    product.track_inventory &&
    Number(product.stock_quantity) <= 0;


  return (

    <article className="public-product-card">


      <button
        type="button"
        className="public-product-image"
        aria-label={`View ${product.name}`}
        onClick={onOpen}
      >

        {image ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="public-product-placeholder">
            <Package size={28} />
          </div>
        )}


        {product.is_featured && (
          <span className="featured-product-badge">
            Featured
          </span>
        )}


        {soldOut && (
          <span className="sold-out-badge">
            Sold out
          </span>
        )}

      </button>


      <div className="public-product-copy">


        {product.category && (
          <span className="public-product-category">
            {product.category}
          </span>
        )}


        <button
          type="button"
          className="public-product-title"
          onClick={onOpen}
        >
          {product.name}
        </button>


        {product.description && (
          <p>{product.description}</p>
        )}


        <div className="public-product-price">

          <strong>{formatMoney(product.price)}</strong>

          {product.compare_at_price &&
            Number(product.compare_at_price) >
            Number(product.price) && (

            <del>
              {formatMoney(product.compare_at_price)}
            </del>

          )}

        </div>


        <button
          type="button"
          className="public-product-add"
          disabled={soldOut}
          onClick={onAdd}
        >

          {soldOut ? (
            "Sold out"
          ) : (
            <>
              <Plus size={16} />
              Add to cart
            </>
          )}

        </button>


      </div>


    </article>

  );

}


/* =========================================================
   STORE INFORMATION CARD (with icon)
========================================================= */

function StoreInformationCard({
  icon,
  title,
  text
}) {

  return (

    <article className="store-information-card">

      <div className="store-information-icon">
        {icon}
      </div>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

    </article>

  );

}


/* =========================================================
   STORE INFO CARD (plain)
========================================================= */

function StoreInfoCard({
  icon,
  title,
  text,
  defaultOpen = false
}) {

  return (

    <details
      className="store-info-row"
      open={defaultOpen}
    >

      <summary>

        <span className="store-info-icon">
          {icon}
        </span>

        <strong>{title}</strong>

      </summary>

      <p>{text}</p>

    </details>

  );

}

/* =========================================================
   PRODUCT DETAILS
========================================================= */

function ProductDetails({
  product,
  formatMoney,
  onClose,
  onAdd
}) {


  if (!product) {
    return null;
  }


  const images = [
    ...(product.product_images || [])
  ].sort(
    (a, b) =>
      Number(a.sort_order || 0) -
      Number(b.sort_order || 0)
  );


  const soldOut =
    product.track_inventory &&
    Number(product.stock_quantity) <= 0;


  return (

    <div className="store-product-detail-layer">


      <button
        type="button"
        className="store-layer-backdrop"
        aria-label="Close product"
        onClick={onClose}
      />


      <article
        className="store-product-detail"
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >


        <header>

          <span>Product details</span>

          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </header>


        <div className="store-product-detail-grid">


          <div className="store-product-gallery">

            {images.length ? (

              images.map(image => (
                <img
                  key={image.id || image.public_url}
                  src={image.public_url}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                />
              ))

            ) : (

              <div className="public-product-placeholder">
                <Package size={36} />
              </div>

            )}

          </div>


          <div className="store-product-detail-copy">


            {product.category && (
              <span className="public-product-category">
                {product.category}
              </span>
            )}


            <h2>{product.name}</h2>


            <div className="public-product-price">

              <strong>{formatMoney(product.price)}</strong>

              {product.compare_at_price &&
                Number(product.compare_at_price) >
                Number(product.price) && (

                <del>
                  {formatMoney(product.compare_at_price)}
                </del>

              )}

            </div>


            {product.description && (
              <p>{product.description}</p>
            )}


            {product.sku && (
              <small>Product code: {product.sku}</small>
            )}


            <button
              type="button"
              className="store-product-detail-add"
              disabled={soldOut}
              onClick={onAdd}
            >

              <ShoppingBag size={17} />

              {soldOut ? "Sold out" : "Add to cart"}

            </button>


          </div>


        </div>


      </article>


    </div>

  );

}


/* =========================================================
   CART
========================================================= */

function CartDrawer({
  open,
  cart,
  cartTotal,
  formatMoney,
  onClose,
  onQuantity,
  onRemove,
  onCheckout
}) {


  if (!open) {
    return null;
  }


  return (

    <div className="store-cart-layer">


      <button
        type="button"
        className="store-layer-backdrop"
        aria-label="Close cart"
        onClick={onClose}
      />


      <aside
        className="store-cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >


        <header>

          <div>
            <span>Your cart</span>
            <h2>Shopping cart</h2>
          </div>

          <button
            type="button"
            aria-label="Close cart"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </header>


        {!cart.length ? (

          <div className="store-cart-empty">

            <ShoppingBag size={30} />

            <h3>Your cart is empty</h3>

            <p>Browse the store and add something you like.</p>

            <button
              type="button"
              onClick={onClose}
            >
              Continue shopping
            </button>

          </div>

        ) : (

          <>

            <div className="store-cart-items">

              {cart.map(item => (

                <div
                  key={item.productId}
                  className="store-cart-item"
                >


                  <div className="store-cart-item-image">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <Package size={20} />
                    )}

                  </div>


                  <div className="store-cart-item-copy">

                    <strong>{item.name}</strong>

                    <span>{formatMoney(item.price)}</span>


                    <div className="store-cart-quantity">

                      <button
                        type="button"
                        aria-label={`Reduce ${item.name} quantity`}
                        onClick={() =>
                          onQuantity(
                            item.productId,
                            item.quantity - 1
                          )
                        }
                      >
                        <Minus size={13} />
                      </button>


                      <strong>{item.quantity}</strong>


                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() =>
                          onQuantity(
                            item.productId,
                            item.quantity + 1
                          )
                        }
                      >
                        <Plus size={13} />
                      </button>

                    </div>

                  </div>


                  <button
                    type="button"
                    className="store-remove-item"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => onRemove(item.productId)}
                  >
                    <Trash2 size={15} />
                  </button>


                </div>

              ))}

            </div>


            <div className="store-cart-footer">


              <div className="store-cart-total">

                <span>Subtotal</span>

                <strong>{formatMoney(cartTotal)}</strong>

              </div>


              <small>
                Delivery charges, if any, are handled
                separately by the seller.
              </small>


              <button
                type="button"
                className="store-checkout-button"
                onClick={onCheckout}
              >
                Checkout
                <ChevronRight size={17} />
              </button>


            </div>

          </>

        )}


      </aside>


    </div>

  );

}


/* =========================================================
   CHECKOUT
========================================================= */

function CheckoutModal({
  open,
  business,
  cart,
  cartTotal,
  orderResult,
  setOrderResult,
  formatMoney,
  onClose,
  onSuccess
}) {


  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [paymentSubmitError, setPaymentSubmitError] = useState("");
  const [copiedAccount, setCopiedAccount] = useState(false);


  useEffect(() => {

    if (!open) {
      setPaymentSubmitted(false);
      setPaymentSubmitError("");
      setSubmittingPayment(false);
      setCopiedAccount(false);
    }

  }, [open]);


  useEffect(() => {

    /*
      Every NEW order must begin with a fresh payment
      state. This fixes the bug where the next order
      showed "Payment submitted" because CheckoutModal
      was still mounted.
    */

    if (orderResult?.order?.id) {
      setPaymentSubmitted(false);
      setPaymentSubmitError("");
      setCopiedAccount(false);
    }

  }, [orderResult?.order?.id]);


  if (!open) {
    return null;
  }


  async function copyAccountNumber() {

    const accountNumber = String(
      orderResult?.paymentMethod?.accountNumber || ""
    );


    if (!accountNumber) {
      return;
    }


    try {

      if (navigator.clipboard && window.isSecureContext) {

        await navigator.clipboard.writeText(accountNumber);

      } else {

        /* Fallback where the Clipboard API isn't available. */

        const textarea = document.createElement("textarea");

        textarea.value = accountNumber;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();

      }


      setCopiedAccount(true);

      setTimeout(() => {
        setCopiedAccount(false);
      }, 1600);


    } catch (err) {

      console.error("Copy account number error:", err);

    }

  }


  async function submitOrder(event) {


    event.preventDefault();

    setError("");


    if (!fullName.trim()) {
      setError("Enter your full name.");
      return;
    }


    if (!phone.trim()) {
      setError("Enter your phone number.");
      return;
    }


    if (!email.trim()) {
      setError(
        "Enter your email address so we can send your order updates."
      );
      return;
    }


    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }


    if (!address.trim()) {
      setError("Enter your delivery address.");
      return;
    }


    if (!city.trim()) {
      setError("Enter your city.");
      return;
    }


    if (!state.trim()) {
      setError("Enter your state.");
      return;
    }


    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }


    setSubmitting(true);


    try {

      const { data, error: orderError } =
        await supabase.functions.invoke("create-order", {

          body: {

            businessSlug: business.slug,

            /*
              Notice: NO PRICE, NO TOTAL, NO BANK DETAILS.
              The server calculates everything.
            */

            customer: {
              fullName: fullName.trim(),
              phone: phone.trim(),
              email: email.trim() || null
            },

            items: cart.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            })),

            delivery: {
              address: address.trim(),
              city: city.trim(),
              state: state.trim(),
              country:
                business.country_name ||
                business.country_code ||
                null
            },

            customerNote: notes.trim()

          }

        });


      if (orderError) {
        throw orderError;
      }


      if (!data?.success) {
        throw new Error(
          data?.error || "Order could not be created."
        );
      }


      setOrderResult(data);

      onSuccess();


    } catch (err) {

      console.error("Checkout error:", err);

      setError(
        err?.message || "We couldn't place your order."
      );

    } finally {

      setSubmitting(false);

    }

  }


  async function submitPaymentConfirmation() {


    if (!orderResult?.order) {
      return;
    }


    setSubmittingPayment(true);

    setPaymentSubmitError("");


    try {

      const { data, error: submitError } =
        await supabase.functions.invoke("mark-payment-submitted", {

          body: {
            orderNumber: orderResult.order.orderNumber,
            customerToken: orderResult.order.customerToken
          }

        });


      if (submitError) {
        throw submitError;
      }


      if (!data?.success) {
        throw new Error(
          data?.error || "We couldn't submit your payment."
        );
      }


      /* Update the customer UI immediately. */

      setOrderResult(current => {

        if (!current) {
          return current;
        }

        return {
          ...current,
          order: {
            ...current.order,
            status: "payment_submitted",
            paymentStatus: "awaiting_confirmation"
          }
        };

      });


      setPaymentSubmitted(true);


    } catch (err) {

      console.error("Payment submitted error:", err);

      setPaymentSubmitError(
        err?.message ||
        "We couldn't submit your payment confirmation."
      );

    } finally {

      setSubmittingPayment(false);

    }

  }


  function contactSeller() {

    openSellerContact(
      business,
      orderResult?.order?.orderNumber
    );

  }


  /* =========================================================
     SUCCESS
  ========================================================= */

  if (orderResult) {


    const result = orderResult.order;

    const payment = orderResult.paymentMethod;


    return (

      <div className="store-checkout-layer">


        <button
          type="button"
          className="store-layer-backdrop"
          aria-label="Close"
          onClick={onClose}
        />


        <section
          className="store-order-success"
          role="dialog"
          aria-modal="true"
          aria-label="Order created"
        >


          <div className="order-success-icon">
            <CheckCircle2 size={31} />
          </div>


          <span>Order created</span>


          <h2>Thank you!</h2>


          <p>
            Your order has been sent to{" "}
            <strong>{business.name}</strong>.
          </p>


          <div className="order-success-number">
            <span>Order number</span>
            <strong>{result.orderNumber}</strong>
          </div>


          <div className="order-success-total">
            <span>Total</span>
            <strong>{formatMoney(result.total)}</strong>
          </div>


          {payment ? (

            <div className="order-payment-instructions">


              <span>Payment instructions</span>


              <h3>Complete your payment</h3>


              <ol className="payment-steps">

                <li>
                  Transfer exactly{" "}
                  <strong>{formatMoney(result.total)}</strong>
                  {" "}to the account below.
                </li>

                <li>
                  Double-check the account name and number
                  before sending.
                </li>

                <li>
                  After transferring, tap{" "}
                  <strong>I&apos;ve made payment</strong>.
                </li>

                <li>
                  The seller verifies your payment before the
                  order is marked paid.
                </li>

                <li>
                  Order updates go to the email address you
                  gave at checkout.
                </li>

              </ol>


              <div className="payment-account-card">
                <span>Provider / Bank</span>
                <strong>
                  {payment.providerName || "Payment"}
                </strong>
              </div>


              {payment.accountName && (
                <div className="payment-account-card">
                  <span>Account name</span>
                  <strong>{payment.accountName}</strong>
                </div>
              )}


              {payment.accountNumber && (

                <div className="payment-account-card account-number-card">


                  <div>

                    <span>Account number</span>

                    <strong className="big-account-number">
                      {payment.accountNumber}
                    </strong>

                  </div>


                  <button
                    type="button"
                    className={
                      copiedAccount
                        ? "copy-account-button copied"
                        : "copy-account-button"
                    }
                    aria-live="polite"
                    onClick={copyAccountNumber}
                  >

                    {copiedAccount ? (
                      <>
                        <Check size={14} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}

                  </button>


                </div>

              )}


              {payment.instructions && (
                <div className="seller-payment-note">
                  <strong>Seller instruction</strong>
                  <p>{payment.instructions}</p>
                </div>
              )}


            </div>

          ) : (

            <div className="order-payment-missing">
              The seller will contact you with payment
              instructions.
            </div>

          )}


          {paymentSubmitted ? (

            <>

              <div className="payment-submitted-success">


                <div className="payment-submitted-check">
                  <CheckCircle2 size={21} />
                </div>


                <div>

                  <strong>Payment submitted</strong>

                  <span>
                    The seller has been notified and will
                    verify your payment.
                  </span>

                  <span>
                    We&apos;ll send order updates to the email
                    address you provided.
                  </span>

                </div>


              </div>


              {(business?.contact_whatsapp ||
                business?.contact_email ||
                business?.contact_phone) && (

                <button
                  type="button"
                  className="contact-seller-button"
                  onClick={contactSeller}
                >
                  <MessageCircle size={16} />
                  Contact seller
                </button>

              )}


              <button
                type="button"
                className="order-success-close"
                onClick={onClose}
              >
                <ArrowLeft size={16} />
                Back to store
              </button>

            </>

          ) : (

            <>

              {payment && (

                <button
                  type="button"
                  className="payment-made-button"
                  disabled={submittingPayment}
                  onClick={submitPaymentConfirmation}
                >

                  {submittingPayment ? (
                    <>
                      <Loader2 size={17} className="spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      I&apos;ve made payment
                    </>
                  )}

                </button>

              )}


              {(business?.contact_whatsapp ||
                business?.contact_email) && (

                <button
                  type="button"
                  className="contact-seller-button"
                  onClick={contactSeller}
                >
                  <MessageCircle size={16} />
                  Contact seller
                </button>

              )}


              {paymentSubmitError && (
                <div className="payment-submit-error">
                  {paymentSubmitError}
                </div>
              )}


              <button
                type="button"
                className="order-close-link"
                onClick={onClose}
              >
                Close
              </button>

            </>

          )}


        </section>


      </div>

    );

  }


  /* =========================================================
     FORM
  ========================================================= */

  return (

    <div className="store-checkout-layer">


      <button
        type="button"
        className="store-layer-backdrop"
        aria-label="Close checkout"
        onClick={onClose}
      />


      <section
        className="store-checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
      >


        <header>

          <button
            type="button"
            className="checkout-back-button"
            aria-label="Back"
            onClick={onClose}
          >
            <ArrowLeft size={18} />
          </button>


          <div>
            <span>Checkout</span>
            <h2>Complete your order</h2>
          </div>

        </header>


        <form onSubmit={submitOrder}>


          <div className="checkout-summary">

            <span>
              {cart.reduce(
                (total, item) => total + item.quantity,
                0
              )}
              {" "}item(s)
            </span>

            <strong>{formatMoney(cartTotal)}</strong>

          </div>


          <CheckoutField
            label="Full name"
            value={fullName}
            placeholder="Your full name"
            onChange={setFullName}
          />


          <CheckoutField
            label="Phone number"
            value={phone}
            type="tel"
            placeholder="080..."
            onChange={setPhone}
          />


          <CheckoutField
            label="Email address"
            value={email}
            type="email"
            placeholder="you@example.com"
            required
            onChange={setEmail}
          />


          <CheckoutField
            label="Delivery address"
            value={address}
            placeholder="Street and house address"
            onChange={setAddress}
          />


          <div className="checkout-form-grid">

            <CheckoutField
              label="City"
              value={city}
              placeholder="Ilorin"
              onChange={setCity}
            />

            <CheckoutField
              label="State / Region"
              value={state}
              placeholder="State, province or region"
              onChange={setState}
            />

          </div>


          <div className="checkout-field">

            <label htmlFor="checkout-notes">
              Order note (optional)
            </label>

            <textarea
              id="checkout-notes"
              rows="3"
              maxLength="1000"
              value={notes}
              placeholder="Any instruction for the seller?"
              onChange={event => setNotes(event.target.value)}
            />

          </div>


          {error && (
            <div
              className="checkout-error"
              role="alert"
            >
              {error}
            </div>
          )}


          <button
            type="submit"
            className="place-order-button"
            disabled={submitting}
          >

            {submitting ? (
              <>
                <Loader2 size={17} className="spin" />
                Creating order...
              </>
            ) : (
              <>
                Place order
                <ChevronRight size={17} />
              </>
            )}

          </button>


          <small className="checkout-security-note">
            Your order total is calculated securely by
            Runambiz using the seller&apos;s current
            product prices.
          </small>


        </form>


      </section>


    </div>

  );

}


/* =========================================================
   CHECKOUT FIELD
========================================================= */

function CheckoutField({
  label,
  value,
  type = "text",
  placeholder,
  required = false,
  onChange
}) {


  const id = `checkout-${label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;


  return (

    <div className="checkout-field">

      <label htmlFor={id}>{label}</label>

      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={event => onChange(event.target.value)}
      />

    </div>

  );

}


/* =========================================================
   PRODUCT IMAGE
========================================================= */

function getProductImage(product) {

  const images = [
    ...(product.product_images || [])
  ].sort(
    (a, b) =>
      Number(a.sort_order || 0) -
      Number(b.sort_order || 0)
  );

  return images[0]?.public_url || null;

}


/* =========================================================
   SELLER CONTACT
========================================================= */

function openSellerContact(business, orderNumber = null) {


  if (!business) {
    return;
  }


  const message = orderNumber
    ? `Hello, I'm contacting you about my order ${orderNumber}.`
    : `Hello ${business.name || ""}, I found your Runambiz store and I have a question.`;


  const rawWhatsApp = String(
    business.contact_whatsapp || ""
  ).trim();


  if (rawWhatsApp) {

    let number = rawWhatsApp.replace(/\D/g, "");


    /*
      Legacy support for Nigerian numbers. Other countries
      should save WhatsApp numbers with their international
      country code.
    */

    if (
      business.country_code === "NG" &&
      number.startsWith("0")
    ) {
      number = `234${number.slice(1)}`;
    }


    if (number.startsWith("00")) {
      number = number.slice(2);
    }


    if (number) {

      window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );

      return;

    }

  }


  if (business.contact_email) {

    window.location.href =
      `mailto:${business.contact_email}?subject=${encodeURIComponent(
        orderNumber
          ? `Order ${orderNumber}`
          : `Question about ${business.name}`
      )}&body=${encodeURIComponent(message)}`;

    return;

  }


  if (business.contact_phone) {
    window.location.href = `tel:${business.contact_phone}`;
  }

}


function getDiscoveryStoreUrl(
  slug
) {


  if (!slug) {
    return "/";
  }


  const hostname =
    window.location.hostname
      .toLowerCase();


  const local =
    hostname ===
      "localhost"

    ||

    hostname ===
      "127.0.0.1";


  if (local) {

    return (
      `/store.html?store=${encodeURIComponent(
        slug
      )}`
    );

  }


  return (
    `https://${slug}.runambiz.com`
  );

}