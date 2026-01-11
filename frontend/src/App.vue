<template>
  <div id="app">
    <router-view />
    <NotificationsPanel />
  </div>
</template>

<script setup>
import NotificationsPanel from './components/NotificationsPanel.vue';
</script>

<style src="./styles/main.css"></style>