
import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { 
  Link as LinkIcon, 
  Search, 
  ExternalLink, 
  Loader2, 
  Globe, 
  FolderOpen,
  Plus,
  Trash2,
  ChevronDown // Added for the dropdown icon
} from "lucide-react";
import toast from "react-hot-toast";

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [visibility, setVisibility] = useState("public"); // Default visibility
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchGlobalResources();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchGlobalResources = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // We fetch resources that are either 'public' OR owned by the current user
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .or(`visibility.eq.public,user_id.eq.${user?.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to sync resources");
    } finally {
      setLoading(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return toast.error("Please login");

      let cleanUrl = resUrl.trim();
      if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;

      const { error } = await supabase.from("resources").insert([{ 
        user_id: user.id, 
        title: resTitle, 
        url: cleanUrl,
        visibility: visibility // Added visibility to the insert logic
      }]);

      if (error) throw error;

      toast.success(`Module Shared (${visibility})`);
      setResTitle("");
      setResUrl("");
      setVisibility("public");
      fetchGlobalResources(); 
    } catch (err) {
      toast.error("Failed to add resource");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (e, resourceId) => {
    e.stopPropagation(); 
    
    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", resourceId);

    if (error) {
      toast.error("Could not delete resource");
    } else {
      toast.success("Resource Removed");
      fetchGlobalResources();
    }
  };

  if (loading) return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-[#050208]">
      <Loader2 className="animate-spin text-purple-500" size={40} />
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-[#050208] text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-4">
            Shared <span className="text-pink-500">Modules</span>
          </h1>
          <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-bold">
            Access the collective knowledge of the Nexus
          </p>
        </header>

        <section className="bg-[#0E0B16] border border-white/5 p-8 rounded-[3rem] mb-12 shadow-2xl shadow-purple-500/5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 flex items-center gap-2">
            <Plus size={14} className="text-pink-500" /> Share New Module
          </h2>
          <form onSubmit={handleAddResource} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                value={resTitle} 
                onChange={e => setResTitle(e.target.value)} 
                placeholder="Module Name" 
                className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-purple-500 text-sm" 
                required 
              />
              <input 
                value={resUrl} 
                onChange={e => setResUrl(e.target.value)} 
                placeholder="URL" 
                className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-purple-500 text-sm" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visibility Selector */}
              <div className="relative group">
                <select 
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-purple-500 text-sm appearance-none cursor-pointer text-slate-300 font-bold uppercase tracking-widest"
                >
                  <option value="public" className="bg-[#0E0B16] text-white">Public (Everyone can see)</option>
                  <option value="private" className="bg-[#0E0B16] text-white">Private (Only me)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] hover:bg-pink-600 hover:text-white transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Syncing..." : "Broadcast Link"}
              </button>
            </div>
          </form>
        </section>

        <div className="relative max-w-xl mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="w-full bg-[#0E0B16] border border-white/5 py-4 pl-12 pr-4 rounded-2xl outline-none focus:border-pink-500/50 transition-all text-sm" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase())).map((res) => (
            <div 
              key={res.id} 
              onClick={() => window.open(res.url, '_blank')}
              className="group bg-[#0E0B16] border border-white/5 p-6 rounded-[2rem] hover:border-pink-500/30 transition-all cursor-pointer relative flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex flex-col gap-1">
                  <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl group-hover:bg-pink-500 group-hover:text-white transition-all w-fit">
                    <LinkIcon size={20} />
                  </div>
                  {/* Visibility Tag */}
                  <span className={`text-[7px] font-black uppercase tracking-widest mt-2 px-2 py-1 rounded-md w-fit ${res.visibility === 'private' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {res.visibility || 'public'}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  {currentUserId === res.user_id && (
                    <button 
                      onClick={(e) => handleDeleteResource(e, res.id)}
                      className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                      title="Delete Module"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <ExternalLink size={16} className="text-slate-800 group-hover:text-white mt-2" />
                </div>
              </div>
              
              <h3 className="text-lg font-black uppercase leading-tight mb-2 group-hover:text-pink-400">
                {res.title}
              </h3>
              
              <div className="mt-auto flex items-center gap-2 text-slate-600">
                <Globe size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest truncate">
                  {new URL(res.url.startsWith('http') ? res.url : `https://${res.url}`).hostname}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;