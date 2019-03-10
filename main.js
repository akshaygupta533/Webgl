var cubeRotation = 0.0;
var buildings = [];
var tracks = [];
var trains = [];
var obstacles1 = [];
var obstacles2 = [];
var boots = [];
var coins = [];
var jets = [];
score = 0;
flag=0;
flash = 0;
var gray = 0;
canvas = document.querySelector('#glcanvas');
gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
player = {
  buffer: initPlayer(gl,flag),
  position: [0,-1,-5],
  jump: false,
  crouch: false,
  crouch_time: -1,
  superjump: false,
  superjump_time: -1,
  dead: false,
  slow: true,
  slow_time: 0,
  jet: false,
  jet_time: -1,
};
police = {
  buffer: initPlayer(gl,flag),
  position: [0,-1,-3],
}

main();
//
// Start here
//
function main() {
  

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec3 aVertexNormal;
  attribute vec2 aTextureCoord;
  
  uniform mat4 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;
  uniform highp float uFlash;
  uniform int uLevel;

  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    // Apply lighting effect
    highp vec3 ambientLight = vec3(0.3 + uFlash, 0.3 + uFlash, 0.3 + uFlash);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0, -1, 1));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    if(uLevel==1 || uLevel==3)
      vLighting = ambientLight + (directionalLightColor * directional);
    else
      vLighting = vec3(1.0 + uFlash, 1.0 + uFlash, 1.0 + uFlash);
  }
  `;
  const fsSource = `
  varying highp vec2 vTextureCoord;
  varying highp vec3 vLighting;

  uniform sampler2D uSampler;
  uniform bool uGray;
  uniform highp float uFlash;

  void main(void) {
    if(uGray)
    {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord).rgba;
      highp float grayScale = dot(texelColor.rgb, vec3(0.199, 0.587, 0.114));
      highp vec3 grayImage = vec3(grayScale+uFlash, grayScale+uFlash, grayScale+uFlash);
      gl_FragColor = vec4(grayImage * vLighting, texelColor.a);
    }
    else
    {
      highp vec4 texelColor = texture2D(uSampler, vTextureCoord).rgba;
      highp vec3 Image = vec3(texelColor.r + uFlash, texelColor.g + uFlash, texelColor.b + uFlash);
      gl_FragColor = vec4(Image * vLighting, texelColor.a);
    }

  }
  `;

  
  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const shaderProgramtxt = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVevrtexColor and also
  // look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };
  
  const programInfotxt = {
    program: shaderProgramtxt,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgramtxt, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgramtxt, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgramtxt, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgramtxt, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgramtxt, 'uSampler'),
    },
  };

  

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  for(i=0;i<20;i++){
    buildings.push({
      buffer: initBuildings(gl),
      draw: drawBuildings,
      position: [3,-1,-11*i],
    });
    buildings.push({
      buffer: initBuildings(gl),
      draw: drawBuildings,
      position: [-3,-1,-11*i],
    });
  }

  for(i=0;i<50;i++){
    tracks.push({
    buffer: initTracks(gl),
    draw: drawTracks,
    position: [0,-1,-5*i],
    });
    tracks.push({
      buffer: initTracks(gl),
      draw: drawTracks,
      position: [-4,-1,-5*i],
      });
      tracks.push({
        buffer: initTracks(gl),
        draw: drawTracks,
        position: [4,-1,-5*i],
        });
  }

  for(var i=0;i<20;i++){
    coins.push({
      buffer: initCoin(gl),
      position: [-1,-0.6,-i-10],
      rotation: 0,
    });
  }

  for(var i=0;i<20;i++){
    coins.push({
      buffer: initCoin(gl),
      position: [0,-0.6,-i-30],
      rotation: 0,
    });
  }
  
  for(var i=0;i<20;i++){
    coins.push({
      buffer: initCoin(gl),
      position: [0,-0.6,-i-50],
      rotation: 0,
    });

    coins.push({
      buffer: initCoin(gl),
      position: [1,-0.6,-i-50],
      rotation: 0,
    });

    coins.push({
      buffer: initCoin(gl),
      position: [-1,-0.6,-i-50],
      rotation: 0,
    });
  }

  for(var i=0;i<50;i++){
    coins.push({
      buffer: initCoin(gl),
      position: [0,1.2,-i-75],
      rotation: 0,
    });

    coins.push({
      buffer: initCoin(gl),
      position: [1,1.2,-i-75],
      rotation: 0,
    });

    coins.push({
      buffer: initCoin(gl),
      position: [-1,1.2,-i-75],
      rotation: 0,
    });
  }

  for(var i=0;i<20;i++){
    coins.push({
      buffer: initCoin(gl),
      position: [0,-0.8,-i-135],
      rotation: 0,
    });
  }

  trains.push({
    buffer: initTrains(gl),
   position: [-1.1, -0.8,-30],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train_s.png'),
   front: loadTexture(gl,'./train_front.png'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [0, -0.8,-95],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train_s.png'),
   front: loadTexture(gl,'./train1.jpg'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [0, -0.8,-150],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train_s.png'),
   front: loadTexture(gl,'./train_front.png'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [1.1, -0.8,-155],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train_s.png'),
   front: loadTexture(gl,'./train1.jpg'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [-1.1, -0.8,-160],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train2.jpg'),
   front: loadTexture(gl,'./train2.jpg'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [0, -0.8,-230],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train_s.png'),
   front: loadTexture(gl,'./train1.jpg'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [1.1, -0.8,-200],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train_s.png'),
   front: loadTexture(gl,'./train1.jpg'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [-1.1, -0.8,-1800],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train_s.png'),
   front: loadTexture(gl,'./train1.jpg'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [1.1, -0.8,-230],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train_s.png'),
   front: loadTexture(gl,'./train1.jpg'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [-1.1, -0.8,-300],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train2.jpg'),
   front: loadTexture(gl,'./train2.jpg'),
  });

  trains.push({
    buffer: initTrains(gl),
   position: [0, -0.8,-240],
   top: loadTexture(gl,'./train_top.png'),
   side: loadTexture(gl,'./train_s.png'),
   front: loadTexture(gl,'./train_front.png'),
  });

  obstacles1.push({
    buffer: initObs1(gl),
    position: [0,-1,-20],
    col: false,
  });

  obstacles1.push({
    buffer: initObs1(gl),
    position: [1.3,-1,-41],
    col: false,
  });

  
  obstacles2.push({
    buffer: initObs2(gl),
    position: [-1.3,-1,-30],
    col: false,
    bush: false,
  });

  obstacles2.push({
    buffer: initObs1(gl),
    position: [-1.3,-1,-60],
    col: false,
    bush: true,
  });

  obstacles1.push({
    buffer: initObs1(gl),
    position: [0,-1,-60],
    col: false,
  });

  obstacles2.push({
    buffer: initObs1(gl),
    position: [1.3,-1,-60],
    col: false,
    bush: true,
  });

  obstacles2.push({
    buffer: initObs1(gl),
    position: [-1.3,-1,-130],
    col: false,
    bush: true,
  });

  obstacles2.push({
    buffer: initObs2(gl),
    position: [-1.3,-1,-135],
    col: false,
    bush: false,
  });

  // obstacles2.push({
  //   buffer: initObs2(gl),
  //   position: [1.3,-1,-25],
  //   col: false,
  // });

  boots.push({
    buffer: initBoots(gl),
    position: [1.3,-0.9,-40],
  });

  jets.push({
    buffer: initBoots(gl),
    position: [-1.3,-0.9,-72] 
  });

  textureobj = {
    train_front: loadTexture(gl,'train_front.png'),
    train_top: loadTexture(gl,'train_top.png'),
    train_s: loadTexture(gl,'train_s.png'),
    brick: loadTexture(gl, 'brick.png'),
    tracks: loadTexture(gl,'tracks.png'),
    skin: loadTexture(gl,'skin.png'),
    cloth: loadTexture(gl,'cloth.png'),
    coin: loadTexture(gl,'coin.png'),
    obs: loadTexture(gl,'obs.png'),
    jeans: loadTexture(gl,'jeans.jpg'),
    boots: loadTexture(gl,'./boots.jpg'),
    police: loadTexture(gl,'./police.png'),
    jet: loadTexture(gl,'./jet.png'),
    train1: loadTexture(gl,'./train1.jpg'),
    train2: loadTexture(gl,'./train2.jpg'),
    grass: loadTexture(gl,'./grass.jpg'),
  };

  var then = 0;

  document.getElementById('intro').play();  
  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;
    if(player.dead==true){
      document.getElementById('theme').pause();
      alert('You died'+'\nFinal Score: '+score);
      return;
    }
    if(gray==0)
      gl.clearColor(135/256, 206/256, 235/256, 1.0);
    else
      gl.clearColor(220/256, 220/256, 220/256, 1.0);

    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawScene(gl, programInfo, programInfotxt,textureobj, deltaTime);
    
    var GrayBuffer = gl.getUniformLocation(programInfotxt.program, "uGray");
    gl.uniform1i(GrayBuffer, gray);

    var FlashBuffer = gl.getUniformLocation(programInfotxt.program, "uFlash");
    gl.uniform1f(FlashBuffer,flash);

    if(flash>0)
      flash-=0.01;
    else
      flash=0;

    if(document.getElementById('theme').paused)
      document.getElementById('theme').play();
    
    
    tick_elements(now);
    tick_input();

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just
// have one object -- a simple three-dimensional cube.
//


//
// Draw the scene.
//
function drawScene(gl, programInfoflash, programInfotxt,texture, deltaTime) {

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  for(i=0;i<tracks.length;i++){
    drawTracks(gl, programInfotxt, tracks[i],texture.tracks, deltaTime);
  }

  drawPlayer(gl, programInfotxt, player, texture.skin,texture.cloth,texture.jeans, deltaTime);
  drawPlayer(gl,programInfotxt,police,texture.skin,texture.police,texture.jeans,deltaTime);
  
  for(i=0;i<buildings.length;i++){  
  drawBuildings(gl, programInfotxt, buildings[i], texture.brick, deltaTime);
  }

  for(i=0;i<coins.length;i++){
  drawCoin(gl,programInfotxt,coins[i],texture.coin,deltaTime);    
  }

  for(i=0;i<trains.length;i++)
    drawTrains(gl,programInfotxt,trains[i],trains[i].front,trains[i].side, trains[i].top ,deltaTime);
  
  for(i=0;i<obstacles1.length;i++)
    drawObs1(gl,programInfotxt,obstacles1[i],texture.obs,deltaTime);
  for(i=0;i<obstacles2.length;i++){
    if(obstacles2[i].bush==false)
      drawObs2(gl,programInfotxt,obstacles2[i],texture.obs,deltaTime);
    else
      drawObs1(gl,programInfotxt,obstacles2[i],texture.grass,deltaTime);

  }
  
  for(i=0;i<boots.length;i++)
    drawBoots(gl,programInfotxt,boots[i],texture.boots,deltaTime)
  for(i=0;i<jets.length;i++){
    drawBoots(gl,programInfotxt,jets[i],texture.jet,deltaTime)
  }
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function tick_elements(now){
  police.position[0] = player.position[0];
  playerbb = {
    y: player.position[1]+0.35,
    height: 0.7,
    z: player.position[2],
    width: 0.1,
  };
  if(player.slow==false && police.position[2]<=1){
    police.position[2]+=0.05;
  }
  //Collisions
    //coins
    for(i=0;i<coins.length;i++){
      if( same_x(coins[i],player) ){
        coinbb = {
          y:coins[i].position[1],
          height: 0.1,
          z:coins[i].position[2],
          width: 0.01,
        };


        if( detect_collision(playerbb,coinbb)  ){
          document.getElementById('coins').play();  
          flash = 0.2;
          coins.splice(i,1);
          score+=1;
          i--;
        }
      }
    }

    //obstacle1
    for(i=0;i<obstacles1.length;i++){
      if(same_x(obstacles1[i],player)){
        obstacles1_bb = {
          y: -1+0.2,
          height : 0.4,
          z: obstacles1[i].position[2],
          width : 0.01,
        };

        if( detect_collision(playerbb,obstacles1_bb) && obstacles1[i].col==false ){
          player.dead=true;
          document.getElementById('crash').play();
          obstacles1[i].col=true;
          // obstacles1.splice(i,1);
        }
      }
    }
    // console.log('slow'+player.slow);
    // console.log('dead'+player.dead);
    //obstacle2
    for(i=0;i<obstacles2.length;i++){
      if(same_x(obstacles2[i],player)){
        if(obstacles2[i].bush==false)
          obstacles2_bb = {
            y: -1+0.2+0.5,
            height : 0.4,
            z: obstacles2[i].position[2],
            width : 0.01,
          };
        else{
          obstacles2_bb = {
            y: -1+0.2,
          height : 0.4,
          z: obstacles2[i].position[2],
          width : 0.01,
          };
        }

        if( detect_collision(playerbb,obstacles2_bb) && obstacles2[i].col==false  ){
          
          if(obstacles2[i].bush==true){
            document.getElementById('bush').play();
          }
          else{
          document.getElementById('crash').play();
          }

          document.getElementById('guard2').play();
          obstacles2[i].col=true;

          if(player.slow==true){
          document.getElementById('guard1').play();
            player.dead=true;
          }

          player.slow=true;
          police.position[2]=-3;
          // obstacles1.splice(i,1);
        }
      }
    }

    //boots
    for(i=0;i<boots.length;i++){
      if( same_x(boots[i],player) ){
        boot_bb = {
          y: boots[i].position[1],
          height: 0.2,
          z: boots[i].position[2],
          width: 0.2,
        };
          if(detect_collision(playerbb,boot_bb)){
            document.getElementById('powerup').play();
            boots.splice(i,1);
            i--;
            player.superjump=true;
            player.superjump_time = now;
          }
      }
    }

    //jets
    for(i=0;i<jets.length;i++){
      if( same_x(jets[i],player) ){
        jet_bb = {
          y: jets[i].position[1],
          height: 0.2,
          z: jets[i].position[2],
          width: 0.2,
        };
          if(detect_collision(playerbb,jet_bb)){
            document.getElementById('powerup').play();
            jets.splice(i,1);
            i--;
            player.jet=true;
          }
      }
    }

    train_flag=false;
    //trains
    for(i=0;i<trains.length;i++){
      if(same_x(trains[i],player)){
        train_bb={
          y: -0.45,
          height: 0.7,
          z: trains[i].position[2]-5,
          width: 10,
        };
        if( detect_collision(playerbb,train_bb) )
          if(player.position[1] >= -0.19)
            train_flag=true;
          else{
            player.dead=true;
            document.getElementById('death').play();
          }
      }
    }

  for(i=0;i<buildings.length;i++)
    buildings[i].position[2]+=0.05;

  for(i=0;i<tracks.length;i++)
    tracks[i].position[2]+=0.05;

  for(i=0;i<obstacles1.length;i++)
    obstacles1[i].position[2]+=0.05;
  for(i=0;i<obstacles2.length;i++)
    obstacles2[i].position[2]+=0.05;
  if(boots.length!=0)
    boots[0].position[2]+=0.05;

  for(i=0;i<jets.length;i++)
    jets[i].position[2]+=0.05;

  for(i=0;i<coins.length;i++){
    coins[i].position[2]+=0.05;
    coins[i].rotation+=0.1;
  }
  for(i=0;i<trains.length;i++)
    trains[i].position[2]+=0.1;
  
  if(Math.round(now*3)%2==0)flag=0;
  else flag=1;
  player.buffer = initPlayer(gl,flag);
  police.buffer = initPlayer(gl,flag);

  if(player.superjump==true)
    maxh = 1;
  else
    maxh = 0;
  
  if(now - player.superjump_time>5){
    player.superjump=false;
    player.superjump_time=-1;
  }
  
  if(player.jump==true && player.crouch==false &&player.jet==false){
    if(player.position[1]<=maxh)
      player.position[1]+=0.05;
    else
      player.jump=false;
  }
  else {
    if(player.position[1]>-1 &&train_flag==false && player.jet==false)
      player.position[1]-=0.05;
  }

  if(player.jet==true){
    if(player.jet_time==-1){
      player.position[1]=1;
      player.jet_time=now;
    }
    if(now-player.jet_time>15){
      player.jet=false;
      player.jet_time=-1;
    }
  }


  if(player.slow==true){
    if(player.slow_time==-1)
      player.slow_time=now;
    if(now-player.slow_time>3){
      player.slow=false;
      player.slow_time=-1;
    }

  }

  if(player.crouch==true &&player.jet==false){
    player.jump=false;
    if(player.crouch_time==-1)
      player.crouch_time=now;
    player.position[1]=-1.25;
    if(now-player.crouch_time>=1){
      player.crouch_time=-1;
      player.crouch=false;
      player.position[1]=-1;
    }
  }

}

function tick_input(){
  Mousetrap.bind('right',function(){
    if(player.position[0]!=1.3)
    {player.position[0]+=1.3;
      document.getElementById('move').play();
    }
  });

  Mousetrap.bind('left',function(){
    if(player.position[0]!=-1.3){
    player.position[0]-=1.3;
    document.getElementById('move').play();
    }
  });
  Mousetrap.bind('up',function(){
    if(player.position[1]<=-1 && player.crouch!=true){
      player.jump=true;
      if(player.superjump==true)document.getElementById('superjump').play();
      else document.getElementById('jump').play()
    }
  });
  Mousetrap.bind('down',function(){
    if(player.crouch==false&&player.jet==false)
      player.crouch=true;
      document.getElementById('crouch').play();
  });

  Mousetrap.bind('g',function(){gray=(gray+1)%2;});

}

function detect_collision(a, b) {
  return (Math.abs(a.z - b.z) * 2 < (a.width + b.width)) &&
         (Math.abs(a.y - b.y) * 2 < (a.height + b.height));
}

function same_x(a,b){
  return ( a.position[0]*b.position[0]>0 || (a.position[0]==0 && b.position[0]==0));
}