# Guide de Configuration du Système de Notifications Push

## 📱 Vue d'ensemble

Vous disposez maintenant d'un système complet de notifications push en temps réel qui :
- Détecte automatiquement quand les jauges du Tamagotchi atteignent 50% et 25%
- Envoie des notifications via WebSocket (temps réel)
- Envoie des notifications push sur mobile/desktop (même app fermée)
- Fonctionne sur Android, iOS (PWA) et Desktop

## 🚀 Installation

### 1. Backend

Installer la dépendance web-push :
```bash
cd backend
npm install web-push
```

### 2. Générer les clés VAPID

Les clés VAPID sont nécessaires pour les notifications push. Générez-les :

```bash
npx web-push generate-vapid-keys
```

Ajoutez les clés dans le fichier `.env` du backend :
```env
VAPID_PUBLIC_KEY=votre_clé_publique
VAPID_PRIVATE_KEY=votre_clé_privée
```

### 3. Frontend

Aucune installation supplémentaire n'est nécessaire.

## 📋 Fonctionnalités

### Détection automatique des seuils
- **50%** : Notification d'alerte (⚠️)
- **25%** : Notification critique (🚨) avec vibration

### Types de notifications
1. **WebSocket** : Temps réel dans l'application
2. **Push** : Sur l'appareil même si l'app est fermée
3. **Navigateur** : Notifications natives du système

## 🎯 Utilisation

### Activer les notifications

Dans l'application, l'utilisateur peut :
1. Aller dans le composant `NotificationSettings`
2. Cliquer sur "Activer" les notifications push
3. Accepter la permission du navigateur
4. Tester avec le bouton "Tester"

### Intégration dans l'application

Vous pouvez ajouter le composant NotificationSettings dans votre interface :

```vue
<template>
  <NotificationSettings />
</template>

<script setup>
import NotificationSettings from '@/components/NotificationSettings.vue'
</script>
```

Ou l'ajouter comme route dans le routeur :

```js
{
  path: '/notifications',
  name: 'Notifications',
  component: () => import('@/components/NotificationSettings.vue'),
  meta: { requiresAuth: true }
}
```

## 📱 Support Mobile

### Progressive Web App (PWA)

Le fichier `manifest.json` permet d'installer l'app sur mobile :
- Android : "Ajouter à l'écran d'accueil"
- iOS : "Ajouter à l'écran d'accueil" (depuis Safari)

### Service Worker

Le Service Worker (`sw.js`) gère :
- Cache de l'application
- Réception des notifications push
- Affichage des notifications
- Actions sur les notifications (ouvrir l'app)

## 🔧 API Endpoints

### Backend

- `GET /api/notifications/vapid-public-key` : Récupère la clé publique
- `POST /api/notifications/subscribe` : S'abonner aux notifications
- `POST /api/notifications/unsubscribe` : Se désabonner
- `POST /api/notifications/test` : Envoyer une notification de test

## 🔐 Sécurité

- Les endpoints sont protégés par authentification JWT
- Les clés VAPID sont stockées dans les variables d'environnement
- Les subscriptions sont stockées dans la base de données (modèle User)

## 🎨 Personnalisation

### Modifier les seuils

Dans [backend/src/services/notificationService.js](backend/src/services/notificationService.js:21-24) :

```js
this.thresholds = {
  warning: 50,  // Modifier ici
  critical: 25  // Modifier ici
};
```

### Personnaliser les messages

Dans [backend/src/services/notificationService.js](backend/src/services/notificationService.js:45-80), modifiez les objets de notification.

### Modifier le style des notifications

Dans [frontend/src/components/NotificationSettings.vue](frontend/src/components/NotificationSettings.vue), modifiez le CSS.

## 🧪 Tests

### Tester localement

1. Démarrer le backend : `cd backend && npm start`
2. Démarrer le frontend : `cd frontend && npm run dev`
3. Se connecter à l'application
4. Activer les notifications push
5. Cliquer sur "Tester"

### Tester le système automatique

1. Attendre que le tick diminue les stats
2. Observer les notifications quand elles atteignent 50% ou 25%

## 📊 Flow des Notifications

```
Tick automatique (5 min)
  ↓
Stats diminuent
  ↓
notificationService.analyzeStats()
  ↓
Détection seuil (50% ou 25%)
  ↓
notificationService.sendNotification()
  ↓
├─→ WebSocket (temps réel)
└─→ Push Notification (mobile/desktop)
```

## 🌐 Déploiement

### Variables d'environnement

Backend `.env` :
```env
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

### HTTPS requis

Les notifications push nécessitent HTTPS en production (sauf localhost).

## 🐛 Dépannage

### Les notifications ne fonctionnent pas

1. Vérifier que les clés VAPID sont configurées
2. Vérifier les permissions du navigateur
3. Vérifier la console pour les erreurs
4. Tester avec le bouton "Tester"

### Service Worker non enregistré

1. Vérifier que `sw.js` est dans `/public`
2. Vérifier la console
3. Clear cache et recharger

### Notifications reçues mais pas affichées

1. Vérifier les permissions du navigateur
2. Vérifier les paramètres de notification de l'OS
3. Tester sur un autre navigateur

## 📚 Ressources

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
