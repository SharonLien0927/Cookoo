import { ref, computed } from 'vue'
import type { MenuItem } from '../types'

const STORAGE_KEY = 'cookoo_calendar'

const raw = localStorage.getItem(STORAGE_KEY)
const initial: Record<string, MenuItem[]> = raw ? JSON.parse(raw) : {}

const schedules = ref<Record<string, MenuItem[]>>(initial)

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules.value))
}

export const calendarStore = {
  getForDate(dateStr: string) {
    return schedules.value[dateStr] || []
  },
  addToDate(dateStr: string, menuItem: MenuItem) {
    if (!schedules.value[dateStr]) schedules.value[dateStr] = []
    schedules.value[dateStr].push(menuItem)
    persist()
  },
  removeFromDate(dateStr: string, recipeId: string) {
    if (!schedules.value[dateStr]) return
    schedules.value[dateStr] = schedules.value[dateStr].filter(i => i.recipeId !== recipeId)
    persist()
  },
  getAll() {
    return schedules.value
  }
}

export default calendarStore
