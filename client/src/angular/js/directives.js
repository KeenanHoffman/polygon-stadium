'use strict';

angular.module('polygonStadiumApp')
  .directive('beginGame', ['userService', beginGameLogic]);

function beginGameLogic(userService) {
  var _userService = userService;
  return {
    scope: {
      save: '=',
      saveId: '@'
    },
    link: function($scope, $elem, $attr) {
      var gameId = $scope.save.id;
      var element = document.body;
      var instructions = document.getElementById('instructions');
      var startNextRound;
      var context1;
      var canvas1;
      var mesh1;
      //Sets up pointer lock
      var pointerlockchange = function() {
        if (document.pointerLockElement === element) {
          controls.enabled = true;
          instructions.style.display = 'none';
          document.querySelector('.navbar').style.display = 'none';
        } else {
          controls.enabled = false;
          instructions.style.display = 'block';
          document.querySelector('.navbar').style.display = 'inline';
        }
      };
      document.addEventListener('pointerlockchange', pointerlockchange, false);
      instructions.addEventListener('click', function() {
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
        color: 0xD50000,
        opacity: 0.6,
        transparent: true
      });
      var blue = new THREE.MeshLambertMaterial({ //Simple Three material for boxes
        color: 0x304FFE,
        opacity: 0.6,
        transparent: true
      });
      var green = new THREE.MeshLambertMaterial({ //Simple Three material for boxes
        color: 0x00C853,
        opacity: 0.6,
        transparent: true
      });

      var world; //physicsMaterial;
      var camera, scene, renderer;
      var environmentObjects = [];
      var projectiles = [];
      var projectileNumber = 0;
      var enemies = [];
      // var boxGeometry, boxMaterial, box;
      // var floorGeometry, floorMaterial, floor;
      var player = {
        maxHealth: 10,
        health: 10,
        damage: 1,
        score: 0,
        level: 1, //not yet used
        skillPoints: [], //not yet used
        exp: 0, //not yet used
        money: 0, //not yet used
        items: [], //not yet used
        takeDamage: function(enemy) {
          this.health -= enemy.damage;
        },
        die: function() {
          hud.lifeCounter.innerHTML = '100%';
          hud.healthBar.className = 'progress-bar health-bar-blue';
          hud.healthBar.style.width = '100%';
          player.health = 10;
          player.maxHealth = 10;
          player.finalScore = player.score;
          player.score = 0;
          hud.playerScore.innerHTML = player.score;
          round.loss = true;
        }
      };
      var shouldSave = false;
      var round = {
        number: 0,
        multiplier: 1,
        enemiesRemaining: 0,
        willStart: true,
        isOver: false,
        loss: false,
        end: function() {
          enemies = [];
          player.health = player.maxHealth;
          hud.lifeCounter.innerHTML = '100%';
          hud.healthBar.className = 'progress-bar health-bar-blue';
          hud.healthBar.style.width = '100%';
          round.isOver = true;
          gate.toggle();
          round.multiplier += round.number / 10;
          if (shouldSave) {
            startNextRound.innerHTML = 'press ENTER to begin the next round';
            //use setTimeout to allow scoring to finish
            setTimeout(function() {
              var userId = _userService.getUser().id;
              if (userId !== 'none') {
                $.ajax({
                    type: "POST",
                    url: 'http://localhost:3000/users/' + userId + '/save-game',
                    data: {
                      saveId: gameId,
                      score: player.finalScore || player.score,
                      save: JSON.stringify(saveState)
                    },
                    headers: {
                      Authorization: 'Bearer ' + window.sessionStorage.token
                    }
                  })
                  .done(function(data) { //add a popup letting the user know the game has been saved.
                    if (data.newGameId) {
                      gameId = data.newGameId;
                    }
                    player.finalScore = undefined;
                  });
              }
            }, 0);
          }
          shouldSave = true;
          window.addEventListener('keydown', function(e) {
            if (controls.enabled) {
              if (e.keyCode === 13 && !round.enemiesRemaining && player.body.position.z < 15) {
                round.willStart = true;
              }
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
          mesh1.material.map.minFilter = THREE.LinearFilter;

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
          if (round.number % 5 === 0) {
            round.number -= 5;
          } else {
            for (round.number; round.number % 5 !== 0; round.number--);

          }
          round.multiplier = 1;
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
      if ($scope.save !== 'new') {
        round.number += Number($scope.save.saved_game.round);
        player.score = Number($scope.save.saved_game.score);
        hud.playerScore.innerHTML = player.score;
        hud.currentRound.innerHTML = 'Round ' + round.number;
      }
      var saveState;
      var playerShape;
      var count = 0;
      var controls;
      var time = Date.now();
      var dt = 1 / 60;

      var PointerLockControls = function(camera, cannonBody) {
        var velocityFactor = 0.2;
        var jumpVelocity = 20;
        var scope = this;
        var pitchObject = new THREE.Object3D();
        pitchObject.add(camera);
        var yawObject = new THREE.Object3D();
        yawObject.position.x = 0;
        yawObject.position.y = 1.3;
        yawObject.position.z = 28;
        yawObject.add(pitchObject);
        var quat = new THREE.Quaternion();
        var moveForward = false;
        var moveBackward = false;
        var moveLeft = false;
        var moveRight = false;
        var canJump = false;
        var contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
        var upAxis = new CANNON.Vec3(0, 1, 0);
        cannonBody.addEventListener("collide", function(event) {
          //Check if an enemy collided with the player
          var healthPercentage = Math.round(player.health / player.maxHealth * 100);
          if (event.body.cubeEnemyId) {
            player.takeDamage(enemies[event.body.cubeEnemyId]);
            if (healthPercentage <= 0) {
              player.die();
              hud.lifeCounter.innerHTML = '100%';
            } else {
              hud.healthBar.style.width = healthPercentage + '%';
              hud.lifeCounter.innerHTML = healthPercentage + '%';
              switch (true) {
                case (healthPercentage < 21):
                  hud.healthBar.className = 'progress-bar health-bar-red';
                  break;
                case (healthPercentage < 41):
                  hud.healthBar.className = 'progress-bar health-bar-orange';
                  break;
                case (healthPercentage < 61):
                  hud.healthBar.className = 'progress-bar health-bar-yellow';
                  break;
                case (healthPercentage < 81):
                  hud.healthBar.className = 'progress-bar health-bar-green';
                  break;
                case (healthPercentage < 100):
                  hud.healthBar.className = 'progress-bar health-bar-blue';
                  break;
              }
            }
          }
          var contact = event.contact;
          // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
          // We do not yet know which one is which! Let's check.
          if (contact.bi.id === cannonBody.id) { // bi is the player body, flip the contact normal
            contact.ni.negate(contactNormal);
          } else {
            contactNormal.copy(contact.ni);
          } // bi is something else. Keep the normal as it is

          // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
          if (contactNormal.dot(upAxis) > 0.5) { // Use a "good" threshold value between 0 and 1 here!
            canJump = true;
          }
        });

        var velocity = cannonBody.velocity;

        var PI_2 = Math.PI / 2;

        var onMouseMove = function(event) {
          if (scope.enabled === false) return;

          var movementX = event.movementX || event.mozMovementX || 0;
          var movementY = event.movementY || event.mozMovementY || 0;

          yawObject.rotation.y -= movementX * 0.002;
          pitchObject.rotation.x -= movementY * 0.002;
          pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
        };

        var onKeyDown = function(event) {
          switch (event.keyCode) {
            case 38: // up
            case 87: // w
              moveForward = true;
              break;
            case 37: // left
            case 65: // a
              moveLeft = true;
              break;
            case 40: // down
            case 83: // s
              moveBackward = true;
              break;
            case 39: // right
            case 68: // d
              moveRight = true;
              break;
            case 32: // space
              if (canJump === true) velocity.y = jumpVelocity;
              canJump = false;
              break;
          }
        };

        var onKeyUp = function(event) {
          switch (event.keyCode) {
            case 38: // up
            case 87: // w
              moveForward = false;
              break;
            case 37: // left
            case 65: // a
              moveLeft = false;
              break;
            case 40: // down
            case 83: // a
              moveBackward = false;
              break;
            case 39: // right
            case 68: // d
              moveRight = false;
              break;
          }
        };
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        //Disabled by default
        this.enabled = false;

        this.getObject = function() {
          return yawObject;
        };

        // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
        var inputVelocity = new THREE.Vector3();
        var euler = new THREE.Euler();
        this.update = function(delta) {
          if (scope.enabled === false) return;
          delta *= 0.1;
          inputVelocity.set(0, 0, 0);
          if (moveForward) inputVelocity.z = -velocityFactor * delta;
          if (moveBackward) inputVelocity.z = velocityFactor * delta;
          if (moveLeft) inputVelocity.x = -velocityFactor * delta;
          if (moveRight) inputVelocity.x = velocityFactor * delta;
          // Convert velocity to world coordinates
          euler.x = pitchObject.rotation.x;
          euler.y = yawObject.rotation.y;
          euler.order = "XYZ";
          quat.setFromEuler(euler);
          inputVelocity.applyQuaternion(quat);
          // Add to the object
          velocity.x += inputVelocity.x;
          velocity.z += inputVelocity.z;
          yawObject.position.copy(cannonBody.position);
        };
      };

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
          radius = 1.5;//1.3; //sphere radius
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

        var light = new THREE.SpotLight(0x424242);
        light.position.set(0, 20, 0);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        light = new THREE.SpotLight(0x424242);
        light.position.set(12, 12, 12);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        light = new THREE.SpotLight(0x424242);
        light.position.set(-12, 12, 12);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        light = new THREE.SpotLight(0x424242);
        light.position.set(12, 12, -12);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        light = new THREE.SpotLight(0x424242);
        light.position.set(-12, 12, -12);
        light.target.position.set(0, 0, 0);
        scene.add(light);
        light = new THREE.PointLight(0x424242, 4, 100);
        light.position.set(0, 3, 23);
        scene.add(light);
        light = new THREE.PointLight(0x424242, 4, 100);
        light.position.set(0, 3, -23);
        scene.add(light);

        controls = new PointerLockControls(camera, player.body);
        scene.add(controls.getObject());
        var username = _userService.getUser().username;
        // username = JSON.parse(username).username;
        if (username.length >= 10) {
          hud.playerName.innerHTML = '<h2>' + username + '</h2>';
        } else {
          hud.playerName.innerHTML = username;
        }

        startNextRound = document.createElement('h1');
        startNextRound.innerHTML = '';
        startNextRound.id = 'next-round';
        document.querySelector('#game').appendChild(startNextRound);

        ///////////////////////////////////////////////////////
        //Begin Text Example
        ///////////////////////////////////////////////////////
        canvas1 = document.createElement('canvas');
        context1 = canvas1.getContext('2d');
        context1.font = "Bold 40px Arial";
        context1.fillStyle = "rgba(21,101,192,0.6)";
        context1.fillText('Round ' + round.number, 70, 50);

        // canvas contents will be used for a texture
        var texture1 = new THREE.Texture(canvas1);
        texture1.needsUpdate = true;

        var material1 = new THREE.MeshBasicMaterial({
          map: texture1,
          side: THREE.DoubleSide
        });
        material1.map.minFilter = THREE.LinearFilter;
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
          color: 0x607D8B
        });
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        scene.add(floor);

        //renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.querySelector('#game').appendChild(renderer.domElement);

        //Window resize handler
        window.addEventListener('resize', onWindowResize, false);

        function onWindowResize() {
          document.querySelector('#hud').style.width = $(window).width() + 'px';
          document.querySelector('.stretch-across').style.width = $(window).width() + 'px';
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }

        //Make arena
        makeStadium();
      }

      function animate() {
        requestAnimationFrame(animate);
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
        saveState = {
          level: player.level,
          skillPoints: player.skillPoints,
          items: player.items,
          money: player.money,
          exp: player.exp,
          score: player.score,
          round: round.number
        };
        //Update controls with time for delta
        controls.update(Date.now() - time);
        //Render the updated scene
        renderer.render(scene, camera);
        //Set new time for delta
        time = Date.now();
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

      window.addEventListener("click", function() {
        if (controls.enabled === true) {
          //Set up x, y, and z at the player's current position
          var x = player.body.position.x;
          var y = player.body.position.y;
          var z = player.body.position.z;
          var ballBody = new CANNON.Body({ //Set up a body(cannon) for the ball
            mass: 1
          });
          var ballMaterial = new THREE.MeshPhongMaterial({ //give the ball a material
            color: 0xFF0000
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
              color: 0xCFD8DC
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
          color: 0x6A1B9A
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
          color: 0xCFD8DC
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
          color: 0xC2185B,
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
      var PointerLockControls = function(camera, cannonBody) {
        var velocityFactor = 0.2;
        var jumpVelocity = 20;
        var scope = this;
        var pitchObject = new THREE.Object3D();
        pitchObject.add(camera);
        var yawObject = new THREE.Object3D();
        yawObject.position.x = 0;
        yawObject.position.y = 1.3;
        yawObject.position.z = 28;
        yawObject.add(pitchObject);
        var quat = new THREE.Quaternion();
        var moveForward = false;
        var moveBackward = false;
        var moveLeft = false;
        var moveRight = false;
        var canJump = false;

        var contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
        var upAxis = new CANNON.Vec3(0, 1, 0);
        cannonBody.addEventListener("collide", function(event) {
          //Check if an enemy collided with the player
          var healthPercentage = Math.round(player.health / player.maxHealth * 100);
          if (event.body.cubeEnemyId) {
            player.takeDamage(enemies[event.body.cubeEnemyId]);
            if (healthPercentage <= 0) {
              player.die();
              hud.lifeCounter.innerHTML = '100%';
            } else {
              hud.healthBar.style.width = healthPercentage + '%';
              hud.lifeCounter.innerHTML = healthPercentage + '%';
              switch (true) {
                case (healthPercentage < 21):
                  hud.healthBar.className = 'progress-bar health-bar-red';
                  break;
                case (healthPercentage < 41):
                  hud.healthBar.className = 'progress-bar health-bar-orange';
                  break;
                case (healthPercentage < 61):
                  hud.healthBar.className = 'progress-bar health-bar-yellow';
                  break;
                case (healthPercentage < 81):
                  hud.healthBar.className = 'progress-bar health-bar-green';
                  break;
                case (healthPercentage < 100):
                  hud.healthBar.className = 'progress-bar health-bar-blue';
                  break;
              }
            }
          }
          var contact = event.contact;
          // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
          // We do not yet know which one is which! Let's check.
          if (contact.bi.id === cannonBody.id) { // bi is the player body, flip the contact normal
            contact.ni.negate(contactNormal);
          } else {
            contactNormal.copy(contact.ni);
          } // bi is something else. Keep the normal as it is

          // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
          if (contactNormal.dot(upAxis) > 0.5) { // Use a "good" threshold value between 0 and 1 here!
            canJump = true;
          }
        });

        var velocity = cannonBody.velocity;

        var PI_2 = Math.PI / 2;

        var onMouseMove = function(event) {

          if (scope.enabled === false) {
            return;
          }

          var movementX = event.movementX || event.mozMovementX || 0;
          var movementY = event.movementY || event.mozMovementY || 0;

          yawObject.rotation.y -= movementX * 0.002;
          pitchObject.rotation.x -= movementY * 0.002;

          pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
        };

        var onKeyDown = function(event) {

          switch (event.keyCode) {

            case 38: // up
            case 87: // w
              moveForward = true;
              break;

            case 37: // left
            case 65: // a
              moveLeft = true;
              break;
            case 40: // down
            case 83: // s
              moveBackward = true;
              break;
            case 39: // right
            case 68: // d
              moveRight = true;
              break;
            case 32: // space
              if (canJump === true) {
                velocity.y = jumpVelocity;
              }
              canJump = false;
              break;
          }
        };

        var onKeyUp = function(event) {
          switch (event.keyCode) {
            case 38: // up
            case 87: // w
              moveForward = false;
              break;
            case 37: // left
            case 65: // a
              moveLeft = false;
              break;
            case 40: // down
            case 83: // a
              moveBackward = false;
              break;
            case 39: // right
            case 68: // d
              moveRight = false;
              break;
          }
        };

        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);

        //Disabled by default
        this.enabled = false;

        this.getObject = function() {
          return yawObject;
        };

        // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
        var inputVelocity = new THREE.Vector3();
        var euler = new THREE.Euler();
        this.update = function(delta) {
          if (scope.enabled === false) {
            return;
          }
          delta *= 0.1;
          inputVelocity.set(0, 0, 0);
          if (moveForward) {
            inputVelocity.z = -velocityFactor * delta;
          }
          if (moveBackward) {
            inputVelocity.z = velocityFactor * delta;
          }
          if (moveLeft) {
            inputVelocity.x = -velocityFactor * delta;
          }
          if (moveRight) {
            inputVelocity.x = velocityFactor * delta;
          }

          // Convert velocity to world coordinates
          euler.x = pitchObject.rotation.x;
          euler.y = yawObject.rotation.y;
          euler.order = "XYZ";
          quat.setFromEuler(euler);
          inputVelocity.applyQuaternion(quat);

          // Add to the object
          velocity.x += inputVelocity.x;
          velocity.z += inputVelocity.z;

          yawObject.position.copy(cannonBody.position);
        };
      };
    }
  };
}
