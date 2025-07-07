import { useState, useEffect } from 'react'
import MetricsForm from './components/MetricsForm'
import TreeDetailCard from './components/TreeDetailCard'
import FloatingActionButton from './components/FloatingActionButton'
import NewTreeDialog from './components/NewTreeDialog'
import { treesApi, metricsApi, syncService } from './services/api'
import './App.css'

function App() {
  const [activeView, setActiveView] = useState('trees')
  const [trees, setTrees] = useState([])
  const [selectedTree, setSelectedTree] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showTreeDetail, setShowTreeDetail] = useState(false)
  const [showNewTreeDialog, setShowNewTreeDialog] = useState(false)
  const [syncStatus, setSyncStatus] = useState({
    hasOfflineData: false,
    isSyncing: false,
    lastSyncResult: null
  })

  // Bäume beim ersten Laden abrufen
  useEffect(() => {
    fetchTrees()
    checkOfflineData()
  }, [])

  // Prüfen, ob Offline-Daten vorhanden sind
  const checkOfflineData = () => {
    const hasData = syncService.hasOfflineData()
    setSyncStatus(prev => ({ ...prev, hasOfflineData: hasData }))
  }

  // Bäume vom Backend abrufen
  const fetchTrees = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await treesApi.getAll()
      setTrees(data)
    } catch (err) {
      console.error('Fehler beim Abrufen der Bäume:', err)
      setError('Bäume konnten nicht geladen werden. Bitte versuchen Sie es später erneut.')
    } finally {
      setIsLoading(false)
    }
  }

  // Offline-Daten synchronisieren
  const handleSync = async () => {
    if (!navigator.onLine) {
      setError('Keine Internetverbindung verfügbar')
      return
    }
    
    setSyncStatus(prev => ({ ...prev, isSyncing: true }))
    
    try {
      const result = await syncService.syncOfflineData()
      setSyncStatus({
        hasOfflineData: result.synced < result.total,
        isSyncing: false,
        lastSyncResult: result
      })
      
      if (result.synced > 0) {
        fetchTrees() // Daten aktualisieren nach erfolgreicher Synchronisierung
      }
    } catch (err) {
      console.error('Synchronisierungsfehler:', err)
      setSyncStatus(prev => ({ 
        ...prev, 
        isSyncing: false,
        lastSyncResult: { error: err.message }
      }))
    }
  }

  // Metrik speichern
  const handleSaveMetric = async (metricData) => {
    try {
      await metricsApi.create(metricData)
      return true
    } catch (err) {
      console.error('Fehler beim Speichern der Metrik:', err)
      throw err
    }
  }

  // Baum auswählen und Details anzeigen
  const handleSelectTree = async (tree) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Vollständige Baumdaten mit allen Details (Metriken, Inspektionen, Maßnahmen) laden
      const detailedTree = await treesApi.getById(tree.tree_id)
      setSelectedTree(detailedTree)
      setShowTreeDetail(true)
    } catch (err) {
      console.error('Fehler beim Laden der Baum-Details:', err)
      setError('Baum-Details konnten nicht geladen werden.')
      // Trotzdem die Basis-Daten anzeigen
      setSelectedTree(tree)
      setShowTreeDetail(true)
    } finally {
      setIsLoading(false)
    }
  }
  
  // TreeDetailCard schließen
  const handleCloseTreeDetail = () => {
    setShowTreeDetail(false)
  }
  
  // Zu Metriken wechseln
  const handleEditMetrics = () => {
    setShowTreeDetail(false)
    setActiveView('metrics')
  }
  
  // Bearbeitete Baumdaten speichern
  const handleSaveTree = async (updatedTree) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Aktualisiere den Baum im Backend
      const savedTree = await treesApi.update(updatedTree.tree_id, updatedTree);
      
      // Aktualisiere den lokalen State
      setSelectedTree(savedTree);
      
      // Aktualisiere die Baumliste
      setTrees(prevTrees => 
        prevTrees.map(tree => 
          tree.tree_id === savedTree.tree_id ? savedTree : tree
        )
      );
      
      return true;
    } catch (err) {
      console.error('Fehler beim Speichern der Baumdaten:', err);
      setError('Baumdaten konnten nicht gespeichert werden. Bitte versuchen Sie es später erneut.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Neuen Baum erstellen
  const handleCreateTree = async (newTreeData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Erstelle den neuen Baum im Backend
      const createdTree = await treesApi.create(newTreeData);
      
      // Aktualisiere die Baumliste
      setTrees(prevTrees => [...prevTrees, createdTree]);
      
      return createdTree;
    } catch (err) {
      console.error('Fehler beim Erstellen des Baums:', err);
      setError('Der Baum konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Dialog zum Erstellen eines neuen Baums öffnen
  const handleOpenNewTreeDialog = () => {
    setShowNewTreeDialog(true);
  };
  
  // Dialog zum Erstellen eines neuen Baums schließen
  const handleCloseNewTreeDialog = () => {
    setShowNewTreeDialog(false);
  };
  
  // Baumdaten drucken
  const handlePrintTree = () => {
    // Hier könnte später eine Druckfunktionalität implementiert werden
    console.log('Drucke Baumdaten:', selectedTree)
    // Einfache Lösung: Öffne ein neues Fenster mit den Baumdaten zum Drucken
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Baum ${selectedTree.tree_number} - Druckansicht</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #166534; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Baum ${selectedTree.tree_number} - ${selectedTree.species_name}</h1>
            <div class="section">
              <p><span class="label">Standort:</span> ${selectedTree.address}, ${selectedTree.city}</p>
              <p><span class="label">Status:</span> ${selectedTree.status}</p>
              <p><span class="label">Wissenschaftlicher Name:</span> ${selectedTree.scientific_name || 'Nicht angegeben'}</p>
              <p><span class="label">Pflanzjahr:</span> ${selectedTree.planting_year || 'Unbekannt'}</p>
            </div>
            ${selectedTree.latest_metrics ? `
              <div class="section">
                <h2>Letzte Messungen (${new Date(selectedTree.latest_metrics.measurement_date).toLocaleDateString('de-DE')})</h2>
                <p><span class="label">Höhe:</span> ${selectedTree.latest_metrics.height} m</p>
                <p><span class="label">Stammdurchmesser:</span> ${selectedTree.latest_metrics.trunk_diameter} cm</p>
                <p><span class="label">Kronendurchmesser:</span> ${selectedTree.latest_metrics.crown_diameter} m</p>
                <p><span class="label">Kronenhöhe:</span> ${selectedTree.latest_metrics.crown_height} m</p>
                <p><span class="label">Gesundheitszustand:</span> ${selectedTree.latest_metrics.health_score}/5</p>
              </div>
            ` : ''}
            <div class="section">
              <h2>Druckdatum</h2>
              <p>${new Date().toLocaleString('de-DE')}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Baumpflegerr</h1>
            <nav>
              <ul className="flex space-x-4">
                <li>
                  <button 
                    onClick={() => setActiveView('trees')} 
                    className={`px-3 py-1 rounded-md ${activeView === 'trees' ? 'bg-green-800' : 'hover:bg-green-600'}`}
                  >
                    Bäume
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Floating Action Button */}
      {activeView === 'trees' && !showTreeDetail && (
        <FloatingActionButton 
          onClick={handleOpenNewTreeDialog}
          icon="M12 6v6m0 0v6m0-6h6m-6 0H6"
          label="Neuen Baum erstellen"
        />
      )}
      
      {/* Dialog zum Erstellen eines neuen Baums */}
      <NewTreeDialog 
        isOpen={showNewTreeDialog}
        onClose={handleCloseNewTreeDialog}
        onSave={handleCreateTree}
      />

      {/* Hauptinhalt */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Offline-Daten-Benachrichtigung */}
        {syncStatus.hasOfflineData && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Es sind ungespeicherte Daten vorhanden. 
                  <button 
                    onClick={handleSync}
                    disabled={syncStatus.isSyncing}
                    className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600"
                  >
                    {syncStatus.isSyncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fehlermeldung */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Inhalt je nach aktiver Ansicht */}
        {activeView === 'trees' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Bäume</h2>
            {isLoading ? (
              <p className="text-gray-500">Lade Bäume...</p>
            ) : trees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trees.map(tree => (
                  <div 
                    key={tree.tree_id} 
                    className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectTree(tree)}
                  >
                    <h3 className="font-medium text-lg">{tree.species_name}</h3>
                    <p className="text-gray-600">Nummer: {tree.tree_number}</p>
                    <p className="text-gray-600">Standort: {tree.address}, {tree.city}</p>
                    <p className="text-gray-600">Status: {tree.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Keine Bäume gefunden.</p>
            )}
          </div>
        )}

        {activeView === 'metrics' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {selectedTree ? `Metriken für ${selectedTree.species_name} (${selectedTree.tree_number})` : 'Neue Metrik erfassen'}
            </h2>
            <MetricsForm 
              treeId={selectedTree?.tree_id || ''}
              onSave={handleSaveMetric}
            />
          </div>
        )}
      </main>

      {/* TreeDetailCard */}
      {showTreeDetail && selectedTree && (
        <TreeDetailCard 
          tree={selectedTree}
          onClose={handleCloseTreeDetail}
          onEdit={handleEditMetrics}
          onPrint={handlePrintTree}
          onSave={handleSaveTree}
        />
      )}
    </div>
  )
}
export default App
