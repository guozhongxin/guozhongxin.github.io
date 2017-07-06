/**
 * Created by zhogu on 6/28/2017.
 */
var canvas = document.getElementById("canvas");
var cxt = canvas.getContext('2d');

var select = document.getElementById("selectTransactions");
var input = document.getElementById("duration");

var imagePath1 = "resource/image1B.png";
var image1 = new Image();
var imagePath2 = "resource/image2B.png";
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
    var pixelInterpolation = nearestInterpolation;
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
        case "zoomFadePP":
            pixelInterpolation = nearestInterpolationFade;
            transition = zoomInFadePixelProcess;
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
    var sleep = 1200;
    var tempImageData = cxt.createImageData(imageData1.width, imageData1.height);
    playId = setInterval(function () {
        var eachstep = Date.now();

        var step = ((Date.now() - start) % (duration + 2 * sleep) - sleep) / duration;
        step = Math.min(Math.max(step, 0), 1);
        transition(cxt, imageData1, imageData2, step, tempImageData, pixelInterpolation);

        console.log(step + " : " + (Date.now() - eachstep));
    }, interval);
    var start = Date.now();
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





