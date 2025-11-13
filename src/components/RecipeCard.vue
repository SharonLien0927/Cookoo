<template>
  <div
    @click="handleClick"
    class="bg-white rounded-2xl shadow-soft overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
  >
    <div class="relative">
      <img
        :src="recipe.image"
        :alt="recipe.name"
        class="w-full h-48 object-cover"
      />
      <button
        @click.stop="handleFavorite"
        class="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-sm backdrop-blur-sm"
      >
        <Heart
          :size="20"
          :class="isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'"
        />
      </button>
      <div class="absolute bottom-3 left-3 right-3 flex gap-2 flex-wrap">
        <span
          v-for="tag in recipe.tags.slice(0, 2)"
          :key="tag"
          class="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs text-gray-700"
        >
          {{ tag }}
        </span>
      </div>
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-lg mb-2 text-gray-900">{{ recipe.name }}</h3>
      <div class="flex items-center gap-4 text-sm text-gray-600">
        <div class="flex items-center gap-1">
          <Clock :size="16" />
          <span>{{ recipe.time }} 分鐘</span>
        </div>
        <div class="flex items-center gap-1">
          <ChefHat :size="16" />
          <span
            class="px-2 py-0.5 rounded-full text-xs"
            :class="difficultyColors[recipe.difficulty]"
          >
            {{ recipe.difficulty }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Clock, ChefHat, Heart } from 'lucide-vue-next'
import type { Recipe } from '../types'

interface Props {
  recipe: Recipe
  onFavorite?: (id: string) => void
  onClick?: () => void
}

const props = defineProps<Props>()

const isFavorite = ref(props.recipe.isFavorite || false)

const difficultyColors = {
  簡單: 'bg-green-100 text-green-700',
  中等: 'bg-yellow-100 text-yellow-700',
  困難: 'bg-red-100 text-red-700',
}

const handleFavorite = () => {
  isFavorite.value = !isFavorite.value
  props.onFavorite?.(props.recipe.id)
}

const handleClick = () => {
  props.onClick?.()
}
</script>

