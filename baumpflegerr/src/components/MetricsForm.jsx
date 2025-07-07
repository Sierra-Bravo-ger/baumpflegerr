import { useState, useEffect } from 'react';

/**
 * Komponente zur Erfassung von Baum-Metriken
 * Unterstützt Online- und Offline-Modus mit lokaler Zwischenspeicherung
 */
const MetricsForm = ({ treeId, onSave, initialData = null }) => {
  // Formularstatus
  const [formData, setFormData] = useState({
    tree_id: treeId || '',
    measurement_date: new Date().toISOString().split('T')[0],
    height: '',
    trunk_diameter: '',
    crown_diameter: '',
    crown_height: '',
    health_score: 5,
    leaf_density: '',
    notes: ''
  });

  // Online/Offline-Status
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Speicherstatus
  const [saveStatus, setSaveStatus] = useState({
    isSaving: false,
    isLocalSaved: false,
    success: false,
    error: null
  });

  // Initialisiere Formular mit vorhandenen Daten, falls vorhanden
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        measurement_date: initialData.measurement_date 
          ? new Date(initialData.measurement_date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  // Überwache Online/Offline-Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Behandle Änderungen in Formularfeldern
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Speichere Daten lokal
  const saveLocally = () => {
    try {
      const localData = JSON.parse(localStorage.getItem('offlineMetrics')) || [];
      const updatedData = [...localData, { ...formData, savedAt: new Date().toISOString(), synced: false }];
      localStorage.setItem('offlineMetrics', JSON.stringify(updatedData));
      setSaveStatus(prev => ({ ...prev, isLocalSaved: true }));
      return true;
    } catch (error) {
      setSaveStatus(prev => ({ ...prev, error: 'Fehler beim lokalen Speichern' }));
      return false;
    }
  };

  // Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus({ isSaving: true, isLocalSaved: false, error: null });

    try {
      if (isOnline) {
        // Online: Direkt an Backend senden
        await onSave(formData);
        setSaveStatus({ isSaving: false, isLocalSaved: false, success: true, error: null });
        
        // Nach 3 Sekunden die Erfolgsmeldung ausblenden
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, success: false }));
        }, 3000);
      } else {
        // Offline: Lokal speichern
        const saved = saveLocally();
        setSaveStatus({ 
          isSaving: false, 
          isLocalSaved: saved, 
          error: saved ? null : 'Fehler beim lokalen Speichern' 
        });
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setSaveStatus({ 
        isSaving: false, 
        isLocalSaved: false, 
        error: 'Fehler beim Speichern der Daten' 
      });
      
      // Fallback: Versuche lokal zu speichern, wenn Online-Speicherung fehlschlägt
      if (isOnline) {
        saveLocally();
      }
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Baum-Metriken erfassen</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isOnline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {saveStatus.success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Daten wurden erfolgreich gespeichert!
        </div>
      )}

      {saveStatus.isLocalSaved && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-md mb-4">
          Daten wurden lokal gespeichert und werden synchronisiert, sobald eine Verbindung verfügbar ist.
        </div>
      )}

      {saveStatus.error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {saveStatus.error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Baum-ID und Datum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Baum-ID</label>
            <input
              type="text"
              name="tree_id"
              value={formData.tree_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!!treeId}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Messdatum</label>
            <input
              type="date"
              name="measurement_date"
              value={formData.measurement_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Höhe und Durchmesser */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Höhe (m)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stammdurchmesser (m)</label>
            <input
              type="number"
              name="trunk_diameter"
              value={formData.trunk_diameter}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Kronendurchmesser und Kronenhöhe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kronendurchmesser (m)</label>
            <input
              type="number"
              name="crown_diameter"
              value={formData.crown_diameter}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kronenhöhe (m)</label>
            <input
              type="number"
              name="crown_height"
              value={formData.crown_height}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Gesundheitswert und Blattdichte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gesundheitswert (0-10): {formData.health_score}
            </label>
            <input
              type="range"
              name="health_score"
              value={formData.health_score}
              onChange={handleChange}
              min="0"
              max="10"
              step="1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Schlecht</span>
              <span>Gut</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blattdichte (0-1)</label>
            <input
              type="number"
              name="leaf_density"
              value={formData.leaf_density}
              onChange={handleChange}
              step="0.01"
              min="0"
              max="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Notizen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Speichern-Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saveStatus.isSaving}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              saveStatus.isSaving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {saveStatus.isSaving ? 'Wird gespeichert...' : isOnline ? 'Speichern' : 'Lokal speichern'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MetricsForm;
