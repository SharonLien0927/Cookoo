<template>
  <div class="min-h-screen pb-20 bg-cream-50">
    <div class="max-w-md mx-auto px-4 py-6">
      <!-- 主按鈕區域 -->
      <div class="text-center mb-8 mt-8">
        <button
          @click="handleGetRecipes"
          class="bg-primary-600 text-white px-8 py-4 rounded-2xl shadow-card text-lg font-semibold flex items-center gap-2 mx-auto hover:bg-primary-700 active:scale-95 transition-all"
        >
          <Sparkles :size="24" />
          今天吃什麼？
        </button>
      </div>

      <!-- 篩選按鈕 -->
      <div class="flex gap-3 mb-6">
        <button
          @click="showFilters = !showFilters"
          class="flex-1 bg-white px-4 py-2 rounded-xl shadow-soft flex items-center justify-center gap-2 text-gray-700"
        >
          <Filter :size="18" />
          篩選條件
        </button>
        <button
          v-if="recipes.length > 0"
          @click="getRandomRecipes"
          class="flex-1 bg-white px-4 py-2 rounded-xl shadow-soft flex items-center justify-center gap-2 text-gray-700"
        >
          <RefreshCw :size="18" />
          重新抽一次
        </button>
      </div>

      <!-- 篩選面板 -->
      <div v-if="showFilters" class="bg-white rounded-2xl shadow-soft p-4 mb-6">
        <h3 class="font-semibold mb-3 text-gray-900">時間</h3>
        <div class="flex gap-2 mb-4">
          <button
            v-for="time in [10, 15, 20, 30]"
            :key="time"
            @click="timeFilter = timeFilter === time ? null : time"
            class="px-4 py-2 rounded-lg text-sm"
            :class="timeFilter === time ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
          >
            {{ time }}分鐘內
          </button>
        </div>
        <h3 class="font-semibold mb-3 text-gray-900">餐別</h3>
        <div class="flex gap-2">
          <button
            v-for="meal in ['早餐', '午餐', '晚餐']"
            :key="meal"
            @click="mealFilter = mealFilter === meal ? null : meal"
            class="px-4 py-2 rounded-lg text-sm"
            :class="mealFilter === meal ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
          >
            {{ meal }}
          </button>
        </div>
      </div>

      <!-- 推薦食譜列表 -->
      <div v-if="recipes.length > 0" class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">推薦食譜</h2>
        <RecipeCard
          v-for="recipe in recipes"
          :key="recipe.id"
          :recipe="recipe"
        />
      </div>
      <div v-else class="text-center py-12 text-gray-500">
        <p>點擊上方按鈕開始尋找今天的料理靈感！</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, Filter, RefreshCw } from 'lucide-vue-next'
import RecipeCard from '../components/RecipeCard.vue'
import type { Recipe } from '../types'
import { mockRecipes } from '../data/recipes'

const recipes = ref<Recipe[]>([])
const showFilters = ref(false)
const timeFilter = ref<number | null>(null)
const mealFilter = ref<string | null>(null)

const getRandomRecipes = () => {
  let filtered = [...mockRecipes]
  
  if (timeFilter.value) {
    filtered = filtered.filter(r => r.time <= timeFilter.value!)
  }
  
  if (mealFilter.value) {
    filtered = filtered.filter(r => r.category === mealFilter.value)
  }
  
  // 隨機選取5道
  const shuffled = filtered.sort(() => 0.5 - Math.random())
  recipes.value = shuffled.slice(0, 5)
}

const handleGetRecipes = () => {
  getRandomRecipes()
}
</script>

