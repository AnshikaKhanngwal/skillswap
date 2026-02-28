
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { Search, Zap, Loader2, User as UserIcon, Globe } from "lucide-react";
import toast from "react-hot-toast";

const Explore = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (!error) {
        setSkills(data?.filter(s => s.user_id !== user?.id) || []);
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSendRequest = async (e, skill) => {
    e.stopPropagation(); 
    
    if (!currentUser) {
      toast.error("Please login first");
      return;
    }

    const { error } = await supabase.from("requests").insert([{ 
      sender_id: currentUser.id, 
      receiver_id: skill.user_id, 
      skill_id: skill.id, 
      status: "pending" 
    }]);

    if (error) {
      toast.error("Already requested or error occurred");
    } else {
      // Updated notification message
      toast.success("Request Sent");
    }
  };

  const filtered = skills.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050208]">
      <Loader2 className="animate-spin text-purple-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050208] text-white p-4 md:p-12">
      <header className="mb-12">
        {/* Updated Heading */}
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-6">
          Explore <span className="text-purple-500">New Skills</span>
        </h1>
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search skills (e.g. Design, React)..." 
            className="w-full bg-white/5 border border-white/10 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-purple-500/50 transition-all" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((skill) => (
          <div 
            key={skill.id} 
            onClick={() => navigate(`/profile/${skill.user_id}`)}
            className="bg-[#0E0B16] border border-white/5 p-8 rounded-[2.5rem] group relative overflow-hidden cursor-pointer hover:border-purple-500/40 hover:bg-white/[0.02] transition-all active:scale-[0.98] flex flex-col h-full"
          >
            <div className="flex justify-between mb-6">
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                <UserIcon size={20} />
              </div>
              <div className="flex flex-col items-end">
                <Globe size={18} className="text-slate-800 group-hover:text-pink-500 transition-colors" />
                <span className="text-[8px] font-bold text-slate-700 mt-1 uppercase tracking-widest">View Profile</span>
              </div>
            </div>

            <h3 className="text-2xl font-black uppercase mb-2 group-hover:text-purple-400 transition-colors">
              {skill.title}
            </h3>
            <p className="text-slate-500 text-sm mb-8 line-clamp-2 italic leading-relaxed flex-grow">
              {skill.description}
            </p>

            <button 
              onClick={(e) => handleSendRequest(e, skill)} 
              // Updated Button Text
              className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-xs hover:bg-purple-600 hover:text-white transition-all shadow-xl mt-auto"
            >
              <Zap size={14} className="inline mr-2 fill-current" /> Send Request
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 border border-dashed border-white/5 rounded-[3rem]">
          <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-xs">No matching signals found in the nexus</p>
        </div>
      )}
    </div>
  );
};

export default Explore;