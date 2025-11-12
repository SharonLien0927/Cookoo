import { useState } from 'react';
import { Sparkles, Filter, RefreshCw } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../types';
import { mockRecipes } from '../data/recipes';

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [timeFilter, setTimeFilter] = useState<number | null>(null);
  const [mealFilter, setMealFilter] = useState<string | null>(null);

  const getRandomRecipes = () => {
    let filtered = [...mockRecipes];
    
    if (timeFilter) {
      filtered = filtered.filter(r => r.time <= timeFilter);
    }
    
    if (mealFilter) {
      filtered = filtered.filter(r => r.category === mealFilter);
    }
    
    // 隨機選取5道
    const shuffled = filtered.sort(() => 0.5 - Math.random());
    setRecipes(shuffled.slice(0, 5));
  };

  const handleGetRecipes = () => {
    getRandomRecipes();
  };

  return (
    <div className="min-h-screen pb-20 bg-cream-50">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* 主按鈕區域 */}
        <div className="text-center mb-8 mt-8">
          <button
            onClick={handleGetRecipes}
            className="bg-primary-600 text-white px-8 py-4 rounded-2xl shadow-card text-lg font-semibold flex items-center gap-2 mx-auto hover:bg-primary-700 active:scale-95 transition-all"
          >
            <Sparkles size={24} />
            今天吃什麼？
          </button>
        </div>

        {/* 篩選按鈕 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex-1 bg-white px-4 py-2 rounded-xl shadow-soft flex items-center justify-center gap-2 text-gray-700"
          >
            <Filter size={18} />
            篩選條件
          </button>
          {recipes.length > 0 && (
            <button
              onClick={getRandomRecipes}
              className="flex-1 bg-white px-4 py-2 rounded-xl shadow-soft flex items-center justify-center gap-2 text-gray-700"
            >
              <RefreshCw size={18} />
              重新抽一次
            </button>
          )}
        </div>

        {/* 篩選面板 */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-soft p-4 mb-6">
            <h3 className="font-semibold mb-3 text-gray-900">時間</h3>
            <div className="flex gap-2 mb-4">
              {[10, 15, 20, 30].map((time) => (
                <button
                  key={time}
                  onClick={() => setTimeFilter(timeFilter === time ? null : time)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    timeFilter === time
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {time}分鐘內
                </button>
              ))}
            </div>
            <h3 className="font-semibold mb-3 text-gray-900">餐別</h3>
            <div className="flex gap-2">
              {['早餐', '午餐', '晚餐'].map((meal) => (
                <button
                  key={meal}
                  onClick={() => setMealFilter(mealFilter === meal ? null : meal)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    mealFilter === meal
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 推薦食譜列表 */}
        {recipes.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">推薦食譜</h2>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>點擊上方按鈕開始尋找今天的料理靈感！</p>
          </div>
        )}
      </div>
    </div>
  );
}

