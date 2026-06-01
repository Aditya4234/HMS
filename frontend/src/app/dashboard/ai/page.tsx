'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { aiAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Bed, Send, Bot, User } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  rooms?: any[];
}

export default function AIPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I can help you find the perfect room. Try asking: "Find deluxe rooms under $200" or "Show me available rooms for 2 guests"' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const res = await aiAPI.searchRooms({ query });
      const data = res.data.data;
      const rooms = data.rooms || [];
      const summary = data.params?.summary || `Found ${data.total} rooms matching your search.`;

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: summary,
        rooms: rooms,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t process your request. Please try again.',
      }]);
      toast.error('AI search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
        <p className="text-gray-500 text-sm">Search rooms using natural language</p>
      </div>

      <Card className="bg-white/[0.02] border-white/5">
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/[0.03] border border-white/10'} rounded-2xl p-4`}>
                  <div className="flex items-center space-x-2 mb-2">
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="text-xs text-gray-500">{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.content}</p>
                  {msg.rooms && msg.rooms.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.rooms.slice(0, 3).map((room: any) => (
                        <div key={room.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Bed className="w-4 h-4 text-indigo-400" />
                              <span className="text-white font-medium">Room {room.roomNumber}</span>
                              <Badge variant={room.status === 'AVAILABLE' ? 'success' : 'info'} className="text-[10px]">{room.status}</Badge>
                            </div>
                            <span className="text-indigo-400 font-semibold">{formatCurrency(room.pricePerNight)}/night</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{room.roomType} • Capacity: {room.capacity} • {room.hotel?.name || ''}</p>
                        </div>
                      ))}
                      {msg.rooms.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">+{msg.rooms.length - 3} more rooms available</p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 p-4">
            <div className="flex items-center space-x-2">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Describe the room you're looking for..."
                className="bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600" />
              <Button onClick={handleSearch} disabled={loading || !query.trim()} variant="gradient" size="icon" className="h-10 w-10">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
