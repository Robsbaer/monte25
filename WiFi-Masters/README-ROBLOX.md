# 🎮 RoBlock - Roblox-ähnliche 3D-Plattform

Eine vollständige, webbasierte 3D-Spielplattform ähnlich wie Roblox mit Multiplayer-Unterstützung!

## ✨ Features

### 🎯 Kern-Features
- **3D-Welt**: Vollständig begehbare 3D-Umgebung mit Three.js
- **Multiplayer**: Echtzeit-Multiplayer mit Socket.io
- **Bauen**: Platziere und entferne Blöcke in verschiedenen Farben
- **Spielersteuerung**: Flüssige First-Person-Steuerung mit Springen
- **Avatar-System**: Jeder Spieler hat einen eigenen Avatar
- **Online-Spieler**: Sehe andere Spieler in Echtzeit

### 🎨 Design & UI
- Modernes, schönes UI Design
- Farbpalette mit 16 Farben
- Werkzeug-Panel mit verschiedenen Modi
- Spielerliste
- Steuerungsanleitung
- Fadenkreuz für präzises Bauen

### 🎮 Steuerung
- **W, A, S, D**: Bewegen
- **Maus**: Umsehen
- **Leertaste**: Springen
- **Linksklick**: Block platzieren
- **Rechtsklick**: Block entfernen
- **B**: Bau-Modus
- **X**: Lösch-Modus
- **C**: Farb-Palette öffnen
- **V**: Bewegungs-Modus

## 🚀 Installation & Start

### Option 1: Mit Multiplayer-Server

1. **Abhängigkeiten installieren**:
```bash
npm install
```

2. **Server starten**:
```bash
npm start
```

3. **Im Browser öffnen**:
```
http://localhost:3000/roblox-platform.html
```

4. **Mehrere Spieler**:
   - Öffne mehrere Browser-Tabs
   - Jeder Tab ist ein eigener Spieler
   - Alle sehen sich gegenseitig in Echtzeit!

### Option 2: Offline (Einzelspieler)

Öffne einfach `roblox-platform.html` direkt im Browser - es funktioniert auch ohne Server!

## 📁 Dateistruktur

```
monte25/
├── roblox-platform.html    # Haupt-Spiel (Client)
├── server.js               # Multiplayer-Server
├── package.json            # Node.js Abhängigkeiten
└── README-ROBLOX.md       # Diese Datei
```

## 🛠️ Technologien

- **Frontend**:
  - Three.js (3D-Grafik)
  - Socket.io-client (Multiplayer)
  - Vanilla JavaScript
  - Modern CSS3

- **Backend**:
  - Node.js
  - Express.js
  - Socket.io (WebSocket)

## 🎨 Features im Detail

### Bau-System
- 16 verschiedene Farben
- Präzises Block-Platzierungs-System
- Blöcke werden automatisch synchronisiert
- Kollisions-Erkennung

### Multiplayer
- Unbegrenzte Spieleranzahl
- Echtzeit-Positionsübertragung
- Synchronisierte Welt
- Spielernamen und Avatare
- Online-Spielerliste

### Physik
- Schwerkraft
- Springen
- Bodenkollision
- Flüssige Bewegung

### Grafik
- Schöne Schatten
- Nebel-Effekt
- Gitter auf dem Boden
- Tag/Nacht-Simulation möglich

## 🔧 Anpassungen

### Farben ändern
In `roblox-platform.html` Zeile ~274:
```javascript
const colors = [
    '#FF0000', '#00FF00', // Füge deine Farben hinzu
];
```

### Bewegungsgeschwindigkeit
In `roblox-platform.html` Zeile ~555:
```javascript
const speed = 10; // Ändere die Geschwindigkeit
```

### Welt-Größe
In `roblox-platform.html` Zeile ~333:
```javascript
const groundGeometry = new THREE.PlaneGeometry(200, 200);
```

## 🎯 Zukünftige Erweiterungen

- [ ] Welt speichern/laden
- [ ] Verschiedene Block-Typen (Glas, Holz, Stein)
- [ ] Tools und Items
- [ ] Chat-System
- [ ] Spielmodi (Creative, Survival)
- [ ] NPCs und Gegner
- [ ] Inventar-System
- [ ] Weltgenerator
- [ ] Tag/Nacht-Zyklus
- [ ] Wetter-Effekte

## 🐛 Bekannte Probleme

- Spieler können durch Wände laufen (keine Block-Kollision)
- Keine Persistenz (Welt wird nicht gespeichert)

## 📝 Lizenz

MIT License - Frei verwendbar für Bildungszwecke!

## 🎉 Viel Spaß beim Bauen!

Erstelle deine eigenen Welten und spiele mit Freunden!

