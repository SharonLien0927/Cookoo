import { useState } from 'react';
import { Search, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { Ingredient } from '../types';
import { mockRecipes } from '../data/recipes';
import RecipeCard from '../components/RecipeCard';

const categories = ['全部', '我的食材', '蔬菜', '水果', '肉類', '海鮮', '蛋奶', '調味料', '其他'];

export default function Ingredients() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [myIngredients, setMyIngredients] = useState<Ingredient[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

  const getRecommendations = () => {
    // 根據現有食材推薦可做的料理
    const ingredientNames = myIngredients.map(ing => ing.name.toLowerCase());
    const recommendations = mockRecipes.filter(recipe =>
      recipe.ingredients.some(ing =>
        ingredientNames.some(name => ing.name.toLowerCase().includes(name))
      )
    );
    setAiRecommendations(recommendations.slice(0, 5));
  };

  const expiringSoon = myIngredients.filter(ing => ing.isExpiringSoon);

  return (
    <div className="min-h-screen pb-20 bg-cream-50">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">食材管理</h1>

        {/* 搜尋框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜尋食材..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-soft border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 分類標籤 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 shadow-soft'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 即將過期提醒 */}
        {expiringSoon.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">即將過期提醒</h3>
              <div className="space-y-1">
                {expiringSoon.map((ing) => (
                  <p key={ing.id} className="text-sm text-yellow-800">
                    {ing.name} {ing.expiryDate && `(${ing.expiryDate.toLocaleDateString()})`}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI 推薦按鈕 */}
        {myIngredients.length > 0 && (
          <button
            onClick={getRecommendations}
            className="w-full bg-primary-600 text-white px-4 py-3 rounded-xl shadow-card mb-4 flex items-center justify-center gap-2 font-semibold"
          >
            <Sparkles size={20} />
            AI 推薦可做的料理
          </button>
        )}

        {/* AI 推薦結果 */}
        {aiRecommendations.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">推薦食譜</h2>
            <div className="space-y-4">
              {aiRecommendations.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}

        {/* 我的食材列表 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">我的食材</h2>
            <button className="bg-primary-600 text-white p-2 rounded-lg shadow-soft">
              <Plus size={20} />
            </button>
          </div>

          {myIngredients.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-soft p-8 text-center text-gray-500">
              <p className="mb-2">還沒有添加食材</p>
              <p className="text-sm">點擊右上角 + 按鈕開始管理你的食材</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myIngredients
                .filter(ing => {
                  if (selectedCategory === '全部') return true;
                  if (selectedCategory === '我的食材') return true;
                  return ing.category === selectedCategory;
                })
                .filter(ing =>
                  searchQuery === '' || ing.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((ing) => (
                  <div
                    key={ing.id}
                    className="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{ing.name}</p>
                      {ing.quantity && (
                        <p className="text-sm text-gray-500">{ing.quantity}</p>
                      )}
                    </div>
                    {ing.isExpiringSoon && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        即將過期
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

