/**
 * Created by zhogu on 6/20/2017.
 */
var canvas = document.getElementById("canvas");
var cxt = canvas.getContext('2d');

var select = document.getElementById("selectTransactions");
var input = document.getElementById("duration");

var imagePath1 = "resource/image1.png";
var image1 = new Image();
var imagePath2 = "resource/image2.png";
var image2 = new Image();

var imageData1;
var imageData2;

image1.src = imagePath1;
image1.onload = function () {
    drawImage(image1);
    imageData1 = cxt.getImageData(0, 0, cxt.canvas.width, cxt.canvas.height);
    cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);

    image2.src = imagePath2;
    image2.onload = function () {
        drawImage(image2);
        imageData2 = cxt.getImageData(0, 0, cxt.canvas.width, cxt.canvas.height);
        cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);

    }
};
var playId = 0;

function play() {

    clearInterval(playId);
    var transition;
    var pixelInterpolation;
    var transitionType = select.options[select.selectedIndex].value;
    switch (transitionType) {
        case "pushB":
            transition = pushFromBottom;
            break;
        case "pushR":
            transition = pushFromRight;
            break;
        case "coverB" :
            transition = coverFromBottom;
            break;
        case "uncoverL" :
            transition = uncoverToLeft;
            break;
        case "fade":
            transition = fade;
            break;
        case "zoomIn" :
            transition = zoomIn;
            break;
        case "zoomInNN":
            transition = zoomInPixelProcess;
            pixelInterpolation = nearestInterpolation;
            break;
        case "zoomInBL":
            transition = zoomInPixelProcess;
            pixelInterpolation = bilinearInterpolation;
            break;
        case "zoomFade":
            transition = zoomInFade;
            break;
        case "peelOff":
            transition = peelOff;
            break;
        default:
            transition = pushFromBottom;
            break;
    }

    var interval = 5; // ms
    var duration = parseFloat(input.value) * 1000;
    var sleep = 1000;
    playId = setInterval(function () {
        // var eachstep = Date.now();

        var step = ((Date.now() - start) % (duration + 2 * sleep) - sleep) / duration;
        step = Math.min(Math.max(step, 0), 1);
        transition(cxt, imageData1, imageData2, step, pixelInterpolation);

        // console.log((step % duration) / duration + " : " + (Date.now() - eachstep));
    }, interval);
    var start = Date.now();
}


function drawImage(image) {

    cxt.drawImage(image, 0, 0);
}

function pushFromRight(cxt, imageData1, imageData2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var width1 = width * (1 - step);
    var width2 = width * step;

    // cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
    cxt.putImageData(imageData1, -width2, 0, width2, 0, width1, height);
    cxt.putImageData(imageData2, width1, 0, 0, 0, width2, height);
}

function pushFromBottom(cxt, imageData1, imageData2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var height1 = height * (1 - step);
    var height2 = height * step;
    cxt.putImageData(imageData1, 0, -height2, 0, height2, width, height1);
    cxt.putImageData(imageData2, 0, height1, 0, 0, width, height2);
}

function coverFromBottom(cxt, imageData1, imageData2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var height1 = height * (1 - step);
    var height2 = height * step;

    cxt.putImageData(imageData2, 0, 0, 0, 0, width, height);
    cxt.putImageData(imageData1, 0, height1, 0, 0, width, height2);
}

function uncoverToLeft(cxt, imageData1, imageData2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var width1 = width * (1 - step);
    var width2 = width * step;

    cxt.putImageData(imageData1, -width2, 0, width2, 0, width1, height);
    cxt.putImageData(imageData2, 0, 0, width1, 0, width2, height);
}

function zoomIn(cxt, imageData1, imageData2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    // Transform a `ImageData` object: `imageData1` to `Image` object:
    var image2 = transform(cxt, imageData2);

    cxt.putImageData(imageData1, 0, 0, 0, 0, width, height);

    // TODO: check whether `onload` is necessary
    // image2.onload = cxt.drawImage(image2, 0, 0, width, height,
    //     (1 - step) * width / 2, (1 - step) * height / 2, width * step, height * step);
    cxt.drawImage(image2, 0, 0, width, height,
        (1 - step) * width / 2, (1 - step) * height / 2, width * step, height * step);

}

function zoomInPixelProcess(cxt, imageData1, imageData2, step, pixelInterpolation) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    cxt.putImageData(imageData1, 0, 0, 0, 0, width, height);

    var imageData2Scale = zoomImageData(imageData2, step, pixelInterpolation);

    cxt.putImageData(imageData2Scale, (1 - step) * width / 2, (1 - step) * height / 2,
        0, 0, imageData2Scale.width, imageData2Scale.height);
    imageData2Scale = null;

}

function zoomInFade(cxt, imageData1, imageData2, step) {

    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var image1 = transform(cxt, imageData1);
    // Alpha mean the increase times of zooming image1:
    // `alpha = 2* step` means the image1 will be tripe as big as canvas
    var alpha = 2 * step;
    cxt.drawImage(image1, alpha * width / (2 * (1 + alpha)), alpha * height / (2 * (1 + alpha)),
        width / (1 + alpha), height / (1 + alpha),
        0, 0, width, height);
    var imageData1Zoom = cxt.getImageData(0, 0, width, height);

    var image2 = transform(cxt, imageData2);
    cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
    cxt.drawImage(image2, 0, 0, width, height,
        (1 - step) * width / 2, (1 - step) * height / 2, width * step, height * step);
    var imageData2Zoom = cxt.getImageData(0, 0, width, height);

    fade(cxt, imageData1Zoom, imageData2Zoom, step);
}

function peelOff(cxt, imageData1, imageData2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    // The value of `tan(angle)`
    var gradient = Math.tan(0.4 * Math.PI);

    var c = (1 - step) * (gradient * width + height);

    var A = {x: (c - height) / gradient, y: height};
    var B = {x: width, y: c - gradient * width};
    var C = {
        x: (2 * gradient * (c - height) + width * (1 - gradient * gradient)) / (1 + gradient * gradient),
        y: (-2 * gradient * width + (gradient * gradient - 1) * height + 2 * c) / (1 + gradient * gradient)
    };
    var D = {x: (C.x + width) / 2, y: (C.y + height) / 2};

    var outImageData = flipImage(imageData1, imageData2, gradient, c);
    cxt.putImageData(outImageData, 0, 0);
    outImageData = null;

    // var start = Date.now();

    cxt.beginPath();
    cxt.moveTo(A.x, A.y);
    // cxt.lineTo(B.x, B.y);
    // cxt.lineTo(C.x, C.y);
    cxt.quadraticCurveTo(D.x, D.y, C.x, C.y);
    // cxt.quadraticCurveTo(D.x, D.y, B.x, B.y);
    cxt.lineTo(B.x, B.y);
    cxt.closePath();
    cxt.shadowBlur = 300;
    cxt.shadowColor = "black";
    var foldStyle = cxt.createLinearGradient(C.x, C.y, width, height);
    foldStyle.addColorStop(0.35, "white");
    foldStyle.addColorStop(0.5, "#999999");
    cxt.fillStyle = foldStyle;
    cxt.fill();
    // console.log("fill fold page : " + (Date.now()-start));

}

function flipImage(imageData1, imageData2, gradient, c) {
    var height = imageData1.height;
    var width = imageData1.width;
    var outImageData = cxt.createImageData(width, height);
    var y, x, index;
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            index = (y * width + x) * 4;
            if ((gradient * x + y) <= c) {
                outImageData.data[index] = imageData1.data[index];
                outImageData.data[index + 1] = imageData1.data[index + 1];
                outImageData.data[index + 2] = imageData1.data[index + 2];
                outImageData.data[index + 3] = imageData1.data[index + 3];
            } else {
                outImageData.data[index] = imageData2.data[index];
                outImageData.data[index + 1] = imageData2.data[index + 1];
                outImageData.data[index + 2] = imageData2.data[index + 2];
                outImageData.data[index + 3] = imageData2.data[index + 3];
            }
        }
    }
    return outImageData;
}


// function zoomInFadePixelProcess(cxt, imageData1, imageData2, step, pixelInterpolation) {
//     var height = cxt.canvas.height;
//     var width = cxt.canvas.width;
//
//
//     var imageData2Scale = zoomImageData(imageData2, step, pixelInterpolation);
//     cxt.putImageData(imageData2Scale, (1 - step) * width / 2, (1 - step) * height / 2,
//         0, 0, imageData2Scale.width, imageData2Scale.height);
//     imageData2Scale = null;
// }

function fade(cxt, imageData1, imageData2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var image1Copy = fadeImageData(imageData1, imageData2, step);
    cxt.putImageData(image1Copy, 0, 0, 0, 0, width, height);
}


function transform(cxt, imageData) {
    cxt.putImageData(imageData, 0, 0, 0, 0, cxt.canvas.width, cxt.canvas.height);
    var image = new Image();
    image.src = cxt.canvas.toDataURL("image/png");

    return image;
}

function fadeImageData(imageData1, imageData2, alpha) {
    var imageCopy = new ImageData(new Uint8ClampedArray(imageData1.data.length), imageData1.width, imageData1.height);

    for (var i = 0, len = imageData1.data.length; i < len; i += 4) {

        // r g b a
        imageCopy.data[i] = imageData1.data[i] * (1 - alpha) + imageData2.data[i] * alpha;
        imageCopy.data[i + 1] = imageData1.data[i + 1] * (1 - alpha) + imageData2.data[i + 1] * alpha;
        imageCopy.data[i + 2] = imageData1.data[i + 2] * (1 - alpha) + imageData2.data[i + 2] * alpha;
        imageCopy.data[i + 3] = 255;
    }
    return imageCopy;
}

function zoomImageData(imageData, scale, pixelInterpolation) {

    var width = imageData.width;
    var height = imageData.height;

    var disImageW = Math.floor(width * scale);
    var disImageH = Math.floor(height * scale);

    if (disImageW == 0 || disImageH == 0) {
        return new ImageData(1, 1);
    }
    var outImage;
    var row, col, index, x, y, i, j, u, v;
    // var xs = [];
    var is = [];
    var us = [];
    if (scale <= 1) {
        outImage = new ImageData(disImageW, disImageH);
        for (col = 0; col < disImageW; col++) {
            x = col / scale + (1 / scale - 1);
            is[col] = Math.floor(x);
            us[col] = x - is[col];
        }
        for (row = 0; row < disImageH; row++) {
            y = row / scale + (1 / scale - 1);
            j = Math.floor(y);
            v = y - j;
            for (col = 0; col < disImageW; col++) {
                index = (row * disImageW + col) * 4;

                // x = col / scale + (1 / scale - 1);
                i = is[col];
                u = us[col];
                pixelInterpolation(imageData, width, height, outImage, index, i, j, u, v);
            }
        }
    }
    else {
        outImage = new ImageData(width, height);
        var m = (disImageW - width) / 2;
        var n = (disImageH - height) / 2;
        for (col = 0; col < disImageW; col++) {
            x = (col + m) / scale + (1 / scale - 1);
            is[col] = Math.floor(x);
            us[col] = x - is[col];
        }
        for (row = 0; row < height; row++) {
            y = (row + n) / scale + (1 / scale - 1);
            j = Math.floor(y);
            v = y - j;
            for (col = 0; col < width; col++) {
                index = (row * width + col) * 4;

                // x = (col + m) / scale + (1 / scale - 1);
                i = is[col];
                u = us[col];
                pixelInterpolation(imageData, width, height, outImage, index, i, j, u, v);
            }
        }

    }
    return outImage;
}

function nearestInterpolation(imageData, width, height, outImage, index, i, j) {

    // var i = Math.round(x);
    // var j = Math.round(y);

    var index1 = (j * width + i) * 4;
    outImage.data[index] = imageData.data[index1];
    outImage.data[index + 1] = imageData.data[index1 + 1];
    outImage.data[index + 2] = imageData.data[index1 + 2];
    // outImage.data[index+3] = imageData.data[index1+3];
    outImage.data[index + 3] = 255;

}

function bilinearInterpolation(imageData, width, height, outImage, index, i, j, u, v) {
    //  a u ,  1-u  b
    //  v   p
    // 1-v
    //  c           d

    // var i = Math.floor(x);
    // var j = Math.floor(y);
    // var u = x - i;
    // var v = y - j;

    // var ab = imageData.data.subarray((j * width + i) * 4, (j * width + i + 2) * 4);
    // var cd = imageData.data.subarray(((j + 1) * width + i) * 4, ((j + 1) * width + i + 2) * 4);

    // var a = ab.subarray(0, 4);
    // var b = ab.subarray(4, 8);
    // var c = cd.subarray(0, 4);
    // var d = cd.subarray(4, 8);

    // outImage.data[index] = (1 - u) * (1 - v) * ab[0] + u * (1 - v) * ab[4] + (1 - u) * v * cd[0] + u * v * cd[4];
    // outImage.data[index+1] = (1 - u) * (1 - v) * ab[1] + u * (1 - v) * ab[5] + (1 - u) * v * cd[1] + u * v * cd[5];
    // outImage.data[index+2] = (1 - u) * (1 - v) * ab[2] + u * (1 - v) * ab[6] + (1 - u) * v * cd[2] + u * v * cd[6];
    // // outImage.data[index+3] = (1-u)*(1-v)*a[] + u*(1-v)*b[] + (1-u)*v*c[] + u*v*d[]
    // outImage.data[index+3] = 255;

    var index1 = (j * width + i) * 4;
    var index2 = ((j + 1) * width + i) * 4;
    outImage.data[index] = (1 - u) * (1 - v) * imageData.data[index1] + u * (1 - v) * imageData.data[index1 + 4]
        + (1 - u) * v * imageData.data[index2] + u * v * imageData.data[index2 + 4];
    outImage.data[index + 1] = (1 - u) * (1 - v) * imageData.data[index1 + 1] + u * (1 - v) * imageData.data[index1 + 5]
        + (1 - u) * v * imageData.data[index2 + 1] + u * v * imageData.data[index2 + 5];
    outImage.data[index + 2] = (1 - u) * (1 - v) * imageData.data[index1 + 2] + u * (1 - v) * imageData.data[index1 + 6]
        + (1 - u) * v * imageData.data[index2 + 2] + u * v * imageData.data[index2 + 6];
    outImage.data[index + 3] = 255;
}


/// Deprecated
function scaleImageData(cxt, imageData, scale) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var newCanvas = document.createElement("canvas")
        .attr("width", width)
        .attr("height", height);
    newCanvas.getContext("2d").putImageData(imageData, 0, 0);
    cxt.scale(scale, scale);
    cxt.drawImage(newCanvas, (scale - 1) * width / (2 * (scale)), (scale - 1) * height / (2 * scale),
        width / scale, height / scale,
        0, 0, width, height);
    cxt.scale(1 / scale, 1 / scale);
}


/// Deprecated
function showWithImage() {

    var canvas = document.getElementById("canvas");
    var cxt = canvas.getContext('2d');

    var interval = 5; // ms
    var duration = 2000;
    var imagePath1 = "resource/image1_800x600.png";
    var imagePath2 = "resource/image2_800x600.png";
    var image1 = new Image();
    image1.src = imagePath1;
    var image2 = new Image();
    image2.src = imagePath2;

    var i = 0;

    setInterval(function () {

        pushFromRightWithImage(cxt, image1, image2, i / (duration / interval));
        if (i < (duration / interval)) {
            i++;
        } else {
            i = 0;
        }
    }, interval);

}

function drawImageUrl(url) {

    var image = new Image();
    image.src = url;

    if (image.complete) {
        drawImage(image);
    } else {
        image.onload = function () {
            drawImage(image);
        }
    }
}

/// Deprecated
function pushFromBottomWithImage(cxt, image1, image2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var height1 = height * (1 - step);
    var height2 = height * step;

    cxt.drawImage(image1, 0, height2, width, height1, 0, 0, width, height1);
    cxt.drawImage(image2, 0, 0, width, height2, 0, height1, width, height2);

}

/// Deprecated
function pushFromRightWithImage(cxt, image1, image2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var width1 = width * (1 - step);
    var width2 = width * step;

    cxt.drawImage(image1, width2, 0, width1, height, 0, 0, width1, height);
    cxt.drawImage(image2, 0, 0, width2, height, width1, 0, width2, height);
}

/// Deprecated
function zoomInWithImage(cxt, image1, image2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    cxt.drawImage(image1, 0, 0, 0, 0, width, height);
    cxt.drawImage(image2, 0, 0, width, height,
        (1 - step) * width / 2, (1 - step) * height / 2, width * step, height * step);

}

/// Deprecated
function scaleImageData(imageData, scale) {
    var scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale);
    var subLine = ctx.createImageData(scale, 1).data;
    for (var row = 0; row < imageData.height; row++) {
        for (var col = 0; col < imageData.width; col++) {
            var sourcePixel = imageData.data.subarray(
                (row * imageData.width + col) * 4,
                (row * imageData.width + col) * 4 + 4
            );
            for (var x = 0; x < scale; x++) subLine.set(sourcePixel, x * 4)
            for (var y = 0; y < scale; y++) {
                var destRow = row * scale + y;
                var destCol = col * scale;
                scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
            }
        }
    }

    return scaled;
}





