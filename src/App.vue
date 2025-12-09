<template>
  <div class="App">
    <RouterView />
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import TabBar from './components/TabBar.vue'
import { recipeStore } from './stores/recipeStore'

// Ensure recipes are loaded when app mounts
onMounted(() => {
  console.log('App mounted, recipes:', recipeStore.getAll())
})
</script>

