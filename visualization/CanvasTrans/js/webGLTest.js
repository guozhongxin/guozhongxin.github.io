/**
 * Created by zhogu on 6/29/2017.
 */
var webgl;
var vertexShaderObject;
var fragmentShaderObject;
var curProgram;
var v4PositionIndex = 0;

var curInterval;

var verticesData =
    [
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0
    ];




function webglInit() {
    var canvas = document.getElementById("canvas");
    webgl = canvas.getContext("experimental-webgl");
    webgl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

    vertexShaderObject = webgl.createShader(webgl.VERTEX_SHADER);
    fragmentShaderObject = webgl.createShader(webgl.FRAGMENT_SHADER);
}

function shaderInit(type) {
    var vshaderCode, fshaderCode;
    switch (type) {
        case "wave":
            vshaderCode = waveVertexShader;
            fshaderCode = waveFragmentShader;
            break;
        default:
            // TODO
            return;
    }
    webgl.shaderSource(vertexShaderObject, vshaderCode);
    webgl.shaderSource(fragmentShaderObject, fshaderCode);
    webgl.compileShader(vertexShaderObject);
    webgl.compileShader(fragmentShaderObject);

    if (!webgl.getShaderParameter(vertexShaderObject, webgl.COMPILE_STATUS)) {
        alert("compiling vertex shader failed");
        return;
    }
    if (!webgl.getShaderParameter(fragmentShaderObject, webgl.COMPILE_STATUS)) {
        alert("compiling fragment shader failed");
        return;
    }
}

function shaderProgramInit() {
    if (curProgram != null) {
        webgl.deleteProgram(curProgram);
    }
    curProgram = webgl.createProgram();
    webgl.attachShader(curProgram, vertexShaderObject);
    webgl.attachShader(curProgram, fragmentShaderObject);

    webgl.bindAttribLocation(curProgram, v4PositionIndex, "position");
    webgl.linkProgram(curProgram);
    if (!webgl.getProgramParameter(curProgram, webgl.LINK_STATUS)) {
        alert("link program error");
        return;
    }
    webgl.useProgram(curProgram);

    var buffer = webgl.createBuffer();
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(verticesData), webgl.STATIC_DRAW);

    webgl.enableVertexAttribArray(v4PositionIndex);
    webgl.vertexAttribPointer(v4PositionIndex, 2, webgl.FLOAT, false, 0, 0);
}

function initInputImage(image) {
    var texture = webgl.createTexture();
    webgl.bindTexture(webgl.TEXTURE_2D, texture);
    webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, image);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
    // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
    // webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);


    webgl.activeTexture(webgl.TEXTURE0);
    var uniform = webgl.getUniformLocation(curProgram, "inputImageTexture");
    webgl.uniform1i(uniform, 0);
}



function main() {
    var image1 = new Image();
    image1.src = "resource/pic1.jpg";
    image1.onload = function () {
        renderImage(image1, "wave");

    }
}

main();

function renderImage(image, type) {

    webglInit();
    shaderInit(type);
    shaderProgramInit();
    initInputImage(image);

    var webglDraw;
    switch (type) {
        case "wave":
            webglDraw = webglDrawWave;
            break;
        default:
            // TODO
            return;
    }

    clearInterval(curInterval);
    var intervalTime = 5; // ms
    var duration = 5000;
    var sleep = 1200;

    curInterval = setInterval(function () {
        var step = ((Date.now() - start) % (duration + 2 * sleep) - sleep) / duration;
        step = 10 * Math.min(Math.max(step, 0), 1);
        webglDraw(step);
    }, intervalTime);
    var start = Date.now();
}

function webglDrawWave(step) {
    var uniformMotion = webgl.getUniformLocation(curProgram, "motion");
    var uniformAngle = webgl.getUniformLocation(curProgram, "angle");
    console.log(step);
    webgl.uniform1f(uniformMotion, step);
    webgl.uniform1f(uniformAngle, 10.0);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
}