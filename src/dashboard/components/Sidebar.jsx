import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  MessageCircle,
  Bot,
  CreditCard,
  BarChart3,
  Store,
  Radio,
  WalletCards,
  Settings,
  HelpCircle,
  LogOut,
  MoreHorizontal,
  X
} from "lucide-react";


const navigation = [

  {
    label: "Overview",
    icon: LayoutDashboard
  },

  {
    label: "Products",
    icon: Package
  },

  {
    label: "Orders",
    icon: ShoppingBag
  },

  {
    label: "Customers",
    icon: Users
  },

  {
    label: "Messages",
    icon: MessageCircle
  },

    {
    label: "Channels",
    icon: Radio
  },

{
  label: "AI Brain",
  page: "AI Assistant",
  icon: Bot
},

  {
    label: "Payments",
    icon: CreditCard
  },

  {
  label: "Wallet",
  icon: WalletCards
},

{
  label: "Plans & Billing",
  page: "Plans & Billing",
  icon: CreditCard
},

  {
    label: "Analytics",
    icon: BarChart3
  },

  {
  label: "Store",
  icon: Store
},


];



export default function Sidebar({
  open,
  activePage,
  business,
  onClose,
  onSelect,
  onLogout
}) {


  const businessName =
    business?.name ||
    "Your business";


  return (

    <aside
      className={
        open
          ? "dashboard-sidebar open"
          : "dashboard-sidebar"
      }
    >


      {/* =============================
          REAL RUNAMBIZ BRAND
      ============================== */}

      <div className="sidebar-brand">


       


        <button
          type="button"
          className="sidebar-mobile-close"
          onClick={onClose}
          aria-label="Close navigation"
        >

          <X size={20} />

        </button>


      </div>



      {/* =============================
          BUSINESS
      ============================== */}

     <button

  type="button"

  className="sidebar-business"

  onClick={() => {

    onSelect(
      "Store"
    );

    onClose();

  }}

  title="Manage business"

>


  <div className="sidebar-business-avatar">


    {business?.logo_url ? (

      <img

        src={
          business.logo_url
        }

        alt={
          businessName
        }

      />

    ) : (

      <span>

        {businessName
          .charAt(0)
          .toUpperCase()}

      </span>

    )}


  </div>



  <div className="sidebar-business-copy">

    <span>
      Business
    </span>

    <strong>
      {businessName}
    </strong>

  </div>



  <MoreHorizontal
    size={17}
  />


</button>


      {/* =============================
          NAVIGATION
      ============================== */}

      <nav className="sidebar-nav">


        <span className="sidebar-label">

          Workspace

        </span>


        {navigation.map(
          function(item) {

            const Icon =
              item.icon;


           const page =
  item.page ||
  item.label;


const active =
  activePage ===
  page;

            return (

              <button
                type="button"
                key={item.label}
                className={
                  active
                    ? "sidebar-link active"
                    : "sidebar-link"
                }
                onClick={() => {

                 onSelect(
  page
);

                  onClose();

                }}
              >

                <Icon size={18} />

                <span>
                  {item.label}
                </span>

              </button>

            );

          }
        )}


      </nav>



      {/* =============================
          BOTTOM
      ============================== */}

      <div className="sidebar-bottom">


        <button
          type="button"
          className="sidebar-link"
          onClick={() =>
            onSelect("Settings")
          }
        >

          <Settings size={18} />

          <span>
            Settings
          </span>

        </button>



        <button
          type="button"
          className="sidebar-link"
          onClick={() =>
            onSelect("Help & Support")
          }
        >

          <HelpCircle size={18} />

          <span>
            Help & support
          </span>

        </button>



        <button
          type="button"
          className="sidebar-link sidebar-logout"
          onClick={onLogout}
        >

          <LogOut size={18} />

          <span>
            Sign out
          </span>

        </button>


      </div>


    </aside>

  );

}
