/*global THREE*/

'use strict';

//Defines player object & child objects

function Ground(){
	var groundMaterial = new THREE.MeshBasicMaterial({color: 0xccff00}),
		groundGeo = new THREE.PlaneBufferGeometry(100, 100, 10),
		ground = {
			mesh: new THREE.Mesh(groundGeo, groundMaterial)
	};
	ground.mesh.rotation.set(-Math.PI/2,0,0);
	ground.mesh.position.set(0,-0.5,0);
	return ground;
}

function Sky(){
	var skyMaterial = new THREE.MeshBasicMaterial({
		side: THREE.BackSide,
		map: THREE.ImageUtils.loadTexture('img/sky2.png'),
		fog: false
	}),
		skyGeo = new THREE.CylinderGeometry(200, 200, 400,50),
		sky = {
			mesh: new THREE.Mesh(skyGeo, skyMaterial)
	};
	sky.mesh.position.set(0,-0.5,0);
	sky.mesh.material.map.wrapS = THREE.RepeatWrapping;
	sky.mesh.material.map.wrapT = THREE.RepeatWrapping;
	sky.mesh.material.map.repeat.set( 3, 1);
	sky.mesh.material.needsUpdate = true;
	sky.mesh.name = 'sky';

	var cloudMaterial = new THREE.MeshBasicMaterial({
		map: THREE.ImageUtils.loadTexture('img/clouds.png'),
		transparent: true,
		opacity: 0.2,
		fog: false
	}),
		cloudGeo = new THREE.PlaneBufferGeometry(400, 400, 10),
		cloud = {
			mesh: new THREE.Mesh(cloudGeo, cloudMaterial),
			offsetX: 0,
			offsetY: 0
	};
	cloud.mesh.position.set(0,16,0);
	cloud.mesh.rotation.set(Math.PI/2,0,0);
	cloud.mesh.material.map.wrapS = THREE.RepeatWrapping;
	cloud.mesh.material.map.wrapT = THREE.RepeatWrapping;
	cloud.mesh.material.map.repeat.set( 16, 16);
	cloud.mesh.material.needsUpdate = true;
	cloud.mesh.name = 'cloud';

	sky.mesh.add(cloud.mesh);

	sky.updateCloud = function(){
		cloud.offsetX+=0.01;
		cloud.offsetY+=0.02;
		cloud.mesh.material.map.offset.set(cloud.offsetX,cloud.offsetY);
		cloud.mesh.material.needsUpdate = true;
	}

	var moons = new Billboard('img/moons.png', new THREE.Vector3(5,5,7.5), 512, 512);
	moons.material.fog = false;
	moons.material.needsUpdate = true;
	sky.mesh.add(moons);

	return sky;
}

function Spray(position, direction, duration, scene){
	var spray = {
			mesh: new Billboard('img/spray.png', position, 64, 64),
			duration: duration,
			age: duration,
			scene: scene,
			interval: null,
			update: function(){
				spray.mesh.translateZ(0.125);
				spray.mesh.material.opacity = spray.age / spray.duration;
				spray.mesh.material.needsUpdate = true;
				spray.age--;
				if(spray.age <=0){
					spray.scene.remove(spray.mesh);
					window.clearInterval(spray.interval);
				}
			}
	};
	spray.mesh.name = 'spray';
	spray.mesh.rotation.copy(direction);
	spray.mesh.material.transparent = true;
	spray.mesh.material.needsUpdate = true;
	scene.add(spray.mesh);
	spray.interval = window.setInterval(function(){
		spray.update();
	}, 60);
	return spray;
}

var playerSprite = new Billboard('img/spraysheet.png', new THREE.Vector3(-0.5, 0.5, -0.25), 128, 128);
	playerSprite.material.map.repeat.set(1/2, 1/2);
	playerSprite.material.map.wrapS = playerSprite.material.map.wrapT = THREE.RepeatWrapping;
	playerSprite.material.map.offset.set(0,0.5);
	playerSprite.material.map.needsUpdate = true;
	playerSprite.name = 'playersprite';


var bottleSprite = new Billboard('img/hud-sprites.png', new THREE.Vector3(1.35, 1.75, 0), 128, 128);
	bottleSprite.material.map.repeat.set(1/4, 1/4);
	bottleSprite.material.map.wrapS = bottleSprite.material.map.wrapT = THREE.RepeatWrapping;
	bottleSprite.material.map.offset.set(0,0.75);
	bottleSprite.material.map.needsUpdate = true;
	bottleSprite.scale.set(0.25, 0.25);


var batterySprite = new Billboard('img/hud-sprites.png', new THREE.Vector3(1.35, 1.45, 0), 128, 128);
	batterySprite.material.map.repeat.set(1/4, 1/4);
	batterySprite.material.map.wrapS = batterySprite.material.map.wrapT = THREE.RepeatWrapping;
	batterySprite.material.map.offset.set(0.25,0.75);
	batterySprite.material.map.needsUpdate = true;
	batterySprite.scale.set(0.25, 0.25);


var oxygenSprite = new Billboard('img/hud-sprites.png', new THREE.Vector3(1.35, 1.15, 0), 128, 128);
	oxygenSprite.material.map.repeat.set(1/4, 1/4);
	oxygenSprite.material.map.wrapS = oxygenSprite.material.map.wrapT = THREE.RepeatWrapping;
	oxygenSprite.material.map.offset.set(0.5,0.75);
	oxygenSprite.material.map.needsUpdate = true;
	oxygenSprite.scale.set(0.25, 0.25);


function Player(){

	var player = {
		hp: 50,
		hpMax: 50,
		spray: 100,
		sprayMax: 100,
		sprayOn: false,
		oxygen: 70,
		oxygenMax: 70,
		ground : new Ground(),
		sky : new Sky(),
		state: 0,
		states: [
			'active',
			'injured',
			'dead',
		],
		mesh: new THREE.Object3D(),
		hpTimer: null,
		landed: false,
		animate: function(controls, scene, gameState){

			//gameStates: intro, play, lose, win

			if(player.state !== 2 && gameState == 1){
				player.oxygen -= 0.01;

				//injury and death logic here\
				scene.children.forEach(function(child){
					if(child.name === 'monster' ){
						var distToMonster = player.mesh.position.clone().sub(child.position);
						if(distToMonster.length() < 1.2){
							child.translateZ(0.5);
							player.mesh.translateZ(-1);
							player.hp-=2;
							player.state = 1;
						}
					}
				});
			}

			if(player.hpTimer === null && player.state === 0){
				player.hpTimer = window.setTimeout(function(){
					player.hp++;
					player.hpTimer = null;
				},2000);
			}

			

			player.hp = Math.max(player.hp, 0);
			player.hp = Math.min(player.hp, player.hpMax);

			if(player.hp === 0 || player.oxygen <= 0){
				player.state = 2;
			}

			if(player.state === 0){
				//active state

				if((controls.mouse.pressed && Math.abs(controls.mouse.position.x) <= 0.3) && !controls.mouse.timer && gameState == 1){ //w
					player.mesh.translateZ(controls.mouse.position.y<-0.9?-0.1:0.1);
					var crazy = (Math.sin(player.mesh.position.z+player.mesh.position.x)*0.001);
					playerSprite.position.x+=crazy;
					playerSprite.position.y += crazy*0.01;
					player.mesh.position.clamp(new THREE.Vector3(-10,-1,-60),new THREE.Vector3(10,1,60));
				}

				if(controls.mouse.pressed && controls.mouse.position.x > 0.3 && gameState == 1){ //a
					player.mesh.rotateOnAxis(new THREE.Vector3(0,1,0), 0.04);
				}

				else if(controls.mouse.pressed && controls.mouse.position.x < -0.3 && gameState == 1){ //d
					player.mesh.rotateOnAxis(new THREE.Vector3(0,1,0), -0.04);
				}

				if(controls.mouse.dblclick && player.spray > 0 && !player.sprayOn){
					//spray!
					player.sprayOn = true;
					playerSprite.material.map.offset.set(0.5,0.5);
					playerSprite.material.needsUpdate = true;

					new Spray(
						player.mesh.position.clone().setY(1),
						player.mesh.rotation,
						20,
						scene
					);
					player.spray--;

					window.setTimeout(function(){
						playerSprite.material.map.offset.set(0,0.5);
						playerSprite.material.map.needsUpdate = true;
						player.sprayOn = false;
					},60);
				}
			}
			else if(player.state == 1){
				//injured

				playerSprite.material.color.setHex(0xff0000);
				playerSprite.material.map.needsUpdate = true;
				player.state = 0;

				window.setTimeout(function(){
					playerSprite.material.color.setHex(0xffffff);
					playerSprite.material.map.needsUpdate = true;
				}, 60);
			}
			else{
				//dead
				playerSprite.material.color.setHex(0xff0000);
				playerSprite.material.map.needsUpdate = true;
				
				if(player.oxygen <= 0){
					oxygenSprite.material.color.setHex(0xff0000);
					oxygenSprite.material.map.needsUpdate = true;
				}
				else if(player.hp <= 0){
					batterySprite.material.color.setHex(0xff0000);
					batterySprite.material.map.needsUpdate = true;
				}
			}

			//update HUD
			bottleSprite.material.map.offset.set(0, Math.round(3*player.spray/player.sprayMax)/4);
			bottleSprite.material.map.needsUpdate = true;

			batterySprite.material.map.offset.set(0.25, Math.round(3*player.hp/player.hpMax)/4);
			batterySprite.material.map.needsUpdate = true;

			oxygenSprite.material.map.offset.set(0.5, Math.round(3*player.oxygen/player.oxygenMax)/4);
			oxygenSprite.material.map.needsUpdate = true;

			//update sky
			player.sky.mesh.rotation.copy(player.mesh.rotation);
			player.sky.mesh.rotation.y = -player.sky.mesh.rotation.y;
			player.sky.updateCloud();

			player.ground.mesh.position.y = -player.mesh.position.y;

		},
		addLand: function(){
			player.mesh.add(bottleSprite);
			player.mesh.add(batterySprite);
			player.mesh.add(oxygenSprite);
			player.mesh.add(player.ground.mesh);
			player.mesh.add(player.sky.mesh);
		}
	};

	player.mesh.name = 'player';
	player.mesh.add(playerSprite);
	return player;
}
