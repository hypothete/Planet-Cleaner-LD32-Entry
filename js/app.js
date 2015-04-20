/*global THREE*/

'use strict';

var scene = new THREE.Scene(),
	camera = new THREE.PerspectiveCamera(90, 900/600, 0.1, 500),
	renderer = new THREE.WebGLRenderer({canvas: document.querySelector('#threed')}),
	winmsg = document.querySelector('#winmsg'),
	losemsg = document.querySelector('#losemsg'),
	origin = new THREE.Vector3(0,0,0),
	player = new Player(),
	controls = new Controls(),
	spaceshipSprite = new Billboard('img/spaceship.png', new THREE.Vector3(0,2.75,50), 1024, 1024),
	crashing = new Billboard('img/crashing.png', new THREE.Vector3(0,20,-70), 512, 512),
	intro,
	sceneWidth = 10,
	sceneHeight = 60,
	gameStates = [
		{
			name: 'intro',
			falling: false,
			iter: 0,
			init: function(){
				renderer.setSize(900, 600);
				scene.fog = new THREE.Fog( 0x454a09, 0.1, 30);
				player.mesh.add(camera);
				camera.position.set(0,1,-1);
				camera.lookAt(new THREE.Vector3(0,1,10));
				scene.add(player.mesh);
				intro = new Intro(player.mesh);
				controls.setup();
				render();

				window.setTimeout(function(){
					new Monster('img/splat.png', new THREE.Vector3(0,1,0.2), 1, scene, 0, 128, 128, function(){
						var interior = intro.mesh.getObjectByName('interior'),
							cracked = intro.mesh.getObjectByName('cracked');
						cracked.visible = true;
						interior.material.color.setHex(0xff0000);
						interior.material.needsUpdate = true;
						gameStates[0].falling = true;

						window.setTimeout(function(){
							renderer.domElement.style.opacity = 0;
							intro.mesh.getObjectByName('interior').visible = false;
							intro.mesh.getObjectByName('cracked').visible = false;
						}, 2000);

						window.setTimeout(function(){
							currentState = 1;
							gameStates[1].init();
							
						}, 3000);

						window.setTimeout(function(){
							renderer.domElement.style.opacity = 1;
						}, 4000);
						
					});
				}, 1500);
			},
			update: function(){
				player.animate(controls, scene, currentState);
				if(gameStates[0].falling){
					gameStates[0].iter += 0.00025;
					var space = intro.mesh.getObjectByName('space');
					space.translateY(gameStates[0].iter);
				}
			}
		},
		{
			name: 'play',
			init: function(){
				intro.mesh.getObjectByName('space').visible = false;
				player.addLand();
				player.mesh.position.set(0,10,-55);
				makeCraters(50);
				makeWalls(sceneWidth+3, sceneHeight+3);
				scene.add(spaceshipSprite);
				crashing.material.fog = false;
				crashing.material.needsUpdate = true;
				scene.add(crashing);

			},
			update: function(){
				if(player.mesh.position.y > 0 && !player.landed){
					player.mesh.translateY(-0.1);
				}
				else if(player.mesh.position.y <= 0 && !player.landed){
					player.landed = true;
					addMonstersAround(3, new THREE.Vector3(0,0,-40), 10);
					addMonstersAround(7, new THREE.Vector3(0,0,0), 10);
					addMonstersAround(12, new THREE.Vector3(0,0,50), 10);
				}

				if(crashing.position.y <= 0){
					scene.remove(crashing);
				}
				else if(player.landed){
					crashing.translateY(-0.25);
					crashing.translateZ(1);
				}

				player.animate(controls, scene, currentState);
				if(player.state ==2){
					currentState = 2;
					gameStates[2].init();
				}
				else{
					var distToShip = player.mesh.position.clone().sub(spaceshipSprite.position);
					if(distToShip.length() < 3){
						currentState = 3;
						gameStates[3].init();
					}
				}
			}
		},
		{
			name: 'lose',
			init: function(){
				renderer.domElement.style.opacity = 0;

				window.setTimeout(function(){
					losemsg.style.display = 'block';
					losemsg.style.opacity = 1;
				}, 500);
			},
			update: function(){
				player.animate(controls, scene, currentState);
			}
		},
		{
			name: 'win',
			init: function(){
				intro.mesh.getObjectByName('interior').visible = true;
				intro.mesh.getObjectByName('beacon').visible = true;
				player.mesh.getObjectByName('playersprite').visible = false;
				spaceshipSprite.visible = false;
				player.mesh.translateY(0.5);

				scene.children.forEach(function(child){
					if(child.name === 'monster'){
						scene.remove(child);
					}
				})

				window.setTimeout(function(){
					renderer.domElement.style.opacity = 0;
					winmsg.style.display = 'block';
					window.setTimeout(function(){
						winmsg.style.opacity = 1;
					}, 500);
				}, 3000);
			},
			update: function(){
				player.animate(controls, scene, currentState);
				if(player.mesh.position.y < 50){
					player.mesh.translateY(0.01);
				}
			}
		}
	],
	currentState= 0;

gameStates[0].init();

function render(){
	window.requestAnimationFrame(render);
	gameStates[currentState].update();
	renderer.render(scene, camera);
}

function makeCraters(amt){
	for(var i=0; i<amt; i++){
		var bill = new Billboard('img/crater.png', new THREE.Vector3((Math.random()*sceneWidth*2-sceneWidth)|0,0.5,(Math.random()*sceneHeight*2-sceneHeight)|0), 64, 64);
		scene.add(bill);
	}
}

function addMonstersAround(count, position, spread){
	for(var i=0; i<count; i++){
		var randangle = Math.PI*2*Math.random();
		var randPosition = position.clone().add(new THREE.Vector3(Math.sin(randangle), 1, Math.cos(randangle)).normalize().setLength(Math.random()*spread));
		new Monster('img/tardigrade.png', randPosition, 5, scene, 0.1, 256, 256);
	}
}

function makeWalls(x, z){
	var border = 4;
	for(var i=0; i<x+border; i++){
		for(var j=0; j<z+border; j++){
			if(((i===0)||(i==x+1)||(j===0)||(j==z+1)) && Math.random() > 0.5) {
				var bill = new Billboard('img/tall.png', new THREE.Vector3(i*2-(x+border*Math.random())|0, 4, j*2-(z+border*Math.random())), 1024, 1024);
				scene.add(bill);
				
			}
		}
	}
}
