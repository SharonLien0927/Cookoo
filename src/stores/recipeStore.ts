import { ref } from 'vue'
import type { Recipe } from '../types'
import { mockRecipes } from '../data/recipes'

const STORAGE_KEY = 'cookoo_recipes'

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

export const recipeStore = {
  recipes: recipesRef,

  getAll() {
    return this.recipes.value
  },

  getById(id: string) {
    const sid = String(id)
    return this.recipes.value.find(r => String(r.id) === sid) || null
  },

  add(recipe: Recipe) {
    this.recipes.value.push(recipe)
    save(this.recipes.value)
    return recipe
  },

  update(id: string, recipe: Partial<Recipe>) {
    const sid = String(id)
    const index = this.recipes.value.findIndex(r => String(r.id) === sid)
    if (index >= 0) {
      this.recipes.value[index] = { ...this.recipes.value[index], ...recipe }
      save(this.recipes.value)
    }
  },

  remove(id: string) {
    const sid = String(id)
    const index = this.recipes.value.findIndex(r => String(r.id) === sid)
    if (index >= 0) {
      this.recipes.value.splice(index, 1)
      save(this.recipes.value)
    }
  },

  toggleFavorite(id: string) {
    const recipe = this.getById(id)
    if (recipe) {
      recipe.isFavorite = !recipe.isFavorite
      save(this.recipes.value)
    }
  }
}
