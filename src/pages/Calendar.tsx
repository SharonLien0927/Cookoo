import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Download, Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { mockRecipes } from '../data/recipes';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMenuForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return menuItems.filter(item => item.date === dateStr);
  };

  const generateWeeklyMenu = () => {
    const weeklyMenu: MenuItem[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // 隨機選擇食譜
      const breakfast = mockRecipes.filter(r => r.category === '早餐')[0];
      const lunch = mockRecipes.filter(r => r.category === '午餐')[0];
      const dinner = mockRecipes.filter(r => r.category === '晚餐')[0];
      
      if (breakfast) weeklyMenu.push({ date: dateStr, recipeId: breakfast.id, mealType: '早餐' });
      if (lunch) weeklyMenu.push({ date: dateStr, recipeId: lunch.id, mealType: '午餐' });
      if (dinner) weeklyMenu.push({ date: dateStr, recipeId: dinner.id, mealType: '晚餐' });
    }
    
    setMenuItems([...menuItems, ...weeklyMenu]);
  };

  const exportShoppingList = () => {
    const allIngredients = new Set<string>();
    menuItems.forEach(item => {
      const recipe = mockRecipes.find(r => r.id === item.recipeId);
      recipe?.ingredients.forEach(ing => allIngredients.add(ing.name));
    });
    
    const list = Array.from(allIngredients).join('\n');
    alert(`購物清單：\n${list}\n\n（實際應用中可匯出為檔案）`);
  };

  return (
    <div className="min-h-screen pb-20 bg-cream-50">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">菜單日曆</h1>
          <div className="flex gap-2">
            <button
              onClick={generateWeeklyMenu}
              className="bg-primary-600 text-white px-4 py-2 rounded-xl shadow-soft flex items-center gap-2 text-sm"
            >
              <Plus size={16} />
              一週菜單
            </button>
            <button
              onClick={exportShoppingList}
              className="bg-white text-primary-600 px-4 py-2 rounded-xl shadow-soft flex items-center gap-2 text-sm border border-primary-200"
            >
              <Download size={16} />
              購物清單
            </button>
          </div>
        </div>

        {/* 月份導覽 */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-2xl shadow-soft p-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            className="text-primary-600 font-semibold"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'yyyy年MM月')}
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            className="text-primary-600 font-semibold"
          >
            →
          </button>
        </div>

        {/* 日曆網格 */}
        <div className="bg-white rounded-2xl shadow-soft p-4 mb-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayMenus = getMenuForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(format(day, 'yyyy-MM-dd'))}
                  className={`aspect-square rounded-lg text-sm transition-colors ${
                    !isCurrentMonth
                      ? 'text-gray-300'
                      : isCurrentDay
                      ? 'bg-primary-600 text-white font-semibold'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div>{format(day, 'd')}</div>
                  {dayMenus.length > 0 && (
                    <div className="flex gap-0.5 justify-center mt-1">
                      {dayMenus.slice(0, 3).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-1 h-1 bg-primary-400 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 選中日期的菜單詳情 */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow-soft p-4">
            <h3 className="font-semibold mb-3 text-gray-900">
              {format(new Date(selectedDate), 'MM月dd日')}
            </h3>
            {getMenuForDate(new Date(selectedDate)).length > 0 ? (
              <div className="space-y-2">
                {getMenuForDate(new Date(selectedDate)).map((item, idx) => {
                  const recipe = mockRecipes.find(r => r.id === item.recipeId);
                  return recipe ? (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-500 w-12">{item.mealType}</span>
                      <span className="flex-1 text-gray-900">{recipe.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">這天還沒有安排菜單</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

