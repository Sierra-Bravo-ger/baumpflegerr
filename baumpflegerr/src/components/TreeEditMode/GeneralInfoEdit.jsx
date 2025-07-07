import React from 'react';

/**
 * Komponente zur Bearbeitung der allgemeinen Baumdaten
 * 
 * @param {Object} props - Komponenten-Props
 * @param {Object} props.treeData - Die zu bearbeitenden Baumdaten
 * @param {Function} props.onChange - Callback-Funktion für Änderungen
 * @param {Boolean} props.isNewTree - Flag, ob ein neuer Baum angelegt wird
 */
const GeneralInfoEdit = ({ treeData, onChange, isNewTree = false }) => {
  // Handler für Änderungen an Formularfeldern
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  // Handler für numerische Eingabefelder
  const handleNumericChange = (e) => {
    const { name, value } = e.target;
    // Konvertiere zu Dezimalzahl für DB-Kompatibilität
    onChange({ [name]: value === '' ? null : parseFloat(value) });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Allgemeine Informationen</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baumnummer */}
        <div>
          <label htmlFor="tree_number" className="block text-sm font-medium text-gray-700 mb-1">
            Baumnummer
          </label>
          <input
            type="text"
            id="tree_number"
            name="tree_number"
            value={treeData.tree_number || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        
        {/* Wissenschaftlicher Name */}
        <div>
          <label htmlFor="scientific_name" className="block text-sm font-medium text-gray-700 mb-1">
            Wissenschaftlicher Name
          </label>
          <input
            type="text"
            id="scientific_name"
            name="scientific_name"
            value={treeData.scientific_name || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {/* Deutscher Name */}
        <div>
          <label htmlFor="common_name" className="block text-sm font-medium text-gray-700 mb-1">
            Deutscher Name
          </label>
          <input
            type="text"
            id="common_name"
            name="common_name"
            value={treeData.common_name || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {/* Standort */}
        <div className="md:col-span-2">
          <label htmlFor="location_description" className="block text-sm font-medium text-gray-700 mb-1">
            Standort
          </label>
          <input
            type="text"
            id="location_description"
            name="location_description"
            value={treeData.location_description || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {/* PLZ */}
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
            PLZ
          </label>
          <input
            type="text"
            id="postal_code"
            name="postal_code"
            value={treeData.postal_code || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={treeData.status || 'healthy'}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="healthy">Gesund</option>
            <option value="treatment">In Behandlung</option>
            <option value="diseased">Erkrankt</option>
            <option value="critical">Kritisch</option>
            <option value="dead">Abgestorben</option>
          </select>
        </div>
        
        {/* Pflanzungsdatum */}
        <div>
          <label htmlFor="planting_date" className="block text-sm font-medium text-gray-700 mb-1">
            Pflanzungsdatum
          </label>
          <input
            type="date"
            id="planting_date"
            name="planting_date"
            value={treeData.planting_date ? treeData.planting_date.split('T')[0] : ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {/* Koordinaten */}
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
            Breitengrad
          </label>
          <input
            type="number"
            id="latitude"
            name="latitude"
            step="0.00000001"
            value={treeData.latitude || ''}
            onChange={handleNumericChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="z.B. 52.52345000"
          />
        </div>
        
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
            Längengrad
          </label>
          <input
            type="number"
            id="longitude"
            name="longitude"
            step="0.00000001"
            value={treeData.longitude || ''}
            onChange={handleNumericChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="z.B. 13.38270000"
          />
        </div>
        
        {/* Höhe bei Pflanzung */}
        <div>
          <label htmlFor="height_at_planting" className="block text-sm font-medium text-gray-700 mb-1">
            Höhe bei Pflanzung (m)
          </label>
          <input
            type="number"
            id="height_at_planting"
            name="height_at_planting"
            step="0.01"
            value={treeData.height_at_planting || ''}
            onChange={handleNumericChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        {/* Durchmesser bei Pflanzung */}
        <div>
          <label htmlFor="diameter_at_planting" className="block text-sm font-medium text-gray-700 mb-1">
            Durchmesser bei Pflanzung (m)
          </label>
          <input
            type="number"
            id="diameter_at_planting"
            name="diameter_at_planting"
            step="0.01"
            value={treeData.diameter_at_planting || ''}
            onChange={handleNumericChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
      
      {/* Notizen */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notizen
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          value={treeData.notes || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Notizen zum Baum..."
        />
      </div>
    </div>
  );
};

export default GeneralInfoEdit;
