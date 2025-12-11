import { ref } from 'vue'
import type { Recipe } from '../types'
import { mockRecipes } from '../data/recipes'
import { db } from '../firebase/db'
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot
} from 'firebase/firestore'

const STORAGE_KEY = 'cookoo_recipes'
const COLLECTION_NAME = 'recipes'

const load = (): Recipe[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Recipe[]
  } catch (e) {
    // ignore
  }
  return [...mockRecipes]
}

const save = (items: Recipe[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    // ignore
  }
}

const recipesRef = ref<Recipe[]>(load())
let firestoreReady = false
let unsubscribe: (() => void) | null = null

// Firestore helper to convert Firestore doc to Recipe
const docToRecipe = (docId: string, data: any): Recipe => {
  const recipeName = data.name || ''
  
  // 確保陣列欄位一定是陣列
  const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : [])
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients : (data.ingredients ? [data.ingredients] : [])
  const steps = Array.isArray(data.steps) ? data.steps : (data.steps ? [data.steps] : [])
  
  // 優先使用 Firestore 中儲存的圖片（可能是 Base64 或 URL）
  let image = data.image
  
  // 如果沒有圖片，才試著從 mock 圖片中查找
  if (!image) {
    const mockRecipe = mockRecipes.find(r => r.name === recipeName)
    if (mockRecipe) {
      image = mockRecipe.image
    } else {
      image = 'https://via.placeholder.com/400x300'
    }
  }
  
  console.log(`📥 Loading recipe "${recipeName}":`, { 
    tagsCount: tags.length, 
    ingredientsCount: ingredients.length, 
    stepsCount: steps.length,
    hasImage: !!image
  })
  
  return {
    id: docId,
    name: recipeName,
    image: image,
    time: Number(data.time) || 15,
    difficulty: data.difficulty || '簡單',
    category: data.category || '晚餐',
    tags: tags,
    ingredients: ingredients,
    steps: steps,
    tips: data.tips || '',
    isFavorite: data.isFavorite || false
  }
}

// Firestore helper to convert Recipe to storable doc
const recipeToDoc = (recipe: Recipe) => {
  // 儲存完整食譜資料到 Firestore（包括壓縮後的 Base64 圖片）
  // 注意：Base64 圖片會很大，但 Firestore 允許最大 1MB
  return {
    name: recipe.name,
    image: recipe.image, // Base64 或 URL
    time: recipe.time,
    difficulty: recipe.difficulty,
    category: recipe.category,
    tags: recipe.tags || [],
    ingredients: recipe.ingredients || [],
    steps: recipe.steps || [],
    tips: recipe.tips || '',
    isFavorite: recipe.isFavorite || false,
    updatedAt: new Date()
  }
}

// Flag to prevent multiple initialization attempts
let initializationStarted = false

// Direct seed of mock recipes - ensures they always exist
const seedMockRecipes = async () => {
  if (initializationStarted) return
  initializationStarted = true
  
  try {
    console.log('🌱 Starting mock recipe seed...')
    
    // 先設置 listener（立即開始監聽所有變化）
    console.log('📡 Setting up Firestore listener...')
    const q = query(collection(db, COLLECTION_NAME))
    unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(d => docToRecipe(d.id, d.data()))
      recipesRef.value = loaded
      console.log(`📲 Listener updated: ${loaded.length} recipes`)
      console.log('🔄 Recipe names:', loaded.map(r => r.name))
      save(recipesRef.value)
    }, (error) => {
      console.error('❌ Listener error:', error)
    })
    
    firestoreReady = true
    console.log('✅ Firestore listener ready')
    
    // Get all existing recipes
    const snapshot = await getDocs(q)
    const existingNames = new Set(snapshot.docs.map(d => d.data().name))
    
    console.log(`📊 Found ${snapshot.size} existing recipes:`, Array.from(existingNames))
    
    // 同步寫入每筆 mock 食譜（使用 setTimeout 避免速率限制）
    for (let i = 0; i < mockRecipes.length; i++) {
      const mockRecipe = mockRecipes[i]
      if (!existingNames.has(mockRecipe.name)) {
        try {
          // 延遲寫入，避免 Firestore 速率限制
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const docRef = await addDoc(collection(db, COLLECTION_NAME), recipeToDoc(mockRecipe))
          console.log(`✅ Added "${mockRecipe.name}" with ID: ${docRef.id}`)
        } catch (e) {
          console.error(`❌ Error adding "${mockRecipe.name}":`, e)
        }
      }
    }
    
    console.log(`✨ Seeding complete!`)
  } catch (error) {
    console.error('❌ Seed failed:', error)
  }
}

// Start seeding immediately
seedMockRecipes()

export const recipeStore = {
  recipes: recipesRef,

  getAll() {
    return this.recipes.value
  },

  getById(id: string) {
    const sid = String(id)
    return this.recipes.value.find(r => String(r.id) === sid) || null
  },

  async add(recipe: Recipe) {
    // If Firestore is ready, add directly to Firestore
    // The onSnapshot listener will automatically update local state
    if (firestoreReady) {
      try {
        console.log(`➕ Adding recipe to Firestore: "${recipe.name}"`)
        const recipeData = recipeToDoc(recipe)
        console.log(`   Image size: ${recipe.image?.length ? (recipe.image.length / 1024).toFixed(1) : 0}KB`)
        
        const docRef = await addDoc(collection(db, COLLECTION_NAME), recipeData)
        console.log(`✅ Recipe added with Firestore ID: ${docRef.id}`)
        console.log(`   Firestore listener should pick it up automatically...`)
        
        const recipeWithFirestoreId = { ...recipe, id: docRef.id }
        // Return the recipe with Firestore ID for navigation
        // Don't manually push to recipes.value - let the listener handle it
        return recipeWithFirestoreId
      } catch (error) {
        console.error('❌ Failed to add recipe to Firestore:', error)
        // Fall back to local-only if Firestore fails
        console.warn('⚠️ Falling back to local storage')
        this.recipes.value.push(recipe)
        save(this.recipes.value)
        return recipe
      }
    } else {
      // Firestore not ready yet, use local storage
      console.warn('⚠️ Firestore not ready, saving to local storage only')
      this.recipes.value.push(recipe)
      save(this.recipes.value)
      return recipe
    }
  },

  async update(id: string, recipe: Partial<Recipe>) {
    const sid = String(id)
    const index = this.recipes.value.findIndex(r => String(r.id) === sid)
    if (index >= 0) {
      this.recipes.value[index] = { ...this.recipes.value[index], ...recipe }
      save(this.recipes.value)
    }
    
    // Try to sync to Firestore if ready
    if (firestoreReady) {
      try {
        const docRef = doc(db, COLLECTION_NAME, sid)
        await updateDoc(docRef, recipeToDoc({ ...this.getById(id)!, ...recipe }))
      } catch (error) {
        console.error('Failed to sync update to Firestore:', error)
      }
    }
  },

  async remove(id: string) {
    const sid = String(id)
    const index = this.recipes.value.findIndex(r => String(r.id) === sid)
    if (index >= 0) {
      this.recipes.value.splice(index, 1)
      save(this.recipes.value)
    }
    
    // Try to sync to Firestore if ready
    if (firestoreReady) {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, sid))
      } catch (error) {
        console.error('Failed to sync delete to Firestore:', error)
      }
    }
  },

  async toggleFavorite(id: string) {
    const recipe = this.getById(id)
    if (recipe) {
      recipe.isFavorite = !recipe.isFavorite
      await this.update(id, { isFavorite: recipe.isFavorite })
    }
  }
}
