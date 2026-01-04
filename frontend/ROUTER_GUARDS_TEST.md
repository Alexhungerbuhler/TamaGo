# 🛡️ Test Router Guards - Checklist

## 🧪 Scénarios de test

### ✅ Test 1: Accès routes publiques (NON connecté)
- [ ] Aller sur http://localhost:5173/ → ✅ Accessible
- [ ] Aller sur /login → ✅ Accessible
- [ ] Aller sur /register → ✅ Accessible

### ✅ Test 2: Blocage routes privées (NON connecté)
- [ ] Aller sur /profile → ❌ Redirige vers /login
- [ ] Aller sur /tamagotchis → ❌ Redirige vers /login
- [ ] Aller sur /tamagotchis/123 → ❌ Redirige vers /login
- [ ] Vérifier que l'URL a `?redirect=/profile` (ou autre)

### ✅ Test 3: Connexion et redirection
- [ ] Aller sur /profile (non connecté)
- [ ] Être redirigé vers /login?redirect=/profile
- [ ] Se connecter
- [ ] ✅ Être automatiquement redirigé vers /profile

### ✅ Test 4: Routes guest (DÉJÀ connecté)
- [ ] Se connecter
- [ ] Aller sur /login → ❌ Redirige vers /
- [ ] Aller sur /register → ❌ Redirige vers /

### ✅ Test 5: Accès routes privées (CONNECTÉ)
- [ ] Se connecter
- [ ] Aller sur /profile → ✅ Accessible
- [ ] Aller sur /tamagotchis → ✅ Accessible
- [ ] Aller sur /tamagotchis/123 → ✅ Accessible

### ✅ Test 6: Persistance localStorage
- [ ] Se connecter
- [ ] Aller sur /profile
- [ ] Rafraîchir F5
- [ ] ✅ Toujours connecté, toujours sur /profile

### ✅ Test 7: Déconnexion
- [ ] Se connecter
- [ ] Aller sur /profile
- [ ] Se déconnecter
- [ ] Essayer d'aller sur /profile
- [ ] ❌ Redirige vers /login?redirect=/profile

### ✅ Test 8: Page 404
- [ ] Aller sur /page-inexistante
- [ ] ✅ Affiche page 404
- [ ] Cliquer sur "Retour à l'accueil"
- [ ] ✅ Retourne sur /

### ✅ Test 9: Navigation directe par URL
- [ ] Copier l'URL /profile dans un nouvel onglet (non connecté)
- [ ] ❌ Redirige vers /login?redirect=/profile
- [ ] Se connecter
- [ ] ✅ Automatiquement redirigé vers /profile

### ✅ Test 10: Bouton retour navigateur
- [ ] Se connecter
- [ ] Aller sur /profile
- [ ] Se déconnecter → redirigé vers /login
- [ ] Cliquer sur Retour (navigateur)
- [ ] ❌ Bloqué, redirigé vers /login

## 🎯 Résultats attendus

| Statut | Route | Non connecté | Connecté |
|--------|-------|--------------|----------|
| Public | `/` | ✅ Accessible | ✅ Accessible |
| Guest | `/login` | ✅ Accessible | ❌ Redirige → / |
| Guest | `/register` | ✅ Accessible | ❌ Redirige → / |
| Private | `/profile` | ❌ Redirige → /login | ✅ Accessible |
| Private | `/tamagotchis` | ❌ Redirige → /login | ✅ Accessible |
| Private | `/tamagotchis/:id` | ❌ Redirige → /login | ✅ Accessible |
| 404 | `/inexistant` | ✅ Affiche 404 | ✅ Affiche 404 |

## 🐛 Debug

### Voir les guards en action
Ouvre la console du navigateur et ajoute ce code temporairement dans `router/index.js` :

\`\`\`javascript
router.beforeEach((to, from, next) => {
  console.log('🔍 Navigation:', {
    from: from.name,
    to: to.name,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest,
    isAuthenticated: authStore.isAuthenticated
  });
  
  // ... reste du code
});
\`\`\`

### Inspecter le store
Dans la console du navigateur :
\`\`\`javascript
// Voir l'état d'authentification
localStorage.getItem('tamago_auth_token')
localStorage.getItem('tamago_user')
\`\`\`

## 📝 Notes

- **meta.requiresAuth**: Route nécessite connexion
- **meta.requiresGuest**: Route réservée aux non-connectés
- **query.redirect**: Paramètre pour retourner après connexion

## ✨ Bonus - Test manuel rapide

Dans la console du navigateur :
\`\`\`javascript
import { useAuthStore } from './store';
const authStore = useAuthStore();

// Forcer la déconnexion
authStore.logout();

// Tester navigation
window.location.href = '/profile'; // Devrait rediriger vers /login
\`\`\`
