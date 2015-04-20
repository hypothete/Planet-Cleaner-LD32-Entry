/*global THREE*/

'use strict';

function Intro(scene){
	var intro = {
		mesh: new THREE.Object3D(),
		scene: scene
	};

	var space = new Billboard('img/space.png', new THREE.Vector3(0,0.5,2), 1024, 1024),
		interior = new Billboard('img/window.png', new THREE.Vector3(0,2,0.1), 512, 512),
		cracked = new Billboard('img/cracked-glass.png', new THREE.Vector3(0,2,0.09), 512, 512),
		beacon = new Billboard('img/beacon.png', new THREE.Vector3(0,2,0.09), 512, 512);

	intro.mesh.add(space, interior, cracked, beacon);

	cracked.visible = false;
	beacon.visible = false;
	intro.mesh.name = 'intro';
	space.name = 'space';
	interior.name = 'interior';
	cracked.name = 'cracked';
	beacon.name = 'beacon';
	scene.add(intro.mesh);
	intro.mesh.position.setY(-1);
	return intro;
}