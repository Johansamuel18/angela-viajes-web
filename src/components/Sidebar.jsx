import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { to: "/nueva-venta", icon: <PlusCircle size={20} />, label: "Nueva Venta" },
    { to: "/historial", icon: <History size={20} />, label: "Historial" },
  ];

  return (
    <aside className="w-72 h-full flex flex-col bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.4)] z-50">
      <div className="p-8 flex items-center gap-4 border-b border-white/5 cursor-default relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff2a70]/0 via-[#ff2a70]/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
        <div className="relative flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 p-2.5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#rose-gradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 drop-shadow-[0_0_12px_rgba(255,42,112,0.8)] group-hover:scale-110 transition-transform duration-500 ease-out"
          >
            <defs>
              <linearGradient id="rose-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#ff2a70" />
                <stop offset="100%" stopColor="#ff0055" />
              </linearGradient>
            </defs>
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3.5 3.5-2.8-.8c-.4-.1-.8.1-1 .5L1.5 17l4 1 1 4 .8-.2c.4-.2.6-.6.5-1l-.8-2.8 3.5-3.5 5 6l1.2-.7c.4-.2.7-.6.6-1.1z" />
          </svg>
        </div>
        <div className="flex flex-col z-10 transition-all duration-300">
          <span className="font-extrabold text-2xl text-white tracking-tight drop-shadow-lg">Angela</span>
          <span className="text-[11px] font-bold text-[#ff2a70] tracking-[0.25em] uppercase mt-0.5 drop-shadow-[0_0_8px_rgba(255,42,112,0.6)]">Viajes</span>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-3 relative z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
                ? "bg-white/10 text-white font-bold border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-[#ff2a70] to-[#f83a8f] rounded-r-full shadow-[0_0_15px_rgba(255,42,112,1)]" />
                )}
                <div className={`transition-transform duration-300 group-hover:scale-110 z-10 ${isActive ? 'text-[#ff2a70] drop-shadow-[0_0_10px_rgba(255,42,112,0.8)]' : 'text-gray-500 group-hover:text-gray-300'}`}>
                  {item.icon}
                </div>
                <span className={`z-10 ${isActive ? 'text-white' : ''}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 opacity-50 text-[10px] text-center text-gray-400 font-medium tracking-widest uppercase relative z-10">
        © 2026 Angela Viajes
      </div>
    </aside>
  );
}
