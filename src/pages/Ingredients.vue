<template>
  <div class="min-h-screen pb-20 bg-cream-50">
    <div class="max-w-md mx-auto px-4 py-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">食材管理</h1>

      <!-- 搜尋框 -->
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" :size="20" />
        <input
          type="text"
          placeholder="搜尋食材..."
          v-model="searchQuery"
          class="w-full pl-10 pr-4 py-3 bg-white rounded-xl shadow-soft border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- 分類標籤 -->
      <div class="flex gap-2 overflow-x-auto pb-2 mb-4">
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

      <!-- 即將過期提醒 -->
      <div v-if="expiringSoon.length > 0" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-start gap-3">
        <AlertCircle class="text-yellow-600 flex-shrink-0 mt-0.5" :size="20" />
        <div class="flex-1">
          <h3 class="font-semibold text-yellow-900 mb-1">即將過期提醒</h3>
          <div class="space-y-1">
            <p
              v-for="ing in expiringSoon"
              :key="ing.id"
              class="text-sm text-yellow-800"
            >
              {{ ing.name }} {{ ing.expiryDate ? `(${ing.expiryDate.toLocaleDateString()})` : '' }}
            </p>
          </div>
        </div>
      </div>

      <!-- AI 推薦按鈕 -->
      <button
        v-if="myIngredients.length > 0"
        @click="getRecommendations"
        class="w-full bg-primary-600 text-white px-4 py-3 rounded-xl shadow-card mb-4 flex items-center justify-center gap-2 font-semibold"
      >
        <Sparkles :size="20" />
        AI 推薦可做的料理
      </button>

      <!-- AI 推薦結果 -->
      <div v-if="aiRecommendations.length > 0" class="mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">推薦食譜</h2>
        <div class="space-y-4">
          <RecipeCard
            v-for="recipe in aiRecommendations"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>
      </div>

      <!-- 我的食材列表 -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">我的食材</h2>
          <button
            @click="addIngredient"
            class="bg-primary-600 text-white p-2 rounded-lg shadow-soft"
          >
            <Plus :size="20" />
          </button>
        </div>

        <div v-if="filteredIngredients.length === 0" class="bg-white rounded-2xl shadow-soft p-8 text-center text-gray-500">
          <p class="mb-2">還沒有添加食材</p>
          <p class="text-sm">點擊右上角 + 按鈕開始管理你的食材</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="ing in filteredIngredients"
            :key="ing.id"
            class="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between"
          >
            <div>
              <p class="font-medium text-gray-900">{{ ing.name }}</p>
              <p v-if="ing.quantity" class="text-sm text-gray-500">{{ ing.quantity }}</p>
            </div>
            <span
              v-if="ing.isExpiringSoon"
              class="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs"
            >
              即將過期
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, AlertCircle, Sparkles } from 'lucide-vue-next'
import type { Ingredient, Recipe } from '../types'
import { mockRecipes } from '../data/recipes'
import RecipeCard from '../components/RecipeCard.vue'

const categories = ['全部', '我的食材', '蔬菜', '水果', '肉類', '海鮮', '蛋奶', '調味料', '其他']

const searchQuery = ref('')
const selectedCategory = ref('全部')
const myIngredients = ref<Ingredient[]>([])
const aiRecommendations = ref<Recipe[]>([])

const expiringSoon = computed(() => myIngredients.value.filter(ing => ing.isExpiringSoon))

const filteredIngredients = computed(() => {
  return myIngredients.value.filter(ing => {
    if (selectedCategory.value === '全部' || selectedCategory.value === '我的食材') return true
    if (selectedCategory.value !== ing.category) return false
    if (searchQuery.value && !ing.name.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    return true
  }).filter(ing =>
    searchQuery.value === '' || ing.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const getRecommendations = () => {
  const ingredientNames = myIngredients.value.map(ing => ing.name.toLowerCase())
  const recommendations = mockRecipes.filter(recipe =>
    recipe.ingredients.some(ing =>
      ingredientNames.some(name => ing.name.toLowerCase().includes(name))
    )
  )
  aiRecommendations.value = recommendations.slice(0, 5)
}

const addIngredient = () => {
  const newIngredient: Ingredient = {
    id: Date.now().toString(),
    name: '新食材',
    category: '其他',
  }
  myIngredients.value.push(newIngredient)
}
</script>

