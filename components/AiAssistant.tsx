import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useHostel } from '../context/HostelContext';
import { HOSTEL_POLICY_CONTEXT } from '../services/mockDatabase';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am the GCOEN Hostel Assistant. Ask me about rules, curfew timings, room availability, or fees.' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { students, rooms, payments, complaints } = useHostel();

  // Scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Construct a context-rich prompt including GCOEN Policy
      const systemContext = `
        You are the AI Assistant for Government College of Engineering, Nagpur (GCOEN) Hostels.
        
        OFFICIAL HOSTEL POLICY & RULES:
        ${HOSTEL_POLICY_CONTEXT}

        REAL-TIME DATABASE:
        Students: ${JSON.stringify(students.map(s => ({ id: s.id, name: s.name, room: s.roomNumber })))}
        Rooms Summary: Total ${rooms.length}, Occupied ${rooms.filter(r => r.occupied >= r.capacity).length}.
        Complaints: ${JSON.stringify(complaints)}
        
        INSTRUCTIONS:
        - Answer based STRICTLY on the GCOEN policy and database.
        - If asked about curfew, quote the 10:30 PM (Boys) / 7:30 PM (Girls) rules.
        - Be polite and professional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: systemContext + "\n\nUser Question: " + userMsg }] }
        ]
      });

      const aiResponse = response.text || "I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble connecting to the AI service right now. Please check your API Key." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 rounded-full shadow-xl hover:scale-105 transition-transform z-50 flex items-center justify-center"
      >
        {isOpen ? <span className="material-icons-round">close</span> : <span className="material-icons-round">smart_toy</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 flex flex-col overflow-hidden animate-fade-in-up">
          <div className="bg-slate-900 p-4 flex items-center space-x-2 text-white">
            <span className="material-icons-round text-yellow-400">auto_awesome</span>
            <div>
                 <h3 className="font-semibold text-sm">GCOEN Assistant</h3>
                 <p className="text-[10px] text-slate-400">Policy Expert</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about curfew, rules..."
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 dark:text-white"
              />
              <button 
                onClick={handleSend}
                disabled={loading}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
              >
                <span className="material-icons-round text-sm">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;