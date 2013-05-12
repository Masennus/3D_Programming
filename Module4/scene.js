/*************************************************************
  3D Graphics Programming
  anssi.grohn@karelia.fi 2013
  Mesh loading and camera movement demo code with Three.js
 *************************************************************/
// Edited by Taavi Saarelainen, 1001151 LUDNS10, for 3D Graphics Programming course.
// Parameters
var width = 800,
    height = 600
    viewAngle = 45,
    aspect = width/height,
    near = 0.1,
    far = 1000.0;

var renderer = null;
var scene = null;
var camera = null;

var mouse = {
    down: false,
    prevY: 0,
    prevX: 0
}

var camObject = null;
var keysPressed = [];
var ruins = []
calculate = 0.0;

$(function(){

    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);
    camObject = new THREE.Object3D();
    // create scene
    scene = new THREE.Scene();
    // camera will be the the child of camObject
    camObject.add(camera);

    // add camera to scene and set its position.
    scene.add(camObject);
    camObject.position.z = 5;
    camObject.position.y = 1.0;

    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    
    // Create ground from cube and some rock
    var rockTexture = THREE.ImageUtils.loadTexture("rock.jpg");

    // texture wrapping mode set as repeating
    rockTexture.wrapS = THREE.RepeatWrapping;
    rockTexture.wrapT = THREE.RepeatWrapping;

    // Construct a mesh object
    var ground = new THREE.Mesh( new THREE.CubeGeometry(100,0.2,100,1,1,1),
				 new THREE.MeshBasicMaterial({
				     map: rockTexture,
				     transparent: true
				 }));
				 
				 
    // do a little magic with vertex coordinates so ground looks more intersesting.
    $.each( ground.geometry.faceVertexUvs[0], function(i,d){
	d[0] = new THREE.Vector2(0,25);
	d[2] = new THREE.Vector2(25,0);
	d[3] = new THREE.Vector2(25,25);
    });

    // add ground to scene
    scene.add(ground);
	
	// NEW! This is called to display the arm.
	geometry();
	
    // mesh loading functionality
    var loader = new THREE.JSONLoader();
    function handler( geometry, materials ){
	ruins.push( new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(
	    {
		map: rockTexture,
		transparent: true
	    })));
	checkIsAllLoaded();
    }
    function checkIsAllLoaded(){

	if ( ruins.length == 5 ){
	    $.each(ruins, function(i,mesh){
    		// rotate 90 degrees
		mesh.rotation.x = Math.PI/2;
		scene.add(mesh);		
	    });
	    // arcs
	    ruins[0].position.z = 13;
	    // corner
	    ruins[1].position.x = 13;
	    // crumbled place
	    ruins[2].position.x = -13;
	    
	    ruins[3].position.z = -13;
	}
    
    }
    // loading of meshes 
    loader.load("meshes/ruins30.js", handler);
    loader.load("meshes/ruins31.js", handler);
    loader.load("meshes/ruins33.js", handler);
    loader.load("meshes/ruins34.js", handler);
    loader.load("meshes/ruins35.js", handler);

    // request frame update and call update-function once it comes
    requestAnimationFrame(update);

    ////////////////////
    // Setup simple input handling with mouse
    document.onmousedown = function(ev){
	mouse.down = true;
	mouse.prevY = ev.pageY;
	mouse.prevX = ev.pageX;
    }

    
    document.onmouseup = function(ev){
	mouse.down = false;
    }

    document.onmousemove = function(ev){
	if ( mouse.down ) {

	    var rot = (ev.pageY - mouse.prevY) * 0.01;
	    var rotY = (ev.pageX - mouse.prevX) * 0.01;
	    camObject.rotation.y -= rotY;
	    camera.rotation.x -= rot;
	    mouse.prevY = ev.pageY;
	    mouse.prevX = ev.pageX;
	}
    }
    ////////////////////
    // setup input handling with keypresses
    document.onkeydown = function(event) {
	keysPressed[event.keyCode] = true;
    }
    
    document.onkeyup = function(event) {
	keysPressed[event.keyCode] = false;
    }
    
    
    // querying supported extensions
    var gl = renderer.context;
    var supported = gl.getSupportedExtensions();

    console.log("**** Supported extensions ***'");
    $.each(supported, function(i,d){
	console.log(d);
    });
});

var angle = 0.0;

function update(){

    // render everything 
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
 
	// Add movement functionality to the scene
	movement();
	
	// "Animate" the hand with update function
	animateHand();

    // request another frame update
    requestAnimationFrame(update);
}

function movement()
{
    if ( keysPressed["W".charCodeAt(0)] == true )
	{
		var dir = new THREE.Vector3(0,0,-1);
		var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
		camObject.translate(0.1, dirW);
    }

    if ( keysPressed["S".charCodeAt(0)] == true )
	{
		var dir = new THREE.Vector3(0,0,-1);
		var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
		camObject.translate(-0.1, dirW);
    }
    if ( keysPressed["A".charCodeAt(0)] == true )
	{
		var dir = new THREE.Vector3(1,0,0);
		var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
		camObject.translate(-0.1, dirW);
    }

    if ( keysPressed["D".charCodeAt(0)] == true )
	{
		var dir = new THREE.Vector3(1,0,0);
		var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
		camObject.translate(0.1, dirW);
    }
}
function geometry()
{
	// Create first all THREE.Mesh materials and create object3D to call all of them
	wavingHand = new THREE.Object3D();
	
	// Shoulder 
	shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.3, 5, 5), new THREE.MeshLambertMaterial(
	{
		color: 0xFF0000
	}));
	shoulder.position.y = 0.5;
	
	// Upper arm 
	upArm = new THREE.Mesh(new THREE.CubeGeometry(0.2, 1, 0.2), new THREE.MeshLambertMaterial(
	{
		color: 0x66FF33
	}));
	upArm.position.y = 0.5;
	
	// Elbow
	elbow = new THREE.Mesh(new THREE.SphereGeometry(0.2, 5, 5), new THREE.MeshLambertMaterial(
	{
		color: 0x00FFFF
	}));
	elbow.position.y = 0.5;
	
	// Lower Hand
	low = new THREE.Mesh(new THREE.CubeGeometry(0.2, 1, 0.2), new THREE.MeshLambertMaterial(
	{
		color: 0x0066FF
	}));
	low.position.y = 0.5;
	
	// Palm
	hand = new THREE.Mesh(new THREE.CubeGeometry(0.3, 0.3, 0.3), new THREE.MeshLambertMaterial(
	{
		color: 0x996699
	}));
	hand.position.y = 0.5;
	
	// Finger1
	finger1 = new THREE.Mesh(new THREE.CubeGeometry(0.05, 0.3, 0.2), new THREE.MeshLambertMaterial(
	{
		color: 0xFFCC99
	}));
	finger1.position.y = 0.3;
	finger1.position.x = 0.12;
	
	// Finger2
	finger2 = new THREE.Mesh(new THREE.CubeGeometry(0.05, 0.3, 0.2), new THREE.MeshLambertMaterial(
	{
		color: 0xFFCC99
	}));
	finger2.position.y = 0.3;
	finger2.position.x = 0;
	
	// Finger3
	finger3 = new THREE.Mesh(new THREE.CubeGeometry(0.05, 0.3, 0.2), new THREE.MeshLambertMaterial(
	{
		color: 0xFFCC99
	}));
	finger3.position.y = 0.3;
	finger3.position.x = -0.1;
	
	// Finger4, thumb
	finger4 = new THREE.Mesh(new THREE.CubeGeometry(0.05, 0.3, 0.2), new THREE.MeshLambertMaterial(
	{
		color: 0xFFCC99
	}));
	finger4.position.y = 0;
	finger4.position.x = 0.3;
	finger4.rotation.z = 2;
	
	// Call function that hierarchices the joints for objects, making them "stuck" together
	hierachiceJoints();
	
	scene.add(wavingHand);

	var dl = new THREE.DirectionalLight(0xffffff, 1.0);
	dl.position.set(1.5, 0, 1);
	scene.add(dl);
}

// Make the above objects joint themselves 
function hierachiceJoints()
{
	// Hook up the objescts to each other, they can finally be called by wavingHand()
	wavingHand.add(shoulder);
	shoulder.add(upArm);
	upArm.add(elbow);
	elbow.add(low);
	low.add(hand);
	
	// Fingers will be added ALL to hand object, since they can have the same parent
	hand.add(finger1);
	hand.add(finger2);
	hand.add(finger3);
	hand.add(finger4);
}

function animateHand() 
{
	shoulder.rotation.z = Math.cos(calculate);
	elbow.rotation.z = Math.sin(calculate);
	hand.rotation.x = Math.sin(calculate);
	calculate += 0.03;

}