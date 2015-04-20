/*global THREE*/

'use strict';

function Monster(imageURL, position, hp, scene, speed, width, height, deathCallback){
	var monster = {
		hp: hp,
		scene: scene,
		speed: speed !== undefined? speed : 0.1,
		deathCallback: deathCallback || null,
		mesh: new Billboard(imageURL, position, width, height),
		states: [
			'idle',
			'attack',
			'injured',
			'dead'
		],
		state: 0,
		timer: null,
		update: function(){
			var playerMesh = monster.scene.getObjectByName('player'),
				distToPlayer,
				distValue;

			if(monster.state !== 3 && monster.hp > 0){
				window.requestAnimationFrame(monster.update);

				monster.scene.children.forEach(function(child){
					if(child.name === 'spray'){
						var distToSpray = monster.mesh.position.clone().sub(child.position);
						if(distToSpray.length() < 1){
							monster.state = 2;
							monster.hp --;

							monster.mesh.material.color.setHex(0xff0000);
							monster.mesh.material.map.needsUpdate = true;
							monster.scene.remove(child);

							window.setTimeout(function(){
								monster.mesh.material.color.setHex(0xffffff);
								monster.mesh.material.map.needsUpdate = true;
								if(monster.hp < 1){
									monster.scene.remove(monster.mesh);
									monster.state = 3;
									if(monster.deathCallback){
										monster.deathCallback();
									}
								}
								else{
									monster.state = 1;
								}
							}, 200);
						}
					}
				});


				if(monster.speed > 0){

					//check to see if should be attacking
					if(playerMesh && monster.state < 2){
						distToPlayer = monster.mesh.position.clone().sub(playerMesh.position);
						distValue = distToPlayer.length();

						if(distValue < 10 && monster.speed > 0){
							monster.state = 1;
							monster.mesh.rotation.y = Math.atan2(distToPlayer.x, distToPlayer.z);
						}
						else{
							monster.state = 0;
						}
					}

					//if attacking from dist > 1, get closer
					if(monster.state !== 0 && distValue > 0.9){
						monster.mesh.translateZ(-monster.speed);
					}
					//but not too close
					else if(monster.state !== 0 && distValue < 0.5){
						monster.mesh.translateZ(monster.speed);
					}
					else if(monster.state === 0 && monster.timer === null && monster.hp > 1){
						monster.timer = window.setTimeout(function(){
							monster.mesh.rotation.y = Math.PI*(Math.random()*2-1)/2;
							monster.timer = null;
						},100);
						monster.mesh.translateZ(monster.speed/2);
					}
				}

				
			}


			monster.mesh.position.clamp(new THREE.Vector3(-10,0,-60),new THREE.Vector3(10,1,60));

		}
	};

	monster.mesh.name = 'monster';
	scene.add(monster.mesh);
	monster.update();

	return monster;
}