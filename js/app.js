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

var world, physicsMaterial;
var camera, scene, renderer;
var boxes = [],
  boxMeshes = [];
var boxGeometry, boxMaterial, box;
var floorGeometry, floorMaterial, floor;
var playerGeometry, playerMaterial, player;
var controls;
var time = Date.now();
var dt = 1 / 60;
var pause = false;

initCannon();
initThree();
animate();

function initCannon() {
  world = new CANNON.World(); //Sets up the world physics
  world.quatNormalizeSkip = 0; //How often to normalize quaternions.
  world.quatNormalizeFast = false; //Approximation of quaternion normalization.

  var solver = new CANNON.GSSolver(); //Iterates over the equations array solving them.
  // world.defaultContactMaterial.contactEquationStiffness = 1e9;
  // world.defaultContactMaterial.contactEquationRelaxation = 4;
  solver.iterations = 7; //The number of solver iterations determines quality of the constraints in the world.
  solver.tolerance = 0.1; //When tolerance is reached, the system is assumed to be converged.
  world.solver = new CANNON.SplitSolver(solver); //Splits the equations into islands and solves them independently. Can improve performance.
  world.gravity.set(0, -20, 0); //Defines the center of gravity
  // world.broadphase = new CANNON.NaiveBroadphase();
  // Create a slippery material (friction coefficient = 0.0)
  physicsMaterial = new CANNON.Material("slipperyMaterial"); //Set up the Material, and pass in it's name
  var physicsContactMaterial = new CANNON.ContactMaterial( //Defines what happens when two materials meet.
    physicsMaterial, //Material 1
    physicsMaterial, //Material 2
    0.0, // friction
    0.3 // restitution
  );
  world.addContactMaterial(physicsContactMaterial); //Adds our material to the world

  // Create a sphere
  var mass = 5,
    radius = 1.3;
  sphereShape = new CANNON.Sphere(radius);
  sphereBody = new CANNON.Body({
    mass: mass
  });
  sphereBody.addShape(sphereShape);
  sphereBody.position.set(0, 5, 0);
  sphereBody.linearDamping = 0.9;
  world.addBody(sphereBody);

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
  light.position.set(10, 30, 20);
  light.target.position.set(0, 0, 0);
  if (true) {
    light.castShadow = true;

    light.shadowCameraNear = 20;
    light.shadowCameraFar = 50; //camera.far;
    light.shadowCameraFov = 40;

    light.shadowMapBias = 0.1;
    light.shadowMapDarkness = 0.7;
    light.shadowMapWidth = 2 * 512;
    light.shadowMapHeight = 2 * 512;

    //light.shadowCameraVisible = true;
  }
  scene.add(light);

  controls = new PointerLockControls(camera, sphereBody);
  scene.add(controls.getObject());
  // floor
  floorGeometry = new THREE.PlaneGeometry(300, 300, 50, 50);
  floorGeometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
  floorMaterial = new THREE.MeshLambertMaterial({
    color: 0xdddddd
  });
  floor = new THREE.Mesh(floorGeometry, floorMaterial);
  // floor.castShadow = true;
  // floor.receiveShadow = true;
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

  // Add boxes
  var halfExtents = new CANNON.Vec3(1, 1, 1);
  var boxShape = new CANNON.Box(halfExtents);
  var boxGeometry = new THREE.BoxGeometry(halfExtents.x * 2, halfExtents.y * 2, halfExtents.z * 2);
  for (var i = 0; i < 7; i++) {
    var x = (Math.random() - 0.5) * 20;
    var y = 1 + (Math.random() - 0.5) * 1;
    var z = (Math.random() - 0.5) * 20;
    var boxBody = new CANNON.Body({
      mass: 5
    });
    boxBody.addShape(boxShape);
    var boxMesh = new THREE.Mesh(boxGeometry, floorMaterial);
    world.addBody(boxBody);
    scene.add(boxMesh);
    boxBody.position.set(x, y, z);
    boxMesh.position.set(x, y, z);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    boxes.push(boxBody);
    boxMeshes.push(boxMesh);
  }
}

function animate() {
  requestAnimationFrame(animate);
  if (!pause) {
    if (controls.enabled) {
      world.step(dt);
      // Update box positions
      for (var i = 0; i < boxes.length; i++) {
        boxMeshes[i].position.copy(boxes[i].position);
        boxMeshes[i].quaternion.copy(boxes[i].quaternion);
      }
    }
    controls.update(Date.now() - time);
    renderer.render(scene, camera);
    time = Date.now();
  }
}

window.addEventListener("click", function(e) {
  if (controls.enabled === true) {
    console.log('here');
    var x = sphereBody.position.x;
    var y = sphereBody.position.y;
    var z = sphereBody.position.z;
    var ballBody = new CANNON.Body({
      mass: 1
    });
  }
});
