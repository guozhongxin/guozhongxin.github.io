/**
 * Created by zhogu on 6/20/2017.
 */
var canvas = document.getElementById("canvas");
var cxt = canvas.getContext('2d');

var select = document.getElementById("selectTransactions");
var input = document.getElementById("duration");

var imagePath1 = "resource/image1_800x600.png";
var image1 = new Image();
var imagePath2 = "resource/image2_800x600.png";
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
        default:
            transition = pushFromBottom;
            break;
    }

    var i = 0;
    var interval = 5; // ms
    var duration = parseFloat(input.value) * 1000;
    playId = setInterval(function () {
        var step = (Date.now() - start);
        transition(cxt, imageData1, imageData2, (step % duration) / duration, pixelInterpolation);

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
    console.log(step);
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

function zoomInFadePixelProcess(cxt, imageData1, imageData2, step, pixelInterpolation) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;


    var imageData2Scale = zoomImageData(imageData2, step, pixelInterpolation);
    cxt.putImageData(imageData2Scale, (1 - step) * width / 2, (1 - step) * height / 2,
        0, 0, imageData2Scale.width, imageData2Scale.height);
}

function transform(cxt, imageData) {
    cxt.putImageData(imageData, 0, 0, 0, 0, cxt.canvas.width, cxt.canvas.height);
    var image = new Image();
    image.src = cxt.canvas.toDataURL("image/png");

    return image;
}

function fade(cxt, imageData1, imageData2, step) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var image1Copy = fadeImageData(imageData1, imageData2, step);
    cxt.putImageData(image1Copy, 0, 0, 0, 0, width, height);
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
    var out;
    var row, col, index, x, y, pixelData
    // var start = Date.now();
    if (scale <= 1) {
        out = new ImageData(disImageW, disImageH);
        for (row = 0; row < disImageH; row++) {
            for (col = 0; col < disImageW; col++) {
                index = (row * disImageW + col) * 4;
                y = row / scale + (1 / scale - 1);
                x = col / scale + (1 / scale - 1);
                pixelData = pixelInterpolation(imageData, x, y, width, height);

                out.data.set(pixelData, index);
            }
        }
    } else {
        out = new ImageData(width, height);
        var u = (disImageW - width) / 2;
        var v = (disImageH - height) / 2;

        for (row = 0; row < height; row++) {
            for (col = 0; col < width; col++) {
                index = (row * width + col) * 4;
                y = (row + v) / scale + (1 / scale - 1);
                x = (col + u) / scale + (1 / scale - 1);
                pixelData = pixelInterpolation(imageData, x, y, width, height);

                out.data.set(pixelData, index);
            }
        }

    }
    // console.log(disImageW * disImageH + " pixels : " + (Date.now() - start));
    return out;
}

function nearestInterpolation(imageData, x, y, width, height) {


    var n = Math.round(x);
    var m = Math.round(y);
    // n = Math.min(n, height - 1);
    // m = Math.min(m, width - 1);
    var index = (m * width + n) * 4;

    return imageData.data.subarray(index, index + 4);
}

function bilinearInterpolation(imageData, x, y, width, height) {

    //  a u ,  1-u  b
    //  v   p
    // 1-v
    //  c           d
    var i = Math.floor(x);
    var j = Math.floor(y);
    var u = x - i;
    var v = y - j;

    var ab = imageData.data.subarray((j * width + i) * 4, (j * width + i + 2) * 4);
    var cd = imageData.data.subarray(((j + 1) * width + i) * 4, ((j + 1) * width + i + 2) * 4);

    // var a = ab.subarray(0, 4);
    // var b = ab.subarray(4, 8);
    // var c = cd.subarray(0, 4);
    // var d = cd.subarray(4, 8);

    var p = new Uint8ClampedArray(4);
    p[0] = (1 - u) * (1 - v) * ab[0] + u * (1 - v) * ab[4] + (1 - u) * v * cd[0] + u * v * cd[4];
    p[1] = (1 - u) * (1 - v) * ab[1] + u * (1 - v) * ab[5] + (1 - u) * v * cd[1] + u * v * cd[5];
    p[2] = (1 - u) * (1 - v) * ab[2] + u * (1 - v) * ab[6] + (1 - u) * v * cd[2] + u * v * cd[6];
    p[3] = 255;
    // p[3] = (1-u)*(1-v)*a[] + u*(1-v)*b[] + (1-u)*v*c[] + u*v*d[]

    return p;
}


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





