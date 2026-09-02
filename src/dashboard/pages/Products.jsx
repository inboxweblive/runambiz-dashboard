import {
  useEffect,
  useMemo,
  useState
} from "react";


import {
  Archive,
  Box,
  Check,
  ChevronDown,
  Edit3,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X
} from "lucide-react";


import {
  supabase
} from "../../lib/supabase";



/* =========================================================
   CURRENCY HELPERS
========================================================= */

function getCurrencySymbol(
  currency = "USD"
) {

  try {

    const parts =
      new Intl.NumberFormat(
        undefined,
        {
          style:
            "currency",

          currency,

          currencyDisplay:
            "narrowSymbol",

          minimumFractionDigits:
            0,

          maximumFractionDigits:
            0
        }
      )
        .formatToParts(
          0
        );


    return (
      parts.find(
        part =>
          part.type ===
          "currency"
      )?.value ||
      currency
    );


  } catch {

    return currency;

  }

}


function formatProductMoney(
  amount,
  currency = "USD"
) {

  const value =
    Number(
      amount || 0
    );


  try {

    return new Intl.NumberFormat(
      undefined,
      {
        style:
          "currency",

        currency,

        currencyDisplay:
          "narrowSymbol",

        minimumFractionDigits:
          Number.isInteger(
            value
          )
            ? 0
            : 2,

        maximumFractionDigits:
          2
      }
    )
      .format(
        value
      );


  } catch {

    return (
      `${currency} ${value.toLocaleString()}`
    );

  }

}



/* =========================================================
   PRODUCTS PAGE
========================================================= */

export default function Products({
  business,
  user,
  onProductsChanged,
  refreshKey
}) {


    const currency =
  business?.currency ||
  "USD";


const currencySymbol =
  getCurrencySymbol(
    currency
  );


const formatMoney =
  value =>
    formatProductMoney(
      value,
      currency
    );  


  /* =========================================================
     STATE
  ========================================================= */

  const [products, setProducts] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const [search, setSearch] =
    useState("");


  const [statusFilter, setStatusFilter] =
    useState("all");


  const [modalOpen, setModalOpen] =
    useState(false);


  const [editingProduct, setEditingProduct] =
    useState(null);


  const [saving, setSaving] =
    useState(false);


  const [deletingId, setDeletingId] =
    useState(null);



  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  async function loadProducts() {


    if (!business?.id) {

      return;

    }


    setLoading(true);

    setError("");


    try {


      const {
        data,
        error: productsError
      } =
        await supabase
          .from("products")
          .select(`
            *,
            product_images (
              id,
              storage_path,
              public_url,
              sort_order
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


      if (productsError) {

        throw productsError;

      }


      setProducts(
        data || []
      );


    } catch (err) {


      console.error(
        "Products load error:",
        err
      );


      setError(
        err?.message ||
        "We couldn't load your products."
      );


    } finally {


      setLoading(false);


    }


  }



  useEffect(() => {

  loadProducts();

}, [
  business?.id,
  refreshKey
]);



  /* =========================================================
     FILTER PRODUCTS
  ========================================================= */

  const filteredProducts =
    useMemo(() => {


      return products.filter(
        function(product) {


          const matchesSearch =

            product.name
              ?.toLowerCase()
              .includes(
                search
                  .trim()
                  .toLowerCase()
              )

            ||

            product.sku
              ?.toLowerCase()
              .includes(
                search
                  .trim()
                  .toLowerCase()
              );


          const matchesStatus =

            statusFilter === "all"

              ? true

              : product.status ===
                statusFilter;


          return (
            matchesSearch &&
            matchesStatus
          );


        }
      );


    }, [
      products,
      search,
      statusFilter
    ]);



  /* =========================================================
     CREATE
  ========================================================= */

  function openCreateModal() {


    setEditingProduct(null);

    setModalOpen(true);


  }



  /* =========================================================
     EDIT
  ========================================================= */

  function openEditModal(product) {


    setEditingProduct(product);

    setModalOpen(true);


  }



  /* =========================================================
     DELETE PRODUCT
  ========================================================= */

  async function deleteProduct(product) {


    const confirmed =
      window.confirm(
        `Delete "${product.name}"? This cannot be undone.`
      );


    if (!confirmed) {

      return;

    }


    setDeletingId(
      product.id
    );


    try {


      /*
        Delete actual files first.
      */

      const imagePaths =
        (product.product_images || [])
          .map(
            image =>
              image.storage_path
          )
          .filter(Boolean);


      if (imagePaths.length) {


        const {
          error: storageError
        } =
          await supabase.storage
            .from("product-images")
            .remove(
              imagePaths
            );


        if (storageError) {

          console.warn(
            "Some image files could not be removed:",
            storageError
          );

        }


      }



      /*
        Delete product.

        product_images DB rows disappear
        automatically because ON DELETE CASCADE.
      */

      const {
        error: deleteError
      } =
        await supabase
          .from("products")
          .delete()
          .eq(
            "id",
            product.id
          );


      if (deleteError) {

        throw deleteError;

      }


      setProducts(
        current =>
          current.filter(
            item =>
              item.id !== product.id
          )
      );

      if (onProductsChanged) {

  await onProductsChanged();

}


    } catch (err) {


      console.error(
        "Product delete error:",
        err
      );


      alert(
        err?.message ||
        "We couldn't delete this product."
      );


    } finally {


      setDeletingId(null);


    }


  }



  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {


    return (

      <div className="products-loading">

        <Loader2
          size={24}
          className="spin"
        />

        <span>
          Loading products...
        </span>

      </div>

    );


  }



  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <div className="dashboard-content products-page">



      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <section className="products-heading">


        <div>


          <span className="dashboard-eyebrow">

            Catalog

          </span>


          <h1>

            Products

          </h1>


          <p>

            Add, organize and manage everything
            your business sells.

          </p>


        </div>



        <button
          type="button"
          className="products-add-button"
          onClick={openCreateModal}
        >

          <Plus size={18} />

          <span>
            Add product
          </span>

        </button>


      </section>



      {/* =====================================================
          PRODUCT SUMMARY
      ====================================================== */}

      <section className="products-summary">


        <SummaryItem
          label="Total products"
          value={products.length}
        />


        <SummaryItem
          label="Active"
          value={
            products.filter(
              p =>
                p.status === "active"
            ).length
          }
        />


        <SummaryItem
          label="Drafts"
          value={
            products.filter(
              p =>
                p.status === "draft"
            ).length
          }
        />


        <SummaryItem
          label="Low stock"
          value={
            products.filter(
              p =>
                p.track_inventory &&
                p.stock_quantity <= 5
            ).length
          }
          lime
        />


      </section>



      {/* =====================================================
          TOOLBAR
      ====================================================== */}

      <section className="products-toolbar">


        <div className="products-search">


          <Search size={17} />


          <input
            type="search"
            value={search}
            placeholder="Search products or SKU..."

            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
          />


        </div>



        <div className="products-filter">


          <select
            value={statusFilter}

            onChange={
              event =>
                setStatusFilter(
                  event.target.value
                )
            }
          >

            <option value="all">
              All statuses
            </option>

            <option value="active">
              Active
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="archived">
              Archived
            </option>

          </select>


          <ChevronDown size={16} />


        </div>


      </section>



      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="products-error">

          {error}

        </div>

      )}



      {/* =====================================================
          EMPTY STATE
      ====================================================== */}

      {!products.length ? (

        <section className="products-empty">


          <div className="products-empty-icon">

            <Package size={28} />

          </div>


          <span>
            YOUR CATALOG
          </span>


          <h2>

            Add your first product

          </h2>


          <p>

            Products you add will appear in your
            Runambiz storefront and can later be
            handled by your AI assistant.

          </p>


          <button
            type="button"
            onClick={openCreateModal}
          >

            <Plus size={18} />

            Add first product

          </button>


        </section>

      ) : filteredProducts.length === 0 ? (

        <section className="products-empty small">


          <Search size={24} />


          <h2>
            No products found
          </h2>


          <p>

            Try another search or filter.

          </p>


        </section>

      ) : (

        <section className="products-grid">


          {filteredProducts.map(
            function(product) {


              const image =
                product
                  .product_images
                  ?.sort(
                    (a, b) =>
                      a.sort_order -
                      b.sort_order
                  )[0];


              return (

              <ProductCard
  key={
    product.id
  }

  product={
    product
  }

  currency={
    currency
  }

  imageUrl={
    image?.public_url
  }

  deleting={
    deletingId ===
    product.id
  }

  onEdit={() =>
    openEditModal(
      product
    )
  }

  onDelete={() =>
    deleteProduct(
      product
    )
  }
/>

              );


            }
          )}


        </section>

      )}



      {/* =====================================================
          PRODUCT MODAL
      ====================================================== */}

<ProductModal
  open={
    modalOpen
  }

  product={
    editingProduct
  }

  business={
    business
  }

  user={
    user
  }

  currencySymbol={
    currencySymbol
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

  onSaved={async function() {

    setModalOpen(
      false
    );

    setEditingProduct(
      null
    );

    await loadProducts();

    if (
      onProductsChanged
    ) {

      await onProductsChanged();

    }

  }}
/>


    </div>

  );

}


/* =========================================================
   SUMMARY
========================================================= */

function SummaryItem({
  label,
  value,
  lime = false
}) {


  return (

    <article
      className={
        lime
          ? "product-summary-card lime"
          : "product-summary-card"
      }
    >

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </article>

  );

}



/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  currency,
  imageUrl,
  deleting,
  onEdit,
  onDelete
}) {


 function formatPrice(
  value
) {

  return formatProductMoney(
    value,
    currency ||
    "USD"
  );

}


  return (

    <article className="product-card">


      <div className="product-card-media">


        {imageUrl ? (

          <img
            src={imageUrl}
            alt={product.name}
          />

        ) : (

          <div className="product-placeholder">

            <Box size={25} />

          </div>

        )}


        <span
          className={
            `product-status ${product.status}`
          }
        >

          {product.status}

        </span>


      </div>



      <div className="product-card-body">


        <div className="product-card-title">


          <div>

            {product.category && (

              <span>
                {product.category}
              </span>

            )}


            <h3>
              {product.name}
            </h3>

          </div>


          <button
            type="button"
            aria-label="Edit product"
            onClick={onEdit}
          >

            <Edit3 size={16} />

          </button>


        </div>



        <strong className="product-price">

          {formatPrice(
            product.price
          )}

        </strong>



        <div className="product-stock">


          {product.track_inventory ? (

            <>

              <span
                className={
                  product.stock_quantity <= 5
                    ? "stock-dot low"
                    : "stock-dot"
                }
              ></span>

              {product.stock_quantity}
              {" "}
              in stock

            </>

          ) : (

            <>
              <Check size={14} />
              Stock tracking off
            </>

          )}


        </div>



        <div className="product-card-actions">


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


      </div>


    </article>

  );

}



/* =========================================================
   PRODUCT MODAL
========================================================= */

function ProductModal({
  open,
  product,
  business,
  user,
  currencySymbol,
  saving,
  setSaving,
  onClose,
  onSaved
}) {


  const editing =
    Boolean(product);


  const [name, setName] =
    useState("");


  const [description, setDescription] =
    useState("");


  const [category, setCategory] =
    useState("");


  const [price, setPrice] =
    useState("");


  const [
    compareAtPrice,
    setCompareAtPrice
  ] =
    useState("");


  const [stock, setStock] =
    useState("0");


  const [sku, setSku] =
    useState("");


  const [status, setStatus] =
    useState("draft");


  const [
    trackInventory,
    setTrackInventory
  ] =
    useState(true);


  const [images, setImages] =
    useState([]);


  const [previews, setPreviews] =
    useState([]);


  const [formError, setFormError] =
    useState("");

const [aiGenerating, setAiGenerating] =
  useState(false);


const [aiDetails, setAiDetails] =
  useState("");


const [aiTone, setAiTone] =
  useState("natural");


const [aiError, setAiError] =
  useState("");



  /* =========================================================
     RESET FORM
  ========================================================= */

  useEffect(() => {


    if (!open) {

      return;

    }


setFormError("");

setAiError("");

setImages([]);

setPreviews([]);

setAiDetails("");

setAiTone("natural");


    if (product) {


      setName(
        product.name || ""
      );


      setDescription(
        product.description || ""
      );


      setCategory(
        product.category || ""
      );


      setPrice(
        String(
          product.price ?? ""
        )
      );


      setCompareAtPrice(
        product.compare_at_price
          ? String(
              product.compare_at_price
            )
          : ""
      );


      setStock(
        String(
          product.stock_quantity ?? 0
        )
      );


      setSku(
        product.sku || ""
      );


      setStatus(
        product.status || "draft"
      );


      setTrackInventory(
        product.track_inventory !== false
      );


    } else {


      setName("");

      setDescription("");

      setCategory("");

      setPrice("");

      setCompareAtPrice("");

      setStock("0");

      setSku("");

      setStatus("draft");

      setTrackInventory(true);


    }


  }, [
    open,
    product
  ]);



  /* =========================================================
     IMAGE SELECT
  ========================================================= */

  function handleImages(event) {


    const selected =
      Array.from(
        event.target.files || []
      )
      .slice(0, 5);


    setImages(
      selected
    );


    const nextPreviews =
      selected.map(
        file =>
          URL.createObjectURL(
            file
          )
      );


    setPreviews(
      nextPreviews
    );


  }



  /* =========================================================
     SLUG
  ========================================================= */

  function slugify(value) {


    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );


  }


  /* =========================================================
   GENERATE DESCRIPTION WITH RUNAMBIZ AI
========================================================= */

async function generateAiDescription() {


  setAiError("");


  if (
    !name.trim()
  ) {

    setAiError(
      "Enter the product name first."
    );

    return;

  }


  setAiGenerating(
    true
  );


  /*
    One UUID per user action.

    If the same network request gets retried,
    the backend will not charge it twice.
  */

  const requestId =
    crypto.randomUUID();


  try {


    const {
      data,
      error
    } =
      await supabase
        .functions
        .invoke(
          "generate-product-description",
          {

            body: {

              requestId,

              productName:
                name.trim(),

              category:
                category.trim(),

              price:
                price
                  ? Number(
                      price
                    )
                  : null,

              businessName:
                business?.name ||
                "",

              businessType:
                business?.business_type ||
                "",

              details:
                aiDetails.trim(),

              existingDescription:
                description.trim(),

              tone:
                aiTone

            }

          }
        );


    if (
      error
    ) {

      throw error;

    }



    /* =====================================================
       NOT ENOUGH CREDITS
    ====================================================== */

    if (
      data?.code ===
      "INSUFFICIENT_AI_CREDITS"
    ) {

      setAiError(

        `You need ${
          data.requiredCredits ||
          2
        } Runambiz Credits. You currently have ${
          data.availableCredits ||
          0
        }. Open Wallet to buy more credits.`

      );


      return;

    }



    if (
      !data?.success
    ) {

      throw new Error(
        data?.error ||
        "Runambiz AI couldn't generate the description."
      );

    }



    if (
      !data?.description
    ) {

      throw new Error(
        "Runambiz AI didn't return a description."
      );

    }



    /* =====================================================
       PUT AI TEXT INTO DESCRIPTION
    ====================================================== */

    setDescription(
      data.description
    );


  } catch (
    err
  ) {


    console.error(
      "AI description error:",
      err
    );


    setAiError(
      err?.message ||
      "Runambiz AI couldn't write the description. Please try again."
    );


  } finally {


    setAiGenerating(
      false
    );

  }

}





  /* =========================================================
     UPLOAD IMAGES
  ========================================================= */

  async function uploadImages(
    productId
  ) {


    if (!images.length) {

      return;

    }


    for (
      let index = 0;
      index < images.length;
      index++
    ) {


      const file =
        images[index];


      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase()
          || "jpg";


      const filename =
        `${Date.now()}-${index}.${extension}`;


      const storagePath =
        `${user.id}/${productId}/${filename}`;



      const {
        error: uploadError
      } =
        await supabase.storage
          .from("product-images")
          .upload(
            storagePath,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false
            }
          );


      if (uploadError) {

        throw uploadError;

      }



      const {
        data: publicData
      } =
        supabase.storage
          .from("product-images")
          .getPublicUrl(
            storagePath
          );



      const {
        error: imageInsertError
      } =
        await supabase
          .from("product_images")
          .insert({

            product_id:
              productId,

            owner_id:
              user.id,

            storage_path:
              storagePath,

            public_url:
              publicData.publicUrl,

            sort_order:
              index

          });


      if (imageInsertError) {

        throw imageInsertError;

      }


    }


  }



  /* =========================================================
     SAVE
  ========================================================= */

  async function handleSubmit(
    event
  ) {


    event.preventDefault();


    setFormError("");


    if (!name.trim()) {


      setFormError(
        "Enter a product name."
      );


      return;

    }


    if (
      !price ||
      Number(price) < 0
    ) {


      setFormError(
        "Enter a valid product price."
      );


      return;

    }



    setSaving(true);


    try {


      const productData = {

        business_id:
          business.id,

        owner_id:
          user.id,

        name:
          name.trim(),

        description:
          description.trim()
          || null,

        category:
          category.trim()
          || null,

        price:
          Number(price),

        compare_at_price:
          compareAtPrice
            ? Number(
                compareAtPrice
              )
            : null,

        stock_quantity:
          trackInventory
            ? Math.max(
                0,
                Number(stock) || 0
              )
            : 0,

        track_inventory:
          trackInventory,

        sku:
          sku.trim()
          || null,

        status,

        updated_at:
          new Date()
            .toISOString()

      };



      let savedProduct;



      if (editing) {


        const {
          data,
          error
        } =
          await supabase
            .from("products")
            .update(
              productData
            )
            .eq(
              "id",
              product.id
            )
            .select()
            .single();


        if (error) {

          throw error;

        }


        savedProduct =
          data;


      } else {


        let slug =
          slugify(name);


        if (!slug) {

          slug =
            "product";
        }


        slug =
          `${slug}-${Math.random()
            .toString(36)
            .slice(2, 7)}`;


        const {
          data,
          error
        } =
          await supabase
            .from("products")
            .insert({
              ...productData,
              slug
            })
            .select()
            .single();


        if (error) {

          throw error;

        }


        savedProduct =
          data;


      }



      /*
        New selected images get added.
      */

      await uploadImages(
        savedProduct.id
      );


      await onSaved();


    } catch (err) {


      console.error(
        "Product save error:",
        err
      );


      setFormError(
        err?.message ||
        "We couldn't save this product."
      );


    } finally {


      setSaving(false);


    }


  }



  if (!open) {

    return null;

  }



  return (

    <div className="product-modal-layer">


      <button
        type="button"
        className="product-modal-backdrop"
        onClick={onClose}
        aria-label="Close product modal"
      />



      <section className="product-modal">


        <header className="product-modal-header">


          <div>

            <span>
              {editing
                ? "EDIT PRODUCT"
                : "NEW PRODUCT"}
            </span>


            <h2>

              {editing
                ? "Update product"
                : "Add a product"}

            </h2>

          </div>


          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >

            <X size={20} />

          </button>


        </header>



        <form
          onSubmit={handleSubmit}
          className="product-form"
        >



          {/* =========================================
              IMAGE UPLOAD
          ========================================== */}

          <div className="product-form-group">


            <label>
              Product photos
            </label>


            <label className="product-image-upload">


              <ImagePlus size={24} />


              <strong>
                Add product photos
              </strong>


              <span>
                JPG, PNG or WebP · Up to 5 images
              </span>


              <input
                type="file"
                accept="
                  image/jpeg,
                  image/png,
                  image/webp
                "
                multiple
                onChange={handleImages}
              />


            </label>



            {previews.length > 0 && (

              <div className="product-image-previews">


                {previews.map(
                  function(src, index) {


                    return (

                      <img
                        key={src}
                        src={src}
                        alt={
                          `Product preview ${index + 1}`
                        }
                      />

                    );


                  }
                )}


              </div>

            )}


            {editing &&
              product?.product_images
                ?.length > 0 &&
              previews.length === 0 && (

                <div className="product-image-previews">


                  {product.product_images.map(
                    image => (

                      <img
                        key={image.id}
                        src={image.public_url}
                        alt=""
                      />

                    )
                  )}


                </div>

            )}


          </div>



          {/* =========================================
              NAME
          ========================================== */}

          <div className="product-form-group">


            <label htmlFor="productName">
              Product name
            </label>


            <input
              id="productName"
              value={name}
              placeholder="e.g. Classic Ankara Dress"

              onChange={
                event =>
                  setName(
                    event.target.value
                  )
              }
            />


          </div>



          {/* =========================================
              DESCRIPTION
          ========================================== */}

          {/* =========================================
    DESCRIPTION + RUNAMBIZ AI
========================================== */}

<div className="product-form-group">


  <div className="product-description-label-row">


    <label htmlFor="productDescription">

      Description

    </label>


    <button
      type="button"
      className="ai-write-button"

      disabled={
        aiGenerating ||
        !name.trim()
      }

      onClick={
        generateAiDescription
      }
    >


      {aiGenerating ? (

        <>

          <Loader2
            size={14}
            className="spin"
          />

          Writing...

        </>

      ) : (

        <>

          <Sparkles
            size={14}
          />

          Write with AI

        </>

      )}


    </button>


  </div>



  {/* =========================================
      AI HELPER PANEL
  ========================================== */}

  <div className="ai-description-helper">


    <div className="ai-description-helper-top">


      <div className="ai-description-helper-icon">

        <Sparkles
          size={17}
        />

      </div>


      <div>

     <strong>
  Runambiz AI
</strong>

<span>
  Give AI a few product details
  and let it write for you.
</span>

<small className="ai-credit-label">
  ✦ 2 credits per generation
</small>
      </div>


    </div>



    <textarea
      className="ai-details-input"

      value={
        aiDetails
      }

      rows="2"

      maxLength="500"

      placeholder="Optional details e.g. red and gold, cotton fabric, available in S–XL, handmade..."

      onChange={
        event =>
          setAiDetails(
            event.target.value
          )
      }
    />



    <div className="ai-tone-row">


      <span>
        Writing style
      </span>


      <div className="ai-tone-options">


        <button
          type="button"

          className={
            aiTone === "natural"
              ? "active"
              : ""
          }

          onClick={() =>
            setAiTone(
              "natural"
            )
          }
        >

          Natural

        </button>


        <button
          type="button"

          className={
            aiTone === "persuasive"
              ? "active"
              : ""
          }

          onClick={() =>
            setAiTone(
              "persuasive"
            )
          }
        >

          Persuasive

        </button>


        <button
          type="button"

          className={
            aiTone === "premium"
              ? "active"
              : ""
          }

          onClick={() =>
            setAiTone(
              "premium"
            )
          }
        >

          Premium

        </button>


        <button
          type="button"

          className={
            aiTone === "short"
              ? "active"
              : ""
          }

          onClick={() =>
            setAiTone(
              "short"
            )
          }
        >

          Short

        </button>


      </div>


    </div>



    {aiError && (

      <div className="ai-description-error">

        {aiError}

      </div>

    )}



    <button
      type="button"
      className="ai-generate-main-button"

      disabled={
        aiGenerating ||
        !name.trim()
      }

      onClick={
        generateAiDescription
      }
    >


      {aiGenerating ? (

        <>

          <Loader2
            size={16}
            className="spin"
          />

          Runambiz AI is writing...

        </>

      ) : (

        <>

          <Sparkles size={16} />

          Generate description

        </>

      )}


    </button>


  </div>



  {/* =========================================
      ACTUAL DESCRIPTION
  ========================================== */}

  <textarea
    id="productDescription"

    value={
      description
    }

    rows="5"

    maxLength="1000"

    placeholder="Write your description manually or let Runambiz AI help..."

    onChange={
      event =>
        setDescription(
          event.target.value
        )
    }
  />



  <div className="description-footer">


    <span>

      {description &&
        "AI-generated text can be edited before saving."}

    </span>


    <small>

      {description.length}
      {" "}
      / 1000

    </small>


  </div>


</div>



          {/* =========================================
              CATEGORY
          ========================================== */}

          <div className="product-form-group">


            <label htmlFor="productCategory">
              Category
            </label>


            <input
              id="productCategory"
              value={category}
              placeholder="e.g. Dresses"

              onChange={
                event =>
                  setCategory(
                    event.target.value
                  )
              }
            />


          </div>



          {/* =========================================
              PRICES
          ========================================== */}

       <div className="product-form-grid">

  <div className="product-form-group">

    <label htmlFor="productPrice">
      Price
    </label>

    <div className="money-input">

      <span>
        {currencySymbol}
      </span>

      <input
        id="productPrice"
        type="number"
        min="0"
        step="0.01"
        value={price}
        placeholder="0"

        onChange={
          event =>
            setPrice(
              event.target.value
            )
        }
      />

    </div>

  </div>


  <div className="product-form-group">

    <label htmlFor="comparePrice">
      Compare-at price
    </label>

    <div className="money-input">

      <span>
        {currencySymbol}
      </span>

      <input
        id="comparePrice"
        type="number"
        min="0"
        step="0.01"
        value={
          compareAtPrice
        }
        placeholder="Optional"

        onChange={
          event =>
            setCompareAtPrice(
              event.target.value
            )
        }
      />

    </div>

  </div>

</div>



          {/* =========================================
              INVENTORY
          ========================================== */}

          <div className="product-form-section">


            <div className="product-form-section-title">

              Inventory

            </div>


            <label className="product-switch-row">


              <div>

                <strong>
                  Track inventory
                </strong>

                <span>
                  Keep count of available stock.
                </span>

              </div>


              <input
                type="checkbox"
                checked={trackInventory}

                onChange={
                  event =>
                    setTrackInventory(
                      event.target.checked
                    )
                }
              />


            </label>



            {trackInventory && (

              <div className="product-form-grid">


                <div className="product-form-group">


                  <label htmlFor="stock">
                    Quantity
                  </label>


                  <input
                    id="stock"
                    type="number"
                    min="0"
                    value={stock}

                    onChange={
                      event =>
                        setStock(
                          event.target.value
                        )
                    }
                  />


                </div>



                <div className="product-form-group">


                  <label htmlFor="sku">
                    SKU
                  </label>


                  <input
                    id="sku"
                    value={sku}
                    placeholder="Optional"

                    onChange={
                      event =>
                        setSku(
                          event.target.value
                        )
                    }
                  />


                </div>


              </div>

            )}


          </div>



          {/* =========================================
              STATUS
          ========================================== */}

          <div className="product-form-group">


            <label htmlFor="productStatus">
              Product status
            </label>


            <select
              id="productStatus"
              value={status}

              onChange={
                event =>
                  setStatus(
                    event.target.value
                  )
              }
            >

              <option value="draft">
                Draft
              </option>

              <option value="active">
                Active
              </option>

              <option value="archived">
                Archived
              </option>

            </select>


          </div>



          {formError && (

            <div className="product-form-error">

              {formError}

            </div>

          )}



          {/* =========================================
              ACTIONS
          ========================================== */}

          <footer className="product-modal-actions">


            <button
              type="button"
              className="product-cancel-button"
              onClick={onClose}
              disabled={saving}
            >

              Cancel

            </button>


            <button
              type="submit"
              className="product-save-button"
              disabled={saving}
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
                  <Check size={17} />

                  {editing
                    ? "Save changes"
                    : "Add product"}
                </>

              )}

            </button>


          </footer>


        </form>


      </section>


    </div>

  );

}