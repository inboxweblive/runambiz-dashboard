import {
  Bell,
  Download,
  Menu,
  Moon,
  Search,
  Sun
} from "lucide-react";


export default function Topbar({
  theme,
  profile,
  user,
  business,
  installed,
  notificationCount = 0,
  onMenuOpen,
  onThemeToggle,
  onInstallOpen,
  onNotificationsOpen,
  onProfileOpen
}) {

  const fullName =
    profile?.full_name ||
    "Runambiz User";



      const businessName =
  business?.name?.trim() ||
  "Your business";


const businessInitial =
  businessName
    .charAt(0)
    .toUpperCase();


const businessLogo =
  business?.logo_url ||
  null;


  return (

    <header className="dashboard-topbar">


      {/* ===========================
          LEFT
      ============================ */}

      <div className="topbar-left">


        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuOpen}
          aria-label="Open navigation"
        >

          <Menu size={21} />

        </button>



        {/* MOBILE BRAND */}

        <img
          src="/runambizlogo.webp"
          alt="Runambiz"
          className="mobile-dashboard-logo"
        />



        {/* SEARCH */}

        <div className="dashboard-search">

          <Search size={17} />

          <input
            type="search"
            placeholder="Search Runambiz..."
          />

          <span>
            ⌘ K
          </span>

        </div>


      </div>



      {/* ===========================
          RIGHT
      ============================ */}

      <div className="topbar-actions">

        {!installed && (

  <button
    type="button"
    className="install-topbar-button"
    onClick={onInstallOpen}
    aria-label="Install Runambiz"
    title="Install Runambiz"
  >

    <Download size={18} />

    <span>
      Install
    </span>

  </button>

)}


        {/* THEME */}

        <button
          type="button"
          className="icon-button theme-toggle-button"
          onClick={onThemeToggle}
          aria-label={
            theme === "dark"
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            theme === "dark"
              ? "Light mode"
              : "Dark mode"
          }
        >

          {theme === "dark"
            ? <Sun size={19} />
            : <Moon size={19} />
          }

        </button>



        {/* NOTIFICATION */}

      {/* NOTIFICATIONS */}

<button

  type="button"

  className="icon-button topbar-notification-button"

  aria-label={
    notificationCount > 0
      ? `${notificationCount} unread notifications`
      : "Notifications"
  }

  title="Notifications"

  onClick={
    onNotificationsOpen
  }

>

  <Bell
    size={19}
  />


  {notificationCount > 0 && (

    <span className="notification-dot">

      {notificationCount > 9
        ? "9+"
        : notificationCount}

    </span>

  )}

</button>


        {/* USER */}

      {/* BUSINESS / PROFILE */}

<button

  type="button"

  className="topbar-user"

  onClick={
    onProfileOpen
  }

  title="Profile & Settings"

  aria-label="Open Profile and Settings"

>


  <div className="user-avatar">


    {businessLogo ? (

      <img

        src={
          businessLogo
        }

        alt={
          businessName
        }

      />

    ) : (

      <span>

        {businessInitial ||
          "R"}

      </span>

    )}


  </div>



  <div className="user-copy">

    <strong>
      {fullName}
    </strong>

    <span>
      {user?.email}
    </span>

  </div>


</button>


      </div>


    </header>

  );

}
