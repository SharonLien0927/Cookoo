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
  
  // 首先從 mockRecipes 查找（用於初始的 6 筆食譜）
  let mockRecipe = mockRecipes.find(r => r.name === recipeName)
  
  // 如果找到，使用 mockRecipe 的完整資料但用 Firestore ID
  if (mockRecipe) {
    return { ...mockRecipe, id: docId }
  }
  
  // 否則，用 Firestore 中儲存的完整資料（用戶新增的食譜）
  // 確保陣列欄位一定是陣列
  const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : [])
  const ingredients = Array.isArray(data.ingredients) ? data.ingredients : (data.ingredients ? [data.ingredients] : [])
  const steps = Array.isArray(data.steps) ? data.steps : (data.steps ? [data.steps] : [])
  
  console.log(`📥 Loading recipe "${recipeName}":`, { 
    tagsCount: tags.length, 
    ingredientsCount: ingredients.length, 
    stepsCount: steps.length 
  })
  
  return {
    id: docId,
    name: recipeName,
    image: import.meta.env.BASE_URL + `Img/${recipeName}.jpeg`,
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
  // 存儲完整食譜資料到 Firestore（包括 ingredients 和 steps）
  return {
    name: recipe.name,
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
    
    // Get all existing recipes
    const q = query(collection(db, COLLECTION_NAME))
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
    firestoreReady = true
    
    // Set up listener AFTER seeding
    const q2 = query(collection(db, COLLECTION_NAME))
    unsubscribe = onSnapshot(q2, (snapshot) => {
      recipesRef.value = snapshot.docs.map(d => docToRecipe(d.id, d.data()))
      console.log(`📲 Updated: ${recipesRef.value.length} recipes`)
      save(recipesRef.value)
    })
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
        const docRef = await addDoc(collection(db, COLLECTION_NAME), recipeToDoc(recipe))
        const recipeWithFirestoreId = { ...recipe, id: docRef.id }
        // Return the recipe with Firestore ID for navigation
        // Don't manually push to recipes.value - let the listener handle it
        return recipeWithFirestoreId
      } catch (error) {
        console.error('Failed to add recipe to Firestore:', error)
        // Fall back to local-only if Firestore fails
        this.recipes.value.push(recipe)
        save(this.recipes.value)
        return recipe
      }
    } else {
      // Firestore not ready yet, use local storage
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
