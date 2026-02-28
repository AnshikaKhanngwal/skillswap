
import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase"; 
import { 
  LayoutDashboard, 
  Trophy, 
  Search, 
  MessageSquare, 
  LogOut, 
  BookOpen,
  Library,
  Video, // Added for Sessions
  X 
} from "lucide-react";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getNotificationCount();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        () => getNotificationCount() 
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const getNotificationCount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count, error } = await supabase
      .from("requests")
      .select("*", { count: 'exact', head: true })
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    if (!error) setUnreadCount(count || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "My Skills", path: "/my-skills", icon: BookOpen },
    { name: "Explore", path: "/explore", icon: Search },
    { name: "Resources", path: "/resources", icon: Library },
    { name: "Sessions", path: "/sessions", icon: Video }, // Added Sessions Item
    { name: "Requests", path: "/requests", icon: MessageSquare, hasBadge: true },
  ];

  return (
    <>
      {/* MOBILE OVERLAY: Dims the background when sidebar is open on mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* SIDEBAR ASIDE */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        w-72 bg-[#050208] border-r border-white/5 p-8 flex flex-col h-screen shadow-2xl
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        
        {/* BRANDING & CLOSE BUTTON */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-xl">
              <Trophy className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white italic">
              Skill<span className="text-pink-500 not-italic">Swap</span>
            </h1>
          </div>
          
          {/* Close button - Only visible on mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-500 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose} // Closes sidebar when a link is clicked on mobile
              className={({ isActive }) =>
                `flex items-center justify-between py-3 px-4 rounded-xl font-semibold transition-all duration-200
                ${isActive 
                  ? "bg-purple-500/10 text-fuchsia-400 border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.1)]" 
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-200"}`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} />
                {item.name}
              </div>

              {item.hasBadge && unreadCount > 0 && (
                <span className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 bg-white/5 text-slate-400 py-3 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all duration-200"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;