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
var ruins = [];
var customLamberShader;
var fenceShader;
var fps = {
    width: 100,
    height: 50,
    svg: null,
    data: [],
    ticks: 0,
    time: null
}
var spotLight = null;
var spotLightObj = null;
var ambientLight = null;
// for easier conversion
function colorToVec4(color){
    var res = new THREE.Vector4(color.r, color.g, color.b, color.a);
    return res;
}
function colorToVec3(color){
    var res = new THREE.Vector3(color.r, color.g, color.b);
    return res;
}

$(function()
{
    // get div element 
    var ctx = $("#main");
    // create WebGL-based renderer for our content.
    renderer = new THREE.WebGLRenderer();

    // create camera
    camera = new THREE.PerspectiveCamera( viewAngle, aspect, near, far);

    // create scene
    scene = new THREE.Scene();
    camObject = new THREE.Object3D();
    camObject.add(camera);
    spotLightObj = new THREE.Object3D();
    spotLightObj.position.z = 0.1;
    camera.add(spotLightObj);

    // add camera to scene and set its position.
    scene.add(camObject);

    camObject.position.z = 5;
    camObject.position.y = 1.0;
    // define renderer viewport size
    renderer.setSize(width,height);

    // add generated canvas element to HTML page
    ctx.append(renderer.domElement);

    // directional light for the moon
    var directionalLight = new THREE.DirectionalLight( 0x88aaff, 1.0 ); 
    directionalLight.position.set( 1, 1, -1 ); 

    scene.add(directionalLight);

    // Add ambient light, simulating surround scattering light
    ambientLight = new THREE.AmbientLight(0x282a2f);
    scene.add( ambientLight  );
    
    scene.fog = new THREE.Fog(0x000000, 2.0, 20.0);
    // Add our flashlight
    var distance  = 6.0;
    var intensity = 2.0;
    spotLight = new THREE.SpotLight( 0xffffff,  intensity, distance ); 
    spotLight.castShadow = false; 
    spotLight.position = new THREE.Vector3(0,0,1);
    spotLight.target = spotLightObj;
    spotLight.exponent = 488.1;
    spotLight.angle = 0.21;
    scene.add( spotLight );

    // create cube  material
    var material =
	new THREE.MeshBasicMaterial(
	    {
		color: 0xFFFFFF,
		
	    });
    
    var loader = new THREE.JSONLoader();
    // Create ground from cube and some rock
    var rockImage = THREE.ImageUtils.loadTexture("rock.jpg");

    // texture wrapping mode set as repeating
    rockImage.wrapS = THREE.RepeatWrapping;
    rockImage.wrapT = THREE.RepeatWrapping;
    customLamberShader = new THREE.ShaderMaterial(
	{
		vertexShader: $("#light-vs").text(),
		fragmentShader: $("#light-fs").text(),
		transparent: false,
		uniforms: 
		{ 
			map:
			{
				type: 't', 
				value: rockImage
			},
			
			"dirlight.diffuse":
			{
				type: 'v4',
				value: colorToVec4(directionalLight.color)
			},
			
			"dirlight.pos":
			{
				type: 'v3',
				value: directionalLight.position
			},
			
			"dirlight.ambient":
			{
				type: 'v4',
				value: new THREE.Vector4(0,0,0,1.0)
			},
			
			"dirlight.specular":
			{
				type: 'v4',
				value: new THREE.Vector4(0,0,0,1) 
			},
			
			"spotlight.diffuse":
			{
				type: 'v4',
				value: new THREE.Vector4(1,1,0,1)
			},
			
			"spotlight.distance":
			{
				type: 'f',
				value: distance
			},
			
			"spotlight.pos":
			{
				type: 'v3',
				value: spotLight.position
			},
			
			"spotlight.exponent":
			{
				type: 'f',
				value: spotLight.exponent
			},
			
			"spotlight.direction":
			{
				type: 'v3',
				value: new THREE.Vector3(0,0,-1)
			},
			
			"spotlight.specular":
			{
				type: 'v4',
				value: new THREE.Vector4(1,1,1,1) 
			},
			
			"spotlight.intensity":
			{
				type: 'f',
				value: 2.0 
			},
			
			"spotlight.angle":
			{
				type: 'f',
				value: spotLight.angle
			},
			
			// Ambient overall color
			u_ambient:
			{ 
				type: 'v4',
				value: colorToVec4(ambientLight.color)
			},
			
			// Extra snatched from the module6 example:
			// Fog overall color, 
			fogColor:
			{
				type: 'v3',
				value: colorToVec3(scene.fog.color)
			},
			
			fogNear:
			{
				type: 'f',
				value: scene.fog.near
			},
			
			fogFar:
			{
				type: 'f',
				value: scene.fog.far
			}
		}
    });

    function handler(geometry, materials) {
	var m = new THREE.Mesh(geometry, customLamberShader);
	m.renderDepth = 2000;
	ruins.push(m);
	checkIsAllLoaded();
    }
    
    function checkIsAllLoaded(){
	if ( ruins.length == 5 ) {
	    $.each(ruins, function(i,mesh){
		scene.add(mesh);
		// mesh is rotated around 
		mesh.rotation.x = Math.PI/2.0;
		/*$.each( mesh.material.materials, function(i,d){
		    d.map = THREE.ImageUtils.loadTexture("rock.jpg");
		    d.transparent = true;
		});*/
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
    loader.load("meshes/ruins30.js", handler);    
    loader.load("meshes/ruins31.js", handler);
    loader.load("meshes/ruins33.js", handler);
    loader.load("meshes/ruins34.js", handler); 
    loader.load("meshes/ruins35.js", handler);

    var skyboxMaterials = [];
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_west.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_east.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_up.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_down.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_north.png")}));
    skyboxMaterials.push ( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture("./nightsky/nightsky_south.png")}));
    $.each(skyboxMaterials, function(i,d){
	d.side = THREE.BackSide;
	d.depthWrite = false;

    });
    var sbmfm = new THREE.MeshFaceMaterial(skyboxMaterials);
    sbmfm.depthWrite = false;
    // Create a new mesh with cube geometry 
    var skybox = new THREE.Mesh(
	new THREE.CubeGeometry( 10,10,10,1,1,1 ), 
	sbmfm
    );

    skybox.position = camObject.position;
    skybox.renderDepth = 0;
    scene.add(skybox);

    // Construct a mesh object
    var ground = new THREE.Mesh( new THREE.CubeGeometry(100,0.2,100,1,1,1), customLamberShader);

    // Do a little magic with vertex coordinates so ground looks more interesting
    $.each(ground.geometry.faceVertexUvs[0], function(i,d){

	d[0] = new THREE.Vector2(0,25);
	//d[1] = new THREE.Vector2(0,0);
	d[2] = new THREE.Vector2(25,0);
	d[3] = new THREE.Vector2(25,25);
    });
    ground.renderDepth = 2001;
    
    scene.add(ground);

    // NEW! This is called to display the arm.
	geometry();

    fps.time = new Date();
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
var movement = 0.0;
var moving = false;
function update(){

    // render everything 
    renderer.setClearColorHex(0x000000, 1.0);
    renderer.clear(true);
    renderer.render(scene, camera); 
    angle += 0.001;
    moving = false;
    if ( keysPressed["W".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["S".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(0,0,-1);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;

    }
    if ( keysPressed["A".charCodeAt(0)] == true ){
	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(0.1, dirW);
	moving = true;
    }

    if ( keysPressed["D".charCodeAt(0)] == true ){

	var dir = new THREE.Vector3(-1,0,0);
	var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);
	camObject.translate(-0.1, dirW);
	moving = true;
    }
	
    // so strafing and moving back-fourth does not double the bounce
    if ( moving ) {
	movement+=0.1;
	camObject.position.y = Math.sin(movement*2.30)*0.07+1.2; 
    }

    spotLight.position = camObject.position;
    customLamberShader.uniforms["spotlight.pos"].value = camObject.position;
    
    var dir = new THREE.Vector3(0,0,-1);
    var dirW = dir.applyMatrix4(camObject.matrixRotationWorld);

    spotLight.target.position = dirW;

    // request another frame update
    requestAnimationFrame(update);
    
	animateHand();
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

	/* WE DONT NEED THIS ANYMORE..
	var dl = new THREE.DirectionalLight(0xffffff, 1.0);
	dl.position.set(1.5, 0, 1);
	scene.add(dl);
	*/
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

var calculate = 0;
function animateHand() 
{
	shoulder.rotation.z = Math.cos(calculate);
	elbow.rotation.z = Math.sin(calculate);
	hand.rotation.x = Math.sin(calculate);
	calculate += 0.03;
}
