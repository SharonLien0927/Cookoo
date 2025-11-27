<template>
  <div class="min-h-screen pb-20 bg-cream-50">
    <div class="max-w-md mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">食譜瀏覽</h1>
        <button
          @click="router.push('/recipes/new')"
          class="bg-primary-600 text-white p-2 rounded-lg shadow-soft"
        >
          <Plus :size="20" />
        </button>
      </div>

      <!-- 搜尋框 -->
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" :size="20" />
        <input
          type="text"
          placeholder="搜尋食譜..."
          v-model="searchQuery"
          class="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-soft border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- 分類篩選 -->
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">餐別</h3>
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
            :class="selectedCategory === cat ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 shadow-soft'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- 難度篩選 -->
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">難度</h3>
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="diff in difficulties"
            :key="diff"
            @click="selectedDifficulty = diff"
            class="px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
            :class="selectedDifficulty === diff ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 shadow-soft'"
          >
            {{ diff }}
          </button>
        </div>
      </div>

      <!-- 特殊標籤 -->
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-gray-700 mb-2">特色分類</h3>
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="tag in specialTags"
            :key="tag"
            @click="selectedTag = selectedTag === tag ? null : tag"
            class="px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
            :class="selectedTag === tag ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 shadow-soft'"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- 我的最愛 -->
      <div class="mb-6">
        <button
          @click="showFavoritesOnly = !showFavoritesOnly"
          class="px-4 py-2 rounded-lg text-sm w-full"
          :class="showFavoritesOnly ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 shadow-soft'"
        >
          ♡ 我的最愛
        </button>
      </div>

      <!-- 食譜列表 -->
      <div v-if="filteredRecipes.length > 0" class="space-y-4">
        <RecipeCard
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          :recipe="recipe"
          @click="handleRecipeClick(recipe)"
        />
      </div>
      <div v-else class="bg-white rounded-2xl shadow-soft p-8 text-center text-gray-500">
        <p>沒有找到符合條件的食譜</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Plus } from 'lucide-vue-next'
import RecipeCard from '../components/RecipeCard.vue'
import type { Recipe } from '../types'
import { mockRecipes } from '../data/recipes'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('全部')
const selectedDifficulty = ref('全部')
const selectedTag = ref<string | null>(null)
const showFavoritesOnly = ref(false)

const categories = ['全部', '早餐', '午餐', '晚餐', '點心']
const difficulties = ['全部', '簡單', '中等', '困難']
const specialTags = ['快速料理', '一鍋完成', '便當菜', '少洗碗']

const filteredRecipes = computed(() => {
  return mockRecipes.filter((recipe) => {
    if (searchQuery.value && !recipe.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    if (selectedCategory.value !== '全部' && recipe.category !== selectedCategory.value) {
      return false
    }
    if (selectedDifficulty.value !== '全部' && recipe.difficulty !== selectedDifficulty.value) {
      return false
    }
    if (selectedTag.value && !recipe.tags.includes(selectedTag.value)) {
      return false
    }
    if (showFavoritesOnly.value && !recipe.isFavorite) {
      return false
    }
    return true
  })
})

const handleRecipeClick = (recipe: Recipe) => {
  router.push({ 
    path: `/recipes/${recipe.id}`, 
    state: { recipe } 
  })
}
</script>

