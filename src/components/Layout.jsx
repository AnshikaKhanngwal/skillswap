import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = () => {
  // 1. Create the state to track if sidebar is open
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 2. Functions to toggle state
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[#050208] overflow-hidden">
      {/* 3. Pass state and close function to Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <div className="flex flex-col flex-1 min-w-0">
        {/* 4. Pass the toggle function to Navbar so the button works */}
        <Navbar onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;