import {
  Home,
  Package,
  ShoppingBag,
  MessageCircle,
  Menu
} from "lucide-react";


const mobileNavigation = [

  {
    label: "Overview",
    shortLabel: "Home",
    icon: Home
  },

  {
    label: "Products",
    shortLabel: "Products",
    icon: Package
  },

  {
    label: "Orders",
    shortLabel: "Orders",
    icon: ShoppingBag
  },

  {
    label: "Messages",
    shortLabel: "Messages",
    icon: MessageCircle
  }

];



export default function MobileBottomNav({
  activePage,
  onSelect,
  onMore
}) {

  return (

    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile navigation"
    >


      {mobileNavigation.map(
        function(item) {

          const Icon =
            item.icon;


          const active =
            activePage ===
            item.label;


          return (

            <button
              type="button"
              key={item.label}
              className={
                active
                  ? "mobile-nav-item active"
                  : "mobile-nav-item"
              }
              onClick={() =>
                onSelect(item.label)
              }
            >

              <span className="mobile-nav-icon">

                <Icon size={20} />

              </span>

              <span>
                {item.shortLabel}
              </span>

            </button>

          );

        }
      )}



      <button
        type="button"
        className="mobile-nav-item"
        onClick={onMore}
      >

        <span className="mobile-nav-icon">

          <Menu size={20} />

        </span>

        <span>
          More
        </span>

      </button>


    </nav>

  );

}