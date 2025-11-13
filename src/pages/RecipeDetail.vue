<template>
  <div v-if="!recipe" class="min-h-screen pb-20 bg-cream-50 flex items-center justify-center">
    <p class="text-gray-500">找不到食譜</p>
  </div>
  <div v-else class="min-h-screen pb-20 bg-cream-50">
    <div class="max-w-md mx-auto">
      <!-- 圖片區域 -->
      <div class="relative">
        <img
          :src="recipe.image"
          :alt="recipe.name"
          class="w-full h-64 object-cover"
        />
        <button
          @click="router.back()"
          class="absolute top-4 left-4 p-2 bg-white/90 rounded-full backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft :size="20" class="text-gray-900" />
        </button>
      </div>

      <!-- 內容區域 -->
      <div class="px-4 py-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">{{ recipe.name }}</h1>

        <!-- 基本資訊 -->
        <div class="flex items-center gap-4 mb-6">
          <div class="flex items-center gap-2 text-gray-600">
            <Clock :size="18" />
            <span>{{ recipe.time }} 分鐘</span>
          </div>
          <div class="flex items-center gap-2">
            <ChefHat :size="18" class="text-gray-600" />
            <span
              class="px-3 py-1 rounded-full text-sm"
              :class="difficultyColors[recipe.difficulty]"
            >
              {{ recipe.difficulty }}
            </span>
          </div>
        </div>

        <!-- 標籤 -->
        <div class="flex gap-2 flex-wrap mb-6">
          <span
            v-for="tag in recipe.tags"
            :key="tag"
            class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
          >
            {{ tag }}
          </span>
        </div>

        <!-- 食材清單 -->
        <div class="bg-white rounded-2xl shadow-soft p-4 mb-6">
          <h2 class="font-semibold text-lg text-gray-900 mb-3">食材</h2>
          <ul class="space-y-2">
            <li
              v-for="(ing, idx) in recipe.ingredients"
              :key="idx"
              class="flex items-center gap-2 text-gray-700"
            >
              <span class="w-2 h-2 bg-primary-400 rounded-full"></span>
              <span>{{ ing.name }}</span>
              <span v-if="ing.quantity" class="text-gray-500 text-sm ml-auto">{{ ing.quantity }}</span>
            </li>
          </ul>
        </div>

        <!-- 製作步驟 -->
        <div class="bg-white rounded-2xl shadow-soft p-4 mb-6">
          <h2 class="font-semibold text-lg text-gray-900 mb-3">製作步驟</h2>
          <ol class="space-y-4">
            <li
              v-for="(step, idx) in recipe.steps"
              :key="idx"
              class="flex gap-3"
            >
              <span class="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {{ idx + 1 }}
              </span>
              <span class="flex-1 text-gray-700 leading-relaxed">{{ step }}</span>
            </li>
          </ol>
        </div>

        <!-- 小提示 -->
        <div v-if="recipe.tips" class="bg-primary-50 border border-primary-200 rounded-2xl p-4">
          <h3 class="font-semibold text-primary-900 mb-2">💡 小提示</h3>
          <p class="text-primary-800 text-sm">{{ recipe.tips }}</p>
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

const route = useRoute()
const router = useRouter()

const recipe = computed(() => {
  // 先嘗試從 state 獲取
  if (route.state?.recipe) {
    return route.state.recipe as Recipe
  }
  // 如果沒有，從路由參數獲取 ID 並查找
  const id = route.params.id as string
  return mockRecipes.find(r => r.id === id)
})

const difficultyColors = {
  簡單: 'bg-green-100 text-green-700',
  中等: 'bg-yellow-100 text-yellow-700',
  困難: 'bg-red-100 text-red-700',
}
</script>

