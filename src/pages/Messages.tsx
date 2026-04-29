import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, Phone, Video, Search, 
  MoreVertical, Paperclip, Smile, ShieldCheck,
  ChevronLeft, X, Filter, Loader2, Truck, Leaf, Clock,
  Check, CheckCheck
} from 'lucide-react';
import { collection, query, where, addDoc, onSnapshot, serverTimestamp, orderBy, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { cn } from '../lib/utils.ts';

export function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Fetch Conversations
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(convs);
      if (convs.length > 0 && !selectedId) {
        setSelectedId(convs[0].id);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Fetch Messages for active chat
  useEffect(() => {
    if (!selectedId) return;

    const q = query(
      collection(db, `conversations/${selectedId}/messages`),
      orderBy('timestamp', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return unsubscribe;
  }, [selectedId]);

  const activeChat = conversations.find(c => c.id === selectedId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedId || !user) return;

    setSending(true);
    const msgData = {
      senderId: user.uid,
      text: inputText,
      timestamp: serverTimestamp(),
      status: 'sent'
    };

    try {
      await addDoc(collection(db, `conversations/${selectedId}/messages`), msgData);
      setInputText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary-green" size={40} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col pt-20">
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Conversations List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col transition-all",
          selectedId ? "hidden md:flex" : "flex"
        )}>
          <div className="p-6 border-b border-gray-50">
             <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-primary-dark">Conversas</h1>
                <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-primary-green transition-all">
                  <Filter size={20} />
                </button>
             </div>
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-green transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar mensagens..." 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-green/10 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedId(chat.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-6 border-b border-gray-50 transition-all relative group",
                  selectedId === chat.id ? "bg-primary-green/5 border-l-4 border-l-primary-green" : "hover:bg-gray-50"
                )}
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-[20px] bg-white shadow-sm border border-gray-100 flex items-center justify-center scale-90 transition-transform group-hover:scale-100">
                    {chat.type === 'transporter' ? <Truck className="text-blue-500" /> : <Leaf className="text-primary-green" />}
                  </div>
                  {chat.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-primary-dark truncate">{chat.name || 'Nova Conversa'}</h4>
                    <span className="text-[10px] text-gray-400 font-bold">{chat.time}</span>
                  </div>
                  <p className={cn(
                    "text-xs truncate",
                    chat.unread > 0 ? "text-primary-dark font-bold" : "text-gray-400 font-medium"
                  )}>
                    {chat.lastMsg || 'Sem mensagens'}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className="w-5 h-5 bg-primary-green text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-lg shadow-green-900/20">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col bg-gray-50/30",
          !selectedId ? "hidden md:flex" : "flex"
        )}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-6 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-10">
                 <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setSelectedId(null)}
                      className="md:hidden p-2 text-gray-400"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      {activeChat.type === 'transporter' ? <Truck className="text-blue-500" /> : <Leaf className="text-primary-green" />}
                    </div>
                    <div>
                       <h3 className="font-bold text-primary-dark text-lg leading-tight">{activeChat.name}</h3>
                       <div className="flex items-center gap-1.5 mt-0.5">
                          <div className={cn("w-1.5 h-1.5 rounded-full", activeChat.online ? "bg-green-500" : "bg-gray-300")} />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeChat.online ? 'Activo Agora' : 'Offline'}</span>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-2">
                    <button className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-2xl transition-all" title="Audio Call">
                       <Phone size={22} />
                    </button>
                    <button className="p-3 text-gray-400 hover:text-primary-green hover:bg-green-50 rounded-2xl transition-all" title="Video Call">
                       <Video size={22} />
                    </button>
                    <div className="w-px h-8 bg-gray-100 mx-2" />
                    <button className="p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all">
                       <MoreVertical size={22} />
                    </button>
                 </div>
              </div>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col custom-scrollbar">
                <div className="flex justify-center mb-10">
                   <div className="px-4 py-1.5 bg-gray-100/50 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border border-gray-200/50">
                      Criptografia Ponta-a-Ponta Activada
                   </div>
                </div>

                {messages.length > 0 ? (
                  messages.map((msg, idx) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        key={msg.id || idx}
                        className={cn(
                          "max-w-[70%] px-6 py-4 rounded-[32px] text-sm relative shadow-sm",
                          isMe 
                            ? "ml-auto bg-primary-green text-white rounded-tr-none shadow-green-900/10" 
                            : "mr-auto bg-white border border-gray-100 rounded-tl-none text-primary-dark"
                        )}
                      >
                        <p className="leading-relaxed font-medium">{msg.text}</p>
                        <div className={cn(
                          "flex items-center gap-1.5 mt-2 text-[10px]",
                          isMe ? "text-white/60 justify-end" : "text-gray-400"
                        )}>
                          <Clock size={10} /> {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                          {isMe && (
                            msg.status === 'read' ? <CheckCheck size={12} /> : <Check size={12} />
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                     <MessageSquare size={80} className="mb-6" />
                     <p className="font-bold text-xl">Diga Olá!</p>
                     <p className="text-sm">Inicie uma conversa segura agora.</p>
                  </div>
                )}
              </div>

              {/* Message Input Container */}
              <div className="p-8 bg-white border-t border-gray-100">
                <div className="max-w-4xl mx-auto flex items-end gap-2 bg-gray-50 p-2 rounded-[32px] border border-gray-100 focus-within:bg-white focus-within:border-primary-green transition-all shadow-inner">
                   <div className="flex items-center gap-1 pb-2 pl-2">
                      <button className="p-2.5 text-gray-400 hover:text-primary-green transition-all"><Paperclip size={22} /></button>
                      <button className="p-2.5 text-gray-400 hover:text-primary-green transition-all"><Smile size={22} /></button>
                   </div>
                   <textarea 
                    rows={1}
                    className="flex-1 bg-transparent border-none py-3 px-2 focus:outline-none focus:ring-0 text-primary-dark font-medium resize-none min-h-[48px] max-h-32 custom-scrollbar"
                    placeholder="Escreva a sua mensagem..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as any);
                      }
                    }}
                   />
                   <button 
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || sending}
                    className="p-4 bg-primary-green text-white rounded-[24px] hover:scale-105 transition-all shadow-xl shadow-green-900/20 disabled:opacity-50 disabled:grayscale"
                   >
                     {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                   </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 p-12 text-center">
               <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl border border-gray-100 flex items-center justify-center mb-10 text-primary-green/20">
                  <MessageSquare size={64} />
               </div>
               <h2 className="text-3xl font-display font-bold text-primary-dark mb-4">Escolha uma Conversa</h2>
               <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">Selecione um contacto na barra lateral para ver o histórico de negociações e mensagens.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
