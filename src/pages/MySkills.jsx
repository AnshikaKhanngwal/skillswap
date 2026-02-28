import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { BookOpen, Trash2, Sparkles, Zap, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const MySkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserAndSkills = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("skills")
          .select("*")
          .eq("user_id", user.id)
          .order('created_at', { ascending: false });

        setSkills(data || []);
      }
      setLoading(false);
    };

    getUserAndSkills();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (!error) {
      toast.success("Skill removed");
      setSkills(skills.filter((skill) => skill.id !== id));
    } else {
      toast.error("Could not delete");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050208]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.5)]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050208] text-slate-200 font-sans antialiased overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col sm:flex-row justify-between items-center sm:items-end mb-10 md:mb-12 gap-6 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <Sparkles className="text-pink-500 w-4 h-4 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-slate-500">The Vault</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-none">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Expertise</span>
            </h2>
          </div>
          
          <Link to="/dashboard" className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-white/5 border border-white/10 px-6 py-3.5 rounded-2xl hover:bg-fuchsia-500/10 hover:border-fuchsia-500/50 transition-all active:scale-95 shadow-xl shadow-purple-500/5">
            <Plus className="text-pink-500 group-hover:rotate-90 transition-transform" size={18} />
            <span className="text-xs md:text-sm font-black uppercase tracking-widest">New Skill</span>
          </Link>
        </header>

        {/* SKILLS GRID */}
        {skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {skills.map((skill) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={skill.id} 
                  className="group relative bg-[#0E0B16] p-6 sm:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 hover:border-purple-500/30 transition-all duration-500 shadow-2xl overflow-hidden"
                >
                  {/* Neon Glow Hover Decorations */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                      <BookOpen size={20} className="md:w-[22px] md:h-[22px]" />
                    </div>
                    <button 
                      onClick={() => handleDelete(skill.id)} 
                      className="p-2 text-slate-700 hover:text-red-500 transition-all"
                      title="Delete Skill"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 md:mb-3 tracking-tighter uppercase group-hover:text-pink-400 transition-all duration-500 relative z-10">
                    {skill.title}
                  </h3>
                  
                  <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed line-clamp-3 italic group-hover:text-slate-300 transition-colors relative z-10 min-h-[3rem]">
                    {skill.description || "No classification data provided."}
                  </p>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-purple-500" fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 group-hover:text-pink-400 transition-colors">Verified Module</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-800 uppercase">#{skill.id.toString().slice(-4)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* ZERO STATE (RESPONSIVE) */
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex flex-col items-center justify-center py-20 md:py-32 px-4 border-2 border-dashed border-white/5 rounded-[2.5rem] md:rounded-[3rem] bg-white/[0.01] text-center"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <BookOpen size={30} className="md:w-[40px] md:h-[40px] text-slate-700" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2 uppercase tracking-tight">Archives Empty</h3>
            <p className="text-slate-500 text-sm mb-8 max-w-[250px] md:max-w-none">You haven't indexed any skills in your neural vault yet.</p>
            <Link to="/dashboard" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
              Initialize First Skill
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MySkills;