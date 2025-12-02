<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
    <!-- 頂部手繪裝飾 -->
    <div class="relative h-20 overflow-hidden">
      <svg viewBox="0 0 400 80" class="w-full h-full text-orange-300 opacity-40">
        <path d="M 0 40 Q 50 20, 100 40 T 200 40 T 300 40 T 400 40" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" />
      </svg>
    </div>

    <div class="max-w-md mx-auto px-4 py-4">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">食材管理</h1>

      <!-- 搜尋框 -->
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" :size="20" />
        <input
          type="text"
          placeholder="搜尋食材..."
          v-model="searchQuery"
          class="w-full pl-10 pr-4 py-3 bg-white rounded-full shadow-md border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <!-- 三大類標籤 -->
      <div class="mb-3">
        <div class="flex gap-2 overflow-x-auto pb-2 mb-2 scroll-smooth" style="scroll-behavior: smooth;">
          <button
            v-for="v in viewGroup"
            :key="v"
            @click="selectedView = v"
            class="px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-medium transition-all border-2"
            :class="selectedView === v ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 shadow-md border-orange-200'"
          >
            {{ v }}
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 mb-2 scroll-smooth" style="scroll-behavior: smooth; -webkit-overflow-scrolling: touch; scrollbar-width: none;" @wheel.prevent="onCategoryScroll">
          <button
            v-for="c in categoryGroup"
            :key="c"
            @click="selectedCategory = c"
            class="px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-medium transition-all border-2"
            :class="selectedCategory === c ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 shadow-md border-orange-200'"
          >
            {{ c }}
          </button>
        </div>

        <div class="flex gap-2 overflow-x-auto pb-2 scroll-smooth" style="scroll-behavior: smooth;">
          <button
            v-for="s in sortGroup"
            :key="s"
            @click="selectedSort = s"
            class="px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-medium transition-all border-2"
            :class="selectedSort === s ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 shadow-md border-orange-200'"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <!-- 即將過期提醒 -->
      <div v-if="expiringSoon.length > 0" class="bg-orange-50 border-2 border-orange-300 rounded-3xl p-4 mb-4 flex items-start gap-3">
        <AlertCircle class="text-orange-600 flex-shrink-0 mt-0.5" :size="20" />
        <div class="flex-1">
          <h3 class="font-bold text-orange-900 mb-1">⏰ 即將過期提醒</h3>
          <div class="space-y-1">
            <p
              v-for="ing in expiringSoon"
              :key="ing.id"
              class="text-sm text-orange-800 font-medium"
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
        class="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-3 rounded-full shadow-md mb-4 flex items-center justify-center gap-2 font-bold hover:shadow-lg transition-all"
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
          <h2 class="text-lg font-bold text-gray-900">我的食材</h2>
          <button
            @click="addIngredient"
            class="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all"
          >
            <Plus :size="20" />
          </button>
        </div>

        <div v-if="filteredIngredients.length === 0" class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-8 text-center text-gray-500">
          <p class="text-4xl mb-2">🥬</p>
          <p class="mb-2 font-medium">還沒有添加食材</p>
          <p class="text-sm">點擊右上角 + 按鈕開始管理你的食材</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="ing in filteredIngredients"
            :key="ing.id"
            class="rounded-2xl shadow-md p-4 flex items-center justify-between cursor-pointer transition-all hover:shadow-lg group relative"
            :class="isExpired(ing) ? 'bg-red-100 border-2 border-red-400' : 'bg-white border-2 border-orange-200'"
            @click="editIngredient(ing.id)"
          >
            <div>
              <p class="font-bold" :class="isExpired(ing) ? 'text-red-700 line-through' : 'text-gray-900'">{{ ing.name }}</p>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="text-sm font-semibold" :class="isExpired(ing) ? 'text-red-700' : 'text-gray-900'">{{ ing.quantity || '-' }}</div>
                <div class="text-xs font-medium" :class="isExpired(ing) ? 'text-red-600' : 'text-orange-600'">
                  {{ ing.expiryDate ? new Date(ing.expiryDate).toLocaleDateString() : '' }}
                  <span v-if="isExpired(ing)" class="ml-1 font-bold">已過期</span>
                </div>
              </div>
              <button
                @click.stop="deleteIngredient(ing.id)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 font-bold text-xl"
                title="刪除"
              >
                ✕
              </button>
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

const deleteIngredient = (id: string) => {
  if (confirm('確定要刪除此食材嗎？')) {
    ingredientStore.remove(id)
  }
}

const onCategoryScroll = (e: WheelEvent) => {
  const container = e.currentTarget as HTMLElement
  e.preventDefault()
  container.scrollLeft += e.deltaY
}
</script>

