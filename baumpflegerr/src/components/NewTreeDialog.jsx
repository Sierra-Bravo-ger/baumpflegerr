import React, { useState } from 'react';
import GeneralInfoEdit from './TreeEditMode/GeneralInfoEdit';

/**
 * Dialog zum Erstellen eines neuen Baums
 * 
 * @param {Object} props - Komponenten-Props
 * @param {boolean} props.isOpen - Ist der Dialog geöffnet?
 * @param {Function} props.onClose - Callback zum Schließen des Dialogs
 * @param {Function} props.onSave - Callback zum Speichern des neuen Baums
 */
const NewTreeDialog = ({ isOpen, onClose, onSave }) => {
  const [newTreeData, setNewTreeData] = useState({
    tree_number: '',
    species_id: null,
    location_id: null,
    status: 'healthy',
    notes: '',
    scientific_name: '',
    common_name: '',
    address: '',
    city: '',
    postal_code: '',
    planting_date: null,
    planting_year: null,
    height_at_planting: null,
    diameter_at_planting: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handler für Änderungen an den Baumdaten
  const handleChange = (changes) => {
    setNewTreeData(prev => ({ ...prev, ...changes }));
  };

  // Handler für das Speichern des neuen Baums
  const handleSave = async () => {
    if (!newTreeData.tree_number) {
      setError('Bitte geben Sie eine Baumnummer ein.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(newTreeData);
      onClose(); // Dialog schließen nach erfolgreichem Speichern
    } catch (err) {
      console.error('Fehler beim Erstellen des Baums:', err);
      setError('Der Baum konnte nicht erstellt werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Neuen Baum erstellen</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

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

          <GeneralInfoEdit 
            treeData={newTreeData} 
            onChange={handleChange} 
            isNewTree={true} 
          />

          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400"
              disabled={isLoading}
            >
              {isLoading ? 'Speichern...' : 'Baum erstellen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewTreeDialog;
