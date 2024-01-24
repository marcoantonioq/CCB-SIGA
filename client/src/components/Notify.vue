<template>
  <div v-if="isShow" class="notificacao" :class="{ animate: isShow }">
    {{ mensagem }}
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { store } from '../store/index'

const isShow = ref(false)
const mensagem = ref('')

const timeoutId = ref<number | null>(null)

watchEffect(() => {
  const msgs = store.messages
  console.log('Nova mensagem para notificar: ', msgs)
  if (msgs.length > 0) {
    show(msgs[msgs.length - 1])
  }
})

const show = (msg: string) => {
  isShow.value = true
  mensagem.value = msg

  timeoutId.value = setTimeout(() => {
    isShow.value = false
    mensagem.value = ''
    store.messages.pop()
  }, 5000)
}

const clearNotify = () => {
  if (timeoutId.value !== null) {
    clearTimeout(timeoutId.value)
    timeoutId.value = null
  }
}
</script>

<style scoped>
.notificacao {
  position: fixed;
  font-weight: bolder;
  top: 10px;
  right: 10px;
  background-color: #4caf50;
  color: white;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: opacity 5s ease;
}

.animate {
  opacity: 0.7;
}
</style>
