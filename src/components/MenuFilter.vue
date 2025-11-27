<template>
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-end z-40">
    <div class="bg-white w-full rounded-t-3xl p-6 animate-in slide-in-from-bottom">
      <div class="max-w-md mx-auto">
        <h2 class="text-xl font-bold text-gray-900 mb-4">篩選食譜</h2>

        <h3 class="font-semibold mb-2 text-gray-900">餐別</h3>
        <div class="flex gap-2 mb-4">
          <button
            v-for="meal in ['早餐', '午餐', '晚餐']"
            :key="meal"
            @click="toggleMeal(meal)"
            class="px-4 py-2 rounded-lg text-sm"
            :class="selectedMeals.includes(meal) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
          >
            {{ meal }}
          </button>
        </div>

        <h3 class="font-semibold mb-2 text-gray-900">時間</h3>
        <div class="flex gap-2 mb-4">
          <button
            v-for="time in [10, 15, 20, 30]"
            :key="time"
            @click="selectedTime = selectedTime === time ? null : time"
            class="px-4 py-2 rounded-lg text-sm"
            :class="selectedTime === time ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
          >
            {{ time }}分鐘內
          </button>
        </div>

        <h3 class="font-semibold mb-2 text-gray-900">難度</h3>
        <div class="flex gap-2 mb-6">
          <button
            v-for="diff in ['簡單', '中等', '困難']"
            :key="diff"
            @click="selectedDifficulty = selectedDifficulty === diff ? null : diff"
            class="px-4 py-2 rounded-lg text-sm"
            :class="selectedDifficulty === diff ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'"
          >
            {{ diff }}
          </button>
        </div>

        <div class="flex gap-2">
          <button
            @click="onConfirm"
            class="flex-1 bg-primary-600 text-white px-4 py-3 rounded-xl font-semibold"
          >
            完成篩選
          </button>
          <button
            @click="onCancel"
            class="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-semibold"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'confirm', meals: string[], time: number | null, difficulty: string | null): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedMeals = ref<string[]>([])
const selectedTime = ref<number | null>(null)
const selectedDifficulty = ref<string | null>(null)

const toggleMeal = (meal: string) => {
  const idx = selectedMeals.value.indexOf(meal)
  if (idx >= 0) {
    selectedMeals.value.splice(idx, 1)
  } else {
    selectedMeals.value.push(meal)
  }
}

const onConfirm = () => {
  emit('confirm', selectedMeals.value, selectedTime.value, selectedDifficulty.value)
}

const onCancel = () => {
  emit('cancel')
}
</script>
