/*global THREE*/

'use strict';


function Billboard(textureURL, position, width, height){

	var billboard = new THREE.Sprite(new THREE.SpriteMaterial({
					map: THREE.ImageUtils.loadTexture(textureURL),
					useScreenCoordinates: false,
					color: 0xffffff,
					transparent: true,
					fog: true
				}));

	billboard.material.map.magFilter = billboard.material.map.minFilter = THREE.NearestFilter;
	billboard.material.needsUpdate = true;
	billboard.position.copy(position);
	billboard.scale.set(width/128, height/128);

	return billboard;
}