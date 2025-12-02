<template>
  <div
    @click="handleClick"
    class="bg-white rounded-3xl shadow-md border-2 border-orange-200 overflow-hidden cursor-pointer transition-all hover:shadow-lg active:scale-[0.98]"
  >
    <div class="relative">
      <img
        :src="recipe.image"
        :alt="recipe.name"
        class="w-full h-48 object-cover"
      />
      <button
        @click.stop="handleFavorite"
        class="absolute top-3 right-3 p-3 bg-white rounded-full shadow-md border-2 border-orange-200 hover:bg-orange-50 transition-all"
      >
        <Heart
          :size="20"
          :class="recipe.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'"
        />
      </button>
      <div class="absolute bottom-3 left-3 right-3 flex gap-2 flex-wrap">
        <span
          v-for="tag in recipe.tags.slice(0, 2)"
          :key="tag"
          class="px-3 py-1 bg-orange-300 text-white rounded-full text-xs font-semibold shadow-sm"
        >
          {{ tag }}
        </span>
      </div>
    </div>
    <div class="p-4">
      <h3 class="font-bold text-lg mb-2 text-gray-900">{{ recipe.name }}</h3>
      <div class="flex items-center gap-3 text-sm">
        <div class="flex items-center gap-1 text-orange-600 font-semibold">
          <Clock :size="16" />
          <span>{{ recipe.time }} 分</span>
        </div>
        <div class="flex items-center gap-1 font-bold px-3 py-1 rounded-full border-2"
          :class="difficultyColors[recipe.difficulty]"
        >
          <ChefHat :size="16" />
          <span>{{ recipe.difficulty }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, ChefHat, Heart } from 'lucide-vue-next'
import type { Recipe } from '../types'
import { recipeStore } from '../stores/recipeStore'

interface Props {
  recipe: Recipe
  onClick?: () => void
}

const props = defineProps<Props>()

const difficultyColors = {
  簡單: 'bg-green-100 text-green-700 border-green-400',
  中等: 'bg-yellow-100 text-yellow-700 border-yellow-400',
  困難: 'bg-red-100 text-red-700 border-red-400',
}

const handleFavorite = () => {
  recipeStore.toggleFavorite(props.recipe.id)
}

import { useRouter } from 'vue-router'
const router = useRouter()

const handleClick = () => {
  if (props.onClick) {
    props.onClick()
    return
  }
  router.push(`/recipes/${props.recipe.id}`)
}
</script>

