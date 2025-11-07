const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const cors = require('cors');

app.use(cors());
app.use(express.static('.'));

// Spieler-Verwaltung
const players = new Map();
const worlds = new Map();

// Standardwelt erstellen
worlds.set('default', {
  blocks: [],
  name: 'Standard-Welt',
  creator: 'System'
});

io.on('connection', (socket) => {
  console.log('Spieler verbunden:', socket.id);

  // Neuer Spieler
  socket.on('player-join', (data) => {
    players.set(socket.id, {
      id: socket.id,
      name: data.name || 'Spieler',
      position: data.position || { x: 0, y: 5, z: 0 },
      rotation: data.rotation || { x: 0, y: 0, z: 0 },
      color: data.color || '#' + Math.floor(Math.random()*16777215).toString(16)
    });

    // Sende aktuelle Spieler an neuen Spieler
    socket.emit('players-update', Array.from(players.values()));
    
    // Sende Welt-Daten
    socket.emit('world-update', worlds.get('default'));

    // Benachrichtige andere Spieler
    socket.broadcast.emit('player-joined', players.get(socket.id));
  });

  // Spieler-Bewegung
  socket.on('player-move', (data) => {
    const player = players.get(socket.id);
    if (player) {
      player.position = data.position;
      player.rotation = data.rotation;
      socket.broadcast.emit('player-moved', {
        id: socket.id,
        position: data.position,
        rotation: data.rotation
      });
    }
  });

  // Block platzieren
  socket.on('block-place', (data) => {
    const world = worlds.get('default');
    world.blocks.push(data);
    io.emit('block-placed', data);
  });

  // Block entfernen
  socket.on('block-remove', (data) => {
    const world = worlds.get('default');
    world.blocks = world.blocks.filter(b => 
      !(b.position.x === data.position.x && 
        b.position.y === data.position.y && 
        b.position.z === data.position.z)
    );
    io.emit('block-removed', data);
  });

  // Spieler verlässt
  socket.on('disconnect', () => {
    console.log('Spieler getrennt:', socket.id);
    players.delete(socket.id);
    socket.broadcast.emit('player-left', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`🎮 Roblox-ähnlicher Server läuft auf Port ${PORT}`);
});

