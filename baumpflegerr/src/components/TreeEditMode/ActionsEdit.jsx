import React, { useState } from 'react';
import { actionsMapping, convertToDbFormat, convertToFrontendFormat } from '../../utils/fieldMappings';

/**
 * Komponente zur Bearbeitung von Baum-Maßnahmen
 * 
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.actions - Liste der vorhandenen Maßnahmen
 * @param {Number|String} props.treeId - ID des Baums
 * @param {Function} props.onChange - Callback-Funktion für Änderungen
 */
const ActionsEdit = ({ actions = [], treeId, onChange }) => {
  // State für neue Maßnahme
  const [newAction, setNewAction] = useState({
    tree_id: treeId,
    action_date: new Date().toISOString().split('T')[0],
    action_type: 'pruning',
    description: '',
    performed_by: '',
    cost: '',
    status: 'completed',
    scheduled_date: '',
    notes: ''
  });

  // State für Bearbeitung vorhandener Maßnahmen
  const [editingActionId, setEditingActionId] = useState(null);
  
  // Formatierung des Datums
  const formatDate = (dateString) => {
    if (!dateString) return 'Nicht angegeben';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  // Handler für Änderungen an der neuen Maßnahme
  const handleNewActionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAction(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handler für Änderungen an vorhandenen Maßnahmen
  const handleExistingActionChange = (e, actionId) => {
    const { name, value, type, checked } = e.target;
    const updatedActions = actions.map(action => 
      action.id === actionId ? { ...action, [name]: type === 'checkbox' ? checked : value } : action
    );
    onChange(updatedActions);
  };

  // Hinzufügen einer neuen Maßnahme
  const handleAddAction = () => {
    // Temporäre ID für Frontend-Zwecke
    const tempId = `temp_${Date.now()}`;
    const actionToAdd = { ...newAction, id: tempId, isNew: true };
    
    // Konvertiere zum DB-Format für die Speicherung
    const dbAction = convertToDbFormat(actionToAdd, actionsMapping);
    onChange([{ ...dbAction, id: tempId, isNew: true }, ...actions]);
    
    // Formular zurücksetzen
    setNewAction({
      tree_id: treeId,
      action_date: new Date().toISOString().split('T')[0],
      action_type: 'pruning',
      description: '',
      performed_by: '',
      cost: '',
      status: 'completed',
      scheduled_date: '',
      notes: ''
    });
  };

  // Löschen einer Maßnahme
  const handleDeleteAction = (actionId) => {
    const updatedActions = actions.filter(action => action.id !== actionId);
    onChange(updatedActions);
  };

  // Formatierung des Maßnahmentyps
  const formatActionType = (type) => {
    switch (type) {
      case 'pruning':
        return 'Schnitt';
      case 'removal':
        return 'Fällung';
      case 'planting':
        return 'Pflanzung';
      case 'fertilization':
        return 'Düngung';
      case 'treatment':
        return 'Behandlung';
      case 'inspection':
        return 'Kontrolle';
      case 'other':
        return 'Sonstige';
      default:
        return type || 'Unbekannt';
    }
  };

  // Formatierung des Status
  const formatStatus = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Geplant';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'completed':
        return 'Abgeschlossen';
      case 'cancelled':
        return 'Abgebrochen';
      default:
        return status || 'Unbekannt';
    }
  };

  // Status-Farbe bestimmen
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Neue Maßnahme hinzufügen</h3>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={newAction.status}
                onChange={handleNewActionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="scheduled">Geplant</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="completed">Abgeschlossen</option>
                <option value="cancelled">Abgebrochen</option>
              </select>
            </div>
            
            {/* Maßnahmentyp */}
            <div>
              <label htmlFor="action_type" className="block text-sm font-medium text-gray-700 mb-1">
                Maßnahmentyp
              </label>
              <select
                id="action_type"
                name="action_type"
                value={newAction.action_type}
                onChange={handleNewActionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="pruning">Schnitt</option>
                <option value="removal">Fällung</option>
                <option value="planting">Pflanzung</option>
                <option value="fertilization">Düngung</option>
                <option value="treatment">Behandlung</option>
                <option value="inspection">Kontrolle</option>
                <option value="other">Sonstige</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Geplantes Datum */}
            <div>
              <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-1">
                Geplantes Datum
              </label>
              <input
                type="date"
                id="scheduled_date"
                name="scheduled_date"
                value={newAction.scheduled_date}
                onChange={handleNewActionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Durchführungsdatum */}
            <div>
              <label htmlFor="action_date" className="block text-sm font-medium text-gray-700 mb-1">
                Durchführungsdatum
              </label>
              <input
                type="date"
                id="action_date"
                name="action_date"
                value={newAction.action_date}
                onChange={handleNewActionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required={newAction.status === 'completed'}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Beschreibung
            </label>
            <textarea
              id="description"
              name="description"
              value={newAction.description}
              onChange={handleNewActionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Durchgeführt von */}
            <div>
              <label htmlFor="performed_by" className="block text-sm font-medium text-gray-700 mb-1">
                Durchgeführt von
              </label>
              <input
                type="text"
                id="performed_by"
                name="performed_by"
                value={newAction.performed_by}
                onChange={handleNewActionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Kosten */}
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Kosten (€)
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={newAction.cost}
                onChange={handleNewActionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notizen
            </label>
            <textarea
              id="notes"
              name="notes"
              value={newAction.notes}
              onChange={handleNewActionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddAction}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Maßnahme hinzufügen
            </button>
          </div>
        </div>
      </div>
      
      {/* Liste vorhandener Maßnahmen */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vorhandene Maßnahmen</h3>
        
        {actions.length === 0 ? (
          <p className="text-gray-500 italic">Keine Maßnahmen vorhanden</p>
        ) : (
          <div className="space-y-4">
            {actions.map(action => (
              <div 
                key={action.id} 
                className="bg-white p-4 rounded-md border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">
                      {formatActionType(action.action_type)} vom {formatDate(action.action_date)}
                    </h4>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(action.status)
                      }`}>
                        {formatStatus(action.status)}
                      </span>
                      {action.performed_by && (
                        <span className="text-sm text-gray-500 ml-2">
                          Durchgeführt von: {action.performed_by}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingActionId(editingActionId === action.id ? null : action.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {editingActionId === action.id ? 'Fertig' : 'Bearbeiten'}
                    </button>
                    <button
                      onClick={() => handleDeleteAction(action.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
                
                {editingActionId === action.id ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={action.status || 'completed'}
                          onChange={(e) => handleExistingActionChange(e, action.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="scheduled">Geplant</option>
                          <option value="in_progress">In Bearbeitung</option>
                          <option value="completed">Abgeschlossen</option>
                          <option value="cancelled">Abgebrochen</option>
                        </select>
                      </div>
                      
                      {/* Maßnahmentyp */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Maßnahmentyp
                        </label>
                        <select
                          name="action_type"
                          value={action.action_type || 'pruning'}
                          onChange={(e) => handleExistingActionChange(e, action.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="pruning">Schnitt</option>
                          <option value="removal">Fällung</option>
                          <option value="planting">Pflanzung</option>
                          <option value="fertilization">Düngung</option>
                          <option value="treatment">Behandlung</option>
                          <option value="inspection">Kontrolle</option>
                          <option value="other">Sonstige</option>
                        </select>
                      </div>
                      
                      {/* Geplantes Datum */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Geplantes Datum
                        </label>
                        <input
                          type="date"
                          name="scheduled_date"
                          value={action.scheduled_date ? action.scheduled_date.split('T')[0] : ''}
                          onChange={(e) => handleExistingActionChange(e, action.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      {/* Durchführungsdatum */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durchführungsdatum
                        </label>
                        <input
                          type="date"
                          name="action_date"
                          value={action.action_date ? action.action_date.split('T')[0] : ''}
                          onChange={(e) => handleExistingActionChange(e, action.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      {/* Durchgeführt von */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Durchgeführt von
                        </label>
                        <input
                          type="text"
                          name="performed_by"
                          value={action.performed_by || ''}
                          onChange={(e) => handleExistingActionChange(e, action.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      {/* Kosten */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kosten (€)
                        </label>
                        <input
                          type="number"
                          name="cost"
                          value={action.cost || ''}
                          onChange={(e) => handleExistingActionChange(e, action.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    {/* Beschreibung */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Beschreibung
                      </label>
                      <textarea
                        name="description"
                        value={action.description || ''}
                        onChange={(e) => handleExistingActionChange(e, action.id)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    {/* Notizen */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notizen
                      </label>
                      <textarea
                        name="notes"
                        value={action.notes || ''}
                        onChange={(e) => handleExistingActionChange(e, action.id)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    {action.description && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    )}
                    
                    {action.cost && (
                      <div className="text-sm text-gray-600">
                        Kosten: {parseFloat(action.cost).toFixed(2)} €
                      </div>
                    )}
                    
                    {action.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Notizen:</span> {action.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsEdit;
