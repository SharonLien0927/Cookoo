<template>
  <div class="App">
    <RouterView />
    <TabBar />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import TabBar from './components/TabBar.vue'
</script>

