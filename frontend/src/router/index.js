import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store';
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
  { path: '/profile', name: 'Profile', component: Profile }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 🔐 Navigation Guard - Middleware d'authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Route nécessite authentification
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirection vers login avec paramètre de retour
    return next({
      name: 'Login',
      query: { redirect: to.fullPath } // Pour revenir après connexion
    });
  }

  // Route réservée aux invités (login/register) mais déjà connecté
  if (to.meta.requiresGuest && isAuthenticated) {
    // Redirection vers home
    return next({ name: 'Home' });
  }

  // Autoriser la navigation
  next();
});

export default router;