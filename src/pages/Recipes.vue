<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
    <!-- 頂部手繪裝飾 -->
    <div class="relative h-20 overflow-hidden">
      <svg viewBox="0 0 400 80" class="w-full h-full text-orange-300 opacity-40">
        <path d="M 0 40 Q 50 20, 100 40 T 200 40 T 300 40 T 400 40" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" />
      </svg>
    </div>

    <div class="max-w-md mx-auto px-4 py-4">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">食譜瀏覽</h1>
        <div class="flex gap-2">
          <button
            @click="router.push('/recipes/new')"
            class="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all"
            title="新增"
          >
            <Plus :size="20" />
          </button>
          <button
            @click="isDeleteMode = !isDeleteMode; if(!isDeleteMode) recipesToDelete = []"
            class="bg-white text-red-600 p-3 rounded-full shadow-md hover:shadow-lg transition-all border-2 border-red-300"
            title="刪除模式"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>

      <!-- 搜尋框 -->
      <div class="relative mb-4">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400" :size="20" />
        <input
          type="text"
          placeholder="搜尋食譜..."
          v-model="searchQuery"
          class="w-full pl-10 pr-4 py-3 bg-white rounded-full shadow-md border-2 border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <!-- 分類篩選 -->
      <div class="mb-4">
        <h3 class="text-sm font-bold text-gray-700 mb-2">🍽️ 餐別</h3>
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectedCategory = cat"
            class="px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-medium transition-all border-2"
            :class="selectedCategory === cat ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 shadow-md border-orange-200'"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- 難度篩選 -->
      <div class="mb-4">
        <h3 class="text-sm font-bold text-gray-700 mb-2">⭐ 難度</h3>
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="diff in difficulties"
            :key="diff"
            @click="selectedDifficulty = diff"
            class="px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-medium transition-all border-2"
            :class="selectedDifficulty === diff ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 shadow-md border-orange-200'"
          >
            {{ diff }}
          </button>
        </div>
      </div>

      <!-- 時間篩選 -->
      <div class="mb-4">
        <h3 class="text-sm font-bold text-gray-700 mb-2">⏱️ 烹飪時間</h3>
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="time in timeFilters"
            :key="time.value"
            @click="selectedTime = selectedTime === time.value ? null : time.value"
            class="px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-medium transition-all border-2"
            :class="selectedTime === time.value ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 shadow-md border-orange-200'"
          >
            {{ time.label }}
          </button>
        </div>
      </div>

      <!-- 特殊標籤 -->
      <div class="mb-4">
        <h3 class="text-sm font-bold text-gray-700 mb-2">✨ 特色分類</h3>
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="tag in specialTags"
            :key="tag"
            @click="selectedTag = selectedTag === tag ? null : tag"
            class="px-4 py-2 rounded-full text-sm whitespace-nowrap flex-shrink-0 font-medium transition-all border-2"
            :class="selectedTag === tag ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 shadow-md border-orange-200'"
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- 我的最愛 -->
      <div class="mb-6">
        <button
          @click="showFavoritesOnly = !showFavoritesOnly"
          class="px-4 py-3 rounded-full text-sm w-full font-semibold transition-all border-2"
          :class="showFavoritesOnly ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 shadow-md border-orange-200'"
        >
          ♡ 我的最愛
        </button>
      </div>

      <!-- 食譜列表 -->
      <div v-if="filteredRecipes.length > 0" class="space-y-4">
        <div v-for="recipe in filteredRecipes" :key="recipe.id" class="relative">
          <RecipeCard
            :recipe="recipe"
            :selected="recipesToDelete.includes(recipe.id)"
            :onClick="isDeleteMode ? () => toggleRecipeForDelete(recipe.id) : () => handleRecipeClick(recipe)"
          />
        </div>
      </div>
      <div v-else class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-8 text-center text-gray-500">
        <p class="text-4xl mb-2">🤔</p>
        <p>沒有找到符合條件的食譜</p>
      </div>

      <!-- 刪除模式操作按鈕 -->
      <div v-if="isDeleteMode" class="fixed bottom-24 left-0 right-0 px-4 max-w-md mx-auto">
        <div class="flex gap-2">
          <button
            @click="isDeleteMode = false; recipesToDelete = []"
            class="flex-1 px-4 py-3 rounded-full text-sm font-semibold bg-white text-gray-700 shadow-md border-2 border-orange-200 hover:shadow-lg transition-all"
          >
            取消
          </button>
          <button
            v-if="recipesToDelete.length > 0"
            @click="showDeleteConfirm = true"
            class="flex-1 px-4 py-3 rounded-full text-sm font-semibold bg-red-500 text-white shadow-md hover:shadow-lg transition-all"
          >
            確認刪除（{{ recipesToDelete.length }}）
          </button>
        </div>
      </div>

      <!-- 刪除確認模態 -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-3xl shadow-lg border-2 border-orange-200 p-6 max-w-sm w-full">
          <h3 class="text-lg font-bold text-gray-900 mb-4">確認刪除</h3>
          <p class="text-gray-600 mb-6">確定要刪除選中的 {{ recipesToDelete.length }} 筆食譜嗎？此操作無法復原。</p>
          <div class="flex gap-3">
            <button
              @click="showDeleteConfirm = false"
              class="flex-1 px-4 py-2 rounded-full text-sm font-semibold bg-white text-gray-700 shadow-md border-2 border-orange-200 hover:shadow-lg transition-all"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              class="flex-1 px-4 py-2 rounded-full text-sm font-semibold bg-red-500 text-white shadow-md hover:shadow-lg transition-all"
            >
              確認刪除
            </button>
          </div>
        </div>
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
import { recipeStore } from '../stores/recipeStore'

const router = useRouter()
const searchQuery = ref('')
const selectedCategory = ref('全部')
const selectedDifficulty = ref('全部')
const selectedTag = ref<string | null>(null)
const showFavoritesOnly = ref(false)
const selectedTime = ref<number | null>(null)
const isDeleteMode = ref(false)
const recipesToDelete = ref<string[]>([])
const showDeleteConfirm = ref(false)

const categories = ['全部', '早餐', '午餐', '晚餐', '點心']
const difficulties = ['全部', '簡單', '中等', '困難']
const specialTags = ['快速料理', '一鍋完成', '便當菜', '少洗碗']
const timeFilters = [
  { label: '10分鐘以內', value: 10 },
  { label: '15分鐘以內', value: 15 },
  { label: '20分鐘以內', value: 20 },
  { label: '30分鐘以內', value: 30 }
]

const filteredRecipes = computed(() => {
  return recipeStore.getAll().filter((recipe) => {
    if (searchQuery.value && !recipe.name.toLowerCase().includes(searchQuery.value.toLowerCase())) return false
    if (selectedCategory.value !== '全部' && recipe.category !== selectedCategory.value) return false
    if (selectedDifficulty.value !== '全部' && recipe.difficulty !== selectedDifficulty.value) return false
    if (selectedTag.value && !recipe.tags.includes(selectedTag.value)) return false
    if (selectedTime.value !== null && recipe.time > selectedTime.value) return false
    if (showFavoritesOnly.value && !recipe.isFavorite) return false
    return true
  })
})

const handleRecipeClick = (recipe: Recipe) => {
  router.push(`/recipes/${recipe.id}`)
}

const toggleRecipeForDelete = (id: string) => {
  const idx = recipesToDelete.value.indexOf(id)
  if (idx >= 0) recipesToDelete.value.splice(idx, 1)
  else recipesToDelete.value.push(id)
}

const confirmDelete = () => {
  recipesToDelete.value.forEach(id => recipeStore.remove(id))
  recipesToDelete.value = []
  isDeleteMode.value = false
  showDeleteConfirm.value = false
}
</script>

