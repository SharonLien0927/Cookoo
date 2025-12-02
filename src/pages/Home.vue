<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
    <!-- 頂部手繪裝飾 -->
    <div class="relative h-28 overflow-hidden">
      <svg viewBox="0 0 400 120" class="w-full h-full text-orange-300 opacity-40">
        <path d="M 0 60 Q 50 40, 100 60 T 200 60 T 300 60 T 400 60" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" />
      </svg>
    </div>

    <div class="max-w-md mx-auto px-4 space-y-6">
      <!-- 今天吃什麼 區塊 -->
      <div class="relative bg-white rounded-3xl p-6 shadow-md border-2 border-orange-200">
        <h1 class="text-2xl font-bold text-gray-800 mb-2">今天吃什麼？</h1>
        <p class="text-gray-600 mb-4">快速挑選符合你需求的食譜</p>

        <div class="flex gap-3">
          <button
            @click="handleGetRecipes"
            class="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 px-4 rounded-full hover:shadow-lg transition-all"
          >
            <span class="inline-block mr-2">✨</span>
            今天吃什麼
          </button>
          <button
            @click="showFilters = !showFilters"
            class="w-14 h-14 rounded-full bg-white border-2 border-orange-200 flex items-center justify-center"
            title="篩選條件"
          >
            🔎
          </button>
        </div>
      </div>

      <!-- 已套用篩選條件顯示 -->
      <div v-if="!showFilters && (selectedFilters.meal.length > 0 || selectedFilters.time !== null || selectedFilters.difficulty !== null)" class="bg-orange-50 rounded-2xl p-4 border-2 border-dashed border-orange-300">
        <h3 class="text-sm font-bold text-gray-800 mb-2">已套用篩選：</h3>
        <div class="flex flex-wrap gap-2">
          <span v-for="meal in selectedFilters.meal" :key="meal" class="px-3 py-1 bg-orange-300 text-white rounded-full text-xs font-semibold">{{ meal }}</span>
          <span v-if="selectedFilters.time" class="px-3 py-1 bg-orange-300 text-white rounded-full text-xs font-semibold">{{ selectedFilters.time }}分鐘</span>
          <span v-if="selectedFilters.difficulty" class="px-3 py-1 bg-orange-300 text-white rounded-full text-xs font-semibold">{{ selectedFilters.difficulty }}</span>
        </div>
      </div>

      <!-- 篩選面板（手繪風） -->
      <div v-if="showFilters" class="bg-white rounded-2xl p-4 border-2 border-dashed border-orange-300 space-y-4">
        <!-- 餐別 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">🍽️ 餐別</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="meal in ['早餐','午餐','晚餐']"
              :key="meal"
              @click="toggleMeal(meal)"
              :class="selectedFilters.meal.includes(meal) ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-700'"
              class="px-4 py-2 rounded-full font-medium transition-all border-2 border-orange-300"
            >
              {{ meal }}
            </button>
          </div>
        </div>

        <!-- 時間 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">⏱️ 時間</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="t in [10,15,20,30]"
              :key="t"
              @click="selectedFilters.time = selectedFilters.time === t ? null : t"
              :class="selectedFilters.time === t ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-700'"
              class="px-3 py-2 rounded-full text-sm font-medium transition-all border-2 border-orange-300"
            >
              {{ t }}分鐘內
            </button>
          </div>
        </div>

        <!-- 難度 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">⭐ 難度</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="d in ['簡單','中等','困難']"
              :key="d"
              @click="selectedFilters.difficulty = selectedFilters.difficulty === d ? null : d"
              :class="selectedFilters.difficulty === d ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-700'"
              class="px-4 py-2 rounded-full font-medium transition-all border-2 border-orange-300"
            >
              {{ d }}
            </button>
          </div>
        </div>

        <div class="h-1 relative my-2">
          <svg viewBox="0 0 300 4" class="w-full h-full">
            <path d="M 0 2 Q 15 0, 30 2 T 60 2 T 90 2 T 120 2 T 150 2 T 180 2 T 210 2 T 240 2 T 270 2 T 300 2" stroke="#fbbf24" stroke-width="2" fill="none" stroke-linecap="round" />
          </svg>
        </div>

        <div class="flex gap-2">
          <button @click="applyFilters" class="flex-1 bg-amber-400 text-white py-2 rounded-full font-semibold">套用篩選</button>
          <button @click="resetFilters" class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-full">重設</button>
        </div>
      </div>

      <!-- 推薦食譜或空狀態 -->
      <div v-if="filteredRecipes.length > 0" class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">推薦食譜</h2>
        <RecipeCard v-for="r in filteredRecipes" :key="r.id" :recipe="r" />
      </div>
      <div v-else class="text-center py-12 text-gray-600">
        <p class="text-4xl mb-4">🤔</p>
        <p class="mb-2">還沒有符合條件的食譜</p>
        <p class="text-sm text-gray-500">試試套用或清除篩選</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import RecipeCard from '../components/RecipeCard.vue'
import type { Recipe } from '../types'
import { recipeStore } from '../stores/recipeStore'

const showFilters = ref(false)

const selectedFilters = ref({
  meal: [] as string[],
  time: null as number | null,
  difficulty: null as string | null,
})

const baseFilteredRecipes = computed(() => {
  return recipeStore.getAll().filter(r => {
    // meal filter
    if (selectedFilters.value.meal.length > 0) {
      if (!selectedFilters.value.meal.includes(r.category)) return false
    }
    // time filter
    if (selectedFilters.value.time !== null) {
      if (r.time > selectedFilters.value.time!) return false
    }
    // difficulty filter
    if (selectedFilters.value.difficulty !== null) {
      if (r.difficulty !== selectedFilters.value.difficulty) return false
    }
    return true
  })
})

const toggleMeal = (meal: string) => {
  const idx = selectedFilters.value.meal.indexOf(meal)
  if (idx >= 0) selectedFilters.value.meal.splice(idx, 1)
  else selectedFilters.value.meal.push(meal)
}

const applyFilters = () => {
  showFilters.value = false
}

const resetFilters = () => {
  selectedFilters.value = { meal: [], time: null, difficulty: null }
  showFilters.value = false
}

const handleGetRecipes = () => {
  // if no filter selected, show random 5
  if (selectedFilters.value.meal.length === 0 && selectedFilters.value.time === null && selectedFilters.value.difficulty === null) {
    const shuffled = [...recipeStore.getAll()].sort(() => 0.5 - Math.random())
    localResults.value = shuffled.slice(0, 5)
  } else {
    // when filters are active, show filtered set (not random)
    localResults.value = baseFilteredRecipes.value.slice(0, 5)
  }
}

const localResults = ref<Recipe[]>([])

// show initial random recipes
localResults.value = [...recipeStore.getAll()].sort(() => 0.5 - Math.random()).slice(0, 5)

const hasFilters = computed(() => {
  return selectedFilters.value.meal.length > 0 || selectedFilters.value.time !== null || selectedFilters.value.difficulty !== null
})

// computed that UI uses: when filters applied show baseFilteredRecipes (full set), otherwise prefer localResults if available
const filteredRecipesDisplay = computed(() => {
  if (hasFilters.value) return baseFilteredRecipes.value
  if (localResults.value.length > 0) return localResults.value
  return baseFilteredRecipes.value
})

// alias exported to template
const filteredRecipes = filteredRecipesDisplay
</script>

<style scoped>
button { transition: all 0.2s ease }
</style>


