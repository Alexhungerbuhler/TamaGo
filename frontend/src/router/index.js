import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import TamagotchiList from '../views/TamagotchiList.vue';
import TamagotchiDetail from '../views/TamagotchiDetail.vue';
import Profile from '../views/Profile.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/tamagotchis', name: 'TamagotchiList', component: TamagotchiList },
  { path: '/tamagotchis/:id', name: 'TamagotchiDetail', component: TamagotchiDetail },
  { path: '/profile', name: 'Profile', component: Profile }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;