<template>
  <div class="min-h-screen pb-20 bg-cream-50">
    <div class="max-w-md mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? '編輯食譜' : '新增食譜' }}</h1>
      </div>

      <form @submit.prevent="onSave" class="bg-white rounded-2xl shadow-soft p-4 space-y-4">
        <!-- 食譜名稱 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">食譜名稱</label>
          <input v-model="form.name" required class="w-full px-3 py-2 border rounded-lg" />
        </div>

        <!-- 封面圖 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">封面圖</label>
          <input type="file" @change="onFileChange" accept="image/*" />
          <div v-if="form.image" class="mt-2">
            <img :src="form.image" alt="preview" class="w-full h-40 object-cover rounded" />
          </div>
        </div>

        <!-- 時間 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">時間 (分鐘內)</label>
          <div class="flex gap-2">
            <button
              v-for="time in [10, 15, 20, 30]"
              :key="time"
              type="button"
              @click="form.time = form.time === time ? undefined : time"
              class="px-3 py-2 rounded-lg text-sm"
              :class="form.time === time ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
            >
              {{ time }}
            </button>
          </div>
        </div>

        <!-- 餐別 (多選) -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">餐別 (可複選)</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="cat in ['早餐', '午餐', '晚餐']"
              :key="cat"
              type="button"
              @click="toggleMealCategory(cat)"
              class="px-3 py-2 rounded-lg text-sm"
              :class="mealCategories.includes(cat) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <!-- 難度 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">難度</label>
          <div class="flex gap-2">
            <button
              v-for="diff in ['簡單', '中等', '困難']"
              :key="diff"
              type="button"
              @click="form.difficulty = form.difficulty === diff ? undefined : diff"
              class="px-3 py-2 rounded-lg text-sm"
              :class="form.difficulty === diff ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
            >
              {{ diff }}
            </button>
          </div>
        </div>

        <!-- 特色分類 (多選) -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">特色分類 (可複選)</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="tag in ['快速料理', '一鍋完成', '便當菜', '少洗碗']"
              :key="tag"
              type="button"
              @click="toggleTag(tag)"
              class="px-3 py-2 rounded-lg text-sm"
              :class="form.tags?.includes(tag) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
            >
              {{ tag }}
            </button>
          </div>
        </div>

        <!-- 食材列表 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">食材</label>
          <div class="space-y-2 mb-3">
            <div
              v-for="(ing, idx) in form.ingredients"
              :key="idx"
              class="flex items-center gap-2 bg-gray-50 p-2 rounded"
            >
              <span class="flex-1">• {{ ing.name }} {{ ing.quantity }}</span>
              <button
                type="button"
                @click="removeIngredient(idx)"
                class="text-red-600 hover:text-red-700 text-sm"
              >
                移除
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newIngredient.name"
              placeholder="食材名稱"
              class="flex-1 px-2 py-1 text-sm border rounded"
            />
            <input
              v-model="newIngredient.quantity"
              placeholder="數量"
              class="px-2 py-1 text-sm border rounded w-20"
            />
            <button
              type="button"
              @click="addIngredient"
              class="px-3 py-1 bg-primary-600 text-white text-sm rounded"
            >
              新增
            </button>
          </div>
        </div>

        <!-- 製作步驟 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">製作步驟</label>
          <div class="space-y-2 mb-3">
            <div
              v-for="(step, idx) in form.steps"
              :key="idx"
              class="flex items-start gap-2 bg-gray-50 p-2 rounded"
            >
              <span class="text-sm font-semibold text-gray-600 flex-shrink-0">[{{ idx + 1 }}]</span>
              <span class="flex-1 text-sm">{{ step }}</span>
              <button
                type="button"
                @click="removeStep(idx)"
                class="text-red-600 hover:text-red-700 text-sm flex-shrink-0"
              >
                移除
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newStep"
              placeholder="輸入步驟"
              class="flex-1 px-2 py-2 text-sm border rounded"
            />
            <button
              type="button"
              @click="addStep"
              class="px-3 py-2 bg-primary-600 text-white text-sm rounded"
            >
              新增
            </button>
          </div>
        </div>

        <!-- 小提示 -->
        <div>
          <label class="block text-sm text-gray-700 mb-1">小提示</label>
          <textarea
            v-model="form.tips"
            rows="2"
            class="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="可選填"
          />
        </div>

        <!-- 按鈕 -->
        <div class="flex gap-2 mt-6">
          <button type="submit" class="flex-1 bg-primary-600 text-white px-4 py-2 rounded-xl font-semibold">
            儲存
          </button>
          <button type="button" @click="onCancel" class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-semibold">
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
import { mockRecipes } from '../data/recipes'

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

if (isEdit) {
  const item = mockRecipes.find(r => r.id === id)
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

  // For now, just return to recipes page
  // In production, would save to backend or local storage
  router.push('/recipes')
}

const onCancel = () => {
  router.push('/recipes')
}
</script>
