import { emitToUser } from '../websocket.js';

/**
 * Service de gestion des notifications en temps réel (WebSocket)
 */
class NotificationService {
  constructor() {
    this.thresholds = {
      warning: 50,  // Alerte à 50%
      critical: 25  // Alerte critique à 25%
    };
  }

  /**
   * Vérifie si une jauge a atteint un seuil critique
   * @param {number} currentValue - Valeur actuelle
   * @param {number} previousValue - Valeur précédente
   * @param {number} threshold - Seuil à vérifier
   * @returns {boolean}
   */
  hasCrossedThreshold(currentValue, previousValue, threshold) {
    // Vérifier que les valeurs sont des nombres valides
    if (typeof currentValue !== 'number' || typeof previousValue !== 'number') {
      return false;
    }
    return previousValue > threshold && currentValue <= threshold;
  }

  /**
   * Analyse les stats d'un pet et détermine les notifications à envoyer
   * Regroupe les notifications par niveau (warning/critical)
   * N'envoie que si au moins UNE stat franchit le seuil
   * @param {Object} pet - Le tamagotchi
   * @param {Object} oldStats - Les anciennes stats
   * @returns {Array} - Liste des notifications à envoyer
   */
  analyzeStats(pet, oldStats) {
    const stats = {
      hunger: { current: pet.hunger, old: oldStats.hunger, label: 'Hunger' },
      hygiene: { current: pet.hygiene, old: oldStats.hygiene, label: 'Hygiene' },
      energy: { current: pet.energy, old: oldStats.energy, label: 'Energy' },
      fun: { current: pet.fun, old: oldStats.fun, label: 'Fun' }
    };

    const warningStats = [];
    const criticalStats = [];
    let hasWarningCrossed = false;
    let hasCriticalCrossed = false;

    for (const [statName, data] of Object.entries(stats)) {
      // Vérifier le seuil critique (25%) en premier (prioritaire)
      if (this.hasCrossedThreshold(data.current, data.old, this.thresholds.critical)) {
        criticalStats.push({ name: statName, ...data });
        hasCriticalCrossed = true;
      }
      // Vérifier le seuil d'alerte (50%) seulement si pas critique
      else if (this.hasCrossedThreshold(data.current, data.old, this.thresholds.warning)) {
        warningStats.push({ name: statName, ...data });
        hasWarningCrossed = true;
      }
    }

    const notifications = [];

    // Créer une notification groupée pour les critiques (25%) - PRIORITAIRE
    // Seulement si au moins UNE stat vient de franchir le seuil critique
    if (hasCriticalCrossed && criticalStats.length > 0) {
      const statsList = criticalStats.map(s => `${s.label} (${s.current}%)`).join(', ');
      notifications.push({
        level: 'critical',
        title: `${pet.name} in DANGER!`,
        message: `Critical stats: ${statsList}`,
        petId: pet._id,
        petName: pet.name,
        type: 'stat_critical',
        stats: criticalStats
      });
    }
    // Créer une notification groupée pour les alertes (50%)
    // Seulement si au moins UNE stat vient de franchir le seuil warning ET aucune critique
    else if (hasWarningCrossed && warningStats.length > 0) {
      const statsList = warningStats.map(s => `${s.label} (${s.current}%)`).join(', ');
      notifications.push({
        level: 'warning',
        title: `${pet.name} needs attention`,
        message: `Low stats: ${statsList}`,
        petId: pet._id,
        petName: pet.name,
        type: 'stat_warning',
        stats: warningStats
      });
    }

    return notifications;
  }
}

export default new NotificationService();
