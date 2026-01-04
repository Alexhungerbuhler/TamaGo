import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import TamagotchiList from '../views/TamagotchiList.vue';
import TamagotchiDetail from '../views/TamagotchiDetail.vue';
import Profile from '../views/Profile.vue';
import Register from '../views/Register.vue';
import ApiTestPanel from '../components/ApiTestPanel.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/tamagotchis', name: 'TamagotchiList', component: TamagotchiList },
  { path: '/tamagotchis/:id', name: 'TamagotchiDetail', component: TamagotchiDetail },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/test-api', name: 'ApiTest', component: ApiTestPanel }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;