/**
 * API-Service für die Kommunikation mit dem Backend
 */

// API-Basis-URL (kann später in .env ausgelagert werden)
// Verwende relative URL, damit die Anfragen über denselben Host/Protokoll gehen wie die Anwendung
const API_BASE_URL = '/api';

/**
 * Hilfsfunktion für API-Aufrufe
 * @param {string} endpoint - API-Endpunkt
 * @param {string} method - HTTP-Methode (GET, POST, PUT, DELETE)
 * @param {object} data - Zu sendende Daten (optional)
 * @returns {Promise} - Promise mit der API-Antwort
 */
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`API-Aufruf: ${method} ${url}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API-Fehlerantwort:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`API-Fehler: ${response.status} ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error('Unerwarteter Content-Type:', contentType, 'Antwort:', responseText);
      throw new Error(`Unerwarteter Content-Type: ${contentType}. Erwarte application/json`);
    }
    
    try {
      return await response.json();
    } catch (jsonError) {
      const responseText = await response.clone().text();
      console.error('JSON-Parse-Fehler. Erhaltene Antwort:', responseText);
      throw new Error(`JSON-Parse-Fehler: ${jsonError.message}`);
    }
  } catch (error) {
    console.error('API-Aufruf fehlgeschlagen:', error);
    throw error;
  }
};

/**
 * Bäume-API
 */
export const treesApi = {
  // Alle Bäume abrufen
  getAll: () => apiCall('/trees'),
  
  // Einen bestimmten Baum abrufen
  getById: (id) => apiCall(`/trees/${id}`),
  
  // Neuen Baum erstellen
  create: (treeData) => apiCall('/trees', 'POST', treeData),
  
  // Baum aktualisieren
  update: (id, treeData) => apiCall(`/trees/${id}`, 'PUT', treeData),
  
  // Baum löschen
  delete: (id) => apiCall(`/trees/${id}`, 'DELETE'),
};

/**
 * Metriken-API
 */
export const metricsApi = {
  // Neue Metrik erstellen
  create: (metricData) => apiCall('/metrics', 'POST', metricData),
  
  // Metriken für einen bestimmten Baum abrufen
  getByTreeId: (treeId) => apiCall(`/metrics/tree/${treeId}`),
};

/**
 * Standorte-API
 */
export const locationsApi = {
  // Alle Standorte abrufen
  getAll: () => apiCall('/locations'),
  
  // Einen bestimmten Standort abrufen
  getById: (id) => apiCall(`/locations/${id}`),
  
  // Neuen Standort erstellen
  create: (locationData) => apiCall('/locations', 'POST', locationData),
  
  // Standort aktualisieren
  update: (id, locationData) => apiCall(`/locations/${id}`, 'PUT', locationData),
  
  // Standort löschen
  delete: (id) => apiCall(`/locations/${id}`, 'DELETE'),
};

/**
 * Baumarten-API
 */
export const speciesApi = {
  // Alle Baumarten abrufen
  getAll: () => apiCall('/species'),
  
  // Eine bestimmte Baumart abrufen
  getById: (id) => apiCall(`/species/${id}`),
  
  // Neue Baumart erstellen
  create: (speciesData) => apiCall('/species', 'POST', speciesData),
  
  // Baumart aktualisieren
  update: (id, speciesData) => apiCall(`/species/${id}`, 'PUT', speciesData),
  
  // Baumart löschen
  delete: (id) => apiCall(`/species/${id}`, 'DELETE'),
};

/**
 * Offline-Synchronisierungs-Service
 */
export const syncService = {
  // Prüfen, ob ungespeicherte Daten vorhanden sind
  hasOfflineData: () => {
    const offlineMetrics = localStorage.getItem('offlineMetrics');
    return offlineMetrics && JSON.parse(offlineMetrics).length > 0;
  },
  
  // Ungespeicherte Daten synchronisieren
  syncOfflineData: async () => {
    if (!navigator.onLine) {
      throw new Error('Keine Internetverbindung verfügbar');
    }
    
    const offlineMetrics = localStorage.getItem('offlineMetrics');
    
    if (!offlineMetrics) {
      return { synced: 0 };
    }
    
    const metricsToSync = JSON.parse(offlineMetrics);
    
    if (metricsToSync.length === 0) {
      return { synced: 0 };
    }
    
    let syncedCount = 0;
    const errors = [];
    
    // Versuche, jede Metrik zu synchronisieren
    for (const metric of metricsToSync) {
      try {
        await metricsApi.create(metric);
        syncedCount++;
      } catch (error) {
        errors.push({ metric, error: error.message });
      }
    }
    
    // Aktualisiere den lokalen Speicher
    if (syncedCount > 0) {
      const remainingMetrics = metricsToSync.filter((_, index) => index >= syncedCount);
      localStorage.setItem('offlineMetrics', JSON.stringify(remainingMetrics));
    }
    
    return {
      synced: syncedCount,
      total: metricsToSync.length,
      errors: errors.length > 0 ? errors : null
    };
  }
};

export default {
  trees: treesApi,
  metrics: metricsApi,
  sync: syncService
};
