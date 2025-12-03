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
        <h1 class="text-2xl font-bold text-gray-900">日曆</h1>
        <div class="flex gap-2">
          <button
            @click="generateWeeklyMenu"
            class="bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm font-medium hover:shadow-lg transition-all"
          >
            <Plus :size="16" />
            一週菜單
          </button>
          <button
            @click="exportShoppingList"
            class="bg-white text-orange-600 px-4 py-2 rounded-full shadow-md flex items-center gap-2 text-sm font-medium border-2 border-orange-300 hover:shadow-lg transition-all"
          >
            <Download :size="16" />
            購物清單
          </button>
        </div>
      </div>

      <!-- 月份導覽 -->
      <div class="flex items-center justify-between mb-4 bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4">
        <button
          @click="prevMonth"
          class="text-orange-500 font-bold text-xl hover:text-orange-600"
        >
          ←
        </button>
        <h2 class="text-lg font-bold text-gray-900">
          {{ format(currentDate, 'yyyy年MM月') }}
        </h2>
        <button
          @click="nextMonth"
          class="text-orange-500 font-bold text-xl hover:text-orange-600"
        >
          →
        </button>
      </div>

      <!-- 日曆網格 -->
      <div class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4 mb-4">
        <div class="grid grid-cols-7 gap-2 mb-2">
          <div
            v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
            :key="day"
            class="text-center text-sm font-bold text-orange-600 py-2"
          >
            {{ day }}
          </div>
        </div>
        <div class="grid grid-cols-7 gap-2">
          <button
            v-for="day in days"
            :key="day.toISOString()"
            @click="selectedDate = format(day, 'yyyy-MM-dd')"
            class="aspect-square rounded-full text-sm transition-all border-2 font-semibold"
            :class="getDayClass(day)"
          >
            <div>{{ format(day, 'd') }}</div>
            <div v-if="getMenuForDate(day).length > 0" class="flex gap-0.5 justify-center mt-1">
              <div
                v-for="idx in Math.min(getMenuForDate(day).length, 3)"
                :key="idx"
                class="w-1.5 h-1.5 bg-orange-400 rounded-full"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- 選中日期的菜單詳情 -->
      <div v-if="selectedDate" class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4 flex items-center justify-between">
        <div class="flex-1">
          <h3 class="font-bold mb-3 text-gray-900 text-lg">
            {{ format(new Date(selectedDate), 'MM月dd日') }}
          </h3>
          <div v-if="getMenuForDate(new Date(selectedDate)).length > 0" class="space-y-2">
            <div
              v-for="(item, idx) in getMenuForDate(new Date(selectedDate))"
              :key="idx"
              class="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl border border-orange-200"
            >
              <span class="text-xs text-orange-600 font-semibold w-12 bg-orange-100 px-2 py-1 rounded-full">{{ item.mealType }}</span>
              <span class="flex-1 text-gray-900 font-medium">{{ getRecipeName(item.recipeId) }}</span>
              <button
                @click="removeScheduled(selectedDate, item.recipeId)"
                class="ml-2 px-3 py-1 rounded-full text-sm bg-white border-2 border-red-200 text-red-600 hover:bg-red-50"
                title="移除"
              >
                刪除
              </button>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm">這天還沒有安排菜單</p>
        </div>
        <div v-if="getMenuForDate(new Date(selectedDate)).length === 0" class="ml-2">
          <button
            @click="showMenuFilter = true"
            class="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-3 rounded-full shadow-md hover:shadow-lg transition-all"
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

      <!-- 篩選結果：使用者可選擇要加入哪個食譜到選中日期 -->
      <div v-if="menuFilterResults && menuFilterResults.length > 0" class="mt-4 bg-white rounded-3xl p-4 border-2 border-orange-200 shadow-md">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-gray-900">符合的食譜（點擊加入至選中日期）</h3>
          <button
            @click="menuFilterResults = null"
            class="px-3 py-1 rounded-full text-sm bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-medium"
          >
            取消篩選
          </button>
        </div>
        <div class="space-y-3">
          <div v-for="res in menuFilterResults" :key="res.id" class="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-200">
            <div class="flex-1">
              <div class="font-semibold text-gray-900">{{ res.name }}</div>
            </div>
            <div class="flex gap-2 ml-3">
              <button
                v-for="m in allowedMeals || ['早餐','午餐','晚餐']"
                :key="m"
                @click="addRecipeToSelectedDate(res.id, m)"
                class="px-3 py-1 rounded-full text-sm bg-white border-2 border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                加入 {{ m }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="menuFilterResults && menuFilterResults.length === 0" class="mt-4 bg-white rounded-3xl p-4 border-2 border-orange-200 shadow-md text-center text-gray-600">
        <p class="font-medium">目前沒有符合條件的食譜</p>
        <button
          @click="menuFilterResults = null"
          class="mt-3 px-4 py-2 rounded-full text-sm bg-orange-100 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-medium"
        >
          取消篩選
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns'
import { Download, Plus } from 'lucide-vue-next'
import type { MenuItem } from '../types'
import { recipeStore } from '../stores/recipeStore'
import { calendarStore } from '../stores/calendarStore'
import MenuFilter from '../components/MenuFilter.vue'

const currentDate = ref(new Date())
// menuItems are persisted in calendarStore (local variable only for compatibility)
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
  return calendarStore.getForDate(dateStr)
}

const getRecipeName = (recipeId: string) => {
  return recipeStore.getById(recipeId)?.name || ''
}

const getDayClass = (day: Date) => {
  const isCurrentMonth = isSameMonth(day, currentDate.value)
  const isCurrentDay = isToday(day)
  const isSelected = selectedDate.value === format(day, 'yyyy-MM-dd')
  
  if (!isCurrentMonth) return 'text-gray-300 bg-transparent border-transparent'
  if (isSelected) return 'bg-orange-100 text-gray-900 border-orange-500'
  if (isCurrentDay) return 'bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold border-transparent'
  return 'bg-transparent text-gray-700 hover:bg-orange-50 border-transparent'
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
    
    const all = recipeStore.getAll()
    const breakfast = all.find(r => r.category === '早餐')
    const lunch = all.find(r => r.category === '午餐')
    const dinner = all.find(r => r.category === '晚餐')
    
    if (breakfast) weeklyMenu.push({ date: dateStr, recipeId: breakfast.id, mealType: '早餐' })
    if (lunch) weeklyMenu.push({ date: dateStr, recipeId: lunch.id, mealType: '午餐' })
    if (dinner) weeklyMenu.push({ date: dateStr, recipeId: dinner.id, mealType: '晚餐' })
  }
  
  weeklyMenu.forEach(m => calendarStore.addToDate(m.date, m))
}

const menuFilterResults = ref<Array<{ id: string; name: string }> | null>(null)
const allowedMeals = ref<string[] | null>(null)

const onMenuFilterConfirm = (meals: string[], time: number | null, difficulty: string | null) => {
  if (!selectedDate.value) return

  let filtered = recipeStore.getAll()

  if (meals.length > 0) {
    filtered = filtered.filter(r => meals.includes(r.category))
  }

  if (time !== null) {
    filtered = filtered.filter(r => r.time <= time)
  }

  if (difficulty !== null) {
    filtered = filtered.filter(r => r.difficulty === difficulty)
  }

  // store filtered recipes to show for user selection (only IDs + name)
  // We'll map to a small structure for UI
  const results = filtered.map(r => ({ id: r.id, name: r.name }))
  menuFilterResults.value = results
  allowedMeals.value = meals.length > 0 ? meals : ['早餐', '午餐', '晚餐']
  // close the modal, show results below for selection
  showMenuFilter.value = false
}

const addRecipeToSelectedDate = (recipeId: string, mealType: string) => {
  if (!selectedDate.value) return
  const mi: MenuItem = { date: selectedDate.value, recipeId, mealType: mealType as any }
  calendarStore.addToDate(selectedDate.value, mi)
  // clear temp results
  menuFilterResults.value = null
  showMenuFilter.value = false
}

const removeScheduled = (dateStr: string | null, recipeId: string) => {
  if (!dateStr) return
  calendarStore.removeFromDate(dateStr, recipeId)
}

const exportShoppingList = () => {
  const allIngredients = new Set<string>()
  const schedules = calendarStore.getAll()
  Object.values(schedules).forEach((items) => {
    items.forEach(item => {
      const recipe = recipeStore.getById(item.recipeId)
      recipe?.ingredients.forEach(ing => allIngredients.add(ing.name))
    })
  })

  const list = Array.from(allIngredients).join('\n')
  alert(`購物清單：\n${list}\n\n（實際應用中可匯出為檔案）`)
}
</script>

