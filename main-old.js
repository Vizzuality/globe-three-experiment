function Globe() {
  var w = window.innerWidth;
  var h = window.innerHeight;

  var curZoomSpeed = 0;
  var zoomSpeed = 50;
  var distance = 100000, distanceTarget = 100000;
  var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
  var rotation = { x: 0, y: 0 },
    target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
    targetOnDown = { x: 0, y: 0 };
   var PI_HALF = Math.PI / 2;

  var camera = new THREE.PerspectiveCamera( 30, w / h , 1, 10000 );
  camera.position.z = distance;

  var scene = new THREE.Scene();

  var geometry = new THREE.SphereGeometry(200, 32, 32);

  // Basemap
  var uniforms = THREE.UniformsUtils.clone({ texture: { type: 't', value: null } });
  uniforms.texture.value = THREE.ImageUtils.loadTexture('world-no-clouds.jpg');

  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: [
      'varying vec3 vNormal;',
      'varying vec2 vUv;',
      'void main() {',
        'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
        'vNormal = normalize( normalMatrix * normal );',
        'vUv = uv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform sampler2D texture;',
      'varying vec3 vNormal;',
      'varying vec2 vUv;',
      'void main() {',
        'vec3 diffuse = texture2D( texture, vUv ).xyz;',
        'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
        'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
        'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
      '}'
    ].join('\n')
  });

  var mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.y = Math.PI;
  scene.add(mesh);

  // Layer
  // var uniforms2 = THREE.UniformsUtils.clone({ texture: { type: 't', value: null } });
  // uniforms2.texture.value = THREE.ImageUtils.loadTexture('temperature.jpg');

  // var material2 = new THREE.ShaderMaterial({
  //   uniforms: uniforms2,
  //   vertexShader: [
  //     'varying vec3 vNormal;',
  //     'varying vec2 vUv;',
  //     'void main() {',
  //       'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
  //       'vNormal = normalize( normalMatrix * normal );',
  //       'vUv = uv;',
  //     '}'
  //   ].join('\n'),
  //   fragmentShader: [
  //     'uniform sampler2D texture;',
  //     'varying vec3 vNormal;',
  //     'varying vec2 vUv;',
  //     'void main() {',
  //       'vec3 diffuse = texture2D( texture, vUv ).xyz;',
  //       'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
  //       'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
  //       'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
  //     '}'
  //   ].join('\n')
  // });

  // var mesh = new THREE.Mesh(geometry, material2);
  // mesh.rotation.y = Math.PI;
  // scene.add(mesh);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.domElement.style.position = 'absolute';

  document.body.appendChild( renderer.domElement );

  document.body.addEventListener('mousedown', onMouseDown, false);

  document.body.addEventListener('mousewheel', onMouseWheel, false);

  document.body.addEventListener('mouseover', function() {
    overRenderer = true;
  }, false);

  document.body.addEventListener('mouseout', function() {
    overRenderer = false;
  }, false);

  function onMouseDown(event) {
    event.preventDefault();

    document.body.addEventListener('mousemove', onMouseMove, false);
    document.body.addEventListener('mouseup', onMouseUp, false);
    document.body.addEventListener('mouseout', onMouseOut, false);

    mouseOnDown.x = - event.clientX;
    mouseOnDown.y = event.clientY;

    targetOnDown.x = target.x;
    targetOnDown.y = target.y;

    document.body.style.cursor = 'move';
  }

  function onMouseMove(event) {
    mouse.x = - event.clientX;
    mouse.y = event.clientY;

    var zoomDamp = distance/1000;

    target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
    target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

    target.y = target.y > PI_HALF ? PI_HALF : target.y;
    target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
  }

  function onMouseUp(event) {
    document.body.removeEventListener('mousemove', onMouseMove, false);
    document.body.removeEventListener('mouseup', onMouseUp, false);
    document.body.removeEventListener('mouseout', onMouseOut, false);
    document.body.style.cursor = 'auto';
  }

  function onMouseOut(event) {
    document.body.removeEventListener('mousemove', onMouseMove, false);
    document.body.removeEventListener('mouseup', onMouseUp, false);
    document.body.removeEventListener('mouseout', onMouseOut, false);
  }

  function onMouseWheel(event) {
    event.preventDefault();
    if (overRenderer) {
      zoom(event.wheelDeltaY * 0.3);
    }
    return false;
  }

  function zoom(delta) {
    distanceTarget -= delta;
    distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
    distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  function render() {
    zoom(curZoomSpeed);

    rotation.x += (target.x - rotation.x) * 0.1;
    rotation.y += (target.y - rotation.y) * 0.1;
    distance += (distanceTarget - distance) * 0.3;

    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

    camera.lookAt(mesh.position);

    renderer.render(scene, camera);
  }

  this.start = animate();
}

window.onload = new Globe().start;