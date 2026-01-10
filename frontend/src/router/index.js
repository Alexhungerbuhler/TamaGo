import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Tamago from '../views/Tamago.vue';
import TamagotchiView from '../views/TamagotchiView.vue';
import Profile from '../views/Profile.vue';
import Register from '../views/Register.vue';
import MapView from '../views/MapView.vue';
import Games from '../views/Games.vue';

import ApiTestPanel from '../components/ApiTestPanel.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/tamago', name: 'Tamago', component: Tamago, meta: { requiresAuth: true } },
  { path: '/tamagotchi/:id?', name: 'TamagotchiView', component: TamagotchiView, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: Profile },
  { path: '/map', name: 'MapView', component: MapView, meta: { requiresAuth: true } },
  { path: '/games', name: 'Games', component: Games, meta: { requiresAuth: true } },
  { path: '/test-api', name: 'ApiTest', component: ApiTestPanel }
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
    // Redirection vers dashboard
    return next({ name: 'Dashboard' });
  }

  // Autoriser la navigation
  next();
});

export default router;