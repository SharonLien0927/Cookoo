import { useState } from 'react';
import { Search } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';
import { Recipe } from '../types';
import { mockRecipes } from '../data/recipes';
import { useNavigate } from 'react-router-dom';

const categories = ['全部', '早餐', '午餐', '晚餐', '點心'];
const difficulties = ['全部', '簡單', '中等', '困難'];
const specialTags = ['快速料理', '一鍋完成', '便當菜', '少洗碗'];

export default function Recipes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState('全部');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredRecipes = mockRecipes.filter((recipe) => {
    if (searchQuery && !recipe.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== '全部' && recipe.category !== selectedCategory) {
      return false;
    }
    if (selectedDifficulty !== '全部' && recipe.difficulty !== selectedDifficulty) {
      return false;
    }
    if (selectedTag && !recipe.tags.includes(selectedTag)) {
      return false;
    }
    return true;
  });

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipes/${recipe.id}`, { state: { recipe } });
  };

  return (
    <div className="min-h-screen pb-20 bg-cream-50">
      <div className="max-w-md mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">食譜瀏覽</h1>

        {/* 搜尋框 */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜尋食譜..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-soft border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* 分類篩選 */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">餐別</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
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
        </div>

        {/* 難度篩選 */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">難度</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${
                  selectedDifficulty === diff
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 shadow-soft'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* 特殊標籤 */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">特色分類</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {specialTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${
                  selectedTag === tag
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 shadow-soft'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 食譜列表 */}
        {filteredRecipes.length > 0 ? (
          <div className="space-y-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => handleRecipeClick(recipe)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-soft p-8 text-center text-gray-500">
            <p>沒有找到符合條件的食譜</p>
          </div>
        )}
      </div>
    </div>
  );
}

