import React, { useState, useMemo, useCallback } from 'react';
import TreeEditMode from './TreeEditMode';

// Hilfsfunktionen
const formatDate = (dateString) => {
  if (!dateString) return 'Nicht angegeben';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const formatStatus = (status) => {
  switch (status) {
    case 'healthy':
      return 'Gesund';
    case 'treatment':
      return 'In Behandlung';
    case 'diseased':
      return 'Erkrankt';
    case 'critical':
      return 'Kritisch';
    case 'dead':
      return 'Abgestorben';
    default:
      return status || 'Unbekannt';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800';
    case 'treatment':
      return 'bg-yellow-100 text-yellow-800';
    case 'diseased':
      return 'bg-orange-100 text-orange-800';
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'dead':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const renderHealthScore = (score) => {
  const normalizedScore = Math.min(10, Math.max(0, score));
  const color = (() => {
    if (normalizedScore >= 8) return 'text-green-600';
    if (normalizedScore >= 5) return 'text-yellow-600';
    return 'text-red-600';
  })();
  
  return (
    <div className="flex items-center">
      <span className={`font-medium ${color}`}>{normalizedScore}/10</span>
      <div className="ml-2 bg-gray-200 rounded-full h-2 w-24">
        <div 
          className={`h-2 rounded-full ${
            normalizedScore >= 8 ? 'bg-green-600' : 
            normalizedScore >= 5 ? 'bg-yellow-600' : 'bg-red-600'
          }`}
          style={{ width: `${normalizedScore * 10}%` }}
        ></div>
      </div>
    </div>
  );
};

/**
 * Komponente zur Anzeige von Baum-Details in einem Overlay-Kartenformat
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.tree - Das Baumobjekt mit allen Details
 * @param {Function} props.onClose - Callback-Funktion zum Schließen der Karte
 * @param {Function} props.onEdit - Callback-Funktion zum Bearbeiten (Metriken erfassen)
 * @param {Function} props.onPrint - Callback-Funktion zum Drucken der Baumdaten
 * @param {Function} props.onSave - Callback-Funktion zum Speichern der Baumdaten
 */
const TreeDetailCard = ({ tree, onClose, onEdit, onPrint, onSave }) => {
  // State für aktiven Tab und Bearbeitungsmodus
  const [activeTab, setActiveTab] = useState('info');
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State für bearbeitete Baumdaten
  const [editedTree, setEditedTree] = useState(null);
  
  // Sortierte Listen für Metriken, Inspektionen und Maßnahmen
  const sortedMetrics = useMemo(() => {
    return tree.metrics ? [...tree.metrics].sort((a, b) => 
      new Date(b.measurement_date) - new Date(a.measurement_date)
    ) : [];
  }, [tree.metrics]);
  
  const sortedInspections = useMemo(() => {
    return tree.inspections ? [...tree.inspections].sort((a, b) => 
      new Date(b.inspection_date) - new Date(a.inspection_date)
    ) : [];
  }, [tree.inspections]);
  
  const sortedActions = useMemo(() => {
    return tree.actions ? [...tree.actions].sort((a, b) => 
      new Date(b.action_date) - new Date(a.action_date)
    ) : [];
  }, [tree.actions]);
  
  // Neueste Metrik für die Übersichtsanzeige
  const latestMetric = sortedMetrics.length > 0 ? sortedMetrics[0] : null;

  // Initialisiere editedTree, wenn tree sich ändert oder in den Bearbeitungsmodus gewechselt wird
  React.useEffect(() => {
    if (tree) {
      setEditedTree(JSON.parse(JSON.stringify(tree)));
    }
  }, [tree]);
  
  // Handler für Änderungen an den Baumdaten im Bearbeitungsmodus
  const handleTreeChange = useCallback((field, value) => {
    setEditedTree(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // Handler für Änderungen an verschachtelten Daten (metrics, inspections, actions)
  const handleNestedDataChange = useCallback((field, data) => {
    setEditedTree(prev => ({
      ...prev,
      [field]: data
    }));
  }, []);
  
  // Handler für Speichern der Änderungen
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(editedTree);
    }
    setIsEditMode(false);
  }, [editedTree, onSave]);
  
  // Handler für Abbrechen der Bearbeitung
  const handleCancel = useCallback(() => {
    setEditedTree(JSON.parse(JSON.stringify(tree)));
    setIsEditMode(false);
  }, [tree]);
  
  // Wechsel in den Bearbeitungsmodus
  const handleEnterEditMode = useCallback(() => {
    setIsEditMode(true);
  }, []);
  
  if (!tree) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header mit Schließen-Button */}
        <div className="bg-green-700 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">Baum-Details: {tree.tree_number}</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-green-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-gray-100 border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            <button 
              onClick={() => setActiveTab('info')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'info' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-600 hover:text-green-600'}`}
            >
              Allgemeine Infos
            </button>
            <button 
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'metrics' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-600 hover:text-green-600'}`}
            >
              Messungen ({sortedMetrics.length})
            </button>
            <button 
              onClick={() => setActiveTab('inspections')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'inspections' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-600 hover:text-green-600'}`}
            >
              Inspektionen ({sortedInspections.length})
            </button>
            <button 
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'actions' 
                ? 'border-b-2 border-green-600 text-green-600' 
                : 'text-gray-600 hover:text-green-600'}`}
            >
              Maßnahmen ({sortedActions.length})
            </button>
          </nav>
        </div>
        
        {/* Inhalt */}
        <div className="p-6 overflow-y-auto">
          {isEditMode ? (
            <TreeEditMode 
              tree={editedTree}
              activeTab={activeTab}
              onGeneralInfoChange={handleTreeChange}
              onMetricsChange={(metrics) => handleNestedDataChange('metrics', metrics)}
              onInspectionsChange={(inspections) => handleNestedDataChange('inspections', inspections)}
              onActionsChange={(actions) => handleNestedDataChange('actions', actions)}
            />
          ) : (
            <>
            {/* Tab: Allgemeine Infos */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Linke Spalte: Allgemeine Informationen */}
              <div>
                <h3 className="font-bold text-lg mb-2">{tree.common_name || tree.species_name || 'Unbekannte Baumart'}</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Baum-Nr.:</span> {tree.tree_number}</p>
                  <p><span className="font-medium">Wissenschaftlicher Name:</span> {tree.scientific_name || 'Nicht angegeben'}</p>
                  <p><span className="font-medium">Standort:</span> {tree.address}, {tree.city}</p>
                  <p><span className="font-medium">PLZ:</span> {tree.postal_code || 'Nicht angegeben'}</p>
                  <p><span className="font-medium">Koordinaten:</span> {tree.latitude}, {tree.longitude}</p>
                  <p>
                    <span className="font-medium">Status:</span> 
                    <span className={`px-2 py-1 rounded ${getStatusColor(tree.status)}`}>
                      {formatStatus(tree.status)}
                    </span>
                  </p>
                  <p><span className="font-medium">Pflanzjahr:</span> {formatDate(tree.planting_date)}</p>
                  <p><span className="font-medium">Höhe bei Pflanzung:</span> {tree.height_at_planting || 'Nicht erfasst'} m</p>
                  <p><span className="font-medium">Durchmesser bei Pflanzung:</span> {tree.diameter_at_planting || 'Nicht erfasst'} m</p>
                </div>
                
                {tree.notes && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Notizen:</h4>
                    <p className="bg-gray-50 p-3 rounded border border-gray-200">{tree.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Rechte Spalte: Zusammenfassung */}
              <div>
                <h3 className="font-bold text-lg mb-2">Letzte Messung</h3>
                {latestMetric ? (
                  <div className="space-y-2 bg-gray-50 p-4 rounded border border-gray-200">
                    <p><span className="font-medium">Datum:</span> {formatDate(latestMetric.measurement_date)}</p>
                    <p><span className="font-medium">Höhe:</span> {latestMetric.height} m</p>
                    <p><span className="font-medium">Stammdurchmesser:</span> {latestMetric.trunk_diameter} cm</p>
                    <p><span className="font-medium">Kronendurchmesser:</span> {latestMetric.crown_diameter} m</p>
                    <p><span className="font-medium">Kronenhöhe:</span> {latestMetric.crown_height} m</p>
                    <p><span className="font-medium">Gesundheitszustand:</span> {renderHealthScore(latestMetric.health_score)}</p>
                    {latestMetric.leaf_density && (
                      <p><span className="font-medium">Blattdichte:</span> {latestMetric.leaf_density}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Keine Messungen vorhanden</p>
                )}
                
                <h3 className="font-bold text-lg mt-6 mb-2">Letzte Maßnahme</h3>
                {sortedActions.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <p><span className="font-medium">Datum:</span> {formatDate(sortedActions[0].action_date)}</p>
                    <p><span className="font-medium">Maßnahme:</span> {sortedActions[0].action_type}</p>
                    <p><span className="font-medium">Beschreibung:</span> {sortedActions[0].description}</p>
                    <p><span className="font-medium">Durchgeführt von:</span> {sortedActions[0].performed_by}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Keine Maßnahmen dokumentiert</p>
                )}
              </div>
            </div>
          )}
          
          {/* Tab: Messungen */}
          {activeTab === 'metrics' && (
            <div>
              <h3 className="font-bold text-xl mb-4">Messungen</h3>
              {sortedMetrics.length > 0 ? (
                <div className="space-y-6">
                  {sortedMetrics.map((metric, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Messung vom {formatDate(metric.measurement_date)}</h4>
                        <span className="text-sm text-gray-500">ID: {metric.metric_id}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p><span className="font-medium">Höhe:</span> {metric.height} m</p>
                          <p><span className="font-medium">Stammdurchmesser:</span> {metric.trunk_diameter} cm</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Kronendurchmesser:</span> {metric.crown_diameter} m</p>
                          <p><span className="font-medium">Kronenhöhe:</span> {metric.crown_height} m</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Gesundheitszustand:</span> {renderHealthScore(metric.health_score)}</p>
                          {metric.leaf_density && (
                            <p><span className="font-medium">Blattdichte:</span> {metric.leaf_density}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Keine Messungen vorhanden</p>
              )}
            </div>
          )}
          
          {/* Tab: Inspektionen */}
          {activeTab === 'inspections' && (
            <div>
              <h3 className="font-bold text-xl mb-4">Inspektionen</h3>
              {sortedInspections.length > 0 ? (
                <div className="space-y-6">
                  {sortedInspections.map((inspection, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Inspektion vom {formatDate(inspection.inspection_date)}</h4>
                        <span className="text-sm text-gray-500">Inspektor: {inspection.inspector_name}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p>
                            <span className="font-medium">Zustand:</span> 
                            <span className={`ml-2 px-2 py-1 rounded ${inspection.condition_rating >= 8 ? 'bg-green-100 text-green-800' : inspection.condition_rating >= 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                              {inspection.condition_rating}/10
                            </span>
                          </p>
                          <p><span className="font-medium">Schädlingsbefall:</span> {inspection.pest_presence ? 'Ja' : 'Nein'}</p>
                          <p><span className="font-medium">Krankheiten:</span> {inspection.disease_presence ? 'Ja' : 'Nein'}</p>
                          <p><span className="font-medium">Strukturschäden:</span> {inspection.structural_damage ? 'Ja' : 'Nein'}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Nächste Inspektion:</span> {formatDate(inspection.next_inspection_date)}</p>
                          {inspection.notes && (
                            <div className="mt-2">
                              <p className="font-medium">Notizen:</p>
                              <p className="text-sm bg-gray-50 p-2 rounded mt-1">{inspection.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Keine Inspektionen vorhanden</p>
              )}
            </div>
          )}
          
          {/* Tab: Maßnahmen */}
          {activeTab === 'actions' && (
            <div>
              <h3 className="font-bold text-xl mb-4">Maßnahmen</h3>
              {sortedActions.length > 0 ? (
                <div className="space-y-6">
                  {sortedActions.map((action, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{action.action_type}</h4>
                        <span className="text-sm text-gray-500">{formatDate(action.action_date)}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><span className="font-medium">Beschreibung:</span> {action.description}</p>
                          <p><span className="font-medium">Durchgeführt von:</span> {action.performed_by}</p>
                          {action.cost && <p><span className="font-medium">Kosten:</span> {action.cost} €</p>}
                        </div>
                        <div>
                          <p><span className="font-medium">Ergebnis:</span> {action.result_notes || 'Keine Angabe'}</p>
                          <p>
                            <span className="font-medium">Nachverfolgung nötig:</span> 
                            {action.follow_up_needed ? 'Ja' : 'Nein'}
                          </p>
                          {action.follow_up_needed && action.follow_up_date && (
                            <p><span className="font-medium">Nachverfolgung am:</span> {formatDate(action.follow_up_date)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Keine Maßnahmen dokumentiert</p>
              )}
            </div>
          )}
            </>
          )}
        </div>
        
        {/* Footer mit Aktionsbuttons */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          {isEditMode ? (
            <>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Abbrechen
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Speichern
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={onPrint}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Drucken
              </button>
              <button 
                onClick={handleEnterEditMode}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Bearbeiten
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreeDetailCard;
