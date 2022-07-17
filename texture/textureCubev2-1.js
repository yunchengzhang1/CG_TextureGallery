"use strict";

var canvas;
var gl;

var numPositions  = 36;

var texSize = 64;

// Asynchronously load an image
var image = new Image();
image.src = muck;

// locations
var modelViewMatrixLoc;
var projectionMatrixLoc;
var lightProjectionMatrixLoc;
var lightViewMatrixLoc;
var lightPositionLoc;
var disCardNormalLoc;
var textureLoc;
var useMaterialLoc;
var toonLoc, baseLoc;
var distortionLoc;
var u_timeLoc;
var aPosition, aTexCoord, aNormal;
var barrelPowerLoc;
var uColorLoc;
var sharpLoc;
var rippleLoc, impressionLoc, tidalLoc;
var mangaLoc;

var angle = 45;
var deltaAngle = 5.5;
var barrelPower = 0;
var barrelDirection = 1;
var toggleToon = 0;
var toggleBase = 1;
var toggleSharp = 0;
var toggleRipple = 0;
var toggleImpression = 0;
var toggleTidal = 0;
var toggleManga = 0;
var uColor = vec4(1,1,1,1);
var r, g, b;

var flag = false;  // rotate cube
var lflag = false; // rotate light source

var program_default;
var program;

// textures
var tex;


// cube rotation axis and angle
var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var fovy = 45.0;
var near = 0.01;
var far = 1000.0;
var aspect = 1.0;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var eye = vec3(0, 20, 2);
var radius = 4.0;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI / 180.0;


// image.addEventListener('load', function() {
// // Now that the image has loaded make copy it to the texture.
// gl.bindTexture(gl.TEXTURE_2D, texture);
// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
// gl.generateMipmap(gl.TEXTURE_2D);
// });


// Create a checkerboard pattern using floats

var image1 = new Array()
    for (var i =0; i<texSize; i++)  image1[i] = new Array();
    for (var i =0; i<texSize; i++)
        for ( var j = 0; j < texSize; j++)
           image1[i][j] = new Float32Array(4);
    for (var i =0; i<texSize; i++) for (var j=0; j<texSize; j++) {
        var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
        image1[i][j] = [c, c, c, 1];
    }

// Convert floats to ubytes for texture

var image2 = new Uint8Array(4*texSize*texSize);

    for (var i = 0; i < texSize; i++)
        for (var j = 0; j < texSize; j++)
           for(var k =0; k<4; k++)
                image2[4*texSize*i+4*j+k] = 255*image1[i][j][k];

var positionsArray = [];
var colorsArray = [];
var texCoordsArray = [];
var normalsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];


// var vertices = [
//     vec4(-0.5, -0.5, 0.5, 1.0),
//     vec4(-0.5, 0.5, 0.5, 1.0),
//     vec4(0.5, 0.5, 0.5, 1.0),
//     vec4(0.5, -0.5, 0.5, 1.0),
//     vec4(-0.5, -0.5, -0.5, 1.0),
//     vec4(-0.5, 0.5, -0.5, 1.0),
//     vec4(0.5, 0.5, -0.5, 1.0),
//     vec4(0.5, -0.5, -0.5, 1.0)
// ];

var vertices = [
    vec4(-0.9, -0.9, 0.9, 1.0),
    vec4(-0.9, 0.9, 0.9, 1.0),
    vec4(0.9, 0.9, 0.9, 1.0),
    vec4(0.9, -0.9, 0.9, 1.0),
    vec4(-0.9, -0.9, -0.9, 1.0),
    vec4(-0.9, 0.9, -0.9, 1.0),
    vec4(0.9, 0.9, -0.9, 1.0),
    vec4(0.9, -0.9, -0.9, 1.0)
];

var alpha = 0.7;

var vertexColors = [];
var red = .7;
var green =.7;
var blue =.7;
for (let i = 0; i < vertices.length; i++){
    vertexColors.push(vec4(red, green, blue, alpha));
}

// var vertexColors = [
//     vec4(0.0, 0.0, 0.0, alpha),  // black
//     vec4(1.0, 0.0, 0.0, alpha),  // red
//     vec4(1.0, 1.0, 0.0, alpha),  // yellow
//     vec4(0.0, 1.0, 0.0, alpha),  // green
//     vec4(0.0, 0.0, 1.0, alpha),  // blue
//     vec4(1.0, 0.0, 1.0, alpha),  // magenta
//     vec4(0.0, 1.0, 1.0, alpha),  // white
//     vec4(0.0, 1.0, 1.0, alpha)   // cyan
// ];
window.onload = init;


var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;

var theta = vec3(45.0, 45.0, 45.0);

var thetaLoc;

function configureTexture1(image) {
    // create a texture
    var texture = gl.createTexture();
    // use texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // bind to TEXTURE_2D bind point of texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // fill the texture with image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
}

function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);
	var t2 = subtract(vertices[c], vertices[b]);
	var normal = cross(t1, t2);
	var normal = vec3(normal);

     positionsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);
     normalsArray.push(normal);

     positionsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[1]);
     normalsArray.push(normal);

     positionsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);
     normalsArray.push(normal);

     positionsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[0]);
     normalsArray.push(normal);

     positionsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[2]);
     normalsArray.push(normal);

     positionsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
     texCoordsArray.push(texCoord[3]);
     normalsArray.push(normal);
}


function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function initCube(program) {

	colorCube();

	cubevBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubevBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
	aPosition = gl.getAttribLocation(program, "aPosition");
	gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(aPosition);

	cubetBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubetBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
	aTexCoord = gl.getAttribLocation(program, "aTexCoord");
	gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(aTexCoord);

	cubenBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubenBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
	aNormal = gl.getAttribLocation(program, "aNormal");
	gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(aNormal);


	tex = configureTexture1(image);
}

var cubevBuffer;
var cubetBuffer;
var cubenBuffer;

function drawCube(program) {
	gl.bindBuffer(gl.ARRAY_BUFFER, cubevBuffer);
	aPosition = gl.getAttribLocation(program, "aPosition");
	gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(aPosition);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubetBuffer);
	aTexCoord = gl.getAttribLocation(program, "aTexCoord");
	gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(aTexCoord);

	gl.bindBuffer(gl.ARRAY_BUFFER, cubenBuffer);
	aNormal = gl.getAttribLocation(program, "aNormal");
	gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(aNormal);
	gl.uniform1i(disCardNormalLoc, 0);

	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.uniform1i(textureLoc, 0);
}

function getLocations(gl){
    // locations
    modelViewMatrixLoc =gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc =gl.getUniformLocation(program, "projectionMatrix");
    lightProjectionMatrixLoc =gl.getUniformLocation(program, "lightProjectionMatrix");
    lightViewMatrixLoc =gl.getUniformLocation(program, "lightViewMatrix");
    lightPositionLoc =gl.getUniformLocation(program, "lightPosition");
    disCardNormalLoc =gl.getUniformLocation(program, "disCardNormal");
    textureLoc =gl.getUniformLocation(program, "uTextureMap");
    useMaterialLoc =gl.getUniformLocation(program, "useMaterial");
    toonLoc =gl.getUniformLocation(program, "toon");
    distortionLoc =gl.getUniformLocation(program, "distortion");
    u_timeLoc =gl.getUniformLocation(program, "u_time");
    uColorLoc =gl.getUniformLocation(program, "uColor");
    baseLoc =gl.getUniformLocation(program, "show_base");
    sharpLoc =gl.getUniformLocation(program, "sharp");
    rippleLoc =gl.getUniformLocation(program, "ripple_switch");
    impressionLoc =gl.getUniformLocation(program, "impression_switch");
    tidalLoc =gl.getUniformLocation(program, "tidal_switch");
    mangaLoc =gl.getUniformLocation(program, "manga_switch");
    if (program == program_default){
        barrelPowerLoc = gl.getUniformLocation(program, "barrelp");
    }
    
}


function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.2, 0.3, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // set distortion
    var distortion = 1;
    //
    //  Load shaders and initialize attribute buffers
    //
    program_default = initShaders(gl, "vertex-shader", "fragment-shader");
    

    gl.useProgram(program_default);
    program = program_default;
    getLocations(gl);
    initCube(program_default);



    //   // Fill the texture with a 1x1 blue pixel.
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    // new Uint8Array([0, 0, 255, 255]));
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    // configureTexture(image);
    
    // configureTexture1(image);

    gl.uniform1i(disCardNormalLoc, 0);
    gl.uniform1i(textureLoc, 0);
    gl.uniform1i(distortionLoc, 0);

    document.getElementById("Buttonbarrel").onclick = function () {
		program = program_default;
		gl.useProgram(program);
		//eye = vec3(0,15,2);
		distortion = 1;
		gl.uniform1i(distortionLoc, distortion);

        barrelPower = 1.0;
	};
    // circular distortion
	document.getElementById("Buttoncircle").onclick = function () {
		program = program_default;
		gl.useProgram(program);
		//eye = vec3(0,15,2);
		// distortion = 2;
        console.log("button circle");
		gl.uniform1i(distortionLoc, 2);
	};
    // turn off distortion/ return to default
	document.getElementById("ButtonClose").onclick = function () {
		//eye = vec3(0,0,10);
		// distortion = 0;
		program = program_default;
		gl.useProgram(program);
		gl.uniform1i(distortionLoc, 0);
	};
    
    document.getElementById("ButtonToon").onclick = function () {
        if (toggleToon == 0){
            toggleToon = 1;
        }
        else {
            toggleToon = 0;
        }
    };
    document.getElementById("ButtonSharp").onclick = function () {
        if (toggleSharp == 0){
            toggleSharp = 1;
        }
        else {
            toggleSharp = 0;
        }
    };
    document.getElementById("ButtonRipple").onclick = function () {
        if (toggleRipple == 0){
            toggleRipple = 1;
        }
        else {
            toggleRipple = 0;
        }
    };
    document.getElementById("ButtonImpression").onclick = function () {
        if (toggleImpression == 0){
            toggleImpression = 1;
        }
        else {
            toggleImpression = 0;
        }
    };
    document.getElementById("ButtonTidal").onclick = function () {
        if (toggleTidal == 0){
            toggleTidal = 1;
        }
        else {
            toggleTidal = 0;
        }
    };
    document.getElementById("ButtonManga").onclick = function () {
        if (toggleManga == 0){
            toggleManga = 1;
        }
        else if (toggleManga == 1){
            toggleManga = 2;
        }
        else {
            toggleManga = 0;
        }
    };
    document.getElementById("ButtonBase").onclick = function () {
        if (toggleBase == 0){
            toggleBase = 1;
        }
        else {
            toggleBase = 0;
        }
    };
    document.getElementById("barrelPower").onchange = function (event) {
        barrelDirection = event.target.value;
    };
    document.getElementById("Red").onchange = function (event) {
        uColor[0] = event.target.value;
    };
    document.getElementById("Green").onchange = function (event) {
        uColor[1] = event.target.value;
    };
    document.getElementById("Blue").onchange = function (event) {
        uColor[2] = event.target.value;
    };

    // take keyboard inputs
    document.addEventListener('keydown', function (event) {
        if (event.key == " ") {
            const randomTexture = textures[Math.floor(Math.random() * textures.length)];
            console.log(randomTexture);
            image.src = randomTexture;
            configureTexture1(image);

        }
    });


    console.log(positionsArray)
    render();
}

function updateUniforms(){
    // update time for ripple and swirl
    gl.uniform1f(u_timeLoc, u_time);
    // update toon toggle, base toggle
    gl.uniform1i(toonLoc, toggleToon);
    gl.uniform1i(baseLoc, toggleBase);
    gl.uniform1i(sharpLoc, toggleSharp);
    gl.uniform1i(rippleLoc, toggleRipple);
    gl.uniform1i(impressionLoc, toggleImpression);
    gl.uniform1i(tidalLoc, toggleTidal);
    console.log(toggleManga);
    gl.uniform1i(mangaLoc, toggleManga);
    // update uColor
    gl.uniform4fv(uColorLoc, uColor);
} 

var u_time = 1.5;

var render = function() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (lflag) angle += deltaAngle;
	u_time+=0.1;
    updateUniforms();

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    // barrelPower.toFixed(2);
    if (barrelDirection == 1){
        if (barrelPower <= 4){
            barrelPower += 0.01;
        }
    }
    else if (barrelDirection == 0){
        if (barrelPower >= 0){
            barrelPower -= 0.01;
        }
    }
    
    
    gl.uniform1f(barrelPowerLoc, barrelPower);

    
    requestAnimationFrame(render);
}
