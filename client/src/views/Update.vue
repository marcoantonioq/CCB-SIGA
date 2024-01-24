<template>
  <main>
    <form @submit.prevent="generate">
      <div class="input-field">
        <label for="date1Input">Data inicial:</label>
        <input id="date1Input" v-model="settings.date1" type="date" required />
      </div>

      <div class="input-field">
        <label for="date2Input">Data final:</label>
        <input id="date2Input" v-model="settings.date2" type="date" required />
      </div>

      <button class="btn" type="submit">Gerar Dados</button>
    </form>
  </main>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const currentDate = new Date()
const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

const settings = reactive({
  date1: firstDayOfMonth.toISOString().slice(0, 10),
  date2: lastDayOfMonth.toISOString().slice(0, 10)
})

const generate = async () => {
  try {
    const isoDate1 = new Date(settings.date1).toISOString()
    const isoDate2 = new Date(settings.date2).toISOString()

    const response = await fetch(`/api/generate?date1=${isoDate1}&date2=${isoDate2}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Dados recebidos com sucesso:', data)
      router.push('/')
    } else {
      throw new Error('Erro ao receber os dados do servidor.')
    }
  } catch (error) {
    console.error('Erro ao receber os dados:', error)
  }
}
</script>
