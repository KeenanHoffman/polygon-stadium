var gameState = {
  player: {
    maxHealth: 10,
    health: 10,
    damage: 1,
    score: 0,
    die: function() {
      healthBar.style.width = '100%';
      player.health = 10;
      player.maxHealth = 10;
      player.score = 0;
      playerScore.innerHTML = player.score;
      round.lose = true;
    },
  },
  round: {
    number: 0,
    multiplier: 0.9,
    enemiesRemaining: 0,
    willStart: true,
    isOver: false,
    lose: false,
    start: function() {
      makeEnemies();
      round.number++;
      round.multiplier += 0.1;
      currentRound.innerHTML = 'Round ' + round.number;

      context1.clearRect(0, 0, canvas1.width, canvas1.height);
      context1.fillText('Round ' + round.number, 70, 50);
      var texture1 = new THREE.Texture(canvas1);
      texture1.needsUpdate = true;
      mesh1.material.map = texture1;

      gate.toggle();
      round.willStart = false;
      round.isOver = false;
      startNextRound.innerHTML = '';
    }
  }
}

var world, physicsMaterial;
var camera, scene, renderer;
var environmentObjects = [];
var projectiles = [];
var projectileNumber = 0;
var enemies = [];
var boxGeometry, boxMaterial, box;
var floorGeometry, floorMaterial, floor;
var player = {
  maxHealth: 10,
  health: 10,
  damage: 1,
  score: 0,
  die: function() {
    healthBar.style.width = '100%';
    player.health = 10;
    player.maxHealth = 10;
    player.score = 0;
    playerScore.innerHTML = player.score;
    round.lose = true;
  }
};
var round = {
  number: 0,
  multiplier: 0.9,
  enemiesRemaining: 0,
  willStart: true,
  isOver: false,
  lose: false,
  start: function() {
    makeEnemies();
    round.number++;
    round.multiplier += 0.1;
    currentRound.innerHTML = 'Round ' + round.number;

    context1.clearRect(0, 0, canvas1.width, canvas1.height);
    context1.fillText('Round ' + round.number, 70, 50);
    var texture1 = new THREE.Texture(canvas1);
    texture1.needsUpdate = true;
    mesh1.material.map = texture1;

    gate.toggle();
    round.willStart = false;
    round.isOver = false;
    startNextRound.innerHTML = '';
  },
  reset: function() {
    round.number = 0;
    round.multiplier = 0.9;
    round.enemiesRemaining = 0;
    round.lose = false;
  }
};
var gate = {
  bars: [],
  isOpen: false,
  toggle: function() {
    if (gate.isOpen) {
      gate.bars.forEach(function(bar) {
        scene.add(bar);
      });
      world.add(gate.body);
      gate.isOpen = false;
    } else {
      gate.bars.forEach(function(bar) {
        scene.remove(bar);
      });
      world.remove(gate.body);
      gate.isOpen = true;
    }
  }
};
var playerShape;
var count = 0;
var controls;
var time = Date.now();
var dt = 1 / 60;
var pause = false;
var vector = new THREE.Vector3(0, 0, 0);
