import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { ArrowUpRight, ArrowDownLeft, Trash2, MessageSquare, Loader2, Sparkles, Zap } from "lucide-react";
import toast from "react-hot-toast";
import ChatModal from "../components/ChatModal";
import { motion, AnimatePresence } from "framer-motion";

const Requests = () => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: incData } = await supabase.from("requests").select(`*, skills(title)`).eq("receiver_id", user.id);
      const { data: outData } = await supabase.from("requests").select(`*, skills(title)`).eq("sender_id", user.id);

      setIncoming(incData || []);
      setOutgoing(outData || []);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    const { error } = await supabase.from("requests").update({ status: 'accepted' }).eq("id", requestId);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Swap Accepted!");
      setIncoming(prev => prev.map(req => req.id === requestId ? { ...req, status: 'accepted' } : req));
    }
  };

  const handleDelete = async (requestId) => {
    const { error } = await supabase.from("requests").delete().eq("id", requestId);
    if (!error) {
      toast.success("Removed");
      fetchRequests();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050208]">
      <Loader2 className="animate-spin text-fuchsia-500" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050208] text-slate-200 font-sans antialiased overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 space-y-10 md:space-y-16">
        
        {/* --- INCOMING SECTION --- */}
        <section>
          <header className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="p-2.5 md:p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl md:rounded-2xl shrink-0">
                <ArrowDownLeft className="text-purple-400" size={20} />
            </div>
            <div>
                <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Incoming <span className="text-purple-500 not-italic">Swaps</span></h2>
                <p className="text-slate-500 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] mt-1">Knowledge Seekers</p>
            </div>
          </header>

          <div className="grid gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {incoming.map((req) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={req.id} 
                  className="bg-[#0E0B16] p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6 hover:border-purple-500/30 transition-all shadow-xl group"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-white/5 rounded-lg md:rounded-2xl flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                        <Zap size={18} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-base md:text-xl font-black text-white tracking-tight uppercase truncate">{req.skills?.title || "Unknown Skill"}</h3>
                        <p className="text-slate-600 text-[8px] md:text-[9px] uppercase font-bold tracking-widest mt-0.5">ID: {req.id.slice(0, 8)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    {req.status === 'accepted' ? (
                      <button onClick={() => setSelectedChat(req)} className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-95 transition-all">
                        <MessageSquare size={14} /> Chat
                      </button>
                    ) : (
                      <button onClick={() => handleAccept(req.id)} className="flex-1 sm:flex-none bg-white text-black px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-white active:scale-95 transition-all">
                        Accept
                      </button>
                    )}
                    <button onClick={() => handleDelete(req.id)} className="p-2.5 md:p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg md:rounded-xl transition-all shrink-0">
                        <Trash2 size={16}/>
                    </button>
                  </div>
                </motion.div>
              ))}
              {incoming.length === 0 && (
                <div className="py-8 md:py-12 text-center border-2 border-dashed border-white/5 rounded-2xl md:rounded-[2rem]">
                  <p className="text-slate-700 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">No incoming signals detected</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* --- OUTGOING SECTION --- */}
        <section>
          <header className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="p-2.5 md:p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl md:rounded-2xl shrink-0">
                <ArrowUpRight className="text-pink-400" size={20} />
            </div>
            <div>
                <h2 className="text-xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">Sent <span className="text-pink-500 not-italic">Requests</span></h2>
                <p className="text-slate-500 text-[9px] md:text-xs font-black uppercase tracking-[0.2em] mt-1">Target Masteries</p>
            </div>
          </header>

          <div className="grid gap-3 md:gap-4">
            <AnimatePresence mode="popLayout">
              {outgoing.map((req) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={req.id} 
                  className="bg-[#0E0B16] p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6 hover:border-pink-500/30 transition-all shadow-xl group"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-white/5 rounded-lg md:rounded-2xl flex items-center justify-center text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition-all">
                        <Sparkles size={18} />
                    </div>
                    <h3 className="text-base md:text-xl font-black text-white tracking-tight uppercase truncate">{req.skills?.title || "Unknown Skill"}</h3>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    {req.status === 'accepted' && (
                      <button onClick={() => setSelectedChat(req)} className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                        <MessageSquare size={14} /> Chat
                      </button>
                    )}
                    <span className={`flex-1 sm:flex-none text-center text-[8px] md:text-[9px] font-black uppercase tracking-widest px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border ${req.status === 'accepted' ? 'border-pink-500/50 text-pink-400 bg-pink-500/5' : 'border-white/10 text-slate-600 bg-white/5'}`}>
                        {req.status}
                    </span>
                    <button onClick={() => handleDelete(req.id)} className="p-2.5 md:p-3 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg md:rounded-xl transition-all shrink-0">
                        <Trash2 size={16}/>
                    </button>
                  </div>
                </motion.div>
              ))}
              {outgoing.length === 0 && (
                <div className="py-8 md:py-12 text-center border-2 border-dashed border-white/5 rounded-2xl md:rounded-[2rem]">
                  <p className="text-slate-700 font-bold uppercase tracking-widest text-[9px] md:text-[10px]">Archives Empty: No requests transmitted</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {selectedChat && <ChatModal request={selectedChat} onClose={() => setSelectedChat(null)} />}
      </div>
    </div>
  );
};

export default Requests;