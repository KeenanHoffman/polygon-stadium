var element = document.body;
var instructions = document.getElementById('instructions');
//Sets up pointer lock
var pointerlockchange = function(event) {
  controls.enabled = true;
  instructions.style.display = 'none';
};
document.addEventListener('pointerlockchange', pointerlockchange, false);
instructions.addEventListener('click', function(event) {
  instructions.style.display = 'none';
  element.requestPointerLock();
});
var hud = {
  healthBar: document.querySelector('#health'),
  playerName: document.querySelector('#player-name'),
  playerScore: document.querySelector('#score'),
  currentRound: document.querySelector('#round'),
  enemiesRemaining: document.querySelector('#enemies-remaining'),
  lifeCounter: document.querySelector('#life-counter')
};
var red = new THREE.MeshLambertMaterial({ //Simple Three material for boxes
  color: 0xff0000,
  opacity: 0.6,
  transparent: true
});
var blue = new THREE.MeshLambertMaterial({ //Simple Three material for boxes
  color: 0x0000ff,
  opacity: 0.6,
  transparent: true
});
var green = new THREE.MeshLambertMaterial({ //Simple Three material for boxes
  color: 0x00ff00,
  opacity: 0.6,
  transparent: true
});


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
  takeDamage: function(enemy) {
    this.health -= enemy.damage;
  },
  die: function() {
    hud.lifeCounter.innerHTML = '100%';
    hud.healthBar.className = 'progress-bar health-bar-blue';
    hud.healthBar.style.width = '100%';
    player.health = 10;
    player.maxHealth = 10;
    player.score = 0;
    hud.playerScore.innerHTML = player.score;
    round.loss = true;
  }
};
var round = {
  number: 0,
  multiplier: 0.9,
  enemiesRemaining: 0,
  willStart: true,
  isOver: false,
  loss: false,
  end: function() {
    enemies = [];
    round.isOver = true;
    gate.toggle();
    startNextRound.innerHTML = 'press ENTER to begin the next round';
    window.addEventListener('keydown', function(e) {
      if (e.keyCode === 13 && !round.enemiesRemaining && player.body.position.z < 15) {
        round.willStart = true;
      }
    });
  },
  start: function() {
    makeEnemies();
    round.number++;
    round.multiplier += 0.1;
    hud.currentRound.innerHTML = 'Round ' + round.number;

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
  lose: function() {
    enemies.forEach(function(enemy) {
      world.remove(enemy.body);
      scene.remove(enemy.mesh);
    });
    enemies = [];
    round.number = 0;
    round.multiplier = 0.9;
    round.enemiesRemaining = 0;
    round.loss = false;
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
initCannon();
initThree();
animate();

function initCannon() {
  world = new CANNON.World(); //Sets up the world physics
  //A quaternion is a way of calculating rotation in 3D space
  //Normalization is a process of taking a vector and chopping its magnitude to one unit
  world.quatNormalizeSkip = 0; //How often to normalize quaternions.
  world.quatNormalizeFast = false; //Approximation of quaternion normalization.

  var solver = new CANNON.GSSolver(); //Iterates over the equations array solving them.
  solver.iterations = 7; //The number of solver iterations determines quality of the constraints in the world.
  solver.tolerance = 0.1; //When tolerance is reached, the system is assumed to be converged.
  world.solver = new CANNON.SplitSolver(solver); //Splits the equations into islands and solves them independently. Can improve performance.
  world.gravity.set(0, -35, 0); //Defines the center of gravity

  // Create a slippery material (friction coefficient = 0.0)
  // physicsMaterial = new CANNON.Material("slipperyMaterial"); //Set up the Material, and pass in it's name
  // var physicsContactMaterial = new CANNON.ContactMaterial( //Defines what happens when two materials meet.
  //   physicsMaterial, //Material 1
  //   physicsMaterial, //Material 2
  //   0.0, // friction
  //   0.3 // restitution
  // );
  // world.addContactMaterial(physicsContactMaterial); //Adds our material interaction to the world

  // Create a sphere to represent our player
  var mass = 5, //determines the objects mass, important if calculating momentum
    radius = 1.3; //sphere radius
  playerShape = new CANNON.Sphere(radius);
  var playerBody = new CANNON.Body({
    mass: mass
  });
  playerBody.addShape(playerShape); //Give our playerBody shape.
  playerBody.position.set(0, 1.3, 28); //places the player in the middle of the scenejust above the floor
  playerBody.linearDamping = 0.9; //Must have to do with how far an object can move into another object. If raised to one the player sinks through the floor, while at 0 the player can jump extremely high.
  player.body = playerBody;
  world.addBody(player.body); //Add our playerBody to the CANNON world.

  // Create a plane
  var groundShape = new CANNON.Plane();
  var groundBody = new CANNON.Body({
    mass: 0
  });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(groundBody);
}

function initThree() {
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  scene = new THREE.Scene();

  var ambient = new THREE.AmbientLight(0x111111);
  scene.add(ambient);

  light = new THREE.SpotLight(0xffffff);
  light.position.set(0, 20, 0);
  light.target.position.set(0, 0, 0);
  scene.add(light);
  light = new THREE.SpotLight(0xffffff);
  light.position.set(12, 12, 12);
  light.target.position.set(0, 0, 0);
  scene.add(light);
  light = new THREE.SpotLight(0xffffff);
  light.position.set(-12, 12, 12);
  light.target.position.set(0, 0, 0);
  scene.add(light);
  light = new THREE.SpotLight(0xffffff);
  light.position.set(12, 12, -12);
  light.target.position.set(0, 0, 0);
  scene.add(light);
  light = new THREE.SpotLight(0xffffff);
  light.position.set(-12, 12, -12);
  light.target.position.set(0, 0, 0);
  scene.add(light);
  light = new THREE.PointLight(0xffffff, 4, 100);
  light.position.set(0, 3, 23);
  scene.add(light);
  light = new THREE.PointLight(0xffffff, 4, 100);
  light.position.set(0, 3, -23);
  scene.add(light);

  controls = new PointerLockControls(camera, player.body);
  scene.add(controls.getObject());

  hud.playerName.innerHTML = 'KOFF01';

  startNextRound = document.createElement('h1');
  startNextRound.innerHTML = '';
  startNextRound.id = 'next-round';
  element.appendChild(startNextRound);

  ///////////////////////////////////////////////////////
  //Begin Text Example
  ///////////////////////////////////////////////////////
  canvas1 = document.createElement('canvas');
  context1 = canvas1.getContext('2d');
  context1.font = "Bold 40px Arial";
  context1.fillStyle = "rgba(255,0,0,0.95)";
  context1.fillText('Round ' + round.number, 70, 50);

  // canvas contents will be used for a texture
  var texture1 = new THREE.Texture(canvas1);
  texture1.needsUpdate = true;

  var material1 = new THREE.MeshBasicMaterial({
    map: texture1,
    side: THREE.DoubleSide
  });
  material1.transparent = true;

  mesh1 = new THREE.Mesh(
    new THREE.PlaneGeometry(canvas1.width / 20, canvas1.height / 20),
    material1
  );
  mesh1.position.set(0, 10, 0);
  scene.add(mesh1);
  ///////////////////////////////////////////////////////
  //End Text Example
  ///////////////////////////////////////////////////////

  // floor
  var floorGeometry = new THREE.PlaneGeometry(300, 300, 50, 50);
  floorGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  var floorMaterial = new THREE.MeshLambertMaterial({
    color: 0x001122
  });
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  scene.add(floor);

  //renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  element.appendChild(renderer.domElement);

  //Window resize handler
  window.addEventListener('resize', onWindowResize, false);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  //Make arena
  makeStadium();
}

function animate() {
  requestAnimationFrame(animate);
  if (!pause) { //Check if game is paused, do not proggress animation if game is paused
    if (controls.enabled) {
      count++;
      world.step(dt); //Update world dt(1/60)th of a second
      // Update ball positions
      for (var i = 0; i < projectiles.length; i++) {
        //Update ballMeshes(view) position to equal the ballBody(physics)
        projectiles[i].mesh.position.copy(projectiles[i].body.position);
        //Update ballMeshes(view) quaternion to equal the ballBodys(physics) for 3D rotation calculation
        projectiles[i].mesh.quaternion.copy(projectiles[i].body.quaternion);

        projectiles[i].duration--;
        //If projectile duration is up remove it
        if (projectiles[i].duration === 0) {
          projectiles[i].remove();
          i--;
        }
      }
      // Update box positions
      environmentObjects.forEach(function(environmentObject) {
        //Update boxMeshes(view) position to equal the boxBodys(physics)
        environmentObject.mesh.position.copy(environmentObject.body.position);
        //Update boxMeshes(view) quaternion to equal the boxBodys(physics) for 3D rotation calculation
        environmentObject.mesh.quaternion.copy(environmentObject.body.quaternion);
      });
      round.enemiesRemaining = 0;
      for (var k = 0; k < enemies.length; k++) {
        if (!enemies[k].direction || count % 60 === 0) {
          enemies[k].direction = Math.random();
        }
        enemies[k].move();
        if (enemies[k].health <= 0 && !enemies[k].isDead) {
          enemies[k].die();
        }
        if (enemies[k].health / enemies[k].maxHealth > 0.67) {
          enemies[k].mesh.material = green;
        } else if (enemies[k].health / enemies[k].maxHealth > 0.34) {
          enemies[k].mesh.material = blue;
        } else {
          enemies[k].mesh.material = red;
        }
        enemies[k].mesh.position.copy(enemies[k].body.position);
        if (!enemies[k].isDead) {
          round.enemiesRemaining++;
        }
      }
      hud.enemiesRemaining.innerHTML = 'Enemies Remaining ' + round.enemiesRemaining;
      if (!round.enemiesRemaining && !round.isOver) {
        round.end();
      }
      if (round.willStart && player.body.position.z < 15) {
        round.start();
      }
      if (round.loss) {
        round.lose();
      }
      if (count === 240) {
        count = 0;
      }
    }
    //Update controls with time for delta
    controls.update(Date.now() - time);
    //Render the updated scene
    renderer.render(scene, camera);
    //Set new time for delta
    time = Date.now();
  }
}

var ballShape = new CANNON.Sphere(0.2); //Set up a Cannon sphere as the shape, takes in radius
var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
var shootDirection = new THREE.Vector3(); //Vector to be used to set the direction of shot balls
var shootSpeed = 50; //speed of the shot

function getShootDir(targetVec) {
  var vector = targetVec; //Set a local vectorso that the original is not manipulated until we are ready
  targetVec.set(0, 0, 0); //Set the target vector to the middle of the player veiw
  vector.unproject(camera); //
  //Make a ray from the playerBody to the new vector
  var ray = new THREE.Ray(player.body.position, vector.sub(player.body.position).normalize());
  //Set the targetVec to equal the new rays direction
  targetVec.copy(ray.direction);
}

window.addEventListener("click", function(event) {
  if (controls.enabled === true) {
    //Set up x, y, and z at the player's current position
    var x = player.body.position.x;
    var y = player.body.position.y;
    var z = player.body.position.z;
    var ballBody = new CANNON.Body({ //Set up a body(cannon) for the ball
      mass: 1
    });
    var ballMaterial = new THREE.MeshPhongMaterial({ //give the ball a material
      color: 0xff9922
    });
    ballBody.addShape(ballShape); //Add Shape to ball body
    ballBody.projectileId = projectileNumber;

    var ballMesh = new THREE.Mesh(ballGeometry, ballMaterial); //Create the ballMesh with geometry and material
    world.addBody(ballBody); //Add the body to the Cannon world
    scene.add(ballMesh); //Add the mesh to the Three scene
    projectiles.push({
      body: ballBody,
      mesh: ballMesh,
      duration: 180,
      remove: function() {
        world.remove(this.body);
        scene.remove(this.mesh);
        projectiles.splice(projectiles.indexOf(this), 1);
      }
    });
    getShootDir(shootDirection); //Pass in a vector
    //Set the velocity of the ball that is shot
    ballBody.velocity.set(shootDirection.x * shootSpeed,
      shootDirection.y * shootSpeed,
      shootDirection.z * shootSpeed);
    // Move the ball just outside the player sphere in the direction of the shot
    x += shootDirection.x * (playerShape.radius * 1.02 + ballShape.radius);
    y += shootDirection.y * (playerShape.radius * 1.02 + ballShape.radius);
    z += shootDirection.z * (playerShape.radius * 1.02 + ballShape.radius);
    ballBody.position.set(x, y, z); //Set the starting position of the ballMesh
    ballMesh.position.set(x, y, z); //Set the starting position of the ballBody
    projectileNumber++;
  }
});

function makeStadium() {
  function createStadiumWall(vector, halfExtents, material, rotation) {
    //Make Cannon Body
    var wallBody = new CANNON.Body({ //Set up Cannon body for physics calculation
      mass: 10000
    });
    var wallShape = new CANNON.Box(halfExtents);
    wallBody.addShape(wallShape);

    //Make Three Mesh
    var wallGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
    var wallMesh = new THREE.Mesh(wallGeometry, material);

    //Set Cannon Body and Three Mesh position
    wallBody.position.set(vector.x, vector.y, vector.z);
    wallMesh.position.set(vector.x, vector.y, vector.z);

    //Rotate Cannon Body and Three Mesh
    if (rotation) {
      wallBody.quaternion.setFromAxisAngle(rotation.vector, rotation.degree);
      wallMesh.quaternion.setFromAxisAngle(rotation.vector, rotation.degree);
    }

    //Return Cannon Body and Three Mesh
    return {
      body: wallBody,
      mesh: wallMesh
    };
  }

  function createStadiumPillar(vector, diameter, height, material, rotation) {
    //Make Three Mesh
    var pillarGeometry = new THREE.CylinderGeometry(diameter, diameter, height, 32);
    var pillarMesh = new THREE.Mesh(pillarGeometry, material);

    //Set Three Mesh position
    pillarMesh.position.set(vector.x, vector.y, vector.z);

    //Rotate Three Mesh
    if (rotation) {
      pillarMesh.quaternion.setFromAxisAngle(rotation.vector, rotation.degree);
    }

    //Return Three Mesh
    return pillarMesh;
  }

  function createStadiumGate() {
    var bars = [{
      position: new THREE.Vector3(0, 3, 18),
      height: 6.5
    }, {
      position: new THREE.Vector3(2, 3, 18),
      height: 6.5
    }, {
      position: new THREE.Vector3(-2, 3, 18),
      height: 6.5
    }, {
      position: new THREE.Vector3(1, 3, 18),
      height: 6.5
    }, {
      position: new THREE.Vector3(-1, 3, 18),
      height: 6.5
    }];
    bars.forEach(function(bar) {
      var pillarMaterial = new THREE.MeshPhongMaterial({
        color: 0xffff00
      });
      var pillar = createStadiumPillar(bar.position, 0.2, bar.height, pillarMaterial);
      scene.add(pillar);
      gate.bars.push(pillar);
    });
    var wallBody = new CANNON.Body({ //Set up Cannon body for physics calculation
      mass: 10000
    });
    var wallShape = new CANNON.Box(new CANNON.Vec3(2.8, 2.9, 1));
    wallBody.addShape(wallShape);
    wallBody.position.set(0, 3, 18);
    world.addBody(wallBody);
    gate.body = wallBody;
  }
  createStadiumGate();

  var wallMaterial = new THREE.MeshLambertMaterial({
    color: 0x111122
  });
  var walls = [{
    position: new THREE.Vector3(0, 12, -20),
    size: new CANNON.Vec3(7, 12, 3)
  }, {
    position: new THREE.Vector3(-20, 12, 0),
    size: new CANNON.Vec3(3, 12, 7)
  }, {
    position: new THREE.Vector3(20, 12, 0),
    size: new CANNON.Vec3(3, 12, 7)
  }, {
    position: new THREE.Vector3(14, 12, 13.9),
    size: new CANNON.Vec3(7.2, 12, 3),
    rotation: {
      vector: new CANNON.Vec3(0, 1, 0),
      degree: (Math.PI / 4)
    }
  }, {
    position: new THREE.Vector3(-14, 12, 13.9),
    size: new CANNON.Vec3(7.2, 12, 3),
    rotation: {
      vector: new CANNON.Vec3(0, 1, 0),
      degree: -(Math.PI / 4)
    }
  }, {
    position: new THREE.Vector3(-14, 12, -13.9),
    size: new CANNON.Vec3(7.2, 12, 3),
    rotation: {
      vector: new CANNON.Vec3(0, 1, 0),
      degree: (Math.PI / 4)
    }
  }, {
    position: new THREE.Vector3(14, 12, -13.9),
    size: new CANNON.Vec3(7.2, 12, 3),
    rotation: {
      vector: new CANNON.Vec3(0, 1, 0),
      degree: -(Math.PI / 4)
    }
  }, {
    position: new THREE.Vector3(-4.7, 3, 20.9),
    size: new CANNON.Vec3(2, 3, 4)
  }, {
    position: new THREE.Vector3(4.7, 3, 20.9),
    size: new CANNON.Vec3(2, 3, 4)
  }, {
    position: new THREE.Vector3(0, 15, 20.7),
    size: new CANNON.Vec3(7.1, 9, 4)
  }];
  walls.forEach(function(wallConfig) {
    var wall = createStadiumWall(wallConfig.position, wallConfig.size, wallMaterial, wallConfig.rotation);
    scene.add(wall.mesh);
    world.addBody(wall.body);
    environmentObjects.push({
      mesh: wall.mesh,
      body: wall.body
    });
  });

  var pillarMaterial = new THREE.MeshPhongMaterial({
    color: 0xffff00
  });
  var pillarPositions = [
    new THREE.Vector3(17.5, 0, 6.5),
    new THREE.Vector3(17.5, 0, -6.5),
    new THREE.Vector3(-17.5, 0, -6.5),
    new THREE.Vector3(-17.5, 0, 6.5),
    new THREE.Vector3(6.5, 0, -17.5),
    new THREE.Vector3(-6.5, 0, -17.5),
    new THREE.Vector3(6.5, 0, 17.5),
    new THREE.Vector3(-6.5, 0, 17.5)
  ];
  pillarPositions.forEach(function(position) {
    var pillar = createStadiumPillar(position, 1, 48, pillarMaterial);
    scene.add(pillar);
  });
}

function makeEnemies() {
  function createCubeEnemy(vector, size, material, id) {
    //Make Cannon Body
    var halfExtents = new CANNON.Vec3(size / 2, size / 2, size / 2);
    var cubeShape = new CANNON.Box(halfExtents);
    var cubeBody = new CANNON.Body({
      mass: 20
    });
    cubeBody.addShape(cubeShape);

    //Make Three Mesh
    var cubeGeometry = new THREE.BoxGeometry(size, size, size);
    var cubeMesh = new THREE.Mesh(cubeGeometry, material);

    //Set Cannon Body and Three Mesh position
    cubeBody.position.set(vector.x, vector.y, vector.z);
    cubeMesh.position.set(vector.x, vector.y, vector.z);

    //Set Base Damage and Health
    cubeBody.cubeEnemyId = id;

    //Set up Enemy Collision
    cubeBody.addEventListener("collide", function(event) {
      if (event.body.projectileId >= 0) {
        enemies[event.target.cubeEnemyId].takeDamage();
      }
    });

    //Return Cannon Body and Three Mesh
    return {
      body: cubeBody,
      mesh: cubeMesh
    };
  }

  var cubeMaterial = new THREE.MeshLambertMaterial({ //Simple Three material for boxes
    color: 0x00ff00,
    opacity: 0.6,
    transparent: true
  });
  var cubePositions = [
    new THREE.Vector3(5, 1, 5),
    new THREE.Vector3(-5, 1, 5),
    new THREE.Vector3(5, 1, -5),
    new THREE.Vector3(-5, 1, -5),
    new THREE.Vector3(0, 1, 10),
    new THREE.Vector3(0, 1, -10),
    new THREE.Vector3(10, 1, 0),
    new THREE.Vector3(-10, 1, 0)
  ];
  cubePositions.forEach(function(position, index) {
    var cubeEnemy = createCubeEnemy(position, 2, cubeMaterial, index);
    scene.add(cubeEnemy.mesh);
    world.addBody(cubeEnemy.body);
    enemies.push({
      body: cubeEnemy.body,
      mesh: cubeEnemy.mesh,
      speed: 0.05 * round.multiplier,
      maxHealth: 3 * round.multiplier,
      health: 3 * round.multiplier,
      damage: 1 * round.multiplier,
      isDead: false,
      move: function() {
        switch (true) {
          case (this.direction < 0.26):
            this.body.position.x += this.speed;
            break;
          case (this.direction < 0.51):
            this.body.position.z += this.speed;
            break;
          case (this.direction < 0.76):
            this.body.position.x -= this.speed;
            break;
          case (this.direction < 1):
            this.body.position.z -= this.speed;
            break;
        }
        this.body.position.y += 0.1;
      },
      takeDamage: function() {
        this.health -= player.damage;
        player.score += Math.round(100 * round.multiplier);
        hud.playerScore.innerHTML = player.score;
      },
      die: function() {
        this.isDead = true;
        scene.remove(this.mesh);
        world.remove(this.body);
      }
    });
  });
}
