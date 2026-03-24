'use client';
import { useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════
   SplashCursor — from reactbits.dev/animations/splash-cursor
   Full Navier-Stokes WebGL fluid simulation that responds
   to cursor movement anywhere on the page.
   Amber/gold palette tinted to match Maidan theme.
   Renders on a fixed full-screen canvas so it is visible
   on top of everything but never blocks pointer events.
═══════════════════════════════════════════════════════ */
export default function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0, g: 0, b: 0 },
  TRANSPARENT = true,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isActive = true;

    /* ── Pointer prototype ── */
    function pointerPrototype() {
      this.id = -1;
      this.texcoordX = 0; this.texcoordY = 0;
      this.prevTexcoordX = 0; this.prevTexcoordY = 0;
      this.deltaX = 0; this.deltaY = 0;
      this.down = false; this.moved = false;
      this.color = [0, 0, 0];
    }

    const config = {
      SIM_RESOLUTION, DYE_RESOLUTION, DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION, PRESSURE, PRESSURE_ITERATIONS,
      CURL, SPLAT_RADIUS, SPLAT_FORCE, COLOR_UPDATE_SPEED,
      PAUSED: false, BACK_COLOR, TRANSPARENT,
      SHADING: true,
    };

    let pointers = [new pointerPrototype()];

    /* ── WebGL context ── */
    function getWebGLContext(canvas) {
      const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
      let gl = canvas.getContext('webgl2', params);
      const isWebGL2 = !!gl;
      if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
      let halfFloat, supportLinearFiltering;
      if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
      } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
      }
      const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat?.HALF_FLOAT_OES;
      let rgba, rg, r;
      if (isWebGL2) {
        rgba = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
        rg = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        r = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
      } else {
        rgba = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        rg = rgba; r = rgba;
      }
      return { gl, ext: { formatRGBA: rgba, formatRG: rg, formatR: r, halfFloatTexType, supportLinearFiltering } };
    }

    function getSupportedFormat(gl, inFmt, fmt, type) {
      if (!supportRenderTextureFormat(gl, inFmt, fmt, type)) {
        if (inFmt === gl.R16F) return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
        if (inFmt === gl.RG16F) return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
        return null;
      }
      return { internalFormat: inFmt, format: fmt };
    }

    function supportRenderTextureFormat(gl, inFmt, fmt, type) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, inFmt, 4, 4, 0, fmt, type, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }

    const { gl, ext } = getWebGLContext(canvas);
    if (!ext.supportLinearFiltering) { config.DYE_RESOLUTION = 256; config.SHADING = false; }

    /* ── Shaders ── */
    const BASE_VS = `precision highp float;attribute vec2 aPosition;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform vec2 texelSize;void main(){vUv=aPosition*.5+.5;vL=vUv-vec2(texelSize.x,0.);vR=vUv+vec2(texelSize.x,0.);vT=vUv+vec2(0.,texelSize.y);vB=vUv-vec2(0.,texelSize.y);gl_Position=vec4(aPosition,0.,1.);}`;
    const BLUR_VS = `precision highp float;attribute vec2 aPosition;varying vec2 vUv;varying vec2 vL;varying vec2 vR;uniform vec2 texelSize;void main(){vUv=aPosition*.5+.5;float offset=1.33333333;vL=vUv-texelSize*offset;vR=vUv+texelSize*offset;gl_Position=vec4(aPosition,0.,1.);}`;
    const BLUR_FS = `precision mediump float;precision mediump sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;uniform sampler2D uTexture;void main(){vec4 sum=texture2D(uTexture,vUv)*.29411765;sum+=texture2D(uTexture,vL)*.35294118;sum+=texture2D(uTexture,vR)*.35294118;gl_FragColor=sum;}`;
    const COPY_FS = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`;
    const CLEAR_FS = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`;
    const DISPLAY_FS = `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTexture;uniform vec2 texelSize;void main(){vec3 C=texture2D(uTexture,vUv).rgb;float a=max(C.r,max(C.g,C.b));gl_FragColor=vec4(C,a);}`;
    const SPLAT_FS = `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point.xy;p.x*=aspectRatio;vec3 splat=exp(-dot(p,p)/radius)*color;vec3 base=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(base+splat,1.);}`;
    const ADVECTION_FS = `precision highp float;precision highp sampler2D;varying vec2 vUv;uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform vec2 dyeTexelSize;uniform float dt;uniform float dissipation;vec4 bilerp(sampler2D sam,vec2 uv,vec2 tS){vec2 st=uv/tS-.5;vec2 i=floor(st);vec2 f=fract(st);vec4 a=texture2D(sam,(i+vec2(.5,.5))*tS);vec4 b=texture2D(sam,(i+vec2(1.5,.5))*tS);vec4 c=texture2D(sam,(i+vec2(.5,1.5))*tS);vec4 d=texture2D(sam,(i+vec2(1.5,1.5))*tS);return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}void main(){vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;vec4 result=bilerp(uSource,coord,dyeTexelSize);float decay=1.+dissipation*dt;gl_FragColor=result/decay;}`;
    const DIVERGENCE_FS = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x;float R=texture2D(uVelocity,vR).x;float T=texture2D(uVelocity,vT).y;float B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.){C.x=0.;L=-C.x;}if(vR.x>1.){C.x=0.;R=-C.x;}if(vT.y>1.){C.y=0.;T=-C.y;}if(vB.y<0.){C.y=0.;B=-C.y;}float div=.5*(R-L+T-B);gl_FragColor=vec4(div,0.,0.,1.);}`;
    const CURL_FS = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).y;float R=texture2D(uVelocity,vR).y;float T=texture2D(uVelocity,vT).x;float B=texture2D(uVelocity,vB).x;float vorticity=R-L-T+B;gl_FragColor=vec4(.5*vorticity,0.,0.,1.);}`;
    const VORTICITY_FS = `precision highp float;precision highp sampler2D;varying vec2 vUv;varying vec2 vL;varying vec2 vR;varying vec2 vT;varying vec2 vB;uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;void main(){float L=texture2D(uCurl,vL).x;float R=texture2D(uCurl,vR).x;float T=texture2D(uCurl,vT).x;float B=texture2D(uCurl,vB).x;float C=texture2D(uCurl,vUv).x;vec2 force=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));force/=length(force)+.0001;force*=curl*C;force.y*=-1.;vec2 vel=texture2D(uVelocity,vUv).xy;gl_FragColor=vec4(vel+force*dt,0.,1.);}`;
    const PRESSURE_FS = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uDivergence;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;float C=texture2D(uPressure,vUv).x;float divergence=texture2D(uDivergence,vUv).x;float pressure=(L+R+B+T-divergence)*.25;gl_FragColor=vec4(pressure,0.,0.,1.);}`;
    const GRADIENT_FS = `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;varying highp vec2 vL;varying highp vec2 vR;varying highp vec2 vT;varying highp vec2 vB;uniform sampler2D uPressure;uniform sampler2D uVelocity;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;vec2 velocity=texture2D(uVelocity,vUv).xy;velocity.xy-=vec2(R-L,T-B);gl_FragColor=vec4(velocity,0.,1.);}`;

    /* ── Program helpers ── */
    class GLProgram {
      constructor(vs, fs) {
        this.uniforms = {};
        this.program = createProgram(vs, fs);
        getUniforms(this.program, this.uniforms);
      }
      bind() { gl.useProgram(this.program); }
    }
    function createProgram(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, compileShader(gl.VERTEX_SHADER, vs));
      gl.attachShader(p, compileShader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(p);
      return p;
    }
    function compileShader(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    function getUniforms(p, u) {
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        u[info.name] = gl.getUniformLocation(p, info.name);
      }
    }

    const blurProgram = new GLProgram(BLUR_VS, BLUR_FS);
    const copyProgram = new GLProgram(BASE_VS, COPY_FS);
    const clearProgram = new GLProgram(BASE_VS, CLEAR_FS);
    const displayProgram = new GLProgram(BASE_VS, DISPLAY_FS);
    const splatProgram = new GLProgram(BASE_VS, SPLAT_FS);
    const advectionProgram = new GLProgram(BASE_VS, ADVECTION_FS);
    const divergenceProgram = new GLProgram(BASE_VS, DIVERGENCE_FS);
    const curlProgram = new GLProgram(BASE_VS, CURL_FS);
    const vorticityProgram = new GLProgram(BASE_VS, VORTICITY_FS);
    const pressureProgram = new GLProgram(BASE_VS, PRESSURE_FS);
    const gradSubProgram = new GLProgram(BASE_VS, GRADIENT_FS);

    /* ── Quad ── */
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const iBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    /* ── FBOs ── */
    function createFBO(w, h, inFmt, fmt, type, param) {
      gl.activeTexture(gl.TEXTURE0);
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, inFmt, w, h, 0, fmt, type, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
      gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        texture: t, fbo: fb, width: w, height: h, texelSizeX: 1 / w, texelSizeY: 1 / h,
        attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, t); return id; }
      };
    }
    function createDoubleFBO(w, h, inFmt, fmt, type, param) {
      let fbo1 = createFBO(w, h, inFmt, fmt, type, param);
      let fbo2 = createFBO(w, h, inFmt, fmt, type, param);
      return {
        width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
        get read() { return fbo1; }, get write() { return fbo2; },
        swap() { const t = fbo1; fbo1 = fbo2; fbo2 = t; }
      };
    }
    function resizeDoubleFBO(target, w, h, inFmt, fmt, type, param) {
      if (target.width === w && target.height === h) return target;
      const n = createDoubleFBO(w, h, inFmt, fmt, type, param);
      copyProgram.bind();
      gl.uniform1i(copyProgram.uniforms.uTexture, target.read.attach(0));
      blit(n.write); n.swap(); return n;
    }

    function getResolution(res) {
      let ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (ar < 1) ar = 1 / ar;
      const m = Math.round(res * ar);
      return {
        width: gl.drawingBufferWidth > gl.drawingBufferHeight ? m : res,
        height: gl.drawingBufferWidth > gl.drawingBufferHeight ? res : m
      };
    }

    const filter = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    let simRes = getResolution(config.SIM_RESOLUTION);
    let dyeRes = getResolution(config.DYE_RESOLUTION);
    let density = createDoubleFBO(dyeRes.width, dyeRes.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, filter);
    let velocity = createDoubleFBO(simRes.width, simRes.height, ext.formatRG.internalFormat, ext.formatRG.format, ext.halfFloatTexType, filter);
    let divergence = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
    let curl = createFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);
    let pressure = createDoubleFBO(simRes.width, simRes.height, ext.formatR.internalFormat, ext.formatR.format, ext.halfFloatTexType, gl.NEAREST);

    function blit(target) {
      if (target == null) {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      } else {
        gl.viewport(0, 0, target.width, target.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    /* ── Amber color generator ── */
    function generateColor() {
      /* Amber/gold palette — warm oranges and golds */
      const palette = [
        [0.82, 0.55, 0.23],
        [0.91, 0.63, 0.11],
        [0.96, 0.74, 0.30],
        [0.70, 0.38, 0.08],
        [1.0, 0.82, 0.45],
        [0.88, 0.50, 0.10],
      ];
      const c = palette[Math.floor(Math.random() * palette.length)];
      return [c[0], c[1], c[2]];
    }

    /* ── Resize ── */
    function resizeCanvas() {
      const W = canvas.clientWidth, H = canvas.clientHeight;
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W; canvas.height = H;
        simRes = getResolution(config.SIM_RESOLUTION);
        dyeRes = getResolution(config.DYE_RESOLUTION);
        density = resizeDoubleFBO(density, dyeRes.width, dyeRes.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, filter);
        velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, ext.formatRG.internalFormat, ext.formatRG.format, ext.halfFloatTexType, filter);
      }
    }

    /* ── Splat ── */
    function splat(x, y, dx, dy, color) {
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
      gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100));
      blit(velocity.write); velocity.swap();
      gl.uniform1i(splatProgram.uniforms.uTarget, density.read.attach(0));
      gl.uniform3f(splatProgram.uniforms.color, color[0], color[1], color[2]);
      blit(density.write); density.swap();
    }
    function correctRadius(r) { const ar = canvas.width / canvas.height; return ar > 1 ? r * ar : r; }

    function splatPointer(p) {
      const dx = p.deltaX * config.SPLAT_FORCE;
      const dy = p.deltaY * config.SPLAT_FORCE;
      splat(p.texcoordX, p.texcoordY, dx, dy, p.color);
    }

    /* ── Input ── */
    function updatePointerDownData(pointer, id, posX, posY) {
      pointer.id = id;
      pointer.down = true;
      pointer.moved = false;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1 - posY / canvas.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0; pointer.deltaY = 0;
      pointer.color = generateColor();
    }
    function updatePointerMoveData(pointer, posX, posY, color) {
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1 - posY / canvas.height;
      pointer.deltaX = correctDelta(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = correctDelta(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
      pointer.color = color;
    }
    function correctDelta(d) { const corrD = d * (canvas.width > canvas.height ? canvas.height / canvas.width : canvas.width / canvas.height); return corrD; }
    function updatePointerUpData(pointer) { pointer.down = false; }

    canvas.addEventListener('mousedown', e => {
      let pointer = pointers.find(p => p.id === -1) || pointers[0];
      updatePointerDownData(pointer, -1, e.offsetX, e.offsetY);
    });
    window.addEventListener('mousemove', e => {
      let pointer = pointers[0];
      if (!pointer.down) pointer.color = generateColor();
      updatePointerMoveData(pointer, e.clientX, e.clientY, pointer.color);
      pointer.down = true; /* treat any move as down for splash effect */
    });
    window.addEventListener('mouseup', () => { pointers.forEach(p => updatePointerUpData(p)); });
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      const touches = e.targetTouches;
      while (pointers.length < touches.length) pointers.push(new pointerPrototype());
      for (let i = 0; i < touches.length; i++) {
        updatePointerDownData(pointers[i], touches[i].identifier, touches[i].pageX, touches[i].pageY);
      }
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      const touches = e.targetTouches;
      for (let i = 0; i < touches.length; i++) {
        if (i >= pointers.length) break;
        updatePointerMoveData(pointers[i], touches[i].pageX, touches[i].pageY, pointers[i].color);
      }
    }, { passive: false });
    canvas.addEventListener('touchend', e => {
      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        const p = pointers.find(p => p.id === touches[i].identifier);
        if (p) updatePointerUpData(p);
      }
    });

    /* ── Simulation step ── */
    function step(dt) {
      gl.disable(gl.BLEND);
      /* Curl */
      curlProgram.bind();
      gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(curl);
      /* Vorticity */
      vorticityProgram.bind();
      gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
      gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
      gl.uniform1f(vorticityProgram.uniforms.dt, dt);
      blit(velocity.write); velocity.swap();
      /* Divergence */
      divergenceProgram.bind();
      gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
      blit(divergence);
      /* Clear pressure */
      clearProgram.bind();
      gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
      gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
      blit(pressure.write); pressure.swap();
      /* Pressure */
      pressureProgram.bind();
      gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
      for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write); pressure.swap();
      }
      /* Gradient subtract */
      gradSubProgram.bind();
      gl.uniform2f(gradSubProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1i(gradSubProgram.uniforms.uPressure, pressure.read.attach(0));
      gl.uniform1i(gradSubProgram.uniforms.uVelocity, velocity.read.attach(1));
      blit(velocity.write); velocity.swap();
      /* Advect velocity */
      advectionProgram.bind();
      gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
      if (!ext.supportLinearFiltering) gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      const vAttach = velocity.read.attach(0);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, vAttach);
      gl.uniform1i(advectionProgram.uniforms.uSource, vAttach);
      gl.uniform1f(advectionProgram.uniforms.dt, dt);
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
      blit(velocity.write); velocity.swap();
      /* Advect density */
      if (!ext.supportLinearFiltering) gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, density.texelSizeX, density.texelSizeY);
      gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
      gl.uniform1i(advectionProgram.uniforms.uSource, density.read.attach(1));
      gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
      blit(density.write); density.swap();
    }

    /* ── Render ── */
    function render() {
      if (config.TRANSPARENT) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      }
      displayProgram.bind();
      gl.uniform2f(displayProgram.uniforms.texelSize, 1 / gl.drawingBufferWidth, 1 / gl.drawingBufferHeight);
      gl.uniform1i(displayProgram.uniforms.uTexture, density.read.attach(0));
      blit(null);
    }

    /* ── Apply inputs ── */
    function applyInputs() {
      pointers.forEach(p => {
        if (p.moved) { p.moved = false; splatPointer(p); }
      });
    }

    /* ── Update loop ── */
    let lastTime = Date.now();
    let colorTimer = 0;
    let rafId;

    function update() {
      if (!isActive) return;
      const dt = Math.min((Date.now() - lastTime) / 1000, 0.016666);
      lastTime = Date.now();
      resizeCanvas();
      colorTimer += dt * config.COLOR_UPDATE_SPEED;
      if (colorTimer >= 1) {
        colorTimer = 0;
        pointers.forEach(p => { if (p.down) p.color = generateColor(); });
      }
      applyInputs();
      if (!config.PAUSED) step(dt);
      render();
      rafId = requestAnimationFrame(update);
    }
    update();

    return () => {
      isActive = false;
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9998,          /* Below any modals, above page content */
        pointerEvents: 'none', /* Never blocks clicks */
        mixBlendMode: 'screen', /* Blends over dark background beautifully */
      }}
    />
  );
}