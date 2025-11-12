import { Recipe } from '../types';
import { Clock, ChefHat, Heart } from 'lucide-react';
import { useState } from 'react';

interface RecipeCardProps {
  recipe: Recipe;
  onFavorite?: (id: string) => void;
  onClick?: () => void;
}

export default function RecipeCard({ recipe, onFavorite, onClick }: RecipeCardProps) {
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite || false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavorite?.(recipe.id);
  };

  const difficultyColors = {
    簡單: 'bg-green-100 text-green-700',
    中等: 'bg-yellow-100 text-yellow-700',
    困難: 'bg-red-100 text-red-700',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="relative">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm backdrop-blur-sm"
        >
          <Heart
            size={20}
            className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 flex-wrap">
          {recipe.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-900">{recipe.name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.time} 分鐘</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat size={16} />
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${difficultyColors[recipe.difficulty]}`}
            >
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

