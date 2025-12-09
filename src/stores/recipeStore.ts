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
    
    // Add each mock recipe if it doesn't exist
    let addedCount = 0
    for (const mockRecipe of mockRecipes) {
      if (!existingNames.has(mockRecipe.name)) {
        try {
          const docRef = await addDoc(collection(db, COLLECTION_NAME), recipeToDoc(mockRecipe))
          console.log(`✅ Added "${mockRecipe.name}"`)
          addedCount++
        } catch (e) {
          console.error(`❌ Error adding "${mockRecipe.name}":`, e)
        }
      }
    }
    
    console.log(`✨ Seeding complete! Added ${addedCount} new recipes`)
    firestoreReady = true
    
    // Set up listener AFTER seeding
    unsubscribe = onSnapshot(q, (snapshot) => {
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
const docToRecipe = (docId: string, data: any): Recipe => {
  return {
    id: docId,
    name: data.name || '',
    image: data.image || '',
    time: data.time || 15,
    difficulty: data.difficulty || '簡單',
    category: data.category || '晚餐',
    tags: data.tags || [],
    ingredients: data.ingredients || [],
    steps: data.steps || [],
    tips: data.tips || '',
    isFavorite: data.isFavorite || false
  }
}

// Firestore helper to convert Recipe to storable doc
const recipeToDoc = (recipe: Recipe) => {
  return {
    name: recipe.name,
    image: recipe.image,
    time: recipe.time,
    difficulty: recipe.difficulty,
    category: recipe.category,
    tags: recipe.tags,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    tips: recipe.tips,
    isFavorite: recipe.isFavorite,
    updatedAt: new Date()
  }
}

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
