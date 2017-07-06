/**
 * Created by zhogu on 6/20/2017.
 */


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

function zoomInPixelProcess(cxt, imageData1, imageData2, step, tempImageData, pixelInterpolation) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    cxt.putImageData(imageData1, 0, 0, 0, 0, width, height);

    // var imageData2Scale = zoomImageData(imageData2, tempImageData, step, width, height, pixelInterpolation);
    zoomImageData(imageData2, tempImageData, step, width, height, pixelInterpolation);

    cxt.putImageData(tempImageData, 0, 0,
        (1 - step) * width / 2, (1 - step) * height / 2, step * width, step * height);
}

function zoomInFade(cxt, imageData1, imageData2, step, tempImageData) {
    // scaleOut mean the increase times of zooming image1:
    // `scaleOut = 2* step` means the image1 will be tripe as big as canvas when step==1
    var scaleOut = 2 * step;
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    var image1 = transform(cxt, imageData1);
    cxt.drawImage(image1, scaleOut * width / (2 * (1 + scaleOut)), scaleOut * height / (2 * (1 + scaleOut)),
        width / (1 + scaleOut), height / (1 + scaleOut),
        0, 0, width, height);
    var imageData1Zoom = cxt.getImageData(0, 0, width, height);

    var image2 = transform(cxt, imageData2);
    cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
    cxt.drawImage(image2, 0, 0, width, height,
        (1 - step) * width / 2, (1 - step) * height / 2, width * step, height * step);
    var imageData2Zoom = cxt.getImageData(0, 0, width, height);

    fade(cxt, imageData1Zoom, imageData2Zoom, step, tempImageData);
}

function zoomInFadePixelProcess(cxt, imageData1, imageData2, step, tempImageData, pixelInterpolation) {
    // scaleOut mean the increase times of zooming image1:
    // `scaleOut = 2* step` means the image1 will be tripe as big as canvas when step==1
    var scaleOut = 2 * step;
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    zoomImageData(imageData1, tempImageData, (1 + scaleOut), width, height, pixelInterpolation);
    zoomImageData(imageData2, tempImageData, step, width, height, nearestInterpolationFade2);
    // fade(cxt, tempImageData, tempImageData2, step, tempImageData);
    cxt.putImageData(tempImageData, 0, 0, 0, 0, width, height);
}

function fade(cxt, imageData1, imageData2, step, tempImageData) {
    var height = cxt.canvas.height;
    var width = cxt.canvas.width;

    fadeImageData(imageData1, imageData2, step, tempImageData);
    cxt.putImageData(tempImageData, 0, 0, 0, 0, width, height);
}

function peelOff(cxt, imageData1, imageData2, step, tempImageData) {
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

    flipImage(imageData1, imageData2, tempImageData, gradient, c);
    cxt.putImageData(tempImageData, 0, 0);

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

function flipImage(imageData1, imageData2, outImageData, gradient, c) {
    var height = imageData1.height;
    var width = imageData1.width;
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

function transform(cxt, imageData) {
    cxt.putImageData(imageData, 0, 0, 0, 0, cxt.canvas.width, cxt.canvas.height);
    var image = new Image();
    image.src = cxt.canvas.toDataURL("image/png");

    return image;
}

function fadeImageData(imageData1, imageData2, step, tempImageData) {

    for (var i = 0, len = imageData1.data.length; i < len; i += 4) {

        // r g b a
        tempImageData.data[i] = imageData1.data[i] * (1 - step) + imageData2.data[i] * step;
        tempImageData.data[i + 1] = imageData1.data[i + 1] * (1 - step) + imageData2.data[i + 1] * step;
        tempImageData.data[i + 2] = imageData1.data[i + 2] * (1 - step) + imageData2.data[i + 2] * step;
        tempImageData.data[i + 3] = 255;
    }
}

function zoomImageData(imageData, outImageData, scale, width, height, pixelInterpolation, alpha) {

    alpha = alpha || 255;

    var disImageW = Math.floor(width * scale);
    var disImageH = Math.floor(height * scale);

    if (disImageW == 0 || disImageH == 0) {
        return;
    }

    var row, col, index, x, y, i, j, u, v;

    var is = [];
    var us = [];
    if (scale < 1) {
        for (col = 0; col < disImageW; col++) {
            x = col / scale + (1 / scale - 1);
            is[col] = Math.floor(x);
            us[col] = x - is[col];
        }
        var rowOffset = Math.floor((height - disImageH) / 2);
        var colOffset = Math.floor((width - disImageW) / 2);
        for (row = 0; row < disImageH; row++) {
            y = row / scale + (1 / scale - 1);
            j = Math.floor(y);
            v = y - j;
            for (col = 0; col < disImageW; col++) {
                index = ((row + rowOffset) * width + col + colOffset) * 4;
                i = is[col];
                u = us[col];
                pixelInterpolation(imageData, width, height, outImageData, index, i, j, u, v, alpha, scale);
            }
        }
    }
    else if (scale > 1) {
        var step = (scale - 1) / 2;
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
                i = is[col];
                u = us[col];
                pixelInterpolation(imageData, width, height, outImageData, index, i, j, u, v, alpha, step);
            }
        }

    } else {
        cloneImageData(imageData, outImageData);
    }
    return outImageData;
}

function nearestInterpolationFade(imageData, width, height, outImage, index, i, j, u, v, alpha, step) {

    var index1 = (j * width + i) * 4;
    outImage.data[index] = imageData.data[index1] * (1 - step);
    outImage.data[index + 1] = imageData.data[index1 + 1] * (1 - step);
    outImage.data[index + 2] = imageData.data[index1 + 2] * (1 - step);
    // outImage.data[index+3] = imageData.data[index1+3];
    outImage.data[index + 3] = alpha;

}

function nearestInterpolationFade2(imageData, width, height, outImage, index, i, j, u, v, alpha, step) {

    var index1 = (j * width + i) * 4;
    outImage.data[index] = outImage.data[index] + imageData.data[index1] * step;
    outImage.data[index + 1] = outImage.data[index + 1] + imageData.data[index1 + 1] * step;
    outImage.data[index + 2] = outImage.data[index + 2] + imageData.data[index1 + 2] * step;
    // outImage.data[index+3] = imageData.data[index1+3];
    outImage.data[index + 3] = alpha;

}

function nearestInterpolation(imageData, width, height, outImage, index, i, j, u, v, alpha) {

    var index1 = (j * width + i) * 4;
    outImage.data[index] = imageData.data[index1];
    outImage.data[index + 1] = imageData.data[index1 + 1];
    outImage.data[index + 2] = imageData.data[index1 + 2];
    // outImage.data[index+3] = imageData.data[index1+3];
    outImage.data[index + 3] = alpha;

}

function bilinearInterpolation(imageData, width, height, outImage, index, i, j, u, v, alpha) {
    //  a u ,  1-u  b
    //  v   p
    // 1-v
    //  c           d
    var index1 = (j * width + i) * 4;
    var index2 = ((j + 1) * width + i) * 4;
    outImage.data[index] = ( (1 - u) * (1 - v) * imageData.data[index1] + u * (1 - v) * imageData.data[index1 + 4]
    + (1 - u) * v * imageData.data[index2] + u * v * imageData.data[index2 + 4]);
    outImage.data[index + 1] = ((1 - u) * (1 - v) * imageData.data[index1 + 1] + u * (1 - v) * imageData.data[index1 + 5]
    + (1 - u) * v * imageData.data[index2 + 1] + u * v * imageData.data[index2 + 5]);
    outImage.data[index + 2] = ((1 - u) * (1 - v) * imageData.data[index1 + 2] + u * (1 - v) * imageData.data[index1 + 6]
    + (1 - u) * v * imageData.data[index2 + 2] + u * v * imageData.data[index2 + 6]);
    outImage.data[index + 3] = alpha;
}

function cloneImageData(srcImageData, distImageData) {
    var length = srcImageData.data.length, i;
    for (i = 0; i < length; i++) {
        distImageData.data[i] = srcImageData.data[i];
    }
}

