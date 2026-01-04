/**
 * Script de test des services API
 * À utiliser dans la console du navigateur ou comme composable de test
 */

import { authService, petsService, statsService, worldService } from '@/services/api';

export async function testApiServices() {
  console.log('🚀 Début des tests des services API\n');

  const results = {
    auth: false,
    pets: false,
    stats: false,
    world: false
  };

  // Test 1: Auth Service
  console.log('📝 Test 1: Auth Service');
  try {
    // Test d'inscription (peut échouer si l'utilisateur existe déjà)
    const testUser = {
      name: `test_${Date.now()}`,
      password: 'Test123!'
    };
    
    const registerRes = await authService.register(testUser.name, testUser.password);
    console.log('✅ Register OK:', registerRes.data);
    
    // Test de connexion
    const loginRes = await authService.login(testUser.name, testUser.password);
    console.log('✅ Login OK:', loginRes.data);
    
    results.auth = true;
  } catch (error) {
    console.error('❌ Auth Error:', error.message);
  }

  // Test 2: Pets Service
  console.log('\n🐾 Test 2: Pets Service');
  try {
    // Liste des pets
    const listRes = await petsService.list({ limit: 5 });
    console.log('✅ List pets OK:', listRes.data);

    // Créer un pet
    const createRes = await petsService.create({
      name: `TestPet_${Date.now()}`,
      species: 'cat'
    });
    console.log('✅ Create pet OK:', createRes.data);
    
    const petId = createRes.data._id || createRes.data.id;

    // Récupérer le pet
    const getRes = await petsService.getById(petId);
    console.log('✅ Get pet OK:', getRes.data);

    // Actions sur le pet
    await petsService.feed(petId);
    console.log('✅ Feed pet OK');

    await petsService.play(petId);
    console.log('✅ Play pet OK');

    // Stats du pet
    const statsRes = await petsService.getStats(petId);
    console.log('✅ Pet stats OK:', statsRes.data);

    // Supprimer le pet de test
    await petsService.delete(petId);
    console.log('✅ Delete pet OK');

    results.pets = true;
  } catch (error) {
    console.error('❌ Pets Error:', error.message);
  }

  // Test 3: Stats Service
  console.log('\n📊 Test 3: Stats Service');
  try {
    const globalStatsRes = await statsService.getGlobal();
    console.log('✅ Global stats OK:', globalStatsRes.data);
    
    results.stats = true;
  } catch (error) {
    console.error('❌ Stats Error:', error.message);
  }

  // Test 4: World Service
  console.log('\n🗺️ Test 4: World Service');
  try {
    const mapRes = await worldService.getMap();
    console.log('✅ World map OK:', mapRes.data);
    
    results.world = true;
  } catch (error) {
    console.error('❌ World Error:', error.message);
  }

  // Déconnexion
  console.log('\n🚪 Déconnexion');
  try {
    await authService.logout();
    console.log('✅ Logout OK');
  } catch (error) {
    console.error('❌ Logout Error:', error.message);
  }

  // Résumé
  console.log('\n📋 Résumé des tests:');
  console.log('Auth Service:', results.auth ? '✅' : '❌');
  console.log('Pets Service:', results.pets ? '✅' : '❌');
  console.log('Stats Service:', results.stats ? '✅' : '❌');
  console.log('World Service:', results.world ? '✅' : '❌');

  const allPassed = Object.values(results).every(r => r);
  console.log('\n' + (allPassed ? '🎉 Tous les tests sont passés !' : '⚠️ Certains tests ont échoué'));

  return results;
}

// Test rapide de connexion
export async function quickLoginTest(name = 'testuser', password = 'test123') {
  try {
    const response = await authService.login(name, password);
    console.log('✅ Login réussi:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Login échoué:', error.message);
    throw error;
  }
}

// Test rapide de liste des pets
export async function quickPetsListTest() {
  try {
    const response = await petsService.list();
    console.log('✅ Liste des pets:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur liste pets:', error.message);
    throw error;
  }
}
