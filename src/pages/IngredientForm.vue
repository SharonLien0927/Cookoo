<template>
  <div class="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
    <div class="max-w-md mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit ? '編輯食材' : '新增食材' }}</h1>
      </div>

      <form @submit.prevent="onSave" class="bg-white rounded-3xl shadow-md border-2 border-orange-200 p-4 space-y-4">
        <div>
          <label class="block text-sm text-gray-700 mb-1">名稱</label>
          <input v-model="form.name" required class="w-full px-3 py-2 border-2 border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-gray-700 mb-1">數量</label>
            <input v-model="form.quantity" class="w-full px-3 py-2 border-2 border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label class="block text-sm text-gray-700 mb-1">保鮮天數 (天)</label>
            <input type="number" v-model.number="form.shelfLifeDays" class="w-full px-3 py-2 border-2 border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>

        <div>
          <label class="block text-sm text-gray-700 mb-1">購買日期</label>
          <input type="date" v-model="form.purchaseDate" class="w-full px-3 py-2 border-2 border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>

        <div>
          <label class="block text-sm text-gray-700 mb-1">分類</label>
          <select v-model="form.category" class="w-full px-3 py-2 border-2 border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400">
            <option value="蔬菜">蔬菜</option>
            <option value="水果">水果</option>
            <option value="肉類">肉類</option>
            <option value="海鮮">海鮮</option>
            <option value="蛋奶">蛋奶</option>
            <option value="調味料">調味料</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-700 mb-1">到期日（自動計算）</label>
          <div class="text-sm text-gray-600">{{ expiryDisplayValue || '尚未設定' }}</div>
        </div>

        <div class="flex gap-2 mt-4">
          <button type="submit" class="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg">儲存</button>
          <button type="button" @click="onCancel" class="flex-1 bg-white text-gray-700 px-4 py-2 rounded-full font-semibold border-2 border-orange-200">取消</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ingredientStore } from '../stores/ingredientStore'
import type { Ingredient } from '../types'

const route = useRoute()
const router = useRouter()

const id = route.params.id as string | undefined
const isEdit = !!id

const emptyForm = (): Partial<Ingredient> => ({
  name: '',
  quantity: '',
  category: '其他',
  purchaseDate: '',
  shelfLifeDays: undefined,
  expiryDate: undefined,
  image: '',
  tags: [],
})

const form = ref<Partial<Ingredient>>({ ...emptyForm() })

if (isEdit) {
  const item = ingredientStore.ingredients.find(i => i.id === id)
  if (item) {
    form.value = { ...item, purchaseDate: item.purchaseDate || '', shelfLifeDays: item.shelfLifeDays }
  }
}

const expiryDisplayValue = computed(() => {
  if (!form.value.purchaseDate || !form.value.shelfLifeDays) return ''
  const d = new Date(form.value.purchaseDate)
  d.setDate(d.getDate() + (form.value.shelfLifeDays || 0))
  return d.toLocaleDateString()
})



const onSave = () => {
  // compute expiryDate
  if (form.value.purchaseDate && form.value.shelfLifeDays) {
    const d = new Date(form.value.purchaseDate)
    d.setDate(d.getDate() + (form.value.shelfLifeDays || 0))
    form.value.expiryDate = d
  }

  if (isEdit && id) {
    ingredientStore.update(id, form.value as Partial<Ingredient>)
  } else {
    const newItem: Ingredient = {
      id: Date.now().toString(),
      name: form.value.name || '新食材',
      category: (form.value.category as any) || '其他',
      quantity: form.value.quantity,
      expiryDate: form.value.expiryDate as any,
      isExpiringSoon: false,
      purchaseDate: form.value.purchaseDate,
      shelfLifeDays: form.value.shelfLifeDays,
    }
    ingredientStore.add(newItem)
  }

  router.push('/ingredients')
}

const onCancel = () => {
  router.push('/ingredients')
}
</script>
