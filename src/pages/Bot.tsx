import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Camera, Sparkles } from 'lucide-react';
import { ChatMessage, Recipe } from '../types';
import { mockRecipes } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';

export default function Bot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是 Cookoo 的 AI 助手，可以幫你推薦快速料理。試試問我：「我想煮15分鐘內的晚餐」或「冰箱剩下蛋和青菜可以煮什麼？」',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // 模擬 AI 回應
    setTimeout(() => {
      const recommendations = getRecommendations(input);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: recommendations.length > 0
          ? `根據你的需求，我推薦以下 ${recommendations.length} 道料理：`
          : '我理解你的需求，讓我為你推薦一些適合的料理！',
        recipes: recommendations,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const getRecommendations = (query: string): Recipe[] => {
    const lowerQuery = query.toLowerCase();
    let filtered = [...mockRecipes];

    // 時間篩選
    const timeMatch = query.match(/(\d+)\s*分鐘/);
    if (timeMatch) {
      const maxTime = parseInt(timeMatch[1]);
      filtered = filtered.filter(r => r.time <= maxTime);
    }

    // 餐別篩選
    if (lowerQuery.includes('早餐')) {
      filtered = filtered.filter(r => r.category === '早餐');
    } else if (lowerQuery.includes('午餐')) {
      filtered = filtered.filter(r => r.category === '午餐');
    } else if (lowerQuery.includes('晚餐')) {
      filtered = filtered.filter(r => r.category === '晚餐');
    }

    // 食材篩選
    const ingredients = ['蛋', '雞蛋', '青菜', '番茄', '雞肉', '豆腐', '泡菜'];
    const mentionedIngredients = ingredients.filter(ing => lowerQuery.includes(ing));
    if (mentionedIngredients.length > 0) {
      filtered = filtered.filter(recipe =>
        recipe.ingredients.some(ing =>
          mentionedIngredients.some(mentioned => ing.name.includes(mentioned))
        )
      );
    }

    return filtered.slice(0, 3);
  };

  return (
    <div className="min-h-screen pb-20 bg-cream-50 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col h-screen">
        {/* 標題列 */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">AI 料理助手</h1>
            <p className="text-xs text-gray-500">隨時為你推薦快速料理</p>
          </div>
        </div>

        {/* 訊息區域 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-900 shadow-soft'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.recipes && message.recipes.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {message.recipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 輸入區域 */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
          <div className="flex items-end gap-2">
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Camera size={20} />
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Mic size={20} />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="輸入你的需求..."
                className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-2 bg-primary-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

