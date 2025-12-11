import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Calendar from '../pages/Calendar.vue'
import Ingredients from '../pages/Ingredients.vue'
import Recipes from '../pages/Recipes.vue'
import RecipeDetail from '../pages/RecipeDetail.vue'
import IngredientForm from '../pages/IngredientForm.vue'
import RecipeForm from '../pages/RecipeForm.vue'
import Debug from '../pages/Debug.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/calendar', component: Calendar },
  { path: '/ingredients', component: Ingredients },
  { path: '/ingredients/new', component: IngredientForm },
  { path: '/ingredients/:id', component: IngredientForm },
  { path: '/recipes', component: Recipes },
  { path: '/recipes/new', component: RecipeForm },
  { path: '/recipes/:id', component: RecipeDetail },
  { path: '/recipes/:id/edit', component: RecipeForm },
  { path: '/debug', component: Debug },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router

