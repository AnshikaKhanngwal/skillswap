import { useState, useEffect, useRef } from "react";
import supabase from "../lib/supabase";
import { Send, X } from "lucide-react";
import toast from "react-hot-toast";

const ChatModal = ({ request, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [dbUserId, setDbUserId] = useState(null); // This will store your int8 ID
  const scrollRef = useRef();

  useEffect(() => {
    const setup = async () => {
      // 1. Get the Auth User
      const { data: { user } } = await supabase.auth.getUser();
      
      // 2. IMPORTANT: Get your int8 ID from the profiles table
      // This ensures we send a NUMBER if your database expects a NUMBER
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id) // Supabase handles the UUID to int8 lookup here
        .single();

      setDbUserId(profile?.id || user.id);
      
      // 3. Load existing messages
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("request_id", request.id)
        .order("created_at", { ascending: true });
        
      setMessages(data || []);

      // 4. Realtime listener
      const channel = supabase.channel(`chat-${request.id}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages', 
            filter: `request_id=eq.${request.id}` 
        }, (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }).subscribe();

      return () => supabase.removeChannel(channel);
    };
    setup();
  }, [request.id]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !dbUserId) return;

    // Use the dbUserId we fetched (the one that matches your table type)
    const { error } = await supabase.from("messages").insert([{ 
        request_id: request.id, 
        sender_id: dbUserId, 
        content: newMessage 
    }]);

    if (error) {
        console.error("Chat Error:", error);
        toast.error("Message failed to send");
    } else {
        setNewMessage("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md h-[500px] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white flex justify-between items-center font-bold">
          <span>Chat Session</span>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id == dbUserId ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
                msg.sender_id == dbUserId ? "bg-indigo-600 text-white" : "bg-white border"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
          <input 
            type="text" 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 border rounded-xl px-4 py-2 outline-none focus:border-indigo-500" 
          />
          <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl"><Send size={18}/></button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;