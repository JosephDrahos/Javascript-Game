var gl;
var shaderProgramSquare;
var shaderProgramPlayer;
var shaderProgramEnemy;
var theta;
var etheta;
var mouseCoordinatesUniform;
var stopStartFlag;
var tx, ty;
var weaponX, weaponY;
var vx, vy, vel; 
var evx, evy;
var MUniformS;
var MUniformC;
var MValue;
var MValueC;
var bufferIdPlayer;
var bufferIdWeapon;
var bufferIDEnemy;
var playerWidth = .15;
var playerHeight = .15;
var weaponWidth = 0.15;
var playerTextureInfo;
var enemyArray = [];
var currentEnemyId = 0;
var deltaTheta = 0.05;
var startTime;
var playerLives = 5;
var lastHurtTime;
var player1;
var hurtTime = 2.0;
var weaponHorizontal = true;

function init() {
    // Set up the canvas
    var canvas=document.getElementById("gl-canvas");
    gl=WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert( "WebGL is not available" ); }
    
    // Set up the viewport
    gl.viewport( 0, 0, 512, 512 );   // x, y, width, height
    
    
    // Set up the background color
    gl.clearColor( 0.2, 0.4, 0.0, 1.0 );
    
    
    shaderProgramWeapon = initShaders( gl, "vertex-shader-square",
                                      "fragment-shader-weapon" );
    shaderProgramPlayer = initShaders( gl, "vertex-shader-player",
                                      "fragment-shader-player" );
    shaderProgramEnemy = initShaders( gl, "vertex-shader-enemy",
                                      "fragment-shader-enemy" );


    theta = 0.0;
    etheta = 0.0;
    stopStartFlag = 1;
    tx = 0.0;
    ty = 0.0;
    vel = 0.01;
    vx = 0.0;
    vy = 0.0;
    evx = 0.0;
    evy = 0.0;
    var d = new Date();
    startTime = d.getTime();
    lastHurtTime = startTime;

    // Force the WebGL context to clear the color buffer
    gl.clear( gl.COLOR_BUFFER_BIT );

    initEnemy(Math.random()*2 -1, Math.random()*2 -1);

    setupPlayer();
    
    setupWeapon();
    
    render();
}

function restartGame(){
    console.log("restart");
    playerLives = 5;
    player1.updateLives(5); 
    player1.updateState("alive");
    enemyArray = [];
    currentEnemyId = 0;
    var d = new Date();
    startTime = d.getTime();

}

function setupWeapon() {
    gl.useProgram( shaderProgramWeapon );

    gl.useProgram( shaderProgramWeapon );
    MUniformS = gl.getUniformLocation(shaderProgramWeapon, "M");
    MValue = [1.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        1.0];
    gl.uniformMatrix3fv(MUniformS, false, MValue);
    // Enter array set up code here
    var p0 = vec2( 0, .075 );
    var p1 = vec2( .075, .15 );
    var p2 = vec2( .15, .075 );
    var p3 = vec2( .075, 0 );
    var arrayOfPoints = [p0, p1, p2, p3];
    
    // Create a buffer on the graphics card,
    // and send array to the buffer for use
    // in the shaders
    bufferIdWeapon = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdWeapon );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPoints), gl.STATIC_DRAW );
    
    // Create a pointer that iterates over the
    // array of points in the shader code
    var myPositionAttribute = gl.getAttribLocation( shaderProgramWeapon, "myPosition" );
    gl.vertexAttribPointer( myPositionAttribute, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionAttribute );    
}

function setupPlayer(){
    gl.useProgram( shaderProgramPlayer );
    playerTextureInfo = loadImageAndCreateTextureInfo('ness.png');
    MUniformC = gl.getUniformLocation(shaderProgramPlayer, "M");
    MValueC = [1.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        0.0,
        0.0,
        1.0];
    gl.uniformMatrix3fv(MUniformC, false, MValueC);
    // Enter array set up code here
    var p0 = vec2( 0, playerHeight);
    var p1 = vec2( playerWidth, playerHeight );
    var p2 = vec2( playerWidth, 0 );
    var p3 = vec2( 0, 0 );
    var arrayOfPointsPlayer = [p0, p1, p2, p3];
    
    // Create a buffer on the graphics card,
    // and send array to the buffer for use
    // in the shaders
    bufferIdPlayer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdPlayer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPointsPlayer), gl.STATIC_DRAW );
    
    // Create a pointer that iterates over the
    // array of points in the shader code
    var myPositionAttributePlayer = gl.getAttribLocation( shaderProgramPlayer, "myPosition" );
    gl.vertexAttribPointer( myPositionAttributePlayer, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionAttributePlayer );  

    player1 = new player(0.0, 0.0, MValueC, shaderProgramPlayer, bufferIdPlayer);
}

function initEnemy(startX, startY){
    gl.useProgram( shaderProgramEnemy );
    MUniformC = gl.getUniformLocation(shaderProgramEnemy, "M");
    MValueC = [1.0,
        0.0,
        0.0,
        0.0,
        1.0,
        0.0,
        startX,
        startY,
        1.0];
    gl.uniformMatrix3fv(MUniformC, false, MValueC);
    
    var ran = Math.floor(Math.random()*3);
    var arrayOfPointsEnemy = []
    var enemyType;
    if(ran == 1){
        var p0 = vec2( 0, playerHeight);
        var p1 = vec2( playerWidth, playerHeight );
        var p2 = vec2( playerWidth, 0 );
        var p3 = vec2( 0, 0 );
        arrayOfPointsEnemy = [p0, p1, p2, p3];
        enemyType = 1;
    }else if(ran == 2){
        var p0 = vec2( 0, playerHeight/2);
        var p1 = vec2( playerWidth/2, playerHeight );
        var p2 = vec2( playerWidth, playerHeight/2);
        var p3 = vec2( playerWidth/2, 0 );
        arrayOfPointsEnemy = [p0, p1, p2, p3];
        enemyType = 2;
    }else{
        var p0 = vec2( playerWidth/6, 0);
        var p1 = vec2( 0, playerHeight/2 );
        var p2 = vec2( playerWidth/6, playerHeight);
        var p3 = vec2( 5*playerWidth/6, playerHeight );
        var p4 = vec2( playerWidth, playerHeight/2);
        var p5 = vec2( 5*playerWidth/6, 0 );
        arrayOfPointsEnemy = [p0, p1, p2, p3, p4, p5];
        enemyType = 3;
    }
    
    // Create a buffer on the graphics card,
    // and send array to the buffer for use
    // in the shaders
    bufferIdEnemy = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdEnemy );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(arrayOfPointsEnemy), gl.STATIC_DRAW );
    
    // Create a pointer that iterates over the
    // array of points in the shader code
    var myPositionAttributeEnemy = gl.getAttribLocation( shaderProgramEnemy, "myPosition" );
    gl.vertexAttribPointer( myPositionAttributeEnemy, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionAttributeEnemy ); 

    enemyArray.push(new enemy(enemyType, startX, startY, MValueC, shaderProgramEnemy, bufferIdEnemy));
    currentEnemyId ++;
}

var keysPressed = new Array();

function keyUp( e ){
     s="";
     keysPressed[e.which] = false;
     Key = window.event.keyCode;
     s+=Key+" activee:" + keysPressed[e.which];
     updateKeys();
}

function moveSquareKeys( e ){
    if(e.keyCode == 16){
        weaponHorizontal = !weaponHorizontal;
    }

    var s="";
    keysPressed[e.which] = true;
    Key = window.event.keyCode;
    s+=Key+" activee:" + keysPressed[e.which];
    updateKeys();
}

function updateKeys(){
    //console.log(keysPressed);
    if (keysPressed[32]){ //space
        deltaTheta = 0.1;
    }else{
        deltaTheta = 0.05;
    }

    if (keysPressed[68]){ //d
        vx = player1.getVel();
    }

    if (keysPressed[65]){ //a
        vx = -1*player1.getVel();
    }
    if (keysPressed[83]){ //s
        vy = -1*player1.getVel();
    }
    if (keysPressed[87]){ //w
        vy = player1.getVel();
    }

    if(!keysPressed[68] && !keysPressed[65])
        vx = 0;

    if(!keysPressed[83] && !keysPressed[87])
        vy = 0;

}

setInterval(updateKeys, 1);

function moveSquare( event ){

}

function spawnEnemy(){
    var ranX = Math.random()*2 -1;
    var ranY = Math.random()*2 -1;
    while(distance(ranX, ranY, player1.getPositionX(), player1.getPositionY()) < (playerWidth*2)){
        ranX = Math.random()*2 -1;
        ranY = Math.random()*2 -1;
    }

    initEnemy(ranX, ranY);
}

function render(){
    gl.clear( gl.COLOR_BUFFER_BIT );

    var d = new Date();
    var currentTime = d.getTime();
    var dT = Math.round((currentTime - startTime) / 10);
    
    //enemy spawner at set intervals to increase difficulty
    if(player1.getLives() > 0){
        if( (dT % 125) - 1 <= 0 && dT < 1500 && dT >= 0){ //0-15s
            spawnEnemy();
        } else if((dT % 75) - 1 <= 0 && dT < 3000 && dT >= 1500){//15-30s
            spawnEnemy();
        }else if((dT % 50)-1 <= 0  &&  dT >= 3000){//30+s
            spawnEnemy();
        }
    }
    

    enemyArray.forEach(function(e, index){
        if(e.checkAlive()){
            if(e.checkCollisionPlayer(tx, ty) && ((currentTime - player1.getLastHurtTime()) / 1000) > hurtTime && player1.getState() != "dead"){
                player1.hurt();
                console.log(playerLives);
            }
            drawEnemy(e);
        }else{
            enemyArray.splice(index, 1);
        }

    });

    if(player1.getState() != "dead"){
        drawWeapon();
        drawPlayer();
        document.getElementById("elapsedTime").innerHTML = Math.floor((currentTime - startTime) / 1000);
        
    }
    if(player1.getLives() < 0){
        player1.updateLives(0);
    }
    document.getElementById("playerLives").innerHTML = player1.getLives();
    document.getElementById("bestTime").innerHTML = Math.floor(player1.getMaxSurvivalTime());
    
    requestAnimFrame( render );
}

function drawWeapon() {
    gl.useProgram( shaderProgramWeapon );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferIdWeapon );
    var thetaUniform = gl.getUniformLocation( shaderProgramWeapon , "theta" );
    gl.uniform1f( thetaUniform, theta );
    
    theta += deltaTheta * stopStartFlag;
    etheta += 0.05;
    //tx = player1.getPositionX();
    //ty = player1.getPositionY();
    tx += vx;
    ty += vy;
    

    if(tx > 1-playerWidth){
        tx = 1-playerWidth;
    }else if(tx < -1){
        tx = -1;
    }

    if(ty > 1-playerHeight){
        ty = 1-playerHeight;
    }else if(ty < -1){
        ty = -1;
    }

    player1.updatePosition(tx, ty);

    
    if(weaponHorizontal){
        weaponX = Math.cos(theta)/2 + tx;
        weaponY = Math.sin(theta)*Math.cos(theta)/4 + ty;
        MValue = [1.0,
                  0.0,
                  0.0,
                  0.0,
                  1.0,
                  0.0,
                  weaponX,
                  weaponY,
                  1.0];
    }else{
        weaponX = Math.cos(theta)/3.3 + tx;
        weaponY = Math.sin(theta)/3.3 + ty;
        MValue = [1.0,
                  0.0,
                  0.0,
                  0.0,
                  1.0,
                  0.0,
                  weaponX,
                  weaponY,
                  1.0];
    }
    gl.uniformMatrix3fv(MUniformS, false, MValue);

    // Create a pointer that iterates over the
    // array of points in the shader code
    var myPositionAttribute = gl.getAttribLocation( shaderProgramWeapon, "myPosition" );
    gl.vertexAttribPointer( myPositionAttribute, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionAttribute );    


    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
}

function drawPlayer(){
    gl.useProgram( player1.getShader() );
    gl.bindBuffer( gl.ARRAY_BUFFER, player1.getBuffer());
    MUniformC = gl.getUniformLocation( player1.getShader() , "M" );
    MValueC = player1.getMat();

    gl.uniformMatrix3fv(MUniformC, false, MValueC);

    // Create a pointer that iterates over the
    // array of points in the shader code
    var myPositionAttributePlayer = gl.getAttribLocation( player1.getShader(), "myPosition" );
    gl.vertexAttribPointer( myPositionAttributePlayer, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionAttributePlayer );

    var d = new Date();
    var dt = (d.getTime() - player1.getLastHurtTime()) / 1000;
    if (player1.getLives() == 0){
        player1.updateState("dead");
    }else if(player1.getState() == "hurt" && dt < hurtTime) {
        if( Math.round(dt*10) % 2 == 0){
            gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
        }
    }else if(player1.getLives() > 0){
        player1.updateVel(0.01);
        player1.updateState("alive");
        gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    }
}

function drawEnemy(e){
    gl.useProgram( e.getShader() );
    gl.bindBuffer( gl.ARRAY_BUFFER, e.getBuffer() );
    MUniformC = gl.getUniformLocation( e.getShader() , "M" );

    etx = e.getPositionX();
    ety = e.getPositionY();

    if(e.getType() == 1){
        evx = (tx-etx)*(vel+0.005);
        evy = (ty-ety)*(vel+0.005);
    }else if (e.getType() == 2){
        evx = (tx-etx)*(vel+0.01);
        evy = (ty-ety)*(vel+0.01);
    }else{
        evx = (tx-etx)*(vel-0.005);
        evy = (ty-ety)*(vel-0.005);
    }

    etx += evx;
    ety += evy;

    if(etx > 1-playerWidth){
        etx = 1-playerWidth;
    }else if(etx < -1){
        etx = -1;
    }

    if(ety > 1-playerHeight){
        ety = 1-playerHeight;
    }else if(ety < -1){
        ety = -1;
    }

    e.updatePosition(etx, ety);

    MValueC = e.getMat(); /*[1.0,
              0.0,
              0.0,
              0.0,
              1.0,
              0.0,
              etx,
              ety,
              1.0];*/
    gl.uniformMatrix3fv(MUniformC, false, MValueC);

    // Create a pointer that iterates over the
    // array of points in the shader code
    var myPositionAttributeEnemy = gl.getAttribLocation( e.getShader(), "myPosition" );
    gl.vertexAttribPointer( myPositionAttributeEnemy, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPositionAttributeEnemy );

    if(e.checkAlive()){
        if(e.getType() == 3){
            gl.drawArrays( gl.TRIANGLE_FAN, 0, 6 );
        }else{
            gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
        }
    }
}

function distance(x1, y1, x2, y2){
    return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

// creates a texture info { width: w, height: h, texture: tex }
// The texture will start with 1x1 pixels and be updated
// when the image has loaded
function loadImageAndCreateTextureInfo(url) {
  var tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
 
  // let's assume all images are not a power of 2
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
 
  var textureInfo = {
    width: 1,   // we don't know the size until it loads
    height: 1,
    texture: tex,
  };
  var img = new Image();
  img.addEventListener('load', function() {
    textureInfo.width = img.width;
    textureInfo.height = img.height;
 
    gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  });
 
  return textureInfo;
}

function playerHurt(){
    if(playerLives <= 0){

    }else{
        playerLives --;
    }
    

}

class player{
    constructor(tx, ty, mat, shaderProgramPlayer, buffer){
        this.x = tx;
        this.y = ty;
        this.vel = 0.01;
        this.mat = mat;
        this.shader = shaderProgramPlayer;
        this.buffer = buffer;
        this.lives = 5;
        this.state = "alive";
        var d = new Date();
        this.lastHurtTime = d.getTime();
        this.maxSurviveTime = 0.0;
    }

    getPositionX(){
        return this.x;
    }

    getPositionY(){
        return this.Y;
    }

    getMat(){
        return this.mat;
    }

    getShader(){
        return this.shader;
    }

    getBuffer(){
        return this.buffer;
    }

    getState(){
        return this.state;
    }

    getVel(){
        return this.vel;
    }

    getLastHurtTime(){
        return this.lastHurtTime;
    }

    getLives(){
        return this.lives;
    }

    getMaxSurvivalTime(){
        return this.maxSurviveTime;
    }

    updateVel(newVel){
        this.vel = newVel;
    }

    updateState(state){
        this.state = state;
    }

    updateLives(numLives){
        this.lives = numLives;

        if(numLives == 0){
            this.state = "dead";
        }
    }

    updatePosition(x,y){
        this.x = x;
        this.y = y;
        this.mat = [1.0,
                  0.0,
                  0.0,
                  0.0,
                  1.0,
                  0.0,
                  this.x,
                  this.y,
                  1.0];
    }

    hurt(){
        this.lives --;
        if(this.lives <= 0){
            this.state = "dead";
            var d = new Date();
            this.timeOfDeath = (d.getTime() - startTime) / 1000;
            if(this.timeOfDeath > this.maxSurviveTime){
                this.maxSurviveTime = this.timeOfDeath;
            }
        }else if (this.state != "dead"){
            var d = new Date();
            this.lastHurtTime = d.getTime();
            this.state = "hurt";
            this.vel = 0.02;
        }
    }

}

class enemy{
    constructor(type, etx, ety, mat, shaderProgramEnemy, buffer){
        this.type = type;
        this.tx = etx;
        this.ty = ety;
        this.mat = mat;
        this.shader = shaderProgramEnemy;
        this.buffer = buffer;
        this.alive = true;
    }

    getType(){
        return this.type;
    }

    getPositionX(){
        return this.tx;
    }

    getPositionY(){
        return this.ty;
    }

    getMat(){
        return this.mat;
    }

    getShader(){
        return this.shader;
    }

    getBuffer(){
        return this.buffer;
    }

    updatePosition(x, y){
        this.tx = x;
        this.ty = y;

        this.mat = [1.0,
                  0.0,
                  0.0,
                  0.0,
                  1.0,
                  0.0,
                  x,
                  y,
                  1.0];

    }

    checkCollisionWeapon(wX, wY){
        var d = distance(weaponX, weaponY, this.tx, this.ty);
        if( d < (weaponWidth + 0.01)){
            this.alive = false;
        }
    }

    checkCollisionPlayer(cX, cY){
        var d = distance(cX, cY, this.tx, this.ty);
        if( d < (playerWidth - 0.01)){
            return true;
        }
        return false;
    }

    checkAlive(){
        this.checkCollisionWeapon(weaponX, weaponY);
        return this.alive;
    }
}