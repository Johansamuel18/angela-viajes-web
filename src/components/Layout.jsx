import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden text-white w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full px-4 pb-32 pt-2 md:p-8 relative">
        <div className="max-w-7xl mx-auto w-full h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
