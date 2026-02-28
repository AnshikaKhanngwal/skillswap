
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Added useNavigate
import supabase from "../lib/supabase";
import { Search, Bell, Sparkles, Menu } from "lucide-react";

const Navbar = ({ onMenuClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate(); // 2. Initialized navigate

  useEffect(() => {
    getNotificationCount();

    const channel = supabase
      .channel('navbar-notifications')
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

    const { count } = await supabase
      .from("requests")
      .select("*", { count: 'exact', head: true })
      .eq("receiver_id", user.id)
      .eq("status", "pending");

    setUnreadCount(count || 0);
  };

  return (
    <nav className="h-20 bg-[#050208] border-b border-white/5 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
      
      {/* --- LEFT SECTION: MENU & SEARCH --- */}
      <div className="flex items-center gap-4 flex-1">
        {/* MOBILE MENU BUTTON (Hidden on Desktop) */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <Menu size={24} />
        </button>

        {/* --- RESPONSIVE SEARCH INPUT --- */}
        <div className="relative w-full max-w-[180px] sm:max-w-md group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl blur-sm group-focus-within:blur-md group-focus-within:from-purple-500/50 group-focus-within:to-pink-500/50 transition-all duration-500"></div>
          
          <div className="relative flex items-center bg-[#0E0B16] rounded-xl">
            <Search className="absolute left-3 md:left-4 text-slate-500 group-focus-within:text-pink-400 transition-colors w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-2.5 bg-transparent border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 transition-all text-xs md:text-sm text-slate-200 placeholder:text-slate-700 font-bold"
            />
          </div>
        </div>
      </div>
      
      {/* --- RIGHT SECTION: ACTIONS --- */}
      <div className="flex items-center gap-1 md:gap-4 ml-4">
        
        {/* NOTIFICATION BELL */}
        <button 
          // 3. Added onClick handler to navigate to /requests
          onClick={() => navigate("/requests")}
          className="relative p-2 md:p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
        >
          <Bell size={20} className="md:w-[22px] md:h-[22px] group-hover:rotate-12 transition-transform" />
          
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 md:-top-1 md:-right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(217,70,239,0.5)] animate-pulse border-2 border-[#050208]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* SPARKLES */}
        <div className="hidden xs:flex p-2 text-purple-500/30 hover:text-purple-400 transition-colors">
           <Sparkles size={18} />
        </div>

      </div>
    </nav>
  );
};

export default Navbar;