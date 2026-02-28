import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import { 
  Video, 
  Calendar, 
  Clock, 
  Plus, 
  Loader2, 
  ExternalLink,
  Trash2,
  VideoOff
} from "lucide-react";
import toast from "react-hot-toast";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      fetchSessions(user.id);
    }
    setLoading(false);
  };

  const fetchSessions = async (userId) => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .or(`host_id.eq.${userId},participant_id.eq.${userId}`)
      .order("scheduled_at", { ascending: true });

    if (!error) setSessions(data || []);
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!meetingLink.includes("meet.google.com")) {
        return toast.error("Please provide a valid Google Meet link");
    }

    const scheduledTimestamp = new Date(`${date}T${time}`).toISOString();

    const { error } = await supabase.from("sessions").insert([{
      title,
      scheduled_at: scheduledTimestamp,
      duration_minutes: duration,
      meeting_link: meetingLink,
      host_id: currentUser.id,
      status: 'scheduled'
    }]);

    if (error) {
      toast.error("Failed to schedule session");
    } else {
      toast.success("Exchange Session Scheduled!");
      setShowForm(false);
      setTitle("");
      setMeetingLink("");
      fetchSessions(currentUser.id);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-purple-500" /></div>;

  return (
    <div className="flex-1 min-h-screen bg-[#050208] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">
              Exchange <span className="text-purple-500">Sessions</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Manage your virtual meeting nexus</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-black p-4 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-purple-500 hover:text-white transition-all"
          >
            {showForm ? "Cancel" : <><Plus size={16}/> New Session</>}
          </button>
        </header>

        {showForm && (
          <section className="bg-[#0E0B16] border border-white/5 p-8 rounded-[3rem] mb-12 animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Session Title (e.g., React Mentoring)" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-purple-500 text-sm md:col-span-2" required />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-400" required />
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-400" required />
              <input type="url" value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="Google Meet Link" className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-purple-500 text-sm" required />
              <select value={duration} onChange={e => setDuration(e.target.value)} className="bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-purple-500 text-sm text-slate-400">
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
                <option value="90">90 Minutes</option>
              </select>
              <button type="submit" className="md:col-span-2 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-pink-600 transition-all">
                Confirm & Sync Session
              </button>
            </form>
          </section>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map(session => (
            <div key={session.id} className="bg-[#0E0B16] border border-white/5 p-8 rounded-[2.5rem] relative group border-l-4 border-l-purple-500">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/5 rounded-2xl text-purple-500"><Video size={24}/></div>
                <div className="text-right">
                    <span className="text-[10px] font-black uppercase bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full">{session.duration_minutes} MINS</span>
                </div>
              </div>
              
              <h3 className="text-xl font-black uppercase mb-4 tracking-tighter">{session.title}</h3>
              
              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Calendar size={14}/> {new Date(session.scheduled_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <Clock size={14}/> {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <button 
                onClick={() => window.open(session.meeting_link, '_blank')}
                className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-all"
              >
                Join Google Meet <ExternalLink size={14}/>
              </button>
            </div>
          ))}
        </div>

        {sessions.length === 0 && !showForm && (
            <div className="text-center py-20 opacity-20">
                <VideoOff size={48} className="mx-auto mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">No active sessions found</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;