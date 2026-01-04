# 🧪 Guide d'utilisation du Panel de Test API

## Comment y accéder

### Option 1: Via le menu
1. Démarrez l'application frontend
2. Cliquez sur le bouton **🧪 Test API** dans le header

### Option 2: Via l'URL
Accédez directement à : `http://localhost:5173/test-api`

## Fonctionnalités du panel

### 1. Test Authentification
- **S'inscrire** : Créer un nouvel utilisateur (username généré automatiquement)
- **Se connecter** : Se connecter avec les identifiants
- **Se déconnecter** : Déconnecter l'utilisateur

### 2. Test Pets
- **Créer un pet** : Entrez un nom et choisissez une espèce
- **Liste des pets** : Affiche tous vos pets

### 3. Test Actions sur Pet
Une fois un pet créé, vous pouvez tester toutes les actions :
- 🍔 **Nourrir**
- 🎮 **Jouer**
- 🚽 **Toilette**
- 😴 **Dormir**
- 📊 **Statistiques**

### 4. Test Stats Globales
Récupère les statistiques globales de l'application

### 5. Informations Stores
Affiche l'état actuel des stores Pinia :
- Statut de connexion
- Utilisateur actuel
- Nombre de pets en mémoire

## Workflow de test recommandé

1. **Inscription/Connexion**
   ```
   Nom: test_123456789
   Password: Test123!
   ```

2. **Créer un pet**
   ```
   Nom: MonPremierPet
   Espèce: cat
   ```

3. **Tester les actions**
   - Nourrir le pet
   - Jouer avec le pet
   - Voir ses stats

4. **Vérifier les stats globales**

## Ce que vous devriez voir

### Après inscription/connexion
✅ Message de succès avec le token
✅ "Auth: ✅ Connecté" dans les infos stores
✅ Nom d'utilisateur affiché

### Après création d'un pet
✅ Pet ID affiché
✅ JSON du pet dans le résultat
✅ "Pets en store: 1" dans les infos

### Après une action
✅ JSON de la réponse avec les nouvelles stats
✅ Confirmation de l'action effectuée

## Erreurs courantes

### "Network Error"
❌ Le backend n'est pas démarré
✅ Solution: `cd backend && npm start`

### "401 Unauthorized"
❌ Pas connecté ou token expiré
✅ Solution: Cliquez sur "Se connecter"

### "400 Bad Request"
❌ Données invalides
✅ Solution: Vérifiez le nom et l'espèce du pet

## Astuces

- Ouvrez la console DevTools (F12) pour voir les logs détaillés
- Les erreurs s'affichent en rouge en bas à droite
- Les résultats sont au format JSON pour faciliter le debug
- Vous pouvez tester plusieurs fois les mêmes actions

## Nettoyage après test

Pour remettre à zéro :
1. Déconnectez-vous
2. Supprimez les données dans localStorage (DevTools > Application > Storage)
3. Rechargez la page

## Prochaines étapes

Une fois les tests validés, vous pouvez :
1. Créer vos propres composants en vous inspirant du code
2. Utiliser les stores dans vos vues
3. Retirer le bouton "Test API" du header si nécessaire

---

**Le panel de test est maintenant accessible ! 🚀**
