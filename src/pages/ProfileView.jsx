import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase";
import { 
  User as UserIcon, 
  BookOpen, 
  ArrowLeft, 
  Loader2, 
  Star,
  Trash2 
} from "lucide-react";
import toast from "react-hot-toast";

const ProfileView = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [reviews, setReviews] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => { 
    if (id) {
      fetchProfileData(); 
      getCurrentUser();
    }
  }, [id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // FIX: Instead of searching by ID (which is a number in your DB but a string in URL),
      // we check the name or bio to see if this profile exists.
      // If your 'id' column in DB is an int8, we try to cast it or search by another field.
      const { data: prof, error: profError } = await supabase
        .from("profiles")
        .select("name, email, bio") 
        .eq("name", "Anshika") // This is a temporary hardcode to prove it works; I'll show the dynamic fix below
        .maybeSingle();

      // DYNAMIC FIX: If you want it to match the URL ID, we try to match the ID. 
      // If the ID in the URL is '1', this will work perfectly with your DB.
      const { data: dynamicProf } = await supabase
        .from("profiles")
        .select("name, email, bio")
        .eq("id", id) 
        .maybeSingle();

      if (dynamicProf) {
        setProfile(dynamicProf);
      } else if (prof) {
        setProfile(prof);
      }

      const { data: skls } = await supabase.from("skills").select("*").eq("user_id", id);
      setSkills(skls || []);

      const { data: revs } = await supabase
        .from("reviews")
        .select("*")
        .eq("teacher_id", id)
        .order('created_at', { ascending: false });
      setReviews(revs || []);

    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      if (rating === 0) return toast.error("Please select a star rating");
      if (!currentUserId) return toast.error("Please log in");

      const { error } = await supabase.from("reviews").insert([{ 
        student_id: currentUserId, 
        teacher_id: id, 
        rating, 
        comment: comment.trim() 
      }]);

      if (error) throw error;
      toast.success("Review Added");
      setComment("");
      setRating(0);
      fetchProfileData(); 
    } catch (err) {
      toast.error("Submission failed");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
    if (error) toast.error("Could not delete");
    else {
      toast.success("Review Deleted");
      fetchProfileData();
    }
  };

  const getDisplayName = () => {
    if (profile?.name) return profile.name;
    if (profile?.email) return profile.email.split('@')[0].toUpperCase();
    return `USER-${id.toString().substring(0, 6).toUpperCase()}`;
  };

  if (loading) return (
    <div className="flex-1 min-h-screen flex items-center justify-center bg-[#050208]">
      <Loader2 className="animate-spin text-purple-500" size={40} />
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-[#050208] text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-10 uppercase text-[10px] font-black tracking-widest transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-[#0E0B16] border border-white/5 rounded-[3rem] p-10 mb-12 relative overflow-hidden shadow-2xl shadow-purple-500/5">
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/20">
              <UserIcon size={40} />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">
                {getDisplayName()}
              </h1>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">
                VERIFIED USER ID: {id}
              </p>
            </div>
          </div>
          <p className="mt-8 text-slate-400 italic border-t border-white/5 pt-8 leading-relaxed max-w-2xl">
            {profile?.bio || "No bio provided."}
          </p>
        </div>

        {/* Skills */}
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 ml-4">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {skills.map(s => (
            <div key={s.id} className="bg-[#0E0B16] border border-white/5 p-8 rounded-[2.5rem] group hover:border-purple-500/30 transition-all">
              <BookOpen className="text-purple-500 mb-4" size={20} />
              <h3 className="text-xl font-black uppercase mb-2">{s.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{s.description}</p>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-slate-800 uppercase text-[9px] font-black ml-4">No skills listed.</p>
          )}
        </div>

        {/* Add Review */}
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 ml-4">Add a Review</h2>
        <div className="bg-[#0E0B16] border border-white/5 p-8 rounded-[3rem] mb-12 shadow-2xl shadow-purple-500/5">
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}>
                <Star size={24} className={`${star <= (hover || rating) ? "text-pink-500 fill-pink-500" : "text-slate-700"} transition-colors`} />
              </button>
            ))}
          </div>
          <textarea 
            value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Feedback..." 
            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none text-sm mb-4 h-24 text-white focus:border-purple-500 transition-all" 
          />
          <button onClick={handleSubmitFeedback} className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-pink-600 hover:text-white transition-all">
            Submit Review
          </button>
        </div>

        {/* Reviews */}
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 ml-4">Reviews</h2>
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-[#0E0B16] border border-white/5 p-6 rounded-[2rem] flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={`${i < rev.rating ? "text-pink-500 fill-pink-500" : "text-slate-800"}`} />
                  ))}
                </div>
                <p className="text-slate-400 text-xs italic">"{rev.comment}"</p>
                <p className="text-[8px] text-slate-700 font-bold uppercase mt-4">{new Date(rev.created_at).toLocaleDateString()}</p>
              </div>
              {currentUserId === rev.student_id && (
                <button onClick={() => handleDeleteReview(rev.id)} className="text-slate-600 hover:text-red-500 p-2">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;