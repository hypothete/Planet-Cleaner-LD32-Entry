/*global THREE*/

'use strict';

//defines inputs & input events

function Controls(){

	var controls = {
		width: 900,
		height: 600,
		mouse: {
			position: new THREE.Vector2(0,0),
			pressed: false,
			dblclick: false,
			dblclickCount: 0,
			move: function(e){
				controls.mouse.position.set((controls.width/2-e.clientX)/(controls.width/2),(controls.height/2-e.clientY)/(controls.height/2));
			},
			timer: null,
			cancelDoubleClick: function(){
				controls.mouse.dblclickCount = 0;
				window.clearTimeout(controls.mouse.timer);
				controls.mouse.timer = null;
			}
		},
		keys: [],
		setup: function(){

			document.addEventListener('mousedown', function(){
				controls.mouse.pressed = true;
				controls.mouse.dblclickCount++;

				if(controls.mouse.timer === null){
					controls.mouse.timer = window.setTimeout(controls.mouse.cancelDoubleClick, 350);
				}
			});

			document.addEventListener('touchstart', function(e){
				e.preventDefault();
				controls.mouse.pressed = true;
				controls.mouse.dblclickCount++;

				if(controls.mouse.timer === null){
					controls.mouse.timer = window.setTimeout(controls.mouse.cancelDoubleClick, 350);
				}
			});

			document.addEventListener('mouseup', function(){
				controls.mouse.pressed = false;

				if(controls.mouse.timer !== null && controls.mouse.dblclickCount > 1){
					//timer still going - cancel it
					controls.mouse.cancelDoubleClick();
					controls.mouse.dblclick = true;
					//console.log('doubleclick!');
					window.setTimeout(function(){
						controls.mouse.dblclick = false;
					}, 60);
				}
			});

			document.addEventListener('touchend', function(e){
				e.preventDefault();
				controls.mouse.pressed = false;

				if(controls.mouse.timer !== null && controls.mouse.dblclickCount > 1){
					//timer still going - cancel it
					controls.mouse.cancelDoubleClick();
					controls.mouse.dblclick = true;
					//console.log('doubleclick!');
					window.setTimeout(function(){
						controls.mouse.dblclick = false;
					}, 60);
				}
			});

			document.addEventListener('mousemove', function(e){
				controls.mouse.move(e);
				//console.log(controls.mouse.position.x, controls.mouse.position.y);
			});

			document.addEventListener('touchmove', function(e){
				e.preventDefault();
				controls.mouse.move(e.changedTouches[0]);
				//console.log(controls.mouse.position.x, controls.mouse.position.y);
			});

		}
	};

	return controls;
}