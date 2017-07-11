/**
 * Created by zhogu on 7/4/2017.
 */


var imagePath1 = "resource/pic1.jpg";
// var imagePath1 = "resource/image1B.png";
var image1 = new Image();
var imagePath2 = "resource/pic2.jpg";
// var imagePath2 = "resource/image2B.png";
var image2 = new Image();

image1.src = imagePath1;
image2.src = imagePath2;


var canvas = document.getElementById("canvas");
var glcxt = canvas.getContext("experimental-webgl");
glcxt.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

var vertexShader = glcxt.createShader(glcxt.VERTEX_SHADER);
var fragmentShader = glcxt.createShader(glcxt.FRAGMENT_SHADER);

// var curProgram;
var v4PositionIndex = 0;

var curInterval;

var verticesData =
    [
        -1.0, -1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0
    ];


function play() {

    var select = document.getElementById("selectTransactions");
    var input = document.getElementById("duration");

    var transitionType = select.options[select.selectedIndex].value;
    var interval = 5; // ms
    var duration = parseFloat(input.value) * 1000;
    var sleep = 1200;

    var transition;
    var vshaderCode, fshaderCode;
    switch (transitionType) {
        case "pushB":
            transition = defaultGL;
            vshaderCode = pushVSCode;
            fshaderCode = pushFSCode;
            break;
        case "box" :
            transition = defaultGL;
            vshaderCode = boxVSCode;
            fshaderCode = boxFSCode;
            break;
        case "cube" :
            transition = defaultGL;
            vshaderCode = cubeVSCode;
            fshaderCode = cubeFSCode;
            break;
        case "flip" :
            transition = defaultGL;
            vshaderCode = flipVSCode;
            fshaderCode = flipFSCode;
            break;
        case "fade":
            transition = defaultGL;
            vshaderCode = fadeVSCode;
            fshaderCode = fadeFSCode;
            break;
        case "zoomIn" :
            transition = defaultGL;
            vshaderCode = zoominVSCode;
            fshaderCode = zoominFSCode;
            break;
        case "zoomFade":
            transition = defaultGL;
            vshaderCode = zoominfadeVSCode;
            fshaderCode = zoominfadeFSCode;
            break;
        case "flipM" :
            transition = flipMGL;
            vshaderCode = flipMVSCode;
            fshaderCode = flipMFSCode;
            break;
        case "boxM" :
            transition = boxMGL;
            vshaderCode = boxMVSCode;
            fshaderCode = boxMFSCode;
            break;
        case "cubeM" :
            transition = cubeMGL;
            vshaderCode = cubeMVSCode;
            fshaderCode = cubeMFSCode;
            break;

        // case "peelOff":
        //     transition = peelOff;
        //     break;
        default:
            transition = defaultGL;
            vshaderCode = defaultVSCode;
            fshaderCode = defaultFSCode;
            break;
    }

    clearInterval(curInterval);

    curInterval = setInterval(function () {
        var step = ((Date.now() - start) % (duration + 2 * sleep) - sleep) / duration;
        step = Math.min(Math.max(step, 0), 1);

        var eachstep = Date.now();

        transition(glcxt, program, step);

        console.log(step + " : " + (Date.now() - eachstep));
    }, interval);


    shaderInit(glcxt, vshaderCode, fshaderCode);
    var program = programInit(glcxt);
    textureInit(glcxt, program, image1, image2);
    glcxt.clearColor(0.2, 0.2, 0.2, 0.5);
    glcxt.clear(glcxt.COLOR_BUFFER_BIT | glcxt.DEPTH_BUFFER_BIT);
    var start = Date.now();
}

function shaderInit(glcxt, vshaderCode, fshaderCode) {

    glcxt.shaderSource(vertexShader, vshaderCode);
    glcxt.shaderSource(fragmentShader, fshaderCode);
    glcxt.compileShader(vertexShader);
    glcxt.compileShader(fragmentShader);

    if (!glcxt.getShaderParameter(vertexShader, glcxt.COMPILE_STATUS)) {
        alert("compiling vertex shader failed");
    }
    if (!glcxt.getShaderParameter(fragmentShader, glcxt.COMPILE_STATUS)) {
        alert("compiling fragment shader failed");
    }
}

function programInit(glcxt) {

    var curProgram = glcxt.createProgram();
    glcxt.attachShader(curProgram, vertexShader);
    glcxt.attachShader(curProgram, fragmentShader);

    glcxt.bindAttribLocation(curProgram, v4PositionIndex, "position");
    glcxt.linkProgram(curProgram);

    if (!glcxt.getProgramParameter(curProgram, glcxt.LINK_STATUS)) {
        alert("link program error");
        return;
    }

    glcxt.useProgram(curProgram);

    var buffer = glcxt.createBuffer();
    glcxt.bindBuffer(glcxt.ARRAY_BUFFER, buffer);
    glcxt.bufferData(glcxt.ARRAY_BUFFER, new Float32Array(verticesData), glcxt.STATIC_DRAW);

    glcxt.enableVertexAttribArray(v4PositionIndex);
    glcxt.vertexAttribPointer(v4PositionIndex, 2, glcxt.FLOAT, false, 0, 0);
    return curProgram;
}

function textureInit(glcxt, program, preImage, nextImage) {
    glcxt.activeTexture(glcxt.TEXTURE0);
    var texture1 = glcxt.createTexture();
    glcxt.bindTexture(glcxt.TEXTURE_2D, texture1);
    glcxt.texImage2D(glcxt.TEXTURE_2D, 0, glcxt.RGBA, glcxt.RGBA, glcxt.UNSIGNED_BYTE, preImage);
    glcxt.texParameteri(glcxt.TEXTURE_2D, glcxt.TEXTURE_MIN_FILTER, glcxt.NEAREST);
    glcxt.texParameteri(glcxt.TEXTURE_2D, glcxt.TEXTURE_MAG_FILTER, glcxt.NEAREST);
    glcxt.texParameteri(glcxt.TEXTURE_2D, glcxt.TEXTURE_WRAP_S, glcxt.CLAMP_TO_EDGE);
    glcxt.texParameteri(glcxt.TEXTURE_2D, glcxt.TEXTURE_WRAP_T, glcxt.CLAMP_TO_EDGE);

    var uniform = glcxt.getUniformLocation(program, "preImage");
    glcxt.uniform1i(uniform, 0);

    glcxt.activeTexture(glcxt.TEXTURE1);
    var texture2 = glcxt.createTexture();
    glcxt.bindTexture(glcxt.TEXTURE_2D, texture2);
    glcxt.texImage2D(glcxt.TEXTURE_2D, 0, glcxt.RGBA, glcxt.RGBA, glcxt.UNSIGNED_BYTE, nextImage);
    glcxt.texParameteri(glcxt.TEXTURE_2D, glcxt.TEXTURE_MIN_FILTER, glcxt.NEAREST);
    glcxt.texParameteri(glcxt.TEXTURE_2D, glcxt.TEXTURE_MAG_FILTER, glcxt.NEAREST);
    glcxt.texParameteri(glcxt.TEXTURE_2D, glcxt.TEXTURE_WRAP_S, glcxt.CLAMP_TO_EDGE);
    glcxt.texParameteri(glcxt.TEXTURE_2D, glcxt.TEXTURE_WRAP_T, glcxt.CLAMP_TO_EDGE);

    var uniform2 = glcxt.getUniformLocation(program, "nextImage");
    glcxt.uniform1i(uniform2, 1);
}

function defaultGL(glcxt, program, step) {
    glcxt.clearColor(0.2, 0.2, 0.2, 0.5);
    glcxt.clear(glcxt.COLOR_BUFFER_BIT);


    var uniformStep = glcxt.getUniformLocation(program, "step");
    glcxt.uniform1f(uniformStep, step);
    glcxt.drawArrays(glcxt.TRIANGLE_STRIP, 0, 4);
}

function flipMGL(glcxt, program, step) {
    glcxt.clearColor(0.2, 0.2, 0.2, 0.5);
    glcxt.clear(glcxt.COLOR_BUFFER_BIT);


    var uniformStep = glcxt.getUniformLocation(program, "step");
    glcxt.uniform1f(uniformStep, step);

    var persAngle = 20;
    var distance = 1 / Math.tan(persAngle / 2 / 180 * Math.PI);

    var rotateM = new Matrix4();
    rotateM.setRotate(step * 180, 0, 1, 0);
    var scale = 1 - 0.2 * (0.5 - Math.abs(step - 0.5));
    rotateM.scale(scale, scale, 1);
    var viewM = new Matrix4();
    viewM.setLookAt(0, 0, distance, 0, 0, -1, 0, 1, 0);
    var persM = new Matrix4();
    persM.setPerspective(persAngle, 1, 0.1, 100);
    persM.multiply(viewM).multiply(rotateM);

    var uniformMatrix = glcxt.getUniformLocation(program, "matrix");
    glcxt.uniformMatrix4fv(uniformMatrix, false, persM.elements);
    glcxt.drawArrays(glcxt.TRIANGLE_STRIP, 0, 4);
}

function boxMGL(glcxt, program, step) {
    glcxt.clearColor(0.2, 0.2, 0.2, 0.5);
    glcxt.clear(glcxt.COLOR_BUFFER_BIT);

    var uniformMatrix = glcxt.getUniformLocation(program, "matrix");
    var uniformT = glcxt.getUniformLocation(program, "t");

    var distance = 2;
    var ddetla = step * (1 - step);
    var persAngle = 2 * Math.atan(1 / distance);
    distance += ddetla;
    var viewAngle1 = step * persAngle;
    var viewM1 = new Matrix4();
    viewM1.setLookAt(0, 0, distance, (distance) * Math.tan(viewAngle1), 0, 0, 0, 1, 0);
    var persM = new Matrix4();
    persM.setPerspective(persAngle / Math.PI * 180, 1, 0.1, 100);
    persM.multiply(viewM1);

    glcxt.uniform1i(uniformT, 0);
    glcxt.uniformMatrix4fv(uniformMatrix, false, persM.elements);
    glcxt.drawArrays(glcxt.TRIANGLE_STRIP, 0, 4);

    var viewAngle2 = (1 - step) * persAngle;
    var viewM2 = new Matrix4();
    viewM2.setLookAt(0, 0, distance, (-distance ) * Math.tan(viewAngle2), 0, 0, 0, 1, 0);
    var persM2 = new Matrix4();
    persM2.setPerspective(persAngle / Math.PI * 180, 1, 0.1, 100);
    persM2.multiply(viewM2);

    glcxt.uniform1i(uniformT, 1);
    glcxt.uniformMatrix4fv(uniformMatrix, false, persM2.elements);
    glcxt.drawArrays(glcxt.TRIANGLE_STRIP, 0, 4);
}

function cubeMGL(glcxt, program, step) {
    glcxt.clearColor(0.2, 0.2, 0.2, 0.5);
    glcxt.clear(glcxt.COLOR_BUFFER_BIT);

    var uniformMatrix = glcxt.getUniformLocation(program, "matrix");
    var uniformT = glcxt.getUniformLocation(program, "t");

    var distance = 2;  // can be defined (0-inf)
    var ddetla = 2 * step * (1 - step); // can be defined (0-0)
    var persAngle = 2 * Math.atan(1 / distance);
    var cubeAngle = persAngle; // can be defined ()
    var cubeRadius = 1 / Math.tan(cubeAngle / 2);

    var viewAngle1 = step * cubeAngle;
    var eyex1 = (distance + cubeRadius+ ddetla) * Math.sin(viewAngle1);
    var eyez1 = (distance + cubeRadius + ddetla) * Math.cos(viewAngle1) - cubeRadius;
    var viewM1 = new Matrix4().setLookAt(eyex1, 0, eyez1, 0, 0, -cubeRadius, 0, 1, 0);
    var persM1 = new Matrix4().setPerspective(persAngle / Math.PI * 180, 1, 0.1, 100);
    persM1.multiply(viewM1);

    glcxt.uniform1i(uniformT, 0);
    glcxt.uniformMatrix4fv(uniformMatrix, false, persM1.elements);
    glcxt.drawArrays(glcxt.TRIANGLE_STRIP, 0, 4);

    var viewAngle2 = (1-step )* cubeAngle;
    var eyex2 = -(distance + cubeRadius+ ddetla) * Math.sin(viewAngle2);
    var eyez2 = (distance + cubeRadius + ddetla) * Math.cos(viewAngle2) - cubeRadius;
    var viewM2 = new Matrix4().setLookAt(eyex2, 0, eyez2, 0, 0, -cubeRadius, 0, 1, 0);
    var persM2 = new Matrix4().setPerspective(persAngle / Math.PI * 180, 1, 0.1, 100);
    persM2.multiply(viewM2);

    glcxt.uniform1i(uniformT, 1);
    glcxt.uniformMatrix4fv(uniformMatrix, false, persM2.elements);
    glcxt.drawArrays(glcxt.TRIANGLE_STRIP, 0, 4);

    // var viewAngle2 = (1 - step) * persAngle;
    // var viewM2 = new Matrix4();
    // viewM2.setLookAt(0, 0, distance + ddetla, -distance * Math.tan(viewAngle2), 0, 0, 0, 1, 0);
    // var persM2 = new Matrix4();
    // persM2.setPerspective(persAngle / Math.PI * 180, 1, 0.1, 100);
    // persM2.multiply(viewM2);
    //
    // glcxt.uniform1i(uniformT, 1);
    // glcxt.uniformMatrix4fv(uniformMatrix, false, persM2.elements);
    // glcxt.drawArrays(glcxt.TRIANGLE_STRIP, 0, 4);
}

// function zoomInGL(glcxt, program, step) {
//     var uniformStep = glcxt.getUniformLocation(program, "step");
//     glcxt.uniform1f(uniformStep, step);
//     glcxt.drawArrays(glcxt.TRIANGLE_STRIP, 0, 4);
// }

