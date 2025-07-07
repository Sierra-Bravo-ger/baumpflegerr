# Baumpflegerr

Baumpflegerr ist eine moderne Webanwendung zur Verwaltung und Überwachung von Bäumen in städtischen und ländlichen Umgebungen. Die Anwendung ermöglicht es Baumpflegern, Gärtnern und Landschaftsarchitekten, detaillierte Informationen über Bäume zu erfassen, zu verfolgen und zu analysieren.

## Funktionen

- **Baumverwaltung**: Erfassung und Verwaltung von Bäumen mit detaillierten Informationen
- **Standortverwaltung**: Verwaltung von Baumstandorten mit Adresse, Stadt, PLZ und Koordinaten
- **Metriken**: Erfassung und Verfolgung von Baummetriken wie Höhe, Durchmesser, Kronendurchmesser, etc.
- **Inspektionen**: Dokumentation von Bauminspektionen mit Bewertungen und Notizen
- **Maßnahmen**: Erfassung von durchgeführten Maßnahmen wie Beschneidung, Behandlung, etc.
- **Offline-Unterstützung**: Erfassung von Daten auch ohne Internetverbindung
- **Responsive Design**: Optimiert für Desktop und mobile Geräte

## Technologie-Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Datenbank**: PostgreSQL
- **API**: RESTful API

## Installation und Setup

### Voraussetzungen

- Node.js v20.19.3 oder höher
- PostgreSQL 12 oder höher
- npm oder pnpm

### Backend-Setup

1. Navigieren Sie zum Server-Verzeichnis:
   ```bash
   cd server
   ```

2. Installieren Sie die Abhängigkeiten:
   ```bash
   npm install
   ```

3. Erstellen Sie eine `.env`-Datei im Server-Verzeichnis mit folgenden Umgebungsvariablen:
   ```
   DB_HOST=your_db_host
   DB_PORT=your_db_port
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   PORT=3001
   ```

4. Initialisieren Sie die Datenbank mit dem SQL-Schema:
   ```bash
   psql -U your_db_user -d your_db_name -f schema.sql
   ```

5. Starten Sie den Server:
   ```bash
   npm run dev
   ```

### Frontend-Setup

1. Navigieren Sie zum Frontend-Verzeichnis:
   ```bash
   cd baumpflegerr
   ```

2. Installieren Sie die Abhängigkeiten:
   ```bash
   npm install
   ```

3. Starten Sie den Entwicklungsserver:
   ```bash
   npm run dev
   ```

4. Öffnen Sie die Anwendung in Ihrem Browser unter `http://localhost:5173`

## Entwicklung

### Projektstruktur

```
baumpflegerr/
├── server/              # Backend-Code
│   ├── routes/          # API-Routen
│   ├── db.js            # Datenbankverbindung
│   └── index.js         # Server-Einstiegspunkt
├── baumpflegerr/        # Frontend-Code
│   ├── public/          # Statische Dateien
│   └── src/             # Quellcode
│       ├── components/  # React-Komponenten
│       ├── services/    # API-Services
│       └── App.jsx      # Hauptanwendungskomponente
└── README.md            # Projektdokumentation
```

### API-Endpunkte

- `/api/trees` - CRUD-Operationen für Bäume
- `/api/metrics` - CRUD-Operationen für Baummetriken
- `/api/locations` - CRUD-Operationen für Standorte
- `/api/species` - CRUD-Operationen für Baumarten

## Lizenz

Dieses Projekt steht unter der [Lizenz Ihrer Wahl]. Siehe die LICENSE-Datei für Details.

## Mitwirkende

- [Ihr Name/Team]

## Kontakt

Bei Fragen oder Anregungen wenden Sie sich bitte an [Ihre Kontaktinformationen].
