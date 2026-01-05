<template>
  <div class="home-page">
    <HomeHeader />
    
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="emoji">🐣</span>
          Bienvenue sur TamaGo !
        </h1>
        <p class="hero-subtitle">
          Adoptez, élevez et prenez soin de vos Tamagotchis virtuels dans un monde interactif et amusant !
        </p>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <h2 class="section-title">Découvrez les fonctionnalités</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🐾</div>
          <h3 class="feature-title">Adoptez vos Tamagotchis</h3>
          <p class="feature-description">
            Créez et adoptez vos propres Tamagotchis. Choisissez leur nom, leur espèce et personnalisez-les à votre goût.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🍎</div>
          <h3 class="feature-title">Prenez soin d'eux</h3>
          <p class="feature-description">
            Nourrissez, faites jouer, laissez dormir et emmenez aux toilettes vos Tamagotchis pour maintenir leur bonheur.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🗺️</div>
          <h3 class="feature-title">Explorez le monde</h3>
          <p class="feature-description">
            Déplacez vos Tamagotchis sur une carte interactive et découvrez de nouveaux endroits avec eux.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <h3 class="feature-title">Suivez leurs stats</h3>
          <p class="feature-description">
            Surveillez la faim, le bonheur, l'énergie et la santé de vos Tamagotchis en temps réel.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">📸</div>
          <h3 class="feature-title">Personnalisez-les</h3>
          <p class="feature-description">
            Uploadez des images pour personnaliser l'apparence de vos Tamagotchis et créez des souvenirs.
          </p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🏆</div>
          <h3 class="feature-title">Défiez vos amis</h3>
          <p class="feature-description">
            Participez à des défis, comparez vos statistiques et devenez le meilleur éleveur de Tamagotchis !
          </p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="how-it-works">
      <h2 class="section-title">Comment ça marche ?</h2>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h3>Créez votre compte</h3>
          <p>Inscrivez-vous gratuitement en quelques secondes</p>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <h3>Adoptez votre premier Tamagotchi</h3>
          <p>Choisissez un nom et une espèce pour commencer</p>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <h3>Prenez soin de lui</h3>
          <p>Interagissez avec votre Tamagotchi quotidiennement</p>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <h3>Explorez et amusez-vous</h3>
          <p>Découvrez toutes les fonctionnalités et faites grandir votre collection</p>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Prêt à commencer l'aventure ?</h2>
        <p class="cta-subtitle">
          Rejoignez la communauté TamaGo et créez votre premier Tamagotchi dès maintenant !
        </p>
        <div class="cta-buttons">
          <button class="cta-primary" @click="goToRegister">
            Créer un compte
          </button>
          <button class="cta-secondary" @click="goToLogin">
            Se connecter
          </button>
        </div>
        <p class="cta-note">
          ⚠️ Un compte est obligatoire pour jouer
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';
import HomeHeader from '../components/HomeHeader.vue';

const router = useRouter();
const authStore = useAuthStore();

// Rediriger selon l'état de connexion
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard');
  } else {
    router.push('/login');
  }
});

function goToRegister() {
  router.push('/register');
}

function goToLogin() {
  router.push('/login');
}
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Hero Section */
.hero {
  padding: 4rem 2rem;
  text-align: center;
  background: linear-gradient(135deg, #C0FE90 0%, #a8f57a 100%);
  margin-bottom: 3rem;
  width: 100%;
  box-sizing: border-box;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.emoji {
  font-size: 3.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #334155;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
}

/* Features Section */
.features {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  color: #0f172a;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background: #fff;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.feature-description {
  color: #64748b;
  line-height: 1.6;
  font-size: 1rem;
}

/* How it works */
.how-it-works {
  padding: 4rem 2rem;
  background: #fff;
  margin-top: 3rem;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.step {
  text-align: center;
  padding: 1.5rem;
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #C0FE90 0%, #a8f57a 100%);
  color: #0f172a;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 4px 12px rgba(192, 254, 144, 0.3);
}

.step h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.step p {
  color: #64748b;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 5rem 2rem;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: #fff;
  margin-top: 3rem;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  line-height: 1.6;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.cta-primary,
.cta-secondary {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cta-primary {
  background: #fff;
  color: #2563eb;
}

.cta-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}

.cta-secondary {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
}

.cta-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-3px);
}

.cta-note {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 1rem;
}

/* Mobile First - Optimisé pour mobile */
@media (max-width: 768px) {
  .home-page {
    overflow-x: hidden;
  }

  /* Hero Section Mobile */
  .hero {
    padding: 2.5rem 1.5rem;
    margin-bottom: 2rem;
  }

  .hero-title {
    font-size: 1.75rem;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .emoji {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    padding: 0 0.5rem;
  }

  /* Features Mobile */
  .features {
    padding: 2.5rem 1rem;
  }

  .section-title {
    font-size: 1.75rem;
    margin-bottom: 2rem;
    padding: 0 0.5rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-top: 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
    border-radius: 12px;
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .feature-title {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .feature-description {
    font-size: 0.95rem;
    line-height: 1.5;
  }

  /* How it works Mobile */
  .how-it-works {
    padding: 2.5rem 1rem;
    margin-top: 2rem;
  }

  .steps {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .step {
    padding: 1rem;
  }

  .step-number {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }

  .step h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .step p {
    font-size: 0.9rem;
  }

  /* CTA Mobile */
  .cta-section {
    padding: 3rem 1.5rem;
    margin-top: 2rem;
  }

  .cta-title {
    font-size: 1.75rem;
    margin-bottom: 1rem;
    line-height: 1.3;
  }

  .cta-subtitle {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .cta-buttons {
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .cta-primary,
  .cta-secondary {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }

  .cta-note {
    font-size: 0.85rem;
    margin-top: 0.75rem;
  }
}

/* Très petits écrans */
@media (max-width: 480px) {
  .hero {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .emoji {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .feature-card {
    padding: 1.25rem;
  }

  .cta-title {
    font-size: 1.5rem;
  }

  .cta-subtitle {
    font-size: 0.95rem;
  }
}
</style>
