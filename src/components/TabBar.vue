<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-200 safe-area-bottom z-50">
    <div class="flex justify-around items-center h-16 px-2">
      <router-link
        v-for="tab in tabs"
        :key="tab.path"
        :to="tab.path"
        class="flex flex-col items-center justify-center flex-1 h-full transition-colors"
        :class="isActive(tab.path) ? 'text-orange-600' : 'text-gray-400'"
      >
        <component :is="tab.icon" :size="24" :class="isActive(tab.path) ? 'text-orange-600' : 'text-gray-400'" />
        <span class="text-xs mt-1" :class="{ 'font-medium': isActive(tab.path) }">
          {{ tab.label }}
        </span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Home, Calendar, Package, BookOpen } from 'lucide-vue-next'

const route = useRoute()

const tabs = [
  { path: '/', icon: Home, label: '主頁' },
  { path: '/calendar', icon: Calendar, label: '日曆' },
  { path: '/ingredients', icon: Package, label: '食材' },
  { path: '/recipes', icon: BookOpen, label: '食譜' },
]

const isActive = (path: string) => route.path === path
</script>

