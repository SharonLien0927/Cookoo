import { reactive } from 'vue'
import type { Ingredient } from '../types'

const data = reactive({
  ingredients: [] as Ingredient[],
})

export const ingredientStore = {
  get ingredients() {
    return data.ingredients
  },
  setIngredients(list: Ingredient[]) {
    data.ingredients.splice(0, data.ingredients.length, ...list)
  },
  add(ing: Ingredient) {
    data.ingredients.push(ing)
  },
  update(id: string, patch: Partial<Ingredient>) {
    const idx = data.ingredients.findIndex(i => i.id === id)
    if (idx >= 0) {
      data.ingredients[idx] = { ...data.ingredients[idx], ...patch }
    }
  },
  remove(id: string) {
    const idx = data.ingredients.findIndex(i => i.id === id)
    if (idx >= 0) data.ingredients.splice(idx, 1)
  }
}
