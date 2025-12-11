<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
    <!-- 頂部手繪裝飾 -->
    <div class="relative h-20 overflow-hidden">
      <svg viewBox="0 0 400 80" class="w-full h-full text-orange-300 opacity-40">
        <path d="M 0 40 Q 50 20, 100 40 T 200 40 T 300 40 T 400 40" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" />
      </svg>
    </div>

    <div class="max-w-md mx-auto px-4 py-4 space-y-4">
      <h1 class="text-3xl font-bold text-gray-900 text-center">🔧 Debug</h1>
      
      <!-- Firebase Status Card -->
      <div class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4">
        <h2 class="text-lg font-bold text-gray-900 mb-3">Firebase Status</h2>
        <div class="space-y-2 text-sm bg-orange-50 rounded-2xl p-3">
          <p class="font-semibold">📌 Project: cookoo-e50ab</p>
          <p class="font-semibold">📦 Firestore Ready: <span :class="firestoreReady ? 'text-green-600' : 'text-red-600'">{{ firestoreReady ? '✅ YES' : '❌ NO' }}</span></p>
          <p class="font-semibold">📋 Local Recipes: {{ recipes.length }} 筆</p>
        </div>
      </div>

      <!-- Local Recipes List -->
      <div class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4">
        <h2 class="text-lg font-bold text-gray-900 mb-3">📋 你的食譜</h2>
        <div class="space-y-2">
          <div v-if="recipes.length === 0" class="text-center text-gray-500 py-4">
            還沒有食譜
          </div>
          <div v-for="recipe in recipes" :key="recipe.id" class="bg-orange-50 rounded-2xl p-3 border border-orange-200">
            <p class="font-bold text-orange-600">{{ recipe.name }}</p>
            <p class="text-xs text-gray-500">ID: {{ recipe.id }}</p>
            <p class="text-xs text-gray-500">分類: {{ recipe.category }}</p>
          </div>
        </div>
      </div>

      <!-- Test Button -->
      <div class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4">
        <button 
          @click="testFirestoreWrite"
          class="w-full bg-orange-400 hover:bg-orange-500 text-white px-4 py-3 rounded-full font-bold text-lg"
        >
          🧪 測試寫入 Firestore
        </button>
        
        <div v-if="writeResult" class="mt-3 p-3 rounded-2xl" :class="writeResult.success ? 'bg-green-100 border-2 border-green-400' : 'bg-red-100 border-2 border-red-400'">
          <p class="font-bold text-sm" :class="writeResult.success ? 'text-green-700' : 'text-red-700'">
            {{ writeResult.message }}
          </p>
        </div>
      </div>

      <!-- Console Logs -->
      <div class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4">
        <h2 class="text-lg font-bold text-gray-900 mb-3">📝 Console 輸出</h2>
        <div class="bg-gray-900 text-green-400 p-3 rounded-2xl max-h-64 overflow-y-auto font-mono text-xs leading-relaxed">
          <div v-if="logs.length === 0" class="text-gray-500">
            等待日誌輸出...
          </div>
          <div v-for="(log, idx) in logs" :key="idx" class="whitespace-pre-wrap break-words">
            {{ log }}
          </div>
        </div>
      </div>

      <!-- Back Button -->
      <button 
        @click="() => $router.push('/recipes')"
        class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-full font-bold"
      >
        回到食譜列表
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

const addLog = (message: string) => {
  logs.value.push(message)
  if (logs.value.length > 50) logs.value.shift()
}

console.log = (...args: any[]) => {
  const msg = args.join(' ')
  addLog(msg)
  originalLog(...args)
}

console.error = (...args: any[]) => {
  const msg = 'ERROR: ' + args.join(' ')
  addLog(msg)
  originalError(...args)
}

console.warn = (...args: any[]) => {
  const msg = 'WARN: ' + args.join(' ')
  addLog(msg)
  originalWarn(...args)
}

onMounted(() => {
  addLog('✅ Debug 頁面已載入')
  addLog('正在檢查 Firestore 狀態...')
  
  // 簡單延遲後檢查是否就緒
  setTimeout(() => {
    const isReady = (window as any).__FIRESTORE_READY__ || false
    firestoreReady.value = isReady
    addLog(`Firestore 狀態: ${isReady ? '✅ 已就緒' : '⏳ 初始化中...'}`)
  }, 2000)
})

const testFirestoreWrite = async () => {
  writeResult.value = null
  addLog('🧪 開始測試 Firestore 寫入...')
  
  try {
    const testDoc = {
      name: `Test-${Date.now()}`,
      category: 'test',
      time: 15,
      difficulty: '簡單',
      tags: [],
      ingredients: [],
      steps: [],
      tips: 'This is a test document',
      image: 'https://via.placeholder.com/400x300',
      isFavorite: false,
      testTimestamp: new Date()
    }
    
    addLog('📤 發送資料到 Firestore...')
    const docRef = await addDoc(collection(db, 'recipes'), testDoc)
    addLog(`✅ 寫入成功! Document ID: ${docRef.id}`)
    
    writeResult.value = {
      success: true,
      message: `✅ 寫入成功! Document ID: ${docRef.id}`
    }
  } catch (error: any) {
    addLog(`❌ 寫入失敗!`)
    addLog(`錯誤代碼: ${error.code}`)
    addLog(`錯誤訊息: ${error.message}`)
    
    writeResult.value = {
      success: false,
      message: `❌ 寫入失敗: ${error.message}`
    }
  }
}

// Update recipes list when it changes
setInterval(() => {
  recipes.value = recipeStore.getAll()
}, 1000)
</script>
