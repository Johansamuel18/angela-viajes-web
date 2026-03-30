import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Plane } from 'lucide-react';

export default function Layout() {
  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/nueva-venta", icon: <PlusCircle size={20} />, label: "Nueva Venta" },
    { to: "/historial", icon: <History size={20} />, label: "Historial" },
  ];

  return (
    <div className="flex h-screen bg-pink-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 border-r border-pink-100 bg-white flex flex-col shadow-sm">
        <div className="p-6 flex items-center gap-3 border-b border-pink-50 group cursor-default">
          <div className="p-2.5 bg-pink-50 rounded-2xl group-hover:bg-pink-100 group-hover:shadow-inner transition-all duration-300">
            <Plane className="text-pink-500 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" size={26} />
          </div>
          <span className="font-extrabold text-2xl bg-gradient-to-br from-pink-500 via-pink-700 to-gray-800 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
            Angela Viajes
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-r from-pink-50 to-white text-pink-700 font-bold border border-pink-100 shadow-sm" 
                    : "text-gray-500 hover:bg-pink-50/80 hover:text-pink-600 hover:translate-x-1"
                }`
              }
            >
              <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                {item.icon}
              </div>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
