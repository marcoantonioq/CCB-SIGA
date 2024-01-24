<template>
  <div>
    <div class="input-field">
      <label for="date1Input">Data inicial:</label>
      <input id="date1Input" v-model="state.date1" type="date" required />
    </div>

    <div class="input-field">
      <label for="date2Input">Data final:</label>
      <input id="date2Input" v-model="state.date2" type="date" required />
    </div>

    <div class="abas">
      <div class="aba" :class="{ ativa: abaAtiva === 'igrejas' }" @click="selecionarAba('igrejas')">
        Igrejas
      </div>
      <div class="aba" :class="{ ativa: abaAtiva === 'fluxos' }" @click="selecionarAba('fluxos')">
        Fluxos
      </div>
    </div>

    <div v-show="abaAtiva === 'igrejas'" class="cursor" @click="copiar(state.dados.igrejas)">
      <h3>Igrejas</h3>
      <table ref="tabela">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Membros</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="el in state.dados.igrejas" :key="el.id">
            <td>{{ el.id }}</td>
            <td>{{ el.nome.replace(/BR \d+-\d+ - /, '') }}</td>
            <td>{{ el.membros }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-show="abaAtiva === 'fluxos'" class="cursor" @click="copiar(state.dados.fluxos)">
      <h3>Fluxos</h3>
      <table>
        <thead>
          <tr>
            <th>Fluxo</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>Valor</th>
            <th>Detalhes</th>
            <th>Igreja ID</th>
            <th>Referência</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="el in state.dados.fluxos.filter(
              (e) =>
                new Date(e.data).getTime() >= new Date(state.date1).getTime() &&
                new Date(e.data).getTime() <= new Date(state.date2).getTime()
            )"
            :key="el.id"
          >
            <td>{{ el.fluxo }}</td>
            <td>{{ el.categoria }}</td>
            <td>{{ formatDate(el.data) }}</td>
            <td>{{ el.valor }}</td>
            <td>{{ el.detalhes }}</td>
            <td>{{ el.igrejaId }}</td>
            <td>{{ el.ref }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { store } from '@/store'
import { ref, reactive, onMounted } from 'vue'

const currentDate = new Date()
const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

const state = reactive({
  date1: firstDayOfMonth.toISOString().slice(0, 10),
  date2: lastDayOfMonth.toISOString().slice(0, 10),
  dados: {
    igrejas: [] as any[],
    fluxos: [] as any[],
    tarefas: [] as any[]
  }
})

const abaAtiva = ref('igrejas')

onMounted(async () => {
  try {
    const response = await fetch('/api/dados')

    if (response.ok) {
      const { data } = await response.json()
      state.dados.igrejas = data.igrejas
      state.dados.fluxos = data.fluxos
      state.dados.tarefas = data.tarefas
      console.log('Dados recebidos: ', data)
    } else {
      throw new Error('Erro ao buscar os dados do servidor.')
    }
  } catch (error) {
    console.error('Erro ao buscar os dados:', error)
  }
})

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString().replace(', 00:00:00', '')
}

const selecionarAba = (aba: string) => {
  abaAtiva.value = aba
}

const copiar = (dados: any[]) => {
  const elementoTextArea = document.createElement('textarea')
  elementoTextArea.value = dados.map((e) => Object.values(e).join('\t')).join('\n')
  document.body.appendChild(elementoTextArea)
  elementoTextArea.select()
  try {
    document.execCommand('copy')
    const msg = 'Copiado para área de transferência!'
    store.notify(msg)
  } catch (err) {
    const msg = `Erro ao copiar ${err}`
    store.notify(msg)
  } finally {
    document.body.removeChild(elementoTextArea)
  }
}
</script>

<style scoped>
.abas {
  display: flex;
  margin-top: 10px;
}

.aba {
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
}

.aba.ativa {
  background-color: #e6e6e6;
}

.cursor {
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border-bottom: 1px solid #ddd;
  border-right: 1px solid #ddd;
}

td {
  padding: 4px 2px;
}

th {
  background-color: #e6e6e6;
  text-align: center;
  padding: 8px;
}
td:nth-child(1) {
  border-left: 1px solid #ddd;
  text-align: left;
}
</style>
