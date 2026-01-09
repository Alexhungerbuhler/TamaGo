# 🧹 Système d'Hygiène - Crottes Tamagotchi

## 📋 Fonctionnalités Implémentées

### Backend
- ✅ **Tick modifié** : L'hygiène baisse de **-8.33** toutes les 30 secondes (soit -25% en 90s)
- ✅ **Action toiletPet** : +25% d'hygiène quand on nettoie

### Frontend
- ✅ **Affichage des crottes** : 💩 apparaissent automatiquement selon le niveau d'hygiène
  - 0 crotte = 100-76% d'hygiène (vert)
  - 1 crotte = 75-51% d'hygiène (jaune)
  - 2 crottes = 50-26% d'hygiène (orange)
  - 3 crottes = 25-1% d'hygiène (rouge)
  - 4 crottes = 0% d'hygiène (critique)
  
- ✅ **Positions aléatoires** : Les crottes apparaissent à des positions pseudo-aléatoires mais cohérentes
- ✅ **Animation** : Les crottes apparaissent avec une animation de rotation

### Interaction
- ✅ **Icône Hygiene** : Sélectionner l'icône "Hygiene" (caca) avec les flèches gauche/droite
- ✅ **Bouton USE** : Appuyer sur le bouton USE pour nettoyer (+25% hygiene)
- ✅ **Rafraîchissement** : Les stats se rafraîchissent automatiquement et les crottes disparaissent

## 🎮 Comment Tester

### 1. Démarrer le backend
```bash
cd backend
npm run dev
```

### 2. Démarrer le frontend
```bash
cd frontend
npm run dev
```

### 3. Tester le système

#### Méthode rapide - Forcer la baisse d'hygiène :
1. Ouvrir la page Tamago
2. Ouvrir la console du navigateur (F12)
3. Exécuter ce code pour baisser l'hygiène :
```javascript
// Récupérer le pet actuel
const petStore = usePetsStore();
const petId = petStore.currentPet._id;

// Simuler une baisse d'hygiène en appelant plusieurs fois le tick
fetch(`http://localhost:3000/api/tick`, { method: 'POST' });
```

#### Méthode normale - Attendre le tick naturel :
1. Ouvrir la page Tamago
2. Attendre 90 secondes (3 ticks de 30s)
3. Observer : 1 crotte devrait apparaître (hygiene = 75%)
4. Attendre encore 90 secondes
5. Observer : 2 crottes devraient apparaître (hygiene = 50%)

#### Tester le nettoyage :
1. Utiliser les flèches ◀️ ▶️ pour sélectionner l'icône "Hygiene" (💩)
2. Appuyer sur le bouton **USE** en bas
3. Observer : hygiene +25%, une crotte disparaît
4. Répéter jusqu'à atteindre 100% d'hygiène

## 🔧 Détails Techniques

### Formule de calcul
```javascript
nbPoops = Math.floor((100 - hygiene) / 25)
```

### Positions des crottes
Les positions sont calculées avec un algorithme pseudo-aléatoire basé sur le niveau d'hygiène actuel, garantissant des positions cohérentes pour chaque niveau.

### Backend API
- `POST /api/pets/:id/toilet` - Nettoyer le pet (+25% hygiene)
- `POST /api/tick` - Déclencher un tick manuel (toutes les stats -5 sauf hygiene -8.33)

### WebSocket
Les mises à jour de stats sont automatiquement propagées via WebSocket (`pet:updated`) pour un rafraîchissement en temps réel.

## 🐛 Debug

Si les crottes n'apparaissent pas :
1. Vérifier que `currentPet.value` existe (console.log)
2. Vérifier que `isHatched.value = true`
3. Vérifier que `hygiene < 100`
4. Vérifier dans l'inspecteur que les éléments `.poop` sont dans le DOM

Si le nettoyage ne fonctionne pas :
1. Vérifier que l'icône "Hygiene" est bien sélectionnée
2. Vérifier dans la console Network que l'appel API `/api/pets/:id/toilet` est bien envoyé
3. Vérifier que le backend répond avec les nouvelles stats

## ✨ Améliorations Futures

- [ ] Ajouter un son quand une crotte apparaît
- [ ] Ajouter un effet visuel quand on nettoie
- [ ] Permettre de cliquer directement sur une crotte pour la nettoyer
- [ ] Ajouter différents types de crottes (normales, malades, etc.)
- [ ] Impact sur la santé si hygiène trop basse pendant trop longtemps
