var bvc;
function initBuildings(gl) {
   positionBuffer = gl.createBuffer();
  // Select the positionBuffer as the one to apply buffer
  // operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Now create an array of positions for the cube.
  positions = [
    
    //Right building
    
    //left face
    -1, 0, 0,
    -1, 0, -10,
    -1, 2, -10,
    -1, 2, 0,

    //front face
    -1, 0, 0,
    -1, 2, 0,
    1, 2, 0,
    1, 0, 0,

    //top face
    -1, 2, 0,
    -1, 2, -10,
    1, 2, -10,
    1, 2, 0,
    //right face
    1, 0, 0,
    1, 0, -10,
    1, 2, -10,
    1, 2, 0,

    ];
  
  var i;
  bvc = positions.length/3;

  // Now pass the list of positions into WebGL to build the
  // shape. We do this by creating a Float32Array from the
  // JavaScript array, then use it to fill the current buffer.

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Now set up the colors for the faces. We'll use solid colors
  // for each face.

  textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    // 0.0,  0.0,
    // 1.0,  0.0,
    // 1.0,  1.0,
    // 0.0,  1.0,
    // Right
    // 0.0,  0.0,
    // 1.0,  0.0,
    // 1.0,  1.0,
    // 0.0,  1.0,
    
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex arrays for each face's vertices.

   indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.

  var indices = [];
  for(i=0;i<4;i++){
    indices.push(4*i+0);
    indices.push(4*i+1);
    indices.push(4*i+2);

    indices.push(4*i+0);
    indices.push(4*i+2);
    indices.push(4*i+3);
  }

  // Now send the element array to GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}


function drawBuildings(gl, programInfo, building,texture, deltaTime){

    fieldOfView = 45 * Math.PI / 180;   // in radians
    aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    zNear = 0.1;
    zFar = 1000.0;
    projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
   modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 building.position);  // amount to translate

  //Write your code to Rotate the cube here//


  // mat4.rotate(modelViewMatrix, modelViewMatrix, cubeRotation, [0,1,1]);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  {
     numComponents = 3;
     type = gl.FLOAT;
     normalize = false;
     stride = 0;
     offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, building.buffer.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // tell webgl how to pull out the texture coordinates from buffer
  {
     num = 2; // every coordinate composed of 2 values
     type = gl.FLOAT; // the data in the buffer is 32 bit float
     normalize = false; // don't normalize
     stride = 0; // how many bytes to get from one set to the next
     offset = 0; // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, building.buffer.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, num, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    }

  // Tell WebGL which indices to use to index the vertices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, building.buffer.indices);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

    // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
     vertexCount = (bvc*6)/4;
     type = gl.UNSIGNED_SHORT;
     offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // cubeRotation+=deltaTime;
}
