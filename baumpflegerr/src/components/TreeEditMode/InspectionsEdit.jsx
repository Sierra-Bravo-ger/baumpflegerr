import React, { useState } from 'react';
import { inspectionsMapping, convertToDbFormat, convertToFrontendFormat } from '../../utils/fieldMappings';

/**
 * Komponente zur Bearbeitung von Baum-Inspektionen
 * 
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.inspections - Liste der vorhandenen Inspektionen
 * @param {Number|String} props.treeId - ID des Baums
 * @param {Function} props.onChange - Callback-Funktion für Änderungen
 */
const InspectionsEdit = ({ inspections = [], treeId, onChange }) => {
  // State für neue Inspektion
  const [newInspection, setNewInspection] = useState({
    tree_id: treeId,
    inspection_date: new Date().toISOString().split('T')[0],
    inspector_name: '',
    condition_rating: 'good',
    pest_presence: false,
    disease_presence: false,
    structural_damage: false,
    notes: '',
    next_inspection_date: ''
  });

  // State für Bearbeitung vorhandener Inspektionen
  const [editingInspectionId, setEditingInspectionId] = useState(null);
  
  // Formatierung des Datums
  const formatDate = (dateString) => {
    if (!dateString) return 'Nicht angegeben';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  // Handler für Änderungen an der neuen Inspektion
  const handleNewInspectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewInspection(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handler für Änderungen an vorhandenen Inspektionen
  const handleExistingInspectionChange = (e, inspectionId) => {
    const { name, value, type, checked } = e.target;
    const updatedInspections = inspections.map(inspection => 
      inspection.id === inspectionId ? { ...inspection, [name]: type === 'checkbox' ? checked : value } : inspection
    );
    onChange(updatedInspections);
  };

  // Hinzufügen einer neuen Inspektion
  const handleAddInspection = () => {
    // Temporäre ID für Frontend-Zwecke
    const tempId = `temp_${Date.now()}`;
    const inspectionToAdd = { ...newInspection, id: tempId, isNew: true };
    
    // Konvertiere zum DB-Format für die Speicherung
    const dbInspection = convertToDbFormat(inspectionToAdd, inspectionsMapping);
    onChange([{ ...dbInspection, id: tempId, isNew: true }, ...inspections]);
    
    // Formular zurücksetzen
    setNewInspection({
      tree_id: treeId,
      inspection_date: new Date().toISOString().split('T')[0],
      inspector_name: '',
      condition_rating: 'good',
      pest_presence: false,
      disease_presence: false,
      structural_damage: false,
      notes: '',
      next_inspection_date: ''
    });
  };

  // Löschen einer Inspektion
  const handleDeleteInspection = (inspectionId) => {
    const updatedInspections = inspections.filter(inspection => inspection.id !== inspectionId);
    onChange(updatedInspections);
  };

  // Formatierung des Zustands
  const formatCondition = (condition) => {
    switch (condition) {
      case 'excellent':
        return 'Ausgezeichnet';
      case 'good':
        return 'Gut';
      case 'fair':
        return 'Mittelmäßig';
      case 'poor':
        return 'Schlecht';
      case 'critical':
        return 'Kritisch';
      default:
        return condition || 'Unbekannt';
    }
  };

  // Farbe für den Zustand
  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-green-50 text-green-700';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Neue Inspektion hinzufügen</h3>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Datum */}
            <div>
              <label htmlFor="inspection_date" className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                id="inspection_date"
                name="inspection_date"
                value={newInspection.inspection_date}
                onChange={handleNewInspectionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            
            {/* Inspektor */}
            <div>
              <label htmlFor="inspector_name" className="block text-sm font-medium text-gray-700 mb-1">
                Inspektor
              </label>
              <input
                type="text"
                id="inspector_name"
                name="inspector_name"
                value={newInspection.inspector_name}
                onChange={handleNewInspectionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            {/* Zustandsbewertung */}
            <div>
              <label htmlFor="condition_rating" className="block text-sm font-medium text-gray-700 mb-1">
                Zustand (0-10)
              </label>
              <select
                id="condition_rating"
                name="condition_rating"
                value={newInspection.condition_rating}
                onChange={handleNewInspectionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="excellent">Ausgezeichnet (9-10)</option>
                <option value="good">Gut (7-8)</option>
                <option value="fair">Mittelmäßig (5-6)</option>
                <option value="poor">Schlecht (3-4)</option>
                <option value="critical">Kritisch (0-2)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="pest_presence"
                name="pest_presence"
                checked={newInspection.pest_presence}
                onChange={handleNewInspectionChange}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="pest_presence" className="ml-2 block text-sm text-gray-700">
                Schädlingsbefall
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="disease_presence"
                name="disease_presence"
                checked={newInspection.disease_presence}
                onChange={handleNewInspectionChange}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="disease_presence" className="ml-2 block text-sm text-gray-700">
                Krankheiten
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="structural_damage"
                name="structural_damage"
                checked={newInspection.structural_damage}
                onChange={handleNewInspectionChange}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="structural_damage" className="ml-2 block text-sm text-gray-700">
                Strukturschäden
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="next_inspection_date" className="block text-sm font-medium text-gray-700 mb-1">
                Nächste Inspektion
              </label>
              <input
                type="date"
                id="next_inspection_date"
                name="next_inspection_date"
                value={newInspection.next_inspection_date}
                onChange={handleNewInspectionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              value={newInspection.notes}
              onChange={handleNewInspectionChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddInspection}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Inspektion hinzufügen
            </button>
          </div>
        </div>
      </div>
      
      {/* Liste vorhandener Inspektionen */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vorhandene Inspektionen</h3>
        
        {inspections.length === 0 ? (
          <p className="text-gray-500 italic">Keine Inspektionen vorhanden</p>
        ) : (
          <div className="space-y-4">
            {inspections.map(inspection => (
              <div 
                key={inspection.id} 
                className="bg-white p-4 rounded-md border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">Inspektion vom {formatDate(inspection.inspection_date)}</h4>
                    <p className="text-sm text-gray-500">
                      Durchgeführt von: {inspection.inspector_name || 'Unbekannt'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingInspectionId(editingInspectionId === inspection.id ? null : inspection.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {editingInspectionId === inspection.id ? 'Fertig' : 'Bearbeiten'}
                    </button>
                    <button
                      onClick={() => handleDeleteInspection(inspection.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
                
                {editingInspectionId === inspection.id ? (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Datum */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Datum
                        </label>
                        <input
                          type="date"
                          name="inspection_date"
                          value={inspection.inspection_date ? inspection.inspection_date.split('T')[0] : ''}
                          onChange={(e) => handleExistingInspectionChange(e, inspection.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      {/* Inspektor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Inspektor
                        </label>
                        <input
                          type="text"
                          name="inspector_name"
                          value={inspection.inspector_name || ''}
                          onChange={(e) => handleExistingInspectionChange(e, inspection.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      {/* Zustandsbewertung */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zustandsbewertung
                        </label>
                        <select
                          name="condition_rating"
                          value={inspection.condition_rating || 'good'}
                          onChange={(e) => handleExistingInspectionChange(e, inspection.id)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="excellent">Ausgezeichnet</option>
                          <option value="good">Gut</option>
                          <option value="fair">Mittelmäßig</option>
                          <option value="poor">Schlecht</option>
                          <option value="critical">Kritisch</option>
                        </select>
                      </div>
                    </div>
                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`pest_presence_${inspection.id}`}
                          name="pest_presence"
                          checked={inspection.pest_presence || false}
                          onChange={(e) => handleExistingInspectionChange(e, inspection.id)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor={`pest_presence_${inspection.id}`} className="ml-2 block text-sm text-gray-700">
                          Schädlingsbefall
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`disease_presence_${inspection.id}`}
                          name="disease_presence"
                          checked={inspection.disease_presence || false}
                          onChange={(e) => handleExistingInspectionChange(e, inspection.id)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor={`disease_presence_${inspection.id}`} className="ml-2 block text-sm text-gray-700">
                          Krankheiten
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`structural_damage_${inspection.id}`}
                          name="structural_damage"
                          checked={inspection.structural_damage || false}
                          onChange={(e) => handleExistingInspectionChange(e, inspection.id)}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <label htmlFor={`structural_damage_${inspection.id}`} className="ml-2 block text-sm text-gray-700">
                          Strukturschäden
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nächste Inspektion
                      </label>
                      <input
                        type="date"
                        name="next_inspection_date"
                        value={inspection.next_inspection_date ? inspection.next_inspection_date.split('T')[0] : ''}
                        onChange={(e) => handleExistingInspectionChange(e, inspection.id)}
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
                        value={inspection.notes || ''}
                        onChange={(e) => handleExistingInspectionChange(e, inspection.id)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-center mb-2">
                      <span className="text-sm mr-2">Zustand:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(inspection.condition_rating)}`}>
                        {formatCondition(inspection.condition_rating)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {inspection.pest_presence && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Schädlingsbefall
                        </span>
                      )}
                      {inspection.disease_presence && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Krankheiten
                        </span>
                      )}
                      {inspection.structural_damage && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Strukturschäden
                        </span>
                      )}
                    </div>
                    
                    {inspection.notes && (
                      <div className="mb-2">
                        <h5 className="text-sm font-medium text-gray-700">Notizen:</h5>
                        <p className="text-sm text-gray-600">{inspection.notes}</p>
                      </div>
                    )}
                    
                    {inspection.next_inspection_date && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">Nächste Inspektion:</h5>
                        <p className="text-sm text-gray-600">{formatDate(inspection.next_inspection_date)}</p>
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

export default InspectionsEdit;
