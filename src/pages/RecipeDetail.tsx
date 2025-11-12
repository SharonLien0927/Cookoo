import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, ChefHat, ArrowLeft } from 'lucide-react';
import { Recipe } from '../types';

export default function RecipeDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const recipe = location.state?.recipe as Recipe;

  if (!recipe) {
    return (
      <div className="min-h-screen pb-20 bg-cream-50 flex items-center justify-center">
        <p className="text-gray-500">找不到食譜</p>
      </div>
    );
  }

  const difficultyColors = {
    簡單: 'bg-green-100 text-green-700',
    中等: 'bg-yellow-100 text-yellow-700',
    困難: 'bg-red-100 text-red-700',
  };

  return (
    <div className="min-h-screen pb-20 bg-cream-50">
      <div className="max-w-md mx-auto">
        {/* 圖片區域 */}
        <div className="relative">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-64 object-cover"
          />
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 bg-white/90 rounded-full backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-900" />
          </button>
        </div>

        {/* 內容區域 */}
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{recipe.name}</h1>

          {/* 基本資訊 */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={18} />
              <span>{recipe.time} 分鐘</span>
            </div>
            <div className="flex items-center gap-2">
              <ChefHat size={18} className="text-gray-600" />
              <span
                className={`px-3 py-1 rounded-full text-sm ${difficultyColors[recipe.difficulty]}`}
              >
                {recipe.difficulty}
              </span>
            </div>
          </div>

          {/* 標籤 */}
          <div className="flex gap-2 flex-wrap mb-6">
            {recipe.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 食材清單 */}
          <div className="bg-white rounded-2xl shadow-soft p-4 mb-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-3">食材</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                  <span>{ing.name}</span>
                  {ing.quantity && (
                    <span className="text-gray-500 text-sm ml-auto">{ing.quantity}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* 製作步驟 */}
          <div className="bg-white rounded-2xl shadow-soft p-4 mb-6">
            <h2 className="font-semibold text-lg text-gray-900 mb-3">製作步驟</h2>
            <ol className="space-y-4">
              {recipe.steps.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <span className="flex-1 text-gray-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* 小提示 */}
          {recipe.tips && (
            <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4">
              <h3 className="font-semibold text-primary-900 mb-2">💡 小提示</h3>
              <p className="text-primary-800 text-sm">{recipe.tips}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

