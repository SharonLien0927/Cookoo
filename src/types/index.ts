export interface Recipe {
  id: string;
  name: string;
  image: string;
  time: number; // 分鐘
  difficulty: '簡單' | '中等' | '困難';
  category: '早餐' | '午餐' | '晚餐' | '點心';
  tags: string[]; // '快速料理', '一鍋完成', '便當菜', '少洗碗'
  ingredients: Ingredient[];
  steps: string[];
  tips?: string;
  isFavorite?: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  category: '蔬菜' | '水果' | '肉類' | '海鮮' | '蛋奶' | '調味料' | '其他';
  quantity?: string;
  expiryDate?: Date;
  isExpiringSoon?: boolean;
  purchaseDate?: string; // ISO date string
  shelfLifeDays?: number; // 保鮮度天數
  image?: string; // base64 or url
  tags?: string[];
}

export interface MenuItem {
  date: string; // YYYY-MM-DD
  recipeId: string;
  mealType: '早餐' | '午餐' | '晚餐';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recipes?: Recipe[];
  timestamp: Date;
}

