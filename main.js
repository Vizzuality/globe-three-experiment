function Globe(elementId) {
  var webglEl = document.getElementById(elementId) || document.body;

  // Vars
  var w = elementId ? webglEl.innerWidth : window.innerWidth;
  var h = elementId ? webglEl.innerHeight : window.innerHeight;

  var radius = 0.5;
  var segments = 32;
  var rotation = 6;

  function createEarth(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
        bumpScale: 0.0005,
        specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
        specular: new THREE.Color('grey')
      })
    );
  }

  function createClouds(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius + 0.003, segments, segments),
      new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false
      })
    );
  }

  // function createAtmosphere(radius, segments) {
  //   return new THREE.Mesh(
  //     new THREE.SphereGeometry(200, 40, 30),
  //     new THREE.ShaderMaterial({
  //       uniforms: THREE.UniformsUtils.clone({}),
  //       vertexShader: [
  //         'varying vec3 vNormal;',
  //         'void main() {',
  //           'vNormal = normalize( normalMatrix * normal );',
  //           'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
  //         '}'
  //       ].join('\n'),
  //       fragmentShader: [
  //         'varying vec3 vNormal;',
  //         'void main() {',
  //           'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
  //           'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
  //         '}'
  //       ].join('\n')
  //     })
  //   )
  // }

  function createSpace(radius, segments) {
    return new THREE.Mesh(
      new THREE.SphereGeometry(radius, segments, segments),
      new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('images/galaxy_starfield_4k.png'),
        side: THREE.BackSide
      })
    );
  }

  function latLongToVector3(lat, lon, radius, heigth) {
    var phi = (lat)*Math.PI/180;
    var theta = (lon-180)*Math.PI/180;

    var x = -(radius+heigth) * Math.cos(phi) * Math.cos(theta);
    var y = (radius+heigth) * Math.sin(phi);
    var z = (radius+heigth) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x,y,z);
  }

  function createPoints(data) {
    var geometry = new THREE.CubeGeometry(0.01, 0.01, 0.01);
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var cube = new THREE.Mesh( geometry, material );
    var position = latLongToVector3(data[0][1], data[0][2], 0.5, 0);
    cube.position = position;
    cube.lookAt( new THREE.Vector3(0, 0, 0) );
    return cube;
  }

  // Scene
  var scene = new THREE.Scene();

  // Camera
  var camera = new THREE.PerspectiveCamera(45, w / h, 0.01, 1000);
  camera.position.z = 1.5;

  // Renderer
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);

  // Ambient light
  var ambientLight = new THREE.AmbientLight(0x333333);
  var light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 3, 5);

  scene.add(ambientLight);
  scene.add(light);

  // Earth
  var sphere = createEarth(radius, segments);
  sphere.rotation.y = rotation;
  scene.add(sphere);

  // Clouds
  var clouds = createClouds(radius, segments);
  clouds.rotation.y = rotation;
  scene.add(clouds);

  // Space
  var space = createSpace(90, 64);
  scene.add(space);

  // Atmosphere
  // var sceneAtmosphere = new THREE.Scene();
  // var atmosphere = createAtmosphere(radius, segments);

  // atmosphere.scale.x = atmosphere.scale.y = atmosphere.scale.z = 1.1;
  // atmosphere.flipSided = true;
  // atmosphere.matrixAutoUpdate = false;
  // atmosphere.updateMatrix();

  // sceneAtmosphere.add(atmosphere);

  // Points
  var points = createPoints([
    [102,1,0.0003149387],
    [103,1,0.0003149386],
    [104,1,0.0003149387],
    [105,1,0.0003149387],
    [106,1,0.0003149387],
    [107,1,0.0003149386],
    [108,1,0.0003149387],
    [109,1,0.0003149387],
    [110,1,0.0003149387],
    [133,1,0.008578668]
  ]);
  scene.add(points);
  window.points = points;

  // Controls
  var controls = new THREE.TrackballControls(camera);

  // Add element to DOM and render
  webglEl.appendChild(renderer.domElement);

  render();

  function render() {
    controls.update();

    sphere.rotation.y += 0.0005;
    clouds.rotation.y += 0.0006;
    points.position.x += 0.00005;
    points.position.y += 0.00005;

    requestAnimationFrame(render);
    renderer.clear();
    renderer.render(scene, camera);
    // renderer.render(sceneAtmosphere, camera);
  }

  function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

  window.addEventListener('resize', onWindowResize, false);

  return this;
}

window.onload = function() {
  new Globe();
};
