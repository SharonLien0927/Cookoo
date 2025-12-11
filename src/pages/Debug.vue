<template>
  <div class="min-h-screen bg-white p-4">
    <h1 class="text-2xl font-bold mb-4">🔧 Debug Status</h1>
    
    <div class="space-y-4">
      <!-- Firebase Status -->
      <div class="border-2 border-orange-200 rounded-lg p-4">
        <h2 class="font-bold mb-2">Firebase Status</h2>
        <div class="space-y-1 text-sm">
          <p><span class="font-semibold">Project ID:</span> cookoo-e50ab</p>
          <p><span class="font-semibold">Firestore Ready:</span> {{ firestoreReady }}</p>
          <p><span class="font-semibold">Local Recipes:</span> {{ recipes.length }}</p>
        </div>
      </div>
      
      <!-- Recipes List -->
      <div class="border-2 border-orange-200 rounded-lg p-4">
        <h2 class="font-bold mb-2">📋 Local Recipes</h2>
        <div class="text-sm space-y-2">
          <div v-if="recipes.length === 0" class="text-gray-500">No recipes</div>
          <div v-for="recipe in recipes" :key="recipe.id" class="bg-gray-50 p-2 rounded">
            <p><span class="font-semibold">{{ recipe.name }}</span> (ID: {{ recipe.id }})</p>
            <p class="text-xs text-gray-500">Category: {{ recipe.category }}</p>
            <p class="text-xs text-gray-500">Image: {{ recipe.image?.substring(0, 50) }}...</p>
          </div>
        </div>
      </div>
      
      <!-- Test Firestore Write -->
      <div class="border-2 border-orange-200 rounded-lg p-4">
        <h2 class="font-bold mb-2">🧪 Test Firestore Write</h2>
        <button 
          @click="testFirestoreWrite"
          class="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-full font-semibold"
        >
          Test Write
        </button>
        <div v-if="writeResult" class="mt-2 p-2 rounded bg-gray-50 text-sm">
          <p :class="writeResult.success ? 'text-green-600' : 'text-red-600'">
            {{ writeResult.message }}
          </p>
        </div>
      </div>
      
      <!-- Console Output -->
      <div class="border-2 border-orange-200 rounded-lg p-4">
        <h2 class="font-bold mb-2">📝 Recent Logs</h2>
        <div class="text-xs bg-gray-900 text-green-400 p-3 rounded max-h-60 overflow-y-auto font-mono">
          <div v-for="(log, idx) in logs" :key="idx" class="whitespace-pre-wrap">{{ log }}</div>
        </div>
      </div>
      
      <button 
        @click="() => $router.push('/recipes')"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full font-semibold"
      >
        Back to Recipes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { recipeStore } from '../stores/recipeStore'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../firebase/db'

const recipes = ref(recipeStore.getAll())
const firestoreReady = ref(false)
const writeResult = ref<{ success: boolean; message: string } | null>(null)
const logs = ref<string[]>([])

// Capture console logs
const originalLog = console.log
const originalError = console.error
const originalWarn = console.warn

console.log = (...args: any[]) => {
  logs.value.push(args.join(' '))
  if (logs.value.length > 50) logs.value.shift()
  originalLog(...args)
}

console.error = (...args: any[]) => {
  logs.value.push('ERROR: ' + args.join(' '))
  if (logs.value.length > 50) logs.value.shift()
  originalError(...args)
}

console.warn = (...args: any[]) => {
  logs.value.push('WARN: ' + args.join(' '))
  if (logs.value.length > 50) logs.value.shift()
  originalWarn(...args)
}

const testFirestoreWrite = async () => {
  writeResult.value = null
  try {
    console.log('🧪 Testing Firestore write...')
    const testDoc = {
      name: `Test Recipe ${Date.now()}`,
      category: 'test',
      time: 15,
      difficulty: '簡單',
      tags: [],
      ingredients: [],
      steps: [],
      tips: '',
      image: 'https://via.placeholder.com/400x300',
      isFavorite: false,
      testTimestamp: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'recipes'), testDoc)
    console.log('✅ Test write successful! Doc ID:', docRef.id)
    writeResult.value = {
      success: true,
      message: `✅ Write successful! Document ID: ${docRef.id}`
    }
  } catch (error: any) {
    console.error('❌ Test write failed:', error)
    writeResult.value = {
      success: false,
      message: `❌ Write failed: ${error.message}`
    }
  }
}

// Update recipes list when it changes
setInterval(() => {
  recipes.value = recipeStore.getAll()
}, 1000)
</script>
