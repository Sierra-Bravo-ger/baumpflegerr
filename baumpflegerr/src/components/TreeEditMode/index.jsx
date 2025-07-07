import React, { useState } from 'react';
import GeneralInfoEdit from './GeneralInfoEdit';
import MetricsEdit from './MetricsEdit';
import InspectionsEdit from './InspectionsEdit';
import ActionsEdit from './ActionsEdit';

/**
 * Hauptkomponente für den Bearbeitungsmodus der TreeDetailCard
 * Verwaltet die Tabs und rendert die entsprechenden Bearbeitungskomponenten
 * 
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.tree - Das zu bearbeitende Baumobjekt
 * @param {Function} props.onSave - Callback-Funktion zum Speichern der Änderungen
 * @param {Function} props.onCancel - Callback-Funktion zum Abbrechen der Bearbeitung
 * @param {String} props.activeTab - Aktiver Tab ('info', 'metrics', 'inspections', 'actions')
 * @param {Function} props.setActiveTab - Funktion zum Ändern des aktiven Tabs
 */
const TreeEditMode = ({ 
  tree, 
  onSave, 
  onCancel, 
  activeTab, 
  setActiveTab,
  isNewTree = false
}) => {
  // State für die bearbeiteten Daten
  const [editedTree, setEditedTree] = useState(tree || {
    tree_number: '',
    species: '',
    location_description: '',
    status: 'healthy',
    planting_date: new Date().toISOString().split('T')[0],
    notes: '',
    metrics: [],
    inspections: [],
    actions: []
  });

  // Sortierte Listen für Metriken, Inspektionen und Maßnahmen
  const sortedMetrics = editedTree.metrics ? [...editedTree.metrics].sort((a, b) => 
    new Date(b.measurement_date) - new Date(a.measurement_date)
  ) : [];
  
  const sortedInspections = editedTree.inspections ? [...editedTree.inspections].sort((a, b) => 
    new Date(b.inspection_date) - new Date(a.inspection_date)
  ) : [];
  
  const sortedActions = editedTree.actions ? [...editedTree.actions].sort((a, b) => 
    new Date(b.action_date) - new Date(a.action_date)
  ) : [];

  // Handler für Änderungen an den allgemeinen Baumdaten
  const handleGeneralInfoChange = (updatedInfo) => {
    setEditedTree(prev => ({
      ...prev,
      ...updatedInfo
    }));
  };

  // Handler für Änderungen an Metriken
  const handleMetricsChange = (updatedMetrics) => {
    setEditedTree(prev => ({
      ...prev,
      metrics: updatedMetrics
    }));
  };

  // Handler für Änderungen an Inspektionen
  const handleInspectionsChange = (updatedInspections) => {
    setEditedTree(prev => ({
      ...prev,
      inspections: updatedInspections
    }));
  };

  // Handler für Änderungen an Maßnahmen
  const handleActionsChange = (updatedActions) => {
    setEditedTree(prev => ({
      ...prev,
      actions: updatedActions
    }));
  };

  // Speichern der Änderungen
  const handleSave = () => {
    onSave(editedTree);
  };

  return (
    <>
      {/* Tab-Navigation wurde entfernt, da sie bereits in TreeDetailCard vorhanden ist */}

      {/* Tab-Inhalte */}
      <div className="flex-grow overflow-y-auto p-6">
        {activeTab === 'info' && (
          <GeneralInfoEdit 
            treeData={editedTree} 
            onChange={handleGeneralInfoChange} 
            isNewTree={isNewTree}
          />
        )}
        
        {activeTab === 'metrics' && (
          <MetricsEdit 
            metrics={sortedMetrics} 
            treeId={editedTree.id || editedTree.tree_id} 
            onChange={handleMetricsChange} 
          />
        )}
        
        {activeTab === 'inspections' && (
          <InspectionsEdit 
            inspections={sortedInspections} 
            treeId={editedTree.id || editedTree.tree_id} 
            onChange={handleInspectionsChange} 
          />
        )}
        
        {activeTab === 'actions' && (
          <ActionsEdit 
            actions={sortedActions} 
            treeId={editedTree.id || editedTree.tree_id} 
            onChange={handleActionsChange} 
          />
        )}
      </div>

      {/* Aktionsleiste (Speichern/Abbrechen) */}
      <div className="bg-gray-100 px-6 py-4 flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Abbrechen
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Speichern
        </button>
      </div>
    </>
  );
};

export default TreeEditMode;
