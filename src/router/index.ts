import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Calendar from '../pages/Calendar.vue'
import Ingredients from '../pages/Ingredients.vue'
import Recipes from '../pages/Recipes.vue'
import RecipeDetail from '../pages/RecipeDetail.vue'
import Bot from '../pages/Bot.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/calendar', component: Calendar },
  { path: '/ingredients', component: Ingredients },
  { path: '/recipes', component: Recipes },
  { path: '/recipes/:id', component: RecipeDetail },
  { path: '/bot', component: Bot },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

