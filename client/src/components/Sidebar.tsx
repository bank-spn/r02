import { useState } from "react";
import { Menu, X, LayoutDashboard, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentPage?: string;
}

export default function Sidebar({ currentPage = "dashboard" }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/",
      external: false,
    },
    {
      id: "price-check",
      label: "Price Check",
      icon: DollarSign,
      href: "https://www.thailandpost.co.th/index.php?page=rate_result_nrs3",
      external: true,
    },
    {
      id: "create-recipient",
      label: "Create Recipient",
      icon: FileText,
      href: "https://dpostinter.thailandpost.com/#/label/form",
      external: true,
    },
  ];

  const handleMenuItemClick = (item: typeof menuItems[0]) => {
    if (item.external) {
      window.open(item.href, "_blank");
    } else {
      window.location.href = item.href;
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-900" />
        ) : (
          <Menu className="h-6 w-6 text-gray-900" />
        )}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-100 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.external && (
                  <span className="ml-auto text-xs text-gray-400">↗</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            International Parcel Tracker v1.0
          </p>
        </div>
      </aside>

      {/* Main Content Spacer (Desktop only) */}
      <div className="hidden lg:block w-64" />
    </>
  );
}
