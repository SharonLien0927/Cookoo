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

// Initialize Firestore connection asynchronously
const initializeFromFirestore = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      console.log('Seeding Firestore with mock recipes...')
      for (const recipe of mockRecipes) {
        await addDoc(collection(db, COLLECTION_NAME), recipeToDoc(recipe))
      }
      // Reload after seeding
      const seedSnapshot = await getDocs(q)
      recipesRef.value = seedSnapshot.docs.map(d => docToRecipe(d.id, d.data()))
    } else {
      recipesRef.value = snapshot.docs.map(d => docToRecipe(d.id, d.data()))
    }
    save(recipesRef.value)
    firestoreReady = true
    
    // Set up real-time listener for future changes (only after ready)
    unsubscribe = onSnapshot(q, (snapshot) => {
      recipesRef.value = snapshot.docs.map(d => docToRecipe(d.id, d.data()))
      save(recipesRef.value)
    })
    
    console.log('Firestore initialized successfully')
  } catch (error) {
    console.error('Failed to initialize Firestore:', error)
    firestoreReady = false
  }
}

// Start initialization (non-blocking)
initializeFromFirestore()

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
    // Always add to local state first
    this.recipes.value.push(recipe)
    save(this.recipes.value)
    
    // Try to sync to Firestore if ready
    if (firestoreReady) {
      try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), recipeToDoc(recipe))
        const index = this.recipes.value.findIndex(r => r.id === recipe.id)
        if (index >= 0) {
          this.recipes.value[index].id = docRef.id
          save(this.recipes.value)
        }
      } catch (error) {
        console.error('Failed to sync add to Firestore:', error)
      }
    }
    
    return recipe
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
