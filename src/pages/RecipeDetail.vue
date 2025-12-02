<template>
  <div v-if="!recipe" class="min-h-screen pb-20 bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
    <div class="text-center">
      <p class="text-4xl mb-2">🔍</p>
      <p class="text-gray-500 font-medium">找不到食譜</p>
    </div>
  </div>
  <div v-else class="min-h-screen pb-20 bg-gradient-to-b from-orange-50 to-white">
    <div class="max-w-md mx-auto">
      <!-- 圖片區域（手繪風邊框） -->
      <div class="relative">
        <div class="relative overflow-hidden rounded-b-3xl border-b-4 border-orange-300">
          <img
            :src="recipe.image"
            :alt="recipe.name"
            class="w-full h-64 object-cover"
          />
          <button
            @click="router.back()"
            class="absolute top-4 left-4 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all border-2 border-orange-200"
          >
            <ArrowLeft :size="20" class="text-gray-900" />
          </button>
        </div>
      </div>

      <!-- 內容區域 -->
      <div class="px-4 py-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ recipe.name }}</h1>

        <!-- 基本資訊 -->
        <div class="flex items-center gap-4 mb-6 flex-wrap">
          <div class="flex items-center gap-2 text-gray-900 font-semibold bg-orange-100 px-4 py-2 rounded-full border-2 border-orange-300">
            <Clock :size="18" />
            <span>{{ recipe.time }} 分鐘</span>
          </div>
          <div class="flex items-center gap-2 font-semibold px-4 py-2 rounded-full border-2" :class="difficultyColors[recipe.difficulty]">
            <ChefHat :size="18" />
            <span>{{ recipe.difficulty }}</span>
          </div>
        </div>

        <!-- 標籤 -->
        <div class="flex gap-2 flex-wrap mb-6">
          <span
            v-for="tag in recipe.tags"
            :key="tag"
            class="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold border-2 border-orange-300"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 食材清單 -->
        <div class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4 mb-6">
          <h2 class="font-bold text-lg text-gray-900 mb-3">🥘 食材</h2>
          <ul class="space-y-3">
            <li
              v-for="(ing, idx) in recipe.ingredients"
              :key="idx"
              class="flex items-center gap-3 text-gray-700 p-2 bg-orange-50 rounded-xl"
            >
              <span class="w-3 h-3 bg-orange-400 rounded-full flex-shrink-0"></span>
              <span class="font-medium">{{ ing.name }}</span>
              <span v-if="ing.quantity" class="text-orange-600 text-sm ml-auto font-semibold">{{ ing.quantity }}</span>
            </li>
          </ul>
        </div>

        <!-- 製作步驟 -->
        <div class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4 mb-6">
          <h2 class="font-bold text-lg text-gray-900 mb-3">👨‍🍳 製作步驟</h2>
          <ol class="space-y-4">
            <li
              v-for="(step, idx) in recipe.steps"
              :key="idx"
              class="flex gap-3"
            >
              <span class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {{ idx + 1 }}
              </span>
              <span class="flex-1 text-gray-700 leading-relaxed font-medium">{{ step }}</span>
            </li>
          </ol>
        </div>

        <!-- 小提示 -->
        <div v-if="recipe.tips" class="bg-orange-50 border-2 border-dashed border-orange-400 rounded-3xl p-4">
          <h3 class="font-bold text-orange-900 mb-2">💡 小提示</h3>
          <p class="text-orange-800 text-sm leading-relaxed">{{ recipe.tips }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Clock, ChefHat, ArrowLeft } from 'lucide-vue-next'
import type { Recipe } from '../types'
import { mockRecipes } from '../data/recipes'
import { recipeStore } from '../stores/recipeStore'

const route = useRoute()
const router = useRouter()

const recipe = computed(() => {
  const id = route.params.id as string
  
  // 先從 recipeStore 查找
  const storeRecipe = recipeStore.getById(id)
  if (storeRecipe) {
    return storeRecipe
  }
  
  // 再嘗試從 state 獲取
  if (route.state?.recipe) {
    return route.state.recipe as Recipe
  }
  
  // 最後從 mockRecipes 查找
  return mockRecipes.find(r => r.id === id)
})

const difficultyColors = {
  簡單: 'bg-green-100 text-green-700 border-green-400',
  中等: 'bg-yellow-100 text-yellow-700 border-yellow-400',
  困難: 'bg-red-100 text-red-700 border-red-400',
}
</script>

