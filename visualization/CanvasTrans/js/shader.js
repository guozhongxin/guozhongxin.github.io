/**
 * Created by zhogu on 7/4/2017.
 */

var defaultVSCode = "precision mediump float;\
    attribute vec4 position;\
    attribute vec2 inputTextureCoordinate;\
    varying vec2 textureCoordinate;\
    void main()\
    {\
        gl_Position = position;\
        textureCoordinate = vec2((position.x+1.0)/2.0, 1.0-(position.y+1.0)/2.0);\
    }";

var defaultFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    void main()\
    {\
        gl_FragColor = texture2D(preImage, textureCoordinate);\
    }";

//#######################################################

var pushVSCode = defaultVSCode;
var pushFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    uniform sampler2D nextImage;\
    uniform float step;\
    void main()\
    {\
        if (textureCoordinate.y < (1.0-step))\
        {\
            gl_FragColor = texture2D(preImage, vec2(textureCoordinate.x, textureCoordinate.y + step));\
        } else {\
            gl_FragColor = texture2D(nextImage, vec2(textureCoordinate.x, textureCoordinate.y - 1.0 +step));\
        }\
    }";

//#######################################################

// var rotationVSCode = defaultVSCode;

//#######################################################

var flipVSCode = defaultVSCode;
var flipFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    uniform sampler2D nextImage;\
    uniform float step;\
    void main()\
    {\
        float angle = step * 3.14159;\
        float D = 2.0;\
        float scale  = 0.5;\
        vec4 defaultColor = vec4(0.2,0.2,0.2,0.5);\
        if (step < 0.5)\
        {\
            vec2 tmp = textureCoordinate;\
            tmp.x = 0.5 + (tmp.x-0.5)/ cos(angle);\
            tmp.y = (D + tan(angle) * (textureCoordinate.x-0.5) + step * scale )/D * (textureCoordinate.y -0.5) + 0.5;\
            if(tmp.x>0.0 && tmp.x <1.0 && tmp.y>0.0 && tmp.y <1.0){\
                gl_FragColor = texture2D(preImage, tmp);\
            } else { gl_FragColor = defaultColor; }\
        } else {\
            vec2 tmp = textureCoordinate;\
            tmp.x = 0.5 - (tmp.x-0.5)/ cos(angle);\
            tmp.y = (D + tan(angle) * (textureCoordinate.x-0.5) + (1.0-step) * scale )/D * (textureCoordinate.y -0.5) + 0.5;\
            if(tmp.x>0.0 && tmp.x <1.0 && tmp.y>0.0 && tmp.y <1.0){\
                gl_FragColor = texture2D(nextImage, tmp);\
            } else { gl_FragColor = defaultColor; }\
        }\
    }";

//#######################################################

var flipMVSCode = "precision mediump float;\
    attribute vec4 position;\
    uniform mat4 matrix;\
    varying vec2 textureCoordinate;\
    void main()\
    {\
        gl_Position = matrix * position;\
        textureCoordinate = vec2((position.x+1.0)/2.0, 1.0-(position.y+1.0)/2.0);\
    }";

var flipMFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    uniform sampler2D nextImage;\
    uniform float step;\
    void main()\
    {\
        if(step <0.5){\
            gl_FragColor = texture2D(preImage, textureCoordinate);\
        } else{\
            gl_FragColor = texture2D(nextImage, vec2(1.0-textureCoordinate.x, textureCoordinate.y));\
        }\
    }";

//#######################################################

var boxMVSCode = "precision mediump float;\
    attribute vec4 position;\
    uniform mat4 matrix;\
    varying vec2 textureCoordinate;\
    void main()\
    {\
        gl_Position = matrix * position;\
        textureCoordinate = vec2((position.x+1.0)/2.0, 1.0-(position.y+1.0)/2.0);\
    }";

var boxMFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    uniform sampler2D nextImage;\
    uniform int t;\
    void main()\
    {\
        if (t<1){\
            gl_FragColor = texture2D(preImage, textureCoordinate);\
        } else { gl_FragColor = texture2D(nextImage, textureCoordinate);} \
    }";

//#######################################################

var boxVSCode = defaultVSCode;

var boxFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    uniform sampler2D nextImage;\
    uniform float step;\
    void main()\
    {\
        float D = 1.0;\
        float scale = 0.5;\
        vec4 defaultColor = vec4(0.2,0.2,0.2,1.0);\
        \
        float R = sqrt(D * D + 0.25);\
        float Ddelta = 2.0 * scale * step * (1.0 - step );\
        float beta = atan(0.5 /  D);\
        \
        float alpha = 2.0 * beta * step;\
        float xdelta = R * sin(alpha + beta) - 0.5;\
        float x = (textureCoordinate.x + xdelta )/ cos(alpha) ;\
        float ydelta = D - R * cos(alpha + beta) - x * sin(alpha) - Ddelta ;\
        float y = (D - ydelta)/ D * (textureCoordinate.y -0.5)+ 0.5;\
        if(x>0.0 &&x <1.0 && y>0.0 && y <1.0){\
            gl_FragColor = texture2D(preImage, vec2(x, y));\
        } else { \
            alpha = 2.0 * beta * (step-1.0);\
            xdelta = R * sin(alpha + beta) - 0.5;\
            x = (textureCoordinate.x + xdelta )/ cos(alpha) ;\
            ydelta = D - R * cos(alpha + beta) - x * sin(alpha) - Ddelta ;\
            y = (D - ydelta)/ D * (textureCoordinate.y -0.5)+ 0.5;\
            if(x>0.0 &&x <1.0 && y>0.0 && y <1.0){\
                gl_FragColor = texture2D(nextImage, vec2(x, y));\
            }  else { gl_FragColor = defaultColor; }\
        }\
    }";


//#######################################################
//#######################################################

var cubeVSCode = defaultVSCode;

var cubeFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    uniform sampler2D nextImage;\
    uniform float step;\
    void main()\
    {\
        float D = 1.0;\
        float scale = 1.0;\
        vec4 defaultColor = vec4(0.2,0.2,0.2,1.0);\
        \
        float R = sqrt(D * D + 0.25);\
        float Ddelta = 2.0 * scale * step * (1.0 - step );\
        float beta = atan(0.5 /  D);\
        \
        float alpha = 2.0 * beta * step;\
        float xdelta = R * sin(alpha + beta) - 0.5;\
        float x = (  xdelta + (2.0* D - R* cos(alpha + beta) + Ddelta )/ D * (textureCoordinate.x - 0.5) +0.5 )/ \
                                ( cos(alpha) + sin(alpha) * (textureCoordinate.x - 0.5) / D ) ; \
        float ydelta = D - R * cos(alpha + beta) - x * sin(alpha) + Ddelta ;\
        float y = (D + ydelta) / D * (textureCoordinate.y -0.5)+ 0.5;\
        if(x>0.0 &&x < 1.0 && y> 0.0 && y < 1.0){\
            gl_FragColor = texture2D(preImage, vec2(x, y));\
        } else { \
            alpha = 2.0 * beta * (step-1.0);\
            xdelta = R * sin(alpha + beta) - 0.5;\
            x = (  xdelta + (2.0* D - R* cos(alpha + beta) + Ddelta )/ D * (textureCoordinate.x - 0.5) +0.5 )/ \
                        ( cos(alpha) + sin(alpha) * (textureCoordinate.x - 0.5) / D ) ;\
            ydelta = D - R * cos(alpha + beta) - x * sin(alpha) + Ddelta ;\
            y = (D + ydelta) / D * (textureCoordinate.y -0.5)+ 0.5;\
            if(x>0.0 &&x <1.0 && y>0.0 && y <1.0){\
                gl_FragColor = texture2D(nextImage, vec2(x, y));\
            }  else { gl_FragColor = defaultColor; }\
        }\
    }";

//#######################################################

var cubeMVSCode = boxMVSCode;
var cubeMFSCode = boxMFSCode;

//#######################################################

var fadeVSCode = defaultVSCode;

var fadeFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    uniform sampler2D nextImage;\
    uniform float step;\
    void main()\
    {\
        mediump vec4 preFadeOut;\
        mediump vec4 nextFadeIn;\
        preFadeOut = texture2D(preImage, textureCoordinate) *(1.0-step);\
        nextFadeIn = texture2D(nextImage, textureCoordinate) * step;\
        gl_FragColor = preFadeOut + nextFadeIn;\
    }";

//#########################################################

var zoominVSCode = defaultVSCode;

var zoominFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    uniform sampler2D nextImage;\
    uniform float step;\
    void main()\
    {\
        vec2 tmp = textureCoordinate;\
        mediump vec4 zoomInImage;\
        if ( textureCoordinate.x > (0.5- step/2.0) && textureCoordinate.x< (0.5 + step/2.0)  \
            && textureCoordinate.y > (0.5 - step/2.0) && textureCoordinate.y < (0.5+step/2.0) ) \
        {\
            gl_FragColor = texture2D(nextImage,  (textureCoordinate-(0.5- step/2.0) )/ step ) ;\
        }\
        else {\
            gl_FragColor = texture2D(preImage,  textureCoordinate);\
        }\
    }";

//##########################################################

var zoominfadeVSCode = defaultVSCode;
var zoominfadeFSCode = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D preImage;\
    uniform sampler2D nextImage;\
    uniform float step;\
    void main()\
    {\
        float scale;\
        scale = 1.0 + 2.0 * step;\
        gl_FragColor = texture2D(preImage,  (textureCoordinate-(0.5- scale/2.0) )/ scale  )* (1.0-step);\
        if ( textureCoordinate.x > (0.5- step/2.0) && textureCoordinate.x< (0.5 + step/2.0)  \
            && textureCoordinate.y > (0.5 - step/2.0) && textureCoordinate.y < (0.5+step/2.0) ) \
        {\
            gl_FragColor = texture2D(nextImage,  (textureCoordinate-(0.5- step/2.0) )/ step ) * step + gl_FragColor ;\
        }\
    }";

//##########################################################
var waveVertexShader = "precision mediump float;\
    attribute vec4 position;\
    attribute vec2 inputTextureCoordinate;\
    varying vec2 textureCoordinate;\
    void main()\
    {\
        gl_Position = position;\
        textureCoordinate = vec2((position.x+1.0)/2.0, 1.0-(position.y+1.0)/2.0);\
    }";

var waveFragmentShader1 = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D inputImageTexture;\
    uniform float motion;\
    uniform float angle;\
    void main()\
    {\
        vec2 tmp = textureCoordinate;\
        tmp.x = tmp.x + 0.01 * sin(motion +  tmp.x * angle);\
        tmp.y = tmp.y + 0.01 * sin(motion +  tmp.y * angle);\
        gl_FragColor = texture2D(inputImageTexture, tmp);\
    }";

var waveVertexShader1 = defaultVSCode;

var waveFragmentShader = "precision mediump float;\
    varying vec2 textureCoordinate;\
    uniform sampler2D inputImageTexture;\
    uniform float motion;\
    uniform float angle;\
    void main()\
    {\
        float step = motion / 10.0;\
        vec2 tmp = textureCoordinate;\
        if (textureCoordinate.x < (0.5-step/2.0) )\
        {\
            tmp.x = tmp.x / (1.0-step);\
            tmp.x = tmp.x + 0.005 * sin( motion * tmp.x * angle);\
            gl_FragColor = texture2D(inputImageTexture, tmp);\
        }\
        else if( textureCoordinate.x >(0.5+step/2.0)) {\
            tmp.x = 1.0  - (1.0 - tmp.x) / (1.0 - step);\
            tmp.x = tmp.x + 0.005 * sin(  motion * tmp.x * angle);\
            gl_FragColor = texture2D(inputImageTexture, tmp);\
        }\
    }";

//################################################

var flipVSCode2 = "precision mediump float;\
    attribute vec4 position;\
    uniform mat4 u_matrix;\
    varying vec2 textureCoordinate;\
    void main()\
    {\
        gl_Position = u_matrix * position;\
        textureCoordinate = vec2((position.x+1.0)/2.0, 1.0-(position.y+1.0)/2.0);\
    }";

var flipFSCode2 = defaultFSCode;