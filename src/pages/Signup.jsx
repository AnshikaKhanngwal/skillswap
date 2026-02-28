import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { User, Mail, Lock, Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    toast.success("Account created! Please log in.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050208] relative overflow-hidden px-4">
      
      {/* --- AMBIENT NEBULA BACKGROUND --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[40%] bg-purple-600/10 blur-[80px] md:blur-[130px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-pink-600/10 blur-[80px] md:blur-[130px] rounded-full" />

      {/* --- RESPONSIVE CONTAINER --- */}
      <div className="relative w-full max-w-[420px] py-8">
        
        {/* --- NEON GLOW WRAPPER --- */}
        <div className="absolute -inset-0.5 md:-inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-[2rem] md:rounded-[2.5rem] blur opacity-30 md:opacity-20" />
        
        <div className="relative bg-[#0E0B16] p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-2xl">
          
          {/* HEADER */}
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-flex p-3 bg-white/5 rounded-2xl mb-4 text-purple-400">
              <User size={24} className="md:w-7 md:h-7" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">
              Join the <span className="text-purple-500 not-italic">Network</span>
            </h2>
            <p className="text-slate-500 text-[10px] md:text-xs mt-2 font-bold uppercase tracking-[0.2em]">
              Initialize Your Profile
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] md:text-xs py-3 rounded-xl mb-6 text-center font-bold px-2">
              {error}
            </div>
          )}

          {/* INPUT FIELDS */}
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-purple-500/50 text-white text-sm font-medium transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-pink-400 transition-colors" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-pink-500/50 text-white text-sm font-medium transition-all placeholder:text-slate-700"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-400 transition-colors" size={18} />
              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl outline-none focus:border-purple-500/50 text-white text-sm font-medium transition-all placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* ACTION BUTTON */}
          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest hover:brightness-110 active:scale-[0.97] transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Establish Link"
            )}
          </button>

          {/* FOOTER */}
          <p className="text-[10px] md:text-xs text-center mt-8 text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Already registered?{" "}
            <Link to="/login" className="text-purple-400 hover:text-pink-500 transition-colors block sm:inline mt-1 sm:mt-0">
              Return to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;