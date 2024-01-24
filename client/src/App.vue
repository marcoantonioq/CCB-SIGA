<template>
  <header>
    <div>
      <nav>
        <RouterLink to="/">Relatórios</RouterLink>
        <RouterLink to="/settings">Configurações</RouterLink>
        <RouterLink to="/update">Atualizar</RouterLink>
        <!-- <RouterLink to="/about">About</RouterLink> -->
      </nav>
    </div>
  </header>

  <RouterView />
  <Notify />
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import Notify from './components/Notify.vue'
</script>

<style scoped>
nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}
</style>
