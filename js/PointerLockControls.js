/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */
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
    if(event.body.cubeEnemyId) {
      player.health -= enemies[event.body.cubeEnemyId].damage;
      healthBar.style.width = Math.round(player.health / player.maxHealth * 100) + '%';
      document.querySelector('#life-counter').innerHTML = Math.round(player.health / player.maxHealth * 100) + '%';
      if(player.health/player.maxHealth < 0.21) {
        healthBar.style.background = 'linear-gradient(to top, #F44336, #C62828)';
      } else if(player.health/player.maxHealth < 0.41) {
        healthBar.style.background = 'linear-gradient(to top, #FF9800, #EF6C00)';
      } else if(player.health/player.maxHealth < 0.61) {
        healthBar.style.background = 'linear-gradient(to top, #FFEB3B, #F9A825)';
      } else if(player.health/player.maxHealth < 0.81) {
        healthBar.style.background = 'linear-gradient(to top, #4CAF50, #2E7D32)';
      } else {
        healthBar.style.background = 'linear-gradient(to top, #2196F3, #1565C0)';
      }
    }

    var contact = event.contact;
    // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
    // We do not yet know which one is which! Let's check.
    if (contact.bi.id == cannonBody.id) // bi is the player body, flip the contact normal
      contact.ni.negate(contactNormal);
    else
      contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is

    // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
    if (contactNormal.dot(upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
      canJump = true;
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
        if (canJump === true) {
          velocity.y = jumpVelocity;
        }
        canJump = false;
        break;
      case 80: // p
        if (!pause) {
          pause = true;
        } else {
          pause = false;
          time = Date.now(); //reseting the time so players cannot zoom across the world after unpausing
        }
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
