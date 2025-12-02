import { ref } from 'vue'
import type { Recipe } from '../types'
import { mockRecipes } from '../data/recipes'

export const recipeStore = {
  recipes: ref<Recipe[]>([...mockRecipes]),

  getAll() {
    return this.recipes.value
  },

  getById(id: string) {
    return this.recipes.value.find(r => r.id === id)
  },

  add(recipe: Recipe) {
    this.recipes.value.push(recipe)
  },

  update(id: string, recipe: Partial<Recipe>) {
    const index = this.recipes.value.findIndex(r => r.id === id)
    if (index >= 0) {
      this.recipes.value[index] = { ...this.recipes.value[index], ...recipe }
    }
  },

  remove(id: string) {
    const index = this.recipes.value.findIndex(r => r.id === id)
    if (index >= 0) {
      this.recipes.value.splice(index, 1)
    }
  },

  toggleFavorite(id: string) {
    const recipe = this.getById(id)
    if (recipe) {
      recipe.isFavorite = !recipe.isFavorite
    }
  }
}
