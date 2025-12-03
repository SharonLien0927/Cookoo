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
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? '編輯食譜' : '新增食譜' }}</h1>
      </div>

      <form @submit.prevent="onSave" class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4 space-y-4">
        <!-- 食譜名稱 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">食譜名稱</label>
          <input v-model="form.name" required class="w-full px-3 py-2 border-2 border-orange-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>

        <!-- 封面圖 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">封面圖</label>
          <input type="file" @change="onFileChange" accept="image/*" class="text-sm" />
          <div v-if="form.image" class="mt-2">
            <img :src="form.image" alt="preview" class="w-full h-40 object-cover rounded-2xl border-2 border-orange-200" />
          </div>
        </div>

        <!-- 時間 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">⏱️ 時間 (分鐘內)</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="time in [10, 15, 20, 30]"
              :key="time"
              type="button"
              @click="form.time = form.time === time ? undefined : time"
              class="px-4 py-2 rounded-full text-sm font-medium border-2 transition-all"
              :class="form.time === time ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 border-orange-200'"
            >
              {{ time }}
            </button>
          </div>
        </div>

        <!-- 餐別 (多選) -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">🍽️ 餐別 (可複選)</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="cat in ['早餐', '午餐', '晚餐', '點心']"
              :key="cat"
              type="button"
              @click="toggleMealCategory(cat)"
              class="px-4 py-2 rounded-full text-sm font-medium border-2 transition-all"
              :class="mealCategories.includes(cat) ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 border-orange-200'"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- 難度 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">⭐ 難度</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="diff in ['簡單', '中等', '困難']"
              :key="diff"
              type="button"
              @click="form.difficulty = form.difficulty === diff ? undefined : diff"
              class="px-4 py-2 rounded-full text-sm font-medium border-2 transition-all"
              :class="form.difficulty === diff ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 border-orange-200'"
            >
              {{ diff }}
            </button>
          </div>
        </div>

        <!-- 特色分類 (多選) -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">✨ 特色分類 (可複選)</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="tag in ['快速料理', '一鍋完成', '便當菜', '少洗碗']"
              :key="tag"
              type="button"
              @click="toggleTag(tag)"
              class="px-4 py-2 rounded-full text-sm font-medium border-2 transition-all"
              :class="form.tags?.includes(tag) ? 'bg-orange-400 text-white border-orange-400' : 'bg-white text-gray-700 border-orange-200'"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- 食材列表 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">🥘 食材</label>
          <div class="space-y-2 mb-3">
            <div
              v-for="(ing, idx) in form.ingredients"
              :key="idx"
              draggable="true"
              @dragstart="dragStartIndex = idx; dragType = 'ingredient'"
              @dragover.prevent
              @drop="dropItem(idx, 'ingredient')"
              @dragend="dragStartIndex = -1"
              class="flex items-center gap-2 bg-orange-50 p-3 rounded-xl border border-orange-200 group cursor-grab active:cursor-grabbing hover:bg-orange-100 transition-colors"
            >
              <span class="flex-shrink-0 text-gray-400 font-bold">⋮⋮</span>
              <div v-if="editingIngredientIdx === idx" class="flex-1 flex gap-2">
                <input
                  v-model="ing.name"
                  @blur="editingIngredientIdx = -1"
                  @keydown.enter="editingIngredientIdx = -1"
                  class="flex-1 px-2 py-1 text-sm border-2 border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autofocus
                />
                <input
                  v-model="ing.quantity"
                  @blur="editingIngredientIdx = -1"
                  @keydown.enter="editingIngredientIdx = -1"
                  class="w-20 px-2 py-1 text-sm border-2 border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <span v-else @click="editingIngredientIdx = idx" class="flex-1 font-medium text-gray-700 cursor-text">• {{ ing.name }} <span class="text-orange-600 font-semibold">{{ ing.quantity }}</span></span>
              <button
                type="button"
                @click="removeIngredient(idx)"
                class="text-red-500 hover:text-red-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newIngredient.name"
              placeholder="食材名稱"
              class="flex-1 min-w-0 px-3 py-2 text-sm border-2 border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              v-model="newIngredient.quantity"
              placeholder="數量"
              class="px-3 py-2 text-sm border-2 border-orange-200 rounded-full w-24 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="button"
              @click="addIngredient"
              class="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all flex-shrink-0"
            >
              新增
            </button>
          </div>
        </div>

        <!-- 製作步驟 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">👨‍🍳 製作步驟</label>
          <div class="space-y-2 mb-3">
            <div
              v-for="(step, idx) in form.steps"
              :key="idx"
              draggable="true"
              @dragstart="dragStartIndex = idx; dragType = 'step'"
              @dragover.prevent
              @drop="dropItem(idx, 'step')"
              @dragend="dragStartIndex = -1"
              class="flex items-start gap-2 bg-orange-50 p-3 rounded-xl border border-orange-200 group cursor-grab active:cursor-grabbing hover:bg-orange-100 transition-colors"
            >
              <span class="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {{ idx + 1 }}
              </span>
              <div v-if="editingStepIdx === idx" class="flex-1">
                <textarea
                  v-model="form.steps[idx]"
                  @blur="editingStepIdx = -1"
                  @keydown.enter.meta="editingStepIdx = -1"
                  rows="3"
                  class="w-full px-2 py-1 text-sm border-2 border-orange-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autofocus
                ></textarea>
              </div>
              <span v-else @click="editingStepIdx = idx" class="flex-1 text-sm text-gray-700 font-medium cursor-text leading-relaxed">{{ step }}</span>
              <button
                type="button"
                @click="removeStep(idx)"
                class="text-red-500 hover:text-red-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newStep"
              placeholder="輸入步驟"
              class="flex-1 px-3 py-2 text-sm border-2 border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="button"
              @click="addStep"
              class="px-4 py-2 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all"
            >
              新增
            </button>
          </div>
        </div>

        <!-- 小提示 -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">💡 小提示</label>
          <textarea
            v-model="form.tips"
            rows="2"
            class="w-full px-3 py-2 border-2 border-orange-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="可選填"
          ></textarea>
        </div>

        <!-- 按鈕 -->
        <div class="flex gap-2 mt-6">
          <button type="submit" class="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all">
            儲存
          </button>
          <button type="button" @click="onCancel" class="flex-1 bg-white text-gray-700 px-4 py-3 rounded-full font-semibold border-2 border-orange-200">
            取消
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Recipe, Ingredient } from '../types'
import { recipeStore } from '../stores/recipeStore'

const route = useRoute()
const router = useRouter()

const id = route.params.id as string | undefined
const isEdit = !!id

const form = ref<Partial<Recipe>>({
  name: '',
  image: '',
  time: undefined,
  difficulty: undefined,
  category: '晚餐',
  tags: [],
  ingredients: [],
  steps: [],
  tips: '',
})

const mealCategories = ref<string[]>([])
const newIngredient = ref({ name: '', quantity: '' })
const newStep = ref('')
const editingIngredientIdx = ref(-1)
const editingStepIdx = ref(-1)
const dragStartIndex = ref(-1)
const dragType = ref<'ingredient' | 'step'>('ingredient')

if (isEdit) {
  const item = recipeStore.getById(id)
  if (item) {
    form.value = { ...item }
    mealCategories.value = [item.category]
  }
}

const toggleMealCategory = (cat: string) => {
  const idx = mealCategories.value.indexOf(cat)
  if (idx >= 0) {
    mealCategories.value.splice(idx, 1)
  } else {
    mealCategories.value.push(cat)
  }
}

const toggleTag = (tag: string) => {
  const tags = form.value.tags || []
  const idx = tags.indexOf(tag)
  if (idx >= 0) {
    tags.splice(idx, 1)
  } else {
    tags.push(tag)
  }
  form.value.tags = tags
}

const addIngredient = () => {
  if (!newIngredient.value.name) return
  const ings = form.value.ingredients || []
  ings.push({
    id: Date.now().toString(),
    name: newIngredient.value.name,
    category: '其他',
    quantity: newIngredient.value.quantity,
  })
  form.value.ingredients = ings
  newIngredient.value = { name: '', quantity: '' }
}

const removeIngredient = (idx: number) => {
  const ings = form.value.ingredients || []
  ings.splice(idx, 1)
  form.value.ingredients = ings
}

const addStep = () => {
  if (!newStep.value) return
  const steps = form.value.steps || []
  steps.push(newStep.value)
  form.value.steps = steps
  newStep.value = ''
}

const removeStep = (idx: number) => {
  const steps = form.value.steps || []
  steps.splice(idx, 1)
  form.value.steps = steps
}

const dropItem = (targetIdx: number, type: 'ingredient' | 'step') => {
  if (dragStartIndex.value === -1 || dragType.value !== type) return
  
  const startIdx = dragStartIndex.value
  if (startIdx === targetIdx) return

  if (type === 'ingredient') {
    const ings = form.value.ingredients || []
    const [item] = ings.splice(startIdx, 1)
    ings.splice(targetIdx, 0, item)
    form.value.ingredients = ings
  } else if (type === 'step') {
    const steps = form.value.steps || []
    const [item] = steps.splice(startIdx, 1)
    steps.splice(targetIdx, 0, item)
    form.value.steps = steps
  }
}

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  const reader = new FileReader()
  reader.onload = () => {
    form.value.image = reader.result as string
  }
  reader.readAsDataURL(file)
}

const onSave = () => {
  if (!form.value.name || mealCategories.value.length === 0) {
    alert('請填寫食譜名稱和至少選一個餐別')
    return
  }

  // 使用第一個選中的餐別作為主類別
  form.value.category = mealCategories.value[0]

  if (isEdit && id) {
    // 更新現有食譜
    recipeStore.update(id, form.value)
    router.push(`/recipes/${id}`)
  } else {
    // 新增食譜
    const newRecipe: Recipe = {
      id: Date.now().toString(),
      name: form.value.name!,
      image: form.value.image || 'https://via.placeholder.com/400x300',
      time: form.value.time || 15,
      difficulty: form.value.difficulty || '簡單',
      category: form.value.category || '晚餐',
      tags: form.value.tags || [],
      ingredients: form.value.ingredients || [],
      steps: form.value.steps || [],
      tips: form.value.tips || '',
      isFavorite: false,
    }
    recipeStore.add(newRecipe)
    // 直接導向新食譜的詳細頁
    router.push(`/recipes/${newRecipe.id}`)
  }
}

const onCancel = () => {
  router.push('/recipes')
}
</script>
