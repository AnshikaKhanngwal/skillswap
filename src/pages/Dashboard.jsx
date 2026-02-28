import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { 
  Trophy, Plus, User as UserIcon, BookOpen, 
  Zap, Trash2, Loader2, ArrowRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      setUser(user);
      await refreshData(user.id);
    };
    initializeDashboard();
  }, [navigate]);

  const refreshData = async (userId) => {
    const { data: userSkills } = await supabase.from("skills").select("*").eq("user_id", userId).order('created_at', { ascending: false });
    setSkills(userSkills || []);

    const { data: exploreSkills } = await supabase.from("skills").select("title").not("user_id", "eq", userId).limit(20);
    if (exploreSkills) {
      const userSkillTitles = new Set(userSkills?.map(s => s.title.toLowerCase()) || []);
      const uniqueSuggestions = Array.from(new Set(exploreSkills.map(s => s.title).filter(t => !userSkillTitles.has(t.toLowerCase())))).slice(0, 2);
      setSuggestions(uniqueSuggestions);
    }
    setLoading(false);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from("skills").insert([{ title, description, user_id: user.id }]);
    if (error) toast.error("Something went wrong");
    else { toast.success("Skill added!"); setTitle(""); setDescription(""); refreshData(user.id); }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (!error) { toast.success("Skill removed"); refreshData(user.id); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050208]">
      <Loader2 className="animate-spin text-fuchsia-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050208] text-slate-200 font-sans antialiased overflow-x-hidden">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* --- HEADER --- */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12"
        >
          <div className="text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">{user?.email?.split('@')[0]}</span>
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium mt-1 uppercase tracking-widest">Inventory of your Expertise</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
             <UserIcon size={14} className="text-pink-400" />
             <span className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-tighter">{user?.email}</span>
          </div>
        </motion.header>

        {/* --- TOP SECTION: STATS, ADD FORM, SUGGESTIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          
          {/* TOTAL SKILLS */}
          <div className="md:col-span-12 lg:col-span-3 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-fuchsia-500/20 rounded-[2rem] p-6 sm:p-8 flex flex-row lg:flex-col justify-between items-center lg:items-start relative overflow-hidden group">
            <Trophy className="absolute -right-2 -bottom-2 text-pink-500/10 group-hover:scale-110 transition-transform hidden lg:block" size={100} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-300">Total Skills</span>
            <h3 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none">{skills.length}</h3>
          </div>

          {/* ADD NEW SKILL - FIXED DESCRIPTION BOX */}
          <div className="md:col-span-8 lg:col-span-6 bg-[#0E0B16] border border-white/5 rounded-[2rem] p-6 sm:p-8 overflow-hidden">
            <form onSubmit={handleAddSkill} className="flex flex-col gap-4 h-full">
              <div className="flex flex-col gap-3 flex-1 min-w-0">
                <input 
                  type="text" placeholder="Skill Title" value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl outline-none focus:border-purple-500 text-sm font-bold text-white transition-all" required 
                />
                <textarea 
                  placeholder="Describe your mastery..." value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 p-3.5 rounded-xl flex-1 min-h-[100px] lg:min-h-0 outline-none focus:border-pink-500 text-sm resize-none text-slate-400 transition-all" 
                />
              </div>
              <button type="submit" className="w-full py-4 bg-gradient-to-b from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-purple-500/10 active:scale-95 shrink-0">
                <Plus size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Deploy Skill</span>
              </button>
            </form>
          </div>

          {/* SUGGESTIONS */}
          <div className="md:col-span-4 lg:col-span-3 bg-[#0E0B16] border border-white/5 rounded-[2rem] p-6 sm:p-8">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 block mb-4">Recommended</span>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => navigate(`/explore?search=${s}`)} className="w-full flex items-center justify-between p-3.5 bg-white/5 rounded-xl hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20 transition-all group text-left">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-tight">{s}</span>
                  <ArrowRight size={14} className="text-slate-700 group-hover:text-pink-500 transition-colors" />
                </button>
              ))}
              {suggestions.length === 0 && <p className="text-slate-700 text-[10px] uppercase font-bold italic">No new leads...</p>}
            </div>
          </div>
        </div>

        {/* --- LIST OF SKILLS --- */}
        <div className="pb-20">
          <div className="flex items-center gap-4 mb-8">
             <div className="h-[2px] w-8 bg-pink-500" />
             <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-600">Active Database</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {skills.map((skill) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={skill.id} 
                  className="group relative bg-[#0E0B16] p-6 sm:p-8 rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-0 right-12 w-12 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-white/5 rounded-2xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                      <BookOpen size={20} />
                    </div>
                    <button onClick={() => handleDelete(skill.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-700 hover:text-red-500 transition-all duration-300">
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2 uppercase tracking-tight group-hover:text-pink-400 transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed italic line-clamp-3 min-h-[3rem]">
                    {skill.description || "No classification provided for this module."}
                  </p>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sync Status: OK</span>
                    </div>
                    <Zap size={14} className="text-slate-800 group-hover:text-pink-500 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {skills.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">No skills indexed in current profile</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;



