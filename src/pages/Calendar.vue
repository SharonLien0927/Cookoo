<template>
  <div class="min-h-screen pb-20 bg-cream-50">
    <div class="max-w-md mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">日曆</h1>
        <div class="flex gap-2">
          <button
            @click="generateWeeklyMenu"
            class="bg-primary-600 text-white px-4 py-2 rounded-xl shadow-soft flex items-center gap-2 text-sm"
          >
            <Plus :size="16" />
            一週菜單
          </button>
          <button
            @click="exportShoppingList"
            class="bg-white text-primary-600 px-4 py-2 rounded-xl shadow-soft flex items-center gap-2 text-sm border border-primary-200"
          >
            <Download :size="16" />
            購物清單
          </button>
        </div>
      </div>

      <!-- 月份導覽 -->
      <div class="flex items-center justify-between mb-4 bg-white rounded-2xl shadow-soft p-4">
        <button
          @click="prevMonth"
          class="text-primary-600 font-semibold"
        >
          ←
        </button>
        <h2 class="text-lg font-semibold text-gray-900">
          {{ format(currentDate, 'yyyy年MM月') }}
        </h2>
        <button
          @click="nextMonth"
          class="text-primary-600 font-semibold"
        >
          →
        </button>
      </div>

      <!-- 日曆網格 -->
      <div class="bg-white rounded-2xl shadow-soft p-4 mb-4">
        <div class="grid grid-cols-7 gap-2 mb-2">
          <div
            v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
            :key="day"
            class="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {{ day }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <button
            v-for="day in days"
            :key="day.toISOString()"
            @click="selectedDate = format(day, 'yyyy-MM-dd')"
            class="aspect-square rounded-lg text-sm transition-colors border-2"
            :class="getDayClass(day)"
          >
            <div>{{ format(day, 'd') }}</div>
            <div v-if="getMenuForDate(day).length > 0" class="flex gap-0.5 justify-center mt-1">
              <div
                v-for="idx in Math.min(getMenuForDate(day).length, 3)"
                :key="idx"
                class="w-1 h-1 bg-primary-400 rounded-full"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- 選中日期的菜單詳情 -->
      <div v-if="selectedDate" class="bg-white rounded-2xl shadow-soft p-4 flex items-center justify-between">
        <div class="flex-1">
          <h3 class="font-semibold mb-3 text-gray-900">
            {{ format(new Date(selectedDate), 'MM月dd日') }}
          </h3>
          <div v-if="getMenuForDate(new Date(selectedDate)).length > 0" class="space-y-2">
            <div
              v-for="(item, idx) in getMenuForDate(new Date(selectedDate))"
              :key="idx"
              class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              <span class="text-xs text-gray-500 w-12">{{ item.mealType }}</span>
              <span class="flex-1 text-gray-900">{{ getRecipeName(item.recipeId) }}</span>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm">這天還沒有安排菜單</p>
        </div>
        <div v-if="getMenuForDate(new Date(selectedDate)).length === 0" class="ml-2">
          <button
            @click="showMenuFilter = true"
            class="bg-primary-600 text-white p-2 rounded-lg"
          >
            <Plus :size="20" />
          </button>
        </div>
      </div>

      <!-- 菜單篩選 Modal -->
      <MenuFilter
        :show="showMenuFilter"
        @confirm="onMenuFilterConfirm"
        @cancel="showMenuFilter = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns'
import { Download, Plus } from 'lucide-vue-next'
import type { MenuItem } from '../types'
import { mockRecipes } from '../data/recipes'
import MenuFilter from '../components/MenuFilter.vue'

const currentDate = ref(new Date())
const menuItems = ref<MenuItem[]>([])
const selectedDate = ref<string | null>(null)
const showMenuFilter = ref(false)

const monthStart = computed(() => startOfMonth(currentDate.value))
const monthEnd = computed(() => endOfMonth(currentDate.value))
const days = computed(() => {
  const start = startOfWeek(monthStart.value, { weekStartsOn: 0 })
  const end = endOfWeek(monthEnd.value, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
})

const getMenuForDate = (date: Date) => {
  const dateStr = format(date, 'yyyy-MM-dd')
  return menuItems.value.filter(item => item.date === dateStr)
}

const getRecipeName = (recipeId: string) => {
  return mockRecipes.find(r => r.id === recipeId)?.name || ''
}

const getDayClass = (day: Date) => {
  const isCurrentMonth = isSameMonth(day, currentDate.value)
  const isCurrentDay = isToday(day)
  const isSelected = selectedDate === format(day, 'yyyy-MM-dd')
  
  if (!isCurrentMonth) return 'text-gray-300'
  if (isSelected) return 'bg-gray-100 text-gray-900 border-2 border-primary-600'
  if (isCurrentDay) return 'bg-primary-600 text-white font-semibold'
  return 'bg-gray-50 text-gray-700 hover:bg-gray-100'
}

const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1)
}

const generateWeeklyMenu = () => {
  const weeklyMenu: MenuItem[] = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = format(date, 'yyyy-MM-dd')
    
    const breakfast = mockRecipes.find(r => r.category === '早餐')
    const lunch = mockRecipes.find(r => r.category === '午餐')
    const dinner = mockRecipes.find(r => r.category === '晚餐')
    
    if (breakfast) weeklyMenu.push({ date: dateStr, recipeId: breakfast.id, mealType: '早餐' })
    if (lunch) weeklyMenu.push({ date: dateStr, recipeId: lunch.id, mealType: '午餐' })
    if (dinner) weeklyMenu.push({ date: dateStr, recipeId: dinner.id, mealType: '晚餐' })
  }
  
  menuItems.value = [...menuItems.value, ...weeklyMenu]
}

const onMenuFilterConfirm = (meals: string[], time: number | null, difficulty: string | null) => {
  if (!selectedDate.value) return
  
  let filtered = [...mockRecipes]
  
  if (meals.length > 0) {
    filtered = filtered.filter(r => meals.includes(r.category))
  }
  
  if (time !== null) {
    filtered = filtered.filter(r => r.time <= time)
  }
  
  if (difficulty !== null) {
    filtered = filtered.filter(r => r.difficulty === difficulty)
  }
  
  // Add meals to selected date
  const selectedMeals = meals.length > 0 ? meals : ['早餐', '午餐', '晚餐']
  selectedMeals.forEach(meal => {
    const recipe = filtered.find(r => r.category === meal)
    if (recipe) {
      menuItems.value.push({
        date: selectedDate.value!,
        recipeId: recipe.id,
        mealType: meal as '早餐' | '午餐' | '晚餐'
      })
    }
  })
  
  showMenuFilter.value = false
}

const exportShoppingList = () => {
  const allIngredients = new Set<string>()
  menuItems.value.forEach(item => {
    const recipe = mockRecipes.find(r => r.id === item.recipeId)
    recipe?.ingredients.forEach(ing => allIngredients.add(ing.name))
  })
  
  const list = Array.from(allIngredients).join('\n')
  alert(`購物清單：\n${list}\n\n（實際應用中可匯出為檔案）`)
}
</script>

