/**
 * Mapping zwischen Frontend-Feldern und Datenbankfeldern
 * Diese Datei dient als zentrale Referenz für die Feldnamen und -typen
 */

/**
 * Mapping für Metriken (tree_metrics)
 */
export const metricsMapping = {
  // Gemeinsame Felder (gleicher Name in Frontend und DB)
  commonFields: [
    'tree_id',
    'measurement_date',
    'height',
    'trunk_diameter',
    'crown_diameter',
    'crown_height',
    'health_score',
    'leaf_density',
  ],
  
  // Felder, die nur in der Datenbank existieren
  dbOnlyFields: [
    'notes',
    'created_at',
    'updated_at'
  ],
  
  // Typkonvertierungen
  typeConversions: {
    'health_score': {
      toDb: (value) => parseInt(value, 10),
      fromDb: (value) => value !== null ? parseInt(value, 10) : 5
    },
    'height': {
      toDb: (value) => value !== '' ? parseFloat(value) : null,
      fromDb: (value) => value !== null ? value.toString() : ''
    },
    'trunk_diameter': {
      toDb: (value) => value !== '' ? parseFloat(value) : null,
      fromDb: (value) => value !== null ? value.toString() : ''
    },
    'crown_diameter': {
      toDb: (value) => value !== '' ? parseFloat(value) : null,
      fromDb: (value) => value !== null ? value.toString() : ''
    },
    'crown_height': {
      toDb: (value) => value !== '' ? parseFloat(value) : null,
      fromDb: (value) => value !== null ? value.toString() : ''
    },
    'leaf_density': {
      toDb: (value) => value !== '' ? parseFloat(value) : null,
      fromDb: (value) => value !== null ? value.toString() : ''
    }
  }
};

/**
 * Mapping für Inspektionen (tree_inspections)
 */
export const inspectionsMapping = {
  // Gemeinsame Felder (gleicher Name in Frontend und DB)
  commonFields: [
    'tree_id',
    'inspection_date',
    'inspector_name',
    'notes',
    'next_inspection_date'
  ],
  
  // Felder mit unterschiedlichen Namen in Frontend und DB
  fieldMappings: {
    // Frontend-Name: DB-Name
    'condition_rating_value': 'condition_rating'
  },
  
  // Felder, die nur in der Datenbank existieren
  dbOnlyFields: [
    'pest_presence',
    'disease_presence', 
    'structural_damage',
    'created_at',
    'updated_at'
  ],
  
  // Felder, die nur im Frontend existieren
  frontendOnlyFields: [
    'condition_rating' // String-Repräsentation im Frontend
  ],
  
  // Typkonvertierungen und Transformationen
  typeConversions: {
    'condition_rating': {
      // Konvertiert Frontend-String zu DB-Integer
      toDb: (value) => {
        switch(value) {
          case 'excellent': return 10;
          case 'good': return 8;
          case 'fair': return 6;
          case 'poor': return 4;
          case 'critical': return 2;
          default: return 5;
        }
      },
      // Konvertiert DB-Integer zu Frontend-String
      fromDb: (value) => {
        if (value >= 9) return 'excellent';
        if (value >= 7) return 'good';
        if (value >= 5) return 'fair';
        if (value >= 3) return 'poor';
        return 'critical';
      }
    },
    'pest_presence': {
      toDb: (value) => Boolean(value),
      fromDb: (value) => Boolean(value)
    },
    'disease_presence': {
      toDb: (value) => Boolean(value),
      fromDb: (value) => Boolean(value)
    },
    'structural_damage': {
      toDb: (value) => Boolean(value),
      fromDb: (value) => Boolean(value)
    }
  }
};

/**
 * Mapping für Maßnahmen (tree_actions)
 */
export const actionsMapping = {
  // Gemeinsame Felder (gleicher Name in Frontend und DB)
  commonFields: [
    'tree_id',
    'action_date',
    'action_type',
    'description',
    'performed_by',
    'cost'
  ],
  
  // Felder mit unterschiedlichen Namen in Frontend und DB
  fieldMappings: {
    // Frontend-Name: DB-Name
    'completed': 'follow_up_needed' // Invertiert: completed = !follow_up_needed
  },
  
  // Felder, die nur in der Datenbank existieren
  dbOnlyFields: [
    'result_notes',
    'follow_up_date',
    'created_at',
    'updated_at'
  ],
  
  // Typkonvertierungen und Transformationen
  typeConversions: {
    'cost': {
      toDb: (value) => value !== '' ? parseFloat(value) : null,
      fromDb: (value) => value !== null ? value.toString() : ''
    },
    'follow_up_needed': {
      toDb: (value) => !value, // Invertiert: completed = !follow_up_needed
      fromDb: (value) => !value // Invertiert: completed = !follow_up_needed
    }
  },
  
  // Aktionstypen-Mapping
  actionTypes: [
    { value: 'pruning', label: 'Beschneidung' },
    { value: 'fertilization', label: 'Düngung' },
    { value: 'pest_control', label: 'Schädlingsbekämpfung' },
    { value: 'disease_treatment', label: 'Krankheitsbehandlung' },
    { value: 'support_installation', label: 'Stützinstallation' },
    { value: 'removal', label: 'Entfernung' },
    { value: 'planting', label: 'Pflanzung' },
    { value: 'other', label: 'Sonstige' }
  ]
};

/**
 * Hilfsfunktion zum Konvertieren von Frontend-Daten zum DB-Format
 * @param {Object} data - Frontend-Daten
 * @param {Object} mapping - Mapping-Konfiguration
 * @returns {Object} - Daten im DB-Format
 */
export const convertToDbFormat = (data, mapping) => {
  const result = {};
  
  // Gemeinsame Felder kopieren
  mapping.commonFields.forEach(field => {
    if (data[field] !== undefined) {
      // Typkonvertierung anwenden, falls vorhanden
      if (mapping.typeConversions && mapping.typeConversions[field]) {
        result[field] = mapping.typeConversions[field].toDb(data[field]);
      } else {
        result[field] = data[field];
      }
    }
  });
  
  // Gemappte Felder kopieren
  if (mapping.fieldMappings) {
    Object.entries(mapping.fieldMappings).forEach(([frontendField, dbField]) => {
      if (data[frontendField] !== undefined) {
        // Typkonvertierung anwenden, falls vorhanden
        if (mapping.typeConversions && mapping.typeConversions[dbField]) {
          result[dbField] = mapping.typeConversions[dbField].toDb(data[frontendField]);
        } else {
          result[dbField] = data[frontendField];
        }
      }
    });
  }
  
  return result;
};

/**
 * Hilfsfunktion zum Konvertieren von DB-Daten zum Frontend-Format
 * @param {Object} data - DB-Daten
 * @param {Object} mapping - Mapping-Konfiguration
 * @returns {Object} - Daten im Frontend-Format
 */
export const convertToFrontendFormat = (data, mapping) => {
  const result = {};
  
  // Gemeinsame Felder kopieren
  mapping.commonFields.forEach(field => {
    if (data[field] !== undefined) {
      // Typkonvertierung anwenden, falls vorhanden
      if (mapping.typeConversions && mapping.typeConversions[field]) {
        result[field] = mapping.typeConversions[field].fromDb(data[field]);
      } else {
        result[field] = data[field];
      }
    }
  });
  
  // Gemappte Felder kopieren
  if (mapping.fieldMappings) {
    Object.entries(mapping.fieldMappings).forEach(([frontendField, dbField]) => {
      if (data[dbField] !== undefined) {
        // Typkonvertierung anwenden, falls vorhanden
        if (mapping.typeConversions && mapping.typeConversions[dbField]) {
          result[frontendField] = mapping.typeConversions[dbField].fromDb(data[dbField]);
        } else {
          result[frontendField] = data[dbField];
        }
      }
    });
  }
  
  return result;
};
