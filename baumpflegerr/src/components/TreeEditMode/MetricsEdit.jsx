import React, { useState } from 'react';
import { metricsMapping, convertToDbFormat, convertToFrontendFormat } from '../../utils/fieldMappings';

/**
 * Komponente zur Bearbeitung von Baum-Metriken
 * 
 * @param {Object} props - Komponenten-Props
 * @param {Array} props.metrics - Liste der vorhandenen Metriken
 * @param {Number|String} props.treeId - ID des Baums
 * @param {Function} props.onChange - Callback-Funktion für Änderungen
 */
const MetricsEdit = ({ metrics = [], treeId, onChange }) => {
  // State für neue Metrik
  const [newMetric, setNewMetric] = useState({
    tree_id: treeId,
    measurement_date: new Date().toISOString().split('T')[0],
    height: '',
    trunk_diameter: '',
    crown_diameter: '',
    crown_height: '',
    health_score: 5,
    leaf_density: '',
    notes: ''
  });

  // State für Bearbeitung vorhandener Metriken
  const [editingMetricId, setEditingMetricId] = useState(null);
  
  // Formatierung des Datums
  const formatDate = (dateString) => {
    if (!dateString) return 'Nicht angegeben';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  // Handler für Änderungen an der neuen Metrik
  const handleNewMetricChange = (e) => {
    const { name, value, type } = e.target;
    // Konvertiere numerische Werte automatisch
    const processedValue = type === 'number' || name === 'health_score' ? 
      (value === '' ? '' : Number(value)) : value;
    
    setNewMetric(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Handler für Änderungen an vorhandenen Metriken
  const handleExistingMetricChange = (e, metricId) => {
    const { name, value, type } = e.target;
    // Konvertiere numerische Werte automatisch
    const processedValue = type === 'number' || name === 'health_score' ? 
      (value === '' ? '' : Number(value)) : value;
    
    const updatedMetrics = metrics.map(metric => 
      metric.id === metricId ? { ...metric, [name]: processedValue } : metric
    );
    onChange(updatedMetrics);
  };

  // Hinzufügen einer neuen Metrik
  const handleAddMetric = () => {
    // Temporäre ID für Frontend-Zwecke
    const tempId = `temp_${Date.now()}`;
    const metricToAdd = { ...newMetric, id: tempId, isNew: true };
    
    // Konvertiere zum DB-Format für die Speicherung
    const dbMetric = convertToDbFormat(metricToAdd, metricsMapping);
    onChange([{ ...dbMetric, id: tempId, isNew: true }, ...metrics]);
    
    // Formular zurücksetzen
    setNewMetric({
      tree_id: treeId,
      measurement_date: new Date().toISOString().split('T')[0],
      height: '',
      trunk_diameter: '',
      crown_diameter: '',
      crown_height: '',
      health_score: 5,
      leaf_density: '',
      notes: ''
    });
  };

  // Löschen einer Metrik
  const handleDeleteMetric = (metricId) => {
    const updatedMetrics = metrics.filter(metric => metric.id !== metricId);
    onChange(updatedMetrics);
  };

  // Rendern des Gesundheitsscores
  const renderHealthScore = (score) => {
    const normalizedScore = Math.min(10, Math.max(0, score));
    const color = (() => {
      if (normalizedScore >= 8) return 'text-green-600';
      if (normalizedScore >= 5) return 'text-yellow-600';
      return 'text-red-600';
    })();
    
    return (
      <div className="flex items-center">
        <span className={`text-lg font-semibold ${color}`}>{normalizedScore}</span>
        <span className="text-gray-400 text-sm ml-1">/10</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Neue Messung hinzufügen</h3>
        
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="measurement_date" className="block text-sm font-medium text-gray-700 mb-1">
                Datum der Messung
              </label>
              <input
                type="date"
                id="measurement_date"
                name="measurement_date"
                value={newMetric.measurement_date}
                onChange={handleNewMetricChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                Höhe (m)
              </label>
              <input
                type="number"
                step="0.01"
                id="height"
                name="height"
                value={newMetric.height}
                onChange={handleNewMetricChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="trunk_diameter" className="block text-sm font-medium text-gray-700 mb-1">
                Stammdurchmesser (cm)
              </label>
              <input
                type="number"
                step="0.01"
                id="trunk_diameter"
                name="trunk_diameter"
                value={newMetric.trunk_diameter}
                onChange={handleNewMetricChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="crown_diameter" className="block text-sm font-medium text-gray-700 mb-1">
                Kronendurchmesser (m)
              </label>
              <input
                type="number"
                step="0.01"
                id="crown_diameter"
                name="crown_diameter"
                value={newMetric.crown_diameter}
                onChange={handleNewMetricChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label htmlFor="crown_height" className="block text-sm font-medium text-gray-700 mb-1">
                Kronenhöhe (m)
              </label>
              <input
                type="number"
                step="0.01"
                id="crown_height"
                name="crown_height"
                value={newMetric.crown_height}
                onChange={handleNewMetricChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="health_score" className="block text-sm font-medium text-gray-700 mb-1">
                Gesundheitszustand (0-10)
              </label>
              <input
                type="range"
                min="0"
                max="10"
                id="health_score"
                name="health_score"
                value={newMetric.health_score}
                onChange={handleNewMetricChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
              <div className="text-center mt-1">
                {renderHealthScore(newMetric.health_score)}
              </div>
            </div>
            
            <div>
              <label htmlFor="leaf_density" className="block text-sm font-medium text-gray-700 mb-1">
                Blattdichte (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                id="leaf_density"
                name="leaf_density"
                value={newMetric.leaf_density}
                onChange={handleNewMetricChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notizen
            </label>
            <textarea
              id="notes"
              name="notes"
              value={newMetric.notes}
              onChange={handleNewMetricChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddMetric}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Messung hinzufügen
            </button>
          </div>
        </div>
      </div>
      
      {/* Liste vorhandener Metriken */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vorhandene Messungen</h3>
        
        {metrics.length === 0 ? (
          <p className="text-gray-500 italic">Keine Messungen vorhanden</p>
        ) : (
          <div className="space-y-4">
            {metrics.map(metric => (
              <div 
                key={metric.id} 
                className="bg-white p-4 rounded-md border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Messung vom {formatDate(metric.measurement_date)}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingMetricId(editingMetricId === metric.id ? null : metric.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {editingMetricId === metric.id ? 'Fertig' : 'Bearbeiten'}
                    </button>
                    <button
                      onClick={() => handleDeleteMetric(metric.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
                
                {editingMetricId === metric.id ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {/* Notizen */}
                    <div className="col-span-full">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notizen
                      </label>
                      <textarea
                        name="notes"
                        value={metric.notes || ''}
                        onChange={(e) => handleExistingMetricChange(e, metric.id)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        rows="3"
                      />
                    </div>
                    
                    {/* Datum */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Datum
                      </label>
                      <input
                        type="date"
                        name="measurement_date"
                        value={metric.measurement_date ? metric.measurement_date.split('T')[0] : ''}
                        onChange={(e) => handleExistingMetricChange(e, metric.id)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    
                    {/* Höhe */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Höhe (m)
                      </label>
                      <input
                        type="number"
                        name="height"
                        value={metric.height || ''}
                        onChange={(e) => handleExistingMetricChange(e, metric.id)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    
                    {/* Weitere Felder analog */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stammdurchmesser (cm)
                      </label>
                      <input
                        type="number"
                        name="trunk_diameter"
                        value={metric.trunk_diameter || ''}
                        onChange={(e) => handleExistingMetricChange(e, metric.id)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kronendurchmesser (m)
                      </label>
                      <input
                        type="number"
                        name="crown_diameter"
                        value={metric.crown_diameter || ''}
                        onChange={(e) => handleExistingMetricChange(e, metric.id)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kronenhöhe (m)
                      </label>
                      <input
                        type="number"
                        name="crown_height"
                        value={metric.crown_height || ''}
                        onChange={(e) => handleExistingMetricChange(e, metric.id)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gesundheitsscore (1-10)
                      </label>
                      <input
                        type="range"
                        name="health_score"
                        value={metric.health_score || 5}
                        onChange={(e) => handleExistingMetricChange(e, metric.id)}
                        className="w-full"
                        min="0"
                        max="10"
                        step="1"
                      />
                      <div className="mt-1">{renderHealthScore(metric.health_score)}</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blattdichte (%)
                      </label>
                      <input
                        type="number"
                        name="leaf_density"
                        value={metric.leaf_density || ''}
                        onChange={(e) => handleExistingMetricChange(e, metric.id)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Höhe</span>
                      <p>{metric.height ? `${metric.height} m` : '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Stammdurchmesser</span>
                      <p>{metric.trunk_diameter ? `${metric.trunk_diameter} cm` : '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Kronendurchmesser</span>
                      <p>{metric.crown_diameter ? `${metric.crown_diameter} m` : '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Kronenhöhe</span>
                      <p>{metric.crown_height ? `${metric.crown_height} m` : '-'}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Gesundheitsscore</span>
                      <div>{renderHealthScore(metric.health_score)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Blattdichte</span>
                      <p>{metric.leaf_density ? `${metric.leaf_density}%` : '-'}</p>
                    </div>
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

export default MetricsEdit;
