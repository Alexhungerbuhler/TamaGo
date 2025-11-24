<template>
  <div class="card">
    <slot>Empty Tamagotchi</slot>
  </div>
</template>

<script>
export default {
  name: 'TamagotchiCard',
  props: { tama: { type: Object, default: null } }
}
</script>

<style scoped>
.card{border:1px solid #ddd;padding:8px;border-radius:6px}
</style>