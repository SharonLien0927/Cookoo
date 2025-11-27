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

      <!-- 三大類標籤 -->
      <div class="mb-3">
        <div class="flex gap-2 overflow-x-auto pb-2 mb-2">
          <button
            v-for="v in viewGroup"
            :key="v"
            @click="selectedView = v"
            class="px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
            :class="selectedView === v ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 shadow-soft'"
          >
            {{ v }}
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 mb-2">
          <button
            v-for="c in categoryGroup"
            :key="c"
            @click="selectedCategory = c"
            class="px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
            :class="selectedCategory === c ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 shadow-soft'"
          >
            {{ c }}
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="s in sortGroup"
            :key="s"
            @click="selectedSort = s"
            class="px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0"
            :class="selectedSort === s ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 shadow-soft'"
          >
            {{ s }}
          </button>
        </div>
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
            class="rounded-xl shadow-soft p-4 flex items-center justify-between cursor-pointer"
            :class="isExpired(ing) ? 'bg-red-50 border-2 border-red-300' : 'bg-white'"
            @click="editIngredient(ing.id)"
          >
            <div>
              <p class="font-medium" :class="isExpired(ing) ? 'text-red-700 line-through' : 'text-gray-900'">{{ ing.name }}</p>
            </div>
            <div class="text-right">
              <div class="text-sm" :class="isExpired(ing) ? 'text-red-700' : 'text-gray-900'">{{ ing.quantity || '-' }}</div>
              <div class="text-xs" :class="isExpired(ing) ? 'text-red-600' : 'text-gray-500'">
                {{ ing.expiryDate ? new Date(ing.expiryDate).toLocaleDateString() : '' }}
                <span v-if="isExpired(ing)" class="ml-1 font-semibold">已過期</span>
              </div>
            </div>
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
import { useRouter } from 'vue-router'
import { ingredientStore } from '../stores/ingredientStore'

const viewGroup = ['所有食材', '我的食材', '食譜食材']
const categoryGroup = ['全部分類', '蔬菜', '水果', '肉肉', '海鮮', '蛋奶', '調味料', '其他']
const sortGroup = ['按數量排序', '按名稱排序', '按保鮮期排序']

const searchQuery = ref('')
const selectedView = ref('所有食材')
const selectedCategory = ref('全部分類')
const selectedSort = ref('按名稱排序')
const router = useRouter()
const myIngredients = ingredientStore.ingredients
const aiRecommendations = ref<Recipe[]>([])

const expiringSoon = computed(() => myIngredients.filter(ing => ing.isExpiringSoon))

const filteredIngredients = computed(() => {
  let list = myIngredients.slice()
  // view filter
  if (selectedView.value === '我的食材') {
    // currently store only local "我的食材"; keep same
  }

  // category filter
  if (selectedCategory.value !== '全部分類') {
    const mappedCat = mapCategory(selectedCategory.value)
    list = list.filter(ing => ing.category === mappedCat)
  }

  // search
  if (searchQuery.value) {
    list = list.filter(ing => ing.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }

  // sort
  if (selectedSort.value === '按數量排序') {
    list.sort((a, b) => (parseFloat(a.quantity || '0') || 0) - (parseFloat(b.quantity || '0') || 0))
  } else if (selectedSort.value === '按名稱排序') {
    list.sort((a, b) => a.name.localeCompare(b.name))
  } else if (selectedSort.value === '按保鮮期排序') {
    list.sort((a, b) => {
      const da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity
      const db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity
      return da - db
    })
  }

  return list
})

const mapCategory = (label: string) => {
  if (label === '肉肉') return '肉類'
  if (label === '全部分類') return ''
  return label
}

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
  router.push('/ingredients/new')
}

const editIngredient = (id: string) => {
  router.push(`/ingredients/${id}`)
}

const isExpired = (ing: Ingredient) => {
  if (!ing.expiryDate) return false
  const expiry = new Date(ing.expiryDate)
  return expiry < new Date()
}
</script>

