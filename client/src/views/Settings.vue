<template>
  <form @submit.prevent="submitCookie">
    <div class="input-field">
      <label for="cookieInput">Cookie:</label>
      <input
        id="cookieInput"
        autocomplete="off"
        v-model="settings.cookie"
        type="text"
        placeholder="Digite o valor do cookie"
        required
      />
    </div>
    <button class="btn" type="submit">Salvar</button>
  </form>
  <img src="/doc/cookie.png" class="center" />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

const settings = reactive({
  cookie: ''
})

const submitCookie = async () => {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    })

    if (response.ok) {
      const data = await response.json()
      router.push('/update')
      console.log('Dados enviados com sucesso:', data)
    } else {
      throw new Error('Erro ao enviar os dados para o servidor.')
    }
  } catch (error) {
    console.error('Erro ao enviar os dados:', error)
  }
}
</script>

<style scoped>
img {
  border: 1px solid #000;
  margin: 10px auto;
}
</style>
