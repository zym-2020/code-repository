import "./node_modules/axios/dist/axios.js";
export const initWebGL = (canvasDOM) => {
  const style = getComputedStyle(canvasDOM);
  const width = parseInt(style.width);
  const height = parseInt(style.height);
  canvasDOM.width = width;
  canvasDOM.height = height;
  const gl = canvasDOM.getContext("webgl2");
  gl.viewport(0, 0, width, height);
  return gl;
};

export class Flow {
  _gl = null;
  _imageMap = new Map();
  _textureMap = new Map();
  _samplerMap = new Map();
  _shaderScriptMap = new Map();

  _updateProgram = null;
  _trajectoryProgram = null;

  _simulationVAO = null;
  _simulationVAO2 = null;
  _renderVAO = null;
  _renderVAO2 = null;
  _XFBO = null;
  _XFBO2 = null;
  _simulationBuffer = null;
  _xfSimulationBuffer = null;
  _UBO = null;
  _sVAO = null;
  _rVAO = null;
  _xfBO = null;
  _unPackBuffer = null;
  _uboMapBuffer = new Float32Array(12);
  _textureOffsetArray = [];

  _beginBlock = -1.0;

  frequency = 0;

  count = 0;
  flag = true;
  imagePre = 0;
  imageNext = 1;

  _speedFactor = 0;
  _tracksNumber = 0;
  _segmentNumber = 0;
  _fillWidth = 0;
  _aaWidth = 0;
  _color = 0;
  _primitive = 0;
  _fixedDropRate = 0;
  _extraDropRate = 0;
  eventObj = {
    speedFactor: (value) => {
      this._speedFactor = value;
    },
    tracksNumber: (value) => {
      this._tracksNumber = value;
    },
    segmentNumber: (value) => {
      this._segmentNumber = value;
    },
    fillWidth: (value) => {
      this._fillWidth = value;
    },
    aaWidth: (value) => {
      this._aaWidth = value;
    },
    color: (value) => {
      this._color = value;
    },
    primitive: (value) => {
      this._primitive = value;
    },
    fixedDropRate: (value) => {
      this._fixedDropRate = value;
    },
    extraDropRate: (value) => {
      this._extraDropRate = value;
    },
  };

  constructor(option) {
    this.option = option;
    this.frequency = this.option.frequency ? this.option.frequency : 200;
    this._segmentPrepare = option.constraints.maxSegmentNum;
    this._shaderScriptMap.set(
      FlowEnum.UPDATE_VERTEX,
      `#version 300 es
    precision highp float;

    layout (location=0) in vec3 particleInfo;
    layout (location=1) in float age;

    layout (std140) uniform FlowFieldUniforms
    {
        float progress;
        float segmentNum;
        float fullLife;
        float dropRate;
        float dropRateBump;
        float speedFactor;
        vec4 flowBoundary; // vec4(uMin, vMin, uMax, vMax)
        
    };

    uniform sampler2D flowField[2];
    uniform sampler2D mask[2];
    // uniform sampler2D validAddress;
    uniform float randomSeed;

    out vec3 newInfo;
    out float aliveTime;

    // pseudo-random generator
    float rand(const vec2 co) {
        const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);
        float t = dot(rand_constants.xy, co);
        return abs(fract(sin(t) * (rand_constants.z + t)));
    }

    float drop(float velocity, vec2 uv)
    {
        vec2 seed = (particleInfo.xy + uv) * randomSeed;
        float drop_rate = dropRate + velocity * dropRateBump;
        return step(drop_rate, rand(seed));
    }

    float is_in_flow_progress(vec2 resolution, vec2 uv)
    {
        ivec2 texcoords = ivec2(uv * resolution);
        vec4 color1 = texelFetch(mask[0], texcoords, 0);
        vec4 color2 = texelFetch(mask[1], texcoords, 0);

        ivec2 xy1 = ivec2((int(color1.r * 255.0) << 8) + int(color1.g * 255.0), (int(color1.b * 255.0) << 8) + int(color1.a * 255.0));
        ivec2 xy2 = ivec2((int(color2.r * 255.0) << 8) + int(color2.g * 255.0), (int(color2.b * 255.0) << 8) + int(color2.a * 255.0));
        float isInFlow1 = float((xy1 == texcoords));
        float isInFlow2 = float((xy2 == texcoords));

        return step(0.0, 2.0 * mix(isInFlow1, isInFlow2, progress) - 1.0);
    }

    vec2 get_speed(sampler2D sFlowField, vec2 uv)
    {
        vec2 speed_tl = texture(sFlowField, uv).rg;
        return speed_tl;
    }

    vec2 lookup_speed(vec2 uv, vec2 resolution)
    {
        vec2 lSpeed = get_speed(flowField[0], uv);
        vec2 nSpeed = get_speed(flowField[1], uv);
        vec2 speed = mix(lSpeed, nSpeed, progress);
        return mix(flowBoundary.xy, flowBoundary.zw, speed);
        // return vec2(0.5, 0.5);
    }

    float speed_rate(vec2 speed)
    {
        return length(speed) / length(flowBoundary.zw);
    }

    void die(vec2 resolution)
    {
        vec2 seed = randomSeed + particleInfo.xy;

        vec2 uv = vec2(rand(seed + 1.3), rand(seed + 2.1));
        vec4 rebirthColor = texture(mask[1], uv);
        float rebirth_x = float((int(rebirthColor.r * 255.0) << 8) + int(rebirthColor.g * 255.0));
        float rebirth_y = float((int(rebirthColor.b * 255.0) << 8) + int(rebirthColor.a * 255.0));
        rebirth_x = rebirth_x + rand(seed + rebirth_x);
        rebirth_y = rebirth_y + rand(seed + rebirth_y);

        vec2 rebirthPos = vec2(rebirth_x, rebirth_y) / resolution;
        newInfo = vec3(rebirthPos, speed_rate(lookup_speed(rebirthPos, resolution)));
        aliveTime = age + 1.0;
    }

    void simulation(vec2 resolution)
    {
        vec2 uv = particleInfo.xy;
        vec2 speed = lookup_speed(uv, resolution);
        float speedRate = speed_rate(speed);

        vec2 nPos = vec2(particleInfo.xy + speed * speedFactor / resolution);
        nPos = clamp(nPos, vec2(0.0), vec2(1.0));
        float dropped = drop(speedRate, uv) * is_in_flow_progress(resolution, nPos);

        newInfo = mix(particleInfo, vec3(nPos, speedRate), dropped);
        aliveTime = mix(fullLife - segmentNum, age + 1.0, dropped);
    }

    void freeze()
    {
        newInfo = particleInfo;
        aliveTime = age + 1.0;
    }

    void rebirth()
    {
        newInfo = particleInfo;
        aliveTime = 0.0;
    }

    void main()
    {
        vec2 resolution = vec2(textureSize(mask[1], 0));
        
        if (age < fullLife - segmentNum)
        {
            simulation(resolution);
        }
        else if (age == fullLife)
        {
            die(resolution);
        }
        else if (abs(fullLife - age) <= segmentNum)
        {
            freeze();
        }
        else
        {
            rebirth();
        }
    }
    `
    );
    this._shaderScriptMap.set(
      FlowEnum.UPDATE_FRAGMENT,
      `#version 300 es
    precision highp float;

    void main() 
    {
    }
    `
    );
    this._shaderScriptMap.set(
      FlowEnum.TRAJECTORY_VERTEX,
      `#version 300 es
    precision highp float;

    layout (location = 0) in float isAlive;

    layout (std140) uniform FlowFieldUniforms
    {
        float progress;
        float segmentNum;
        float fullLife;
        float dropRate;
        float dropRateBump;
        float speedFactor;
        float colorScheme;
        vec4 flowBoundary;
    };

    uniform sampler2D particlePool;
    uniform sampler2D projectionTexture;
    uniform int blockNum;
    uniform int beginBlock;
    uniform int blockSize;
    uniform float fillWidth;
    uniform float aaWidth;
    uniform vec2 viewport;
    // uniform mat4 u_matrix;

    out struct Stream_line_setting 
    {
        float edgeParam;
        float alphaDegree;
        float velocity; // a percentage
        float isDiscarded;
    } sls;


    // vec4 ReCoordinate(vec2 pos) {

    //     vec3 geoPos;
    //     geoPos = texture(projectionTexture, pos).xyz;
    //     vec4 res = u_matrix * vec4(geoPos, 1.0);
    //     return res;
    // }

    vec4 ReCoordinate(vec2 pos) {
        vec4 res = vec4(pos.xy * 2.0 - 1.0, 0.0, 1.0);
        return res;
    }

    ivec2 get_uv(int vertexIndex)
    {
        // calculate the blockIndex of the current vertx
        int blockIndex = (beginBlock - vertexIndex + blockNum) % blockNum;

        // calculate original uv of the block
        int textureWidth = textureSize(particlePool, 0).x;
        int columnNum = textureWidth / blockSize;
        ivec2 blockUV = ivec2(blockIndex % columnNum, blockIndex / columnNum) * blockSize;

        // calculate uv of the current vertex
        ivec2 vertexUV = blockUV + ivec2(gl_InstanceID % blockSize, gl_InstanceID / blockSize);

        return vertexUV;
    }

    vec4 transfer_to_clip_space(vec2 pos)
    {
        return ReCoordinate(pos);
    }

    vec4 get_clip_position(ivec2 uv)
    {
        return transfer_to_clip_space(texelFetch(particlePool, uv, 0).rg);
    }

    vec2 get_vector(vec2 beginVertex, vec2 endVertex)
    {
        return normalize(endVertex - beginVertex);
    }

    void main()
    {
        // get screen positions from particle pool
        float parity = float(gl_VertexID % 2);
        int currentVertex = gl_VertexID / 2;
        int nextVertex = currentVertex + 1;
        ivec2 c_uv = get_uv(currentVertex);
        ivec2 n_uv = get_uv(nextVertex);
        vec4 cv_pos_CS = get_clip_position(c_uv);
        vec4 nv_pos_CS = get_clip_position(n_uv);
        vec2 cv_pos_SS = cv_pos_CS.xy / cv_pos_CS.w;
        vec2 nv_pos_SS = nv_pos_CS.xy / nv_pos_CS.w;

        // calculate the screen offset
        float speedRate = texelFetch(particlePool, c_uv, 0).b;
        float lineWidth = (fillWidth + aaWidth * 2.0);// * mix(2.0, 1.0, clamp(pow(speedRate * 10.0, 3.0), 0.0, 1.0));
        vec2 cn_vector = get_vector(cv_pos_SS, nv_pos_SS);
        float screenOffset = lineWidth / 2.0;

        // translate current vertex position
        vec3 view = vec3(0.0, 0.0, 1.0);
        vec2 v_offset = normalize(cross(view, vec3(cn_vector, 0.0))).xy * mix(1.0, -1.0, parity);  //等价于以下
        // vec2 v_offset = normalize(vec2(-cn_vector.y, cn_vector.x)).xy * mix(1.0, -1.0, parity);
        
        vec2 vertexPos_SS = cv_pos_SS + v_offset * screenOffset / viewport;

        //////////////
        // calculate vertex position in screen coordinates
        vec2 vertexPos_CS = vertexPos_SS * cv_pos_CS.w;
        gl_Position = vec4(vertexPos_CS, 0.0, cv_pos_CS.w);

        // prepare for anti-aliasing
        sls.edgeParam = 2.0 * parity - 1.0;

        float segmentRate = float(currentVertex) / segmentNum;
        sls.alphaDegree = 1.0 - segmentRate;

        sls.velocity = speedRate;
        sls.isDiscarded = isAlive;
    }
    `
    );
    this._shaderScriptMap.set(
      FlowEnum.TRAJECTORY_FRAGMENT,
      `#version 300 es
    precision highp float;

    in struct Stream_line_setting 
    {
        float edgeParam;
        float alphaDegree;
        float velocity; // a percentage
        float isDiscarded;
    } sls;

    layout (std140) uniform FlowFieldUniforms
    {
        float progress;
        float segmentNum;
        float fullLife;
        float dropRate;
        float dropRateBump;
        float speedFactor;
        float colorScheme;
        vec4 flowBoundary;
    };
    uniform float fillWidth;
    uniform float aaWidth;

    out vec4 fragColor;

    int rampColors0[8] = int[](
        0x3288bd,
        0x66c2a5,
        0xabdda4,
        0xe6f598,
        0xfee08b,
        0xfdae61,
        0xf46d43,
        0xd53e4f
    );

    int rampColors1[8] = int[](
        0x8c510a,
        0xbf812d,
        0xdfc27d,
        0xf6e8c3,
        0xc7eae5,
        0x80cdc1,
        0x35978f,
        0x01665e
    );
    int rampColors2[8] = int[](
        0x8dd3c7,
        0xffffb3,
        0xbebada,
        0xfb8072,
        0x80b1d3,
        0xfdb462,
        0xb3de69,
        0xfccde5
    );

    int[8] rampColors()
    {
        if (colorScheme == 0.0)
            return rampColors0;
        if (colorScheme == 1.0)
            return rampColors1;
        if (colorScheme == 2.0)
            return rampColors2;
    } 

    vec3 colorFromInt(int color)
    {
        float b = float(color & 0xFF) / 255.0;
        float g = float((color >> 8) & 0xFF) / 255.0;
        float r = float((color >> 16) & 0xFF) / 255.0;

        return vec3(r, g, b);
    }

    vec3 velocityColor(float speed)
    {
        float bottomIndex = floor(speed * 10.0);
        float topIndex = mix(bottomIndex + 1.0, 7.0, step(6.0, bottomIndex));
        float interval = mix(1.0, 4.0, step(6.0, bottomIndex));

        vec3 slowColor = colorFromInt(rampColors()[int(bottomIndex)]);
        vec3 fastColor = colorFromInt(rampColors()[int(topIndex)]);

        return mix(slowColor, fastColor, (speed * 10.0 - float(bottomIndex)) / interval);
    }

    float getAlpha(float param)
    {
        if (aaWidth == 0.0) return 1.0;
        // float alpha = 1.0 - sin(clamp((param * (0.5 * fillWidth + aaWidth) - 0.5 * fillWidth) / aaWidth, 0.0, 1.0) * 2.0 / 3.141592653);
        float alpha = 1.0 - sin(clamp((param * (0.5 * fillWidth + aaWidth) - 0.5 * fillWidth) / aaWidth, 0.0, 1.0) * 3.141592653 / 2.0);
        // float alpha = 1.0 - sin(param * 3.141592653 / 2.0);
        return alpha;
    }

    void main() 
    {
        if (sls.isDiscarded >= fullLife) discard; 
        float alpha = getAlpha(abs(0.0));

        // vec3 color = mix(colorFromInt(rampColors[int(sls.velocity * 7.0)]), colorFromInt(rampColors[int(sls.velocity * 7.0 + 0.5)]), fract(sls.velocity * 7.0));
        vec3 color = velocityColor(sls.velocity);
        // color = mix(vec3(0.7), color, alpha);
        // fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        fragColor = vec4(color, 1.0) * alpha * sls.alphaDegree;
        // fragColor = vec4(1.0) * alpha;
    }
    `
    );
    this._segmentNumber = option.parameter.segmentNumber;
    this._speedFactor = option.parameter.speedFactor;
    this._tracksNumber = option.parameter.tracksNumber;
    this._fillWidth = option.parameter.fillWidth;
    this._aaWidth = option.parameter.aaWidth;
    this._color = option.parameter.color;
    this._primitive = option.parameter.primitive;
    this._fixedDropRate = option.parameter.fixedDropRate;
    this._extraDropRate = option.parameter.extraDropRate;
  }

  async prepareAsyncImage() {
    const promiseArr = [];
    for (let i = 0; i < 2; i++) {
      promiseArr.push(this.getImage(FlowEnum.FLOW_FIELD_IMAGE + i, this.option.flowFields[i], "flipY"));
      promiseArr.push(this.getImage(FlowEnum.SEEDING_IMAGE + i, this.option.seeding[i], "flipY"));
    }
    promiseArr.push(this.getImage(FlowEnum.PROJECTION_MAPBOX_IMAGE, this.option.projection, "flipY"));
    await Promise.all(promiseArr);
  }

  getImage(key, address, flip) {
    return new Promise((resolve, reject) => {
      axios.get(address, { responseType: "blob" }).then((res) => {
        createImageBitmap(res.data, { imageOrientation: flip, premultiplyAlpha: "none", colorSpaceConversion: "default" }).then((imageBitmap) => {
          this._imageMap.set(key, imageBitmap);
          resolve(null);
        });
      });
    });
  }

  prepareResource(gl) {
    this._gl = gl;
    // 绑定shader
    this._updateProgram = new GlProgram(gl);
    this._trajectoryProgram = new GlProgram(gl);

    this._updateProgram.setShader(gl, this._shaderScriptMap.get(FlowEnum.UPDATE_VERTEX), this._shaderScriptMap.get(FlowEnum.UPDATE_FRAGMENT), ["newInfo", "aliveTime"]);
    this._trajectoryProgram.setShader(gl, this._shaderScriptMap.get(FlowEnum.TRAJECTORY_VERTEX), this._shaderScriptMap.get(FlowEnum.TRAJECTORY_FRAGMENT));

    const maxBlockSize = Math.ceil(Math.sqrt(this.option.constraints.maxTrajectoryNum)); //1024

    this._uboMapBuffer[8] = this.option.flowBoundary.uMin;
    this._uboMapBuffer[9] = this.option.flowBoundary.vMin;
    this._uboMapBuffer[10] = this.option.flowBoundary.uMax;
    this._uboMapBuffer[11] = this.option.flowBoundary.vMax;

    // 设置sampler
    this._samplerMap.set(FlowEnum.L_SAMPLER, addSampler(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE));
    this._samplerMap.set(FlowEnum.N_SAMPLER, addSampler(gl, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE));

    // 设置simulationVAO buffer
    this._simulationVAO = gl.createVertexArray();
    gl.bindVertexArray(this._simulationVAO);
    const particleMapBuffer = new Float32Array(maxBlockSize * maxBlockSize * 3).fill(0);
    for (let i = 0; i < maxBlockSize * maxBlockSize; i++) {
      particleMapBuffer[i * 3 + 0] = rand(0, 1.0);
      particleMapBuffer[i * 3 + 1] = rand(0, 1.0);
      particleMapBuffer[i * 3 + 2] = 0.0;
    }
    this._simulationBuffer = makeBufferBySource(gl, gl.ARRAY_BUFFER, particleMapBuffer, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._simulationBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(0);
    const particleCountdownArray = new Float32Array(this.option.constraints.maxTrajectoryNum).fill(this.option.constraints.maxSegmentNum * 9.0);
    const lifeBuffer = makeBufferBySource(gl, gl.ARRAY_BUFFER, particleCountdownArray, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, lifeBuffer);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 1 * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // 设置simulationVAO2 buffer
    this._simulationVAO2 = gl.createVertexArray();
    gl.bindVertexArray(this._simulationVAO2);
    this._xfSimulationBuffer = makeBufferBySource(gl, gl.ARRAY_BUFFER, particleMapBuffer, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._xfSimulationBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(0);
    const xfLifeBuffer = makeBufferBySource(gl, gl.ARRAY_BUFFER, particleCountdownArray, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, xfLifeBuffer);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 1 * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // 设置renderVAO buffer
    this._renderVAO = gl.createVertexArray();
    gl.bindVertexArray(this._renderVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, lifeBuffer);
    gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 1 * 4, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // 设置renderVA02 buffer
    this._renderVAO2 = gl.createVertexArray();
    gl.bindVertexArray(this._renderVAO2);
    gl.bindBuffer(gl.ARRAY_BUFFER, xfLifeBuffer);
    gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 1 * 4, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // 设置XFBO buffer
    this._XFBO = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this._XFBO);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, this._xfSimulationBuffer);
    gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._xfSimulationBuffer, 0, maxBlockSize * maxBlockSize * 12);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, xfLifeBuffer);
    gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 1, xfLifeBuffer, 0, maxBlockSize * maxBlockSize * 4);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    // 设置XFBO2 buffer
    this._XFBO2 = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this._XFBO2);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, this._simulationBuffer);
    gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._simulationBuffer, 0, maxBlockSize * maxBlockSize * 12);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, lifeBuffer);
    gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 1, lifeBuffer, 0, maxBlockSize * maxBlockSize * 4);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    this._UBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._UBO);
    gl.bufferData(gl.ARRAY_BUFFER, 48, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 设置纹理
    for (let i = 0; i < 2; i++) {
      const flowFieldTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RG32F, 0, 0);
      fillTexture(
        gl,
        this._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + i),
        "Float_Point",
        0,
        this.option.textureSize.flowField[0],
        this.option.textureSize.flowField[1],
        gl.TEXTURE_2D,
        flowFieldTexture,
        WebGL2RenderingContext.RG32F,
        1,
        WebGL2RenderingContext.RG,
        WebGL2RenderingContext.FLOAT
      );
      this._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + i, flowFieldTexture);

      const seedingTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGBA8, 0, 0);
      fillTexture(
        gl,
        this._imageMap.get(FlowEnum.SEEDING_IMAGE + i),
        "Integer",
        0,
        this.option.textureSize.seeding[0],
        this.option.textureSize.seeding[1],
        gl.TEXTURE_2D,
        seedingTexture,
        WebGL2RenderingContext.RGBA8,
        1,
        WebGL2RenderingContext.RGBA,
        WebGL2RenderingContext.UNSIGNED_BYTE
      );
      this._textureMap.set(FlowEnum.SEEDING_TEXTURE + i, seedingTexture);
    }
    const projectionTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RG32F, 0, 0);
    fillTexture(
      gl,
      this._imageMap.get(FlowEnum.PROJECTION_MAPBOX_IMAGE),
      "Float_Point",
      0,
      this.option.textureSize.projection[0],
      this.option.textureSize.projection[1],
      gl.TEXTURE_2D,
      projectionTexture,
      WebGL2RenderingContext.RG32F,
      1,
      WebGL2RenderingContext.RG,
      WebGL2RenderingContext.FLOAT
    );
    this._textureMap.set(FlowEnum.PROJECTION_MAPBOX_TEXTURE, projectionTexture);

    const maxBlockColumn = Math.floor(this.option.constraints.maxTextureSize / maxBlockSize);
    for (let i = 0; i < this.option.constraints.maxSegmentNum; i++) {
      const offset = {
        offsetX: (i % maxBlockColumn) * maxBlockSize,
        offsetY: Math.floor(i / maxBlockColumn) * maxBlockSize,
      };
      this._textureOffsetArray.push(offset);
    }
    particleMapBuffer.fill(0);
    const poolTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGB32F, this.option.constraints.maxTextureSize, this.option.constraints.maxTextureSize);
    this._textureMap.set(FlowEnum.POOL_TEXTURE, poolTexture);
  }

  tickLogicCount(gl) {
    this._beginBlock = (this._beginBlock + 1) % this.option.constraints.maxSegmentNum;
    this.swap();

    this._uboMapBuffer[0] = this.count / this.frequency;
    this._uboMapBuffer[1] = this._segmentNumber;
    this._uboMapBuffer[2] = this.option.constraints.maxSegmentNum * 10;
    this._uboMapBuffer[3] = this._fixedDropRate;
    this._uboMapBuffer[4] = this._extraDropRate;
    this._uboMapBuffer[5] = this._speedFactor * 0.01 * 100;
    this._uboMapBuffer[6] = this._color;

    if (this.count === this.frequency && this.flag) {
      this.flag = false;
      this.imagePre = this.imageNext;
      this.imageNext = (this.imageNext + 1) % this.option.flowFields.length;
      const that = this;
      const promiseArr = [];
      this._imageMap.set(FlowEnum.FLOW_FIELD_IMAGE + "0", this._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + "1"));
      this._imageMap.set(FlowEnum.SEEDING_IMAGE + "0", this._imageMap.get(FlowEnum.SEEDING_IMAGE + "1"));
      promiseArr.push(this.getImage(FlowEnum.FLOW_FIELD_IMAGE + "1", this.option.flowFields[this.imageNext], "flipY"));
      promiseArr.push(this.getImage(FlowEnum.SEEDING_IMAGE + "1", this.option.seeding[this.imageNext], "flipY"));
      Promise.all(promiseArr).then((res) => {
        that.flag = true;
        that.count = 0;
        that._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + "0", that._textureMap.get(FlowEnum.FLOW_FIELD_TEXTURE + "1"));
        that._textureMap.set(FlowEnum.SEEDING_TEXTURE + "0", that._textureMap.get(FlowEnum.SEEDING_TEXTURE + "1"));
        const flowFieldTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RG32F, 0, 0);
        fillTexture(
          gl,
          that._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + "1"),
          "Float_Point",
          0,
          that.option.textureSize.flowField[0],
          that.option.textureSize.flowField[1],
          gl.TEXTURE_2D,
          flowFieldTexture,
          WebGL2RenderingContext.RG32F,
          1,
          WebGL2RenderingContext.RG,
          WebGL2RenderingContext.FLOAT
        );
        that._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + "1", flowFieldTexture);

        const seedingTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGBA8, 0, 0);
        fillTexture(
          gl,
          that._imageMap.get(FlowEnum.SEEDING_IMAGE + "1"),
          "Integer",
          0,
          that.option.textureSize.seeding[0],
          that.option.textureSize.seeding[1],
          gl.TEXTURE_2D,
          seedingTexture,
          WebGL2RenderingContext.RGBA8,
          1,
          WebGL2RenderingContext.RGBA,
          WebGL2RenderingContext.UNSIGNED_BYTE
        );
        that._textureMap.set(FlowEnum.SEEDING_TEXTURE + "1", seedingTexture);
      });
    }
  }

  swap() {
    if (this._beginBlock % 2 == 0) {
      this._sVAO = this._simulationVAO;
      this._rVAO = this._renderVAO;
      this._xfBO = this._XFBO;
      this._unPackBuffer = this._simulationBuffer;
    } else {
      this._sVAO = this._simulationVAO2;
      this._rVAO = this._renderVAO2;
      this._xfBO = this._XFBO2;
      this._unPackBuffer = this._xfSimulationBuffer;
    }
  }

  bindUBO(gl, bindingPointIndex) {
    gl.bindBuffer(gl.UNIFORM_BUFFER, this._UBO);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this._uboMapBuffer);
    gl.bindBufferRange(gl.UNIFORM_BUFFER, bindingPointIndex, this._UBO, 0, this._uboMapBuffer.length * 4.0);
  }

  tickRender(gl, matrix) {
    const maxBlockSize = Math.ceil(Math.sqrt(this.option.constraints.maxTrajectoryNum));

    this.bindUBO(gl, 0);
    // Pass 1: Simulation
    gl.bindVertexArray(this._sVAO);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this._xfBO);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.FLOW_FIELD_TEXTURE + 0));
    gl.bindSampler(0, this._samplerMap.get(FlowEnum.L_SAMPLER));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.FLOW_FIELD_TEXTURE + 1));
    gl.bindSampler(1, this._samplerMap.get(FlowEnum.L_SAMPLER));
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.SEEDING_TEXTURE + 0));
    gl.bindSampler(2, this._samplerMap.get(FlowEnum.N_SAMPLER));
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.SEEDING_TEXTURE + 1));
    gl.bindSampler(3, this._samplerMap.get(FlowEnum.N_SAMPLER));

    this._updateProgram.useProgram(gl);
    this._updateProgram.setVec1i(gl, "flowField", [0, 1]);
    this._updateProgram.setVec1i(gl, "mask", [2, 3]);
    this._updateProgram.setFloat(gl, "randomSeed", Math.random());
    this._updateProgram.setUniformBlock(gl, "FlowFieldUniforms", 0);
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.beginTransformFeedback(gl.POINTS);

    gl.drawArrays(gl.POINTS, 0, this._tracksNumber);
    gl.endTransformFeedback();
    gl.disable(gl.RASTERIZER_DISCARD);
    gl.bindVertexArray(null);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    // Pass 2: Update particle pool

    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this._unPackBuffer);
    const array = new Float32Array(maxBlockSize * maxBlockSize * 3);
    gl.getBufferSubData(gl.PIXEL_UNPACK_BUFFER, 0, array);

    updateTextureByBuffer(
      gl,
      0,
      maxBlockSize,
      maxBlockSize,
      gl.TEXTURE_2D,
      this._textureMap.get(FlowEnum.POOL_TEXTURE),
      this._textureOffsetArray[this._beginBlock].offsetX,
      this._textureOffsetArray[this._beginBlock].offsetY,
      WebGL2RenderingContext.RGB,
      WebGL2RenderingContext.FLOAT
    );
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
    if (this._segmentPrepare > 0) {
      this._segmentPrepare--;
      return;
    }
    if (this.flag) this.count++;
    // gl.finish();

    // Pass 3: Rendering by trajectorires or points
    gl.bindVertexArray(this._rVAO);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.POOL_TEXTURE));
    gl.bindSampler(0, this._samplerMap.get(FlowEnum.N_SAMPLER));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.PROJECTION_MAPBOX_TEXTURE));
    gl.bindSampler(1, this._samplerMap.get(FlowEnum.L_SAMPLER));
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendColor(0.0, 0.0, 0.0, 0.0);

    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this._trajectoryProgram.useProgram(gl);
    this._trajectoryProgram.setInt(gl, "particlePool", 0);
    this._trajectoryProgram.setInt(gl, "projectionTexture", 1);
    this._trajectoryProgram.setInt(gl, "blockNum", this.option.constraints.maxSegmentNum);
    this._trajectoryProgram.setInt(gl, "beginBlock", this._beginBlock);
    this._trajectoryProgram.setInt(gl, "blockSize", maxBlockSize);
    this._trajectoryProgram.setFloat(gl, "currentSegmentNum", 8.0);
    this._trajectoryProgram.setFloat(gl, "fillWidth", this._fillWidth);
    this._trajectoryProgram.setFloat(gl, "aaWidth", this._aaWidth);
    this._trajectoryProgram.setFloat2(gl, "viewport", gl.canvas.width, gl.canvas.height);
    // this._trajectoryProgram.setMat4(gl, "u_matrix", matrix);
    this._trajectoryProgram.setUniformBlock(gl, "FlowFieldUniforms", 0);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (this._segmentNumber - 1) * 2, this._tracksNumber);

    gl.disable(gl.BLEND);

    gl.bindVertexArray(null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  async render(gl, matrix) {
    await this.prepareAsyncImage();
    const available_extensions = gl.getSupportedExtensions();
    for (const extension of available_extensions) {
      gl.getExtension(extension);
    }
    this.prepareResource(gl);
    const renderHandle = () => {
      this.tickLogicCount(gl);
      this.tickRender(gl, matrix);
      requestAnimationFrame(renderHandle);
    };
    renderHandle();
  }

  //   async generateCustomLayer(id) {
  //     const that = this;
  //     let mapObj;
  //     await this.prepareAsyncImage();
  //     const result = {
  //       id: id,
  //       type: "custom",
  //       onAdd(map, gl) {
  //         const available_extensions = gl.getSupportedExtensions();
  //         for (const extension of available_extensions) {
  //           gl.getExtension(extension);
  //         }
  //         mapObj = map;
  //         that.prepareResource.call(that, gl);
  //       },
  //       render(gl, matrix) {
  //         that.tickLogicCount(gl);
  //         that.tickRender(gl, matrix);
  //         mapObj.triggerRepaint();
  //       },
  //     };
  //     return result;
  //   }

  changeState(value) {
    if (!this._gl || value >= this.option.flowFields.length * this.frequency) return;
    const gl = this._gl;
    this.flag = false;
    const index = Math.floor(value / this.frequency);
    this.imagePre = index;
    this.imageNext = (index + 1) % this.option.flowFields.length;
    const promiseArr = [];
    promiseArr.push(this.getImage(FlowEnum.FLOW_FIELD_IMAGE + "0", this.option.flowFields[this.imagePre], "flipY"));
    promiseArr.push(this.getImage(FlowEnum.SEEDING_IMAGE + "0", this.option.seeding[this.imagePre], "flipY"));
    promiseArr.push(this.getImage(FlowEnum.FLOW_FIELD_IMAGE + "1", this.option.flowFields[this.imageNext], "flipY"));
    promiseArr.push(this.getImage(FlowEnum.SEEDING_IMAGE + "1", this.option.seeding[this.imageNext], "flipY"));
    Promise.all(promiseArr).then((res) => {
      this.flag = true;
      this.count = value % this.frequency;
      const flowFieldTexture0 = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RG32F, 0, 0);
      fillTexture(
        gl,
        this._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + "0"),
        "Float_Point",
        0,
        this.option.textureSize.flowField[0],
        this.option.textureSize.flowField[1],
        gl.TEXTURE_2D,
        flowFieldTexture0,
        WebGL2RenderingContext.RG32F,
        1,
        WebGL2RenderingContext.RG,
        WebGL2RenderingContext.FLOAT
      );
      this._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + "0", flowFieldTexture0);
      const flowFieldTexture1 = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RG32F, 0, 0);
      fillTexture(
        gl,
        this._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + "1"),
        "Float_Point",
        0,
        this.option.textureSize.flowField[0],
        this.option.textureSize.flowField[1],
        gl.TEXTURE_2D,
        flowFieldTexture1,
        WebGL2RenderingContext.RG32F,
        1,
        WebGL2RenderingContext.RG,
        WebGL2RenderingContext.FLOAT
      );
      this._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + "1", flowFieldTexture1);

      const seedingTexture0 = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGBA8, 0, 0);
      fillTexture(
        gl,
        this._imageMap.get(FlowEnum.SEEDING_IMAGE + "0"),
        "Integer",
        0,
        this.option.textureSize.seeding[0],
        this.option.textureSize.seeding[1],
        gl.TEXTURE_2D,
        seedingTexture0,
        WebGL2RenderingContext.RGBA8,
        1,
        WebGL2RenderingContext.RGBA,
        WebGL2RenderingContext.UNSIGNED_BYTE
      );
      this._textureMap.set(FlowEnum.SEEDING_TEXTURE + "0", seedingTexture0);
      const seedingTexture1 = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGBA8, 0, 0);
      fillTexture(
        gl,
        this._imageMap.get(FlowEnum.SEEDING_IMAGE + "1"),
        "Integer",
        0,
        this.option.textureSize.seeding[0],
        this.option.textureSize.seeding[1],
        gl.TEXTURE_2D,
        seedingTexture1,
        WebGL2RenderingContext.RGBA8,
        1,
        WebGL2RenderingContext.RGBA,
        WebGL2RenderingContext.UNSIGNED_BYTE
      );
      this._textureMap.set(FlowEnum.SEEDING_TEXTURE + "1", seedingTexture1);
    });
  }
}

export class Wind {
  _gl = null;
  _imageMap = new Map();
  _textureMap = new Map();
  _samplerMap = new Map();
  _shaderScriptMap = new Map();

  _updateProgram = null;
  _trajectoryProgram = null;

  _simulationVAO = null;
  _simulationVAO2 = null;
  _renderVAO = null;
  _renderVAO2 = null;
  _XFBO = null;
  _XFBO2 = null;
  _simulationBuffer = null;
  _xfSimulationBuffer = null;
  _UBO = null;
  _sVAO = null;
  _rVAO = null;
  _xfBO = null;
  _unPackBuffer = null;
  _uboMapBuffer = new Float32Array(12);
  _textureOffsetArray = [];

  _beginBlock = -1.0;

  frequency = 0;

  count = 0;
  flag = true;
  imagePre = 0;
  imageNext = 1;

  _speedFactor = 0;
  _tracksNumber = 0;
  _segmentNumber = 0;
  _fillWidth = 0;
  _aaWidth = 0;
  _color = 0;
  _primitive = 0;
  _fixedDropRate = 0;
  _extraDropRate = 0;
  eventObj = {
    speedFactor: (value) => {
      this._speedFactor = value;
    },
    tracksNumber: (value) => {
      this._tracksNumber = value;
    },
    segmentNumber: (value) => {
      this._segmentNumber = value;
    },
    fillWidth: (value) => {
      this._fillWidth = value;
    },
    aaWidth: (value) => {
      this._aaWidth = value;
    },
    color: (value) => {
      this._color = value;
    },
    primitive: (value) => {
      this._primitive = value;
    },
    fixedDropRate: (value) => {
      this._fixedDropRate = value;
    },
    extraDropRate: (value) => {
      this._extraDropRate = value;
    },
  };

  constructor(option) {
    this.option = option;
    this.frequency = this.option.frequency ? this.option.frequency : 200;
    this._segmentPrepare = option.constraints.maxSegmentNum;
    this._shaderScriptMap.set(
      FlowEnum.UPDATE_VERTEX,
      `#version 300 es
    precision highp float;

    layout (location=0) in vec3 particleInfo;
    layout (location=1) in float age;

    layout (std140) uniform FlowFieldUniforms
    {
        float progress;
        float segmentNum;
        float fullLife;
        float dropRate;
        float dropRateBump;
        float speedFactor;
        vec4 flowBoundary; // vec4(uMin, vMin, uMax, vMax)
        
    };

    uniform sampler2D flowField[2];
    uniform sampler2D mask[2];
    // uniform sampler2D validAddress;
    uniform float randomSeed;

    out vec3 newInfo;
    out float aliveTime;

    // pseudo-random generator
    float rand(const vec2 co) {
        const vec3 rand_constants = vec3(12.9898, 78.233, 4375.85453);
        float t = dot(rand_constants.xy, co);
        return abs(fract(sin(t) * (rand_constants.z + t)));
    }

    float drop(float velocity, vec2 uv)
    {
        vec2 seed = (particleInfo.xy + uv) * randomSeed;
        float drop_rate = dropRate + velocity * dropRateBump;
        return step(drop_rate, rand(seed));
    }

    float is_in_flow_progress(vec2 resolution, vec2 uv)
    {
        ivec2 texcoords = ivec2(uv * resolution);
        vec4 color1 = texelFetch(mask[0], texcoords, 0);
        vec4 color2 = texelFetch(mask[1], texcoords, 0);

        ivec2 xy1 = ivec2((int(color1.r * 255.0) << 8) + int(color1.g * 255.0), (int(color1.b * 255.0) << 8) + int(color1.a * 255.0));
        ivec2 xy2 = ivec2((int(color2.r * 255.0) << 8) + int(color2.g * 255.0), (int(color2.b * 255.0) << 8) + int(color2.a * 255.0));
        float isInFlow1 = float((xy1 == texcoords));
        float isInFlow2 = float((xy2 == texcoords));

        return step(0.0, 2.0 * mix(isInFlow1, isInFlow2, progress) - 1.0);
    }

    vec2 get_speed(sampler2D sFlowField, vec2 uv)
    {
        vec2 speed_tl = texture(sFlowField, uv).rg;
        return speed_tl;
    }

    vec2 lookup_speed(vec2 uv, vec2 resolution)
    {
        // vec2 lSpeed = get_speed(flowField[0], uv);
        // vec2 nSpeed = get_speed(flowField[1], uv);
        // vec2 speed = mix(lSpeed, nSpeed, progress);
        // return mix(flowBoundary.xy, flowBoundary.zw, speed);
        // return vec2(0.5, 0.5);
        vec2 lSpeed = mix(vec2(flowBoundary.xy), vec2(flowBoundary.zw), texture(flowField[0], uv).rg);
        vec2 nSpeed = mix(vec2(flowBoundary.xy), vec2(flowBoundary.zw), texture(flowField[0], uv).rg);
        vec2 speed = mix(lSpeed, nSpeed, progress);
        return speed;
    }

    float speed_rate(vec2 speed)
    {
        return length(speed) / length(flowBoundary.zw);
        // return 0.5;
    }

    void die(vec2 resolution)
    {
        vec2 seed = randomSeed + particleInfo.xy;

        vec2 uv = vec2(rand(seed + 1.3), rand(seed + 2.1));
        vec4 rebirthColor = texture(mask[1], uv);
        float rebirth_x = float((int(rebirthColor.r * 255.0) << 8) + int(rebirthColor.g * 255.0));
        float rebirth_y = float((int(rebirthColor.b * 255.0) << 8) + int(rebirthColor.a * 255.0));
        rebirth_x = rebirth_x + rand(seed + rebirth_x);
        rebirth_y = rebirth_y + rand(seed + rebirth_y);

        vec2 rebirthPos = vec2(rebirth_x, rebirth_y) / resolution;
        newInfo = vec3(rebirthPos, speed_rate(lookup_speed(rebirthPos, resolution)));
        aliveTime = age + 1.0;
    }

    void simulation(vec2 resolution)
    {
        vec2 uv = particleInfo.xy;
        vec2 speed = lookup_speed(uv, resolution);
        float speedRate = speed_rate(speed);

        vec2 nPos = vec2(particleInfo.xy + speed * speedFactor / resolution);
        nPos = clamp(nPos, vec2(0.0), vec2(1.0));
        float dropped = drop(speedRate, uv) * is_in_flow_progress(resolution, nPos);

        newInfo = mix(particleInfo, vec3(nPos, speedRate), dropped);
        aliveTime = mix(fullLife - segmentNum, age + 1.0, dropped);
    }

    void freeze()
    {
        newInfo = particleInfo;
        aliveTime = age + 1.0;
    }

    void rebirth()
    {
        newInfo = particleInfo;
        aliveTime = 0.0;
    }

    void main()
    {
        vec2 resolution = vec2(textureSize(mask[1], 0));
        
        if (age < fullLife - segmentNum)
        {
            simulation(resolution);
        }
        else if (age == fullLife)
        {
            die(resolution);
        }
        else if (abs(fullLife - age) <= segmentNum)
        {
            freeze();
        }
        else
        {
            rebirth();
        }
    }
    `
    );
    this._shaderScriptMap.set(
      FlowEnum.UPDATE_FRAGMENT,
      `#version 300 es
    precision highp float;

    void main() 
    {
    }
    `
    );
    this._shaderScriptMap.set(
      FlowEnum.TRAJECTORY_VERTEX,
      `#version 300 es
    precision highp float;

    layout (location = 0) in float isAlive;

    layout (std140) uniform FlowFieldUniforms
    {
        float progress;
        float segmentNum;
        float fullLife;
        float dropRate;
        float dropRateBump;
        float speedFactor;
        float colorScheme;
        vec4 flowBoundary;
    };

    uniform sampler2D particlePool;
    uniform sampler2D projectionTexture;
    uniform int blockNum;
    uniform int beginBlock;
    uniform int blockSize;
    uniform float fillWidth;
    uniform float aaWidth;
    uniform vec2 viewport;
    uniform mat4 u_matrix;

    out struct Stream_line_setting 
    {
        float edgeParam;
        float alphaDegree;
        float velocity; // a percentage
        float isDiscarded;
    } sls;


    vec4 ReCoordinate(vec2 pos) {

        vec3 geoPos;
        geoPos = texture(projectionTexture, pos).xyz;
        vec4 res = u_matrix * vec4(geoPos, 1.0);
        return res;
    }

    // vec4 ReCoordinate(vec2 pos) {
    //     vec4 res = vec4(pos.xy * 2.0 - 1.0, 0.0, 1.0);
    //     return res;
    // }

    ivec2 get_uv(int vertexIndex)
    {
        // calculate the blockIndex of the current vertx
        int blockIndex = (beginBlock - vertexIndex + blockNum) % blockNum;

        // calculate original uv of the block
        int textureWidth = textureSize(particlePool, 0).x;
        int columnNum = textureWidth / blockSize;
        ivec2 blockUV = ivec2(blockIndex % columnNum, blockIndex / columnNum) * blockSize;

        // calculate uv of the current vertex
        ivec2 vertexUV = blockUV + ivec2(gl_InstanceID % blockSize, gl_InstanceID / blockSize);

        return vertexUV;
    }

    vec4 transfer_to_clip_space(vec2 pos)
    {
        return ReCoordinate(pos);
    }

    vec4 get_clip_position(ivec2 uv)
    {
        return transfer_to_clip_space(texelFetch(particlePool, uv, 0).rg);
    }

    vec2 get_vector(vec2 beginVertex, vec2 endVertex)
    {
        return normalize(endVertex - beginVertex);
    }

    void main()
    {
        // get screen positions from particle pool
        float parity = float(gl_VertexID % 2);
        int currentVertex = gl_VertexID / 2;
        int nextVertex = currentVertex + 1;
        ivec2 c_uv = get_uv(currentVertex);
        ivec2 n_uv = get_uv(nextVertex);
        vec4 cv_pos_CS = get_clip_position(c_uv);
        vec4 nv_pos_CS = get_clip_position(n_uv);
        vec2 cv_pos_SS = cv_pos_CS.xy / cv_pos_CS.w;
        vec2 nv_pos_SS = nv_pos_CS.xy / nv_pos_CS.w;

        // calculate the screen offset
        float speedRate = texelFetch(particlePool, c_uv, 0).b;
        float lineWidth = (fillWidth + aaWidth * 2.0);// * mix(2.0, 1.0, clamp(pow(speedRate * 10.0, 3.0), 0.0, 1.0));
        vec2 cn_vector = get_vector(cv_pos_SS, nv_pos_SS);
        float screenOffset = lineWidth / 2.0;

        // translate current vertex position
        vec3 view = vec3(0.0, 0.0, 1.0);
        vec2 v_offset = normalize(cross(view, vec3(cn_vector, 0.0))).xy * mix(1.0, -1.0, parity);  //等价于以下
        // vec2 v_offset = normalize(vec2(-cn_vector.y, cn_vector.x)).xy * mix(1.0, -1.0, parity);
        
        vec2 vertexPos_SS = cv_pos_SS + v_offset * screenOffset / viewport;

        //////////////
        // calculate vertex position in screen coordinates
        vec2 vertexPos_CS = vertexPos_SS * cv_pos_CS.w;
        gl_Position = vec4(vertexPos_CS, 0.0, cv_pos_CS.w);

        // prepare for anti-aliasing
        sls.edgeParam = 2.0 * parity - 1.0;

        float segmentRate = float(currentVertex) / segmentNum;
        sls.alphaDegree = 1.0 - segmentRate;

        sls.velocity = speedRate;
        sls.isDiscarded = isAlive;
    }
    `
    );
    this._shaderScriptMap.set(
      FlowEnum.TRAJECTORY_FRAGMENT,
      `#version 300 es
    precision highp float;

    in struct Stream_line_setting 
    {
        float edgeParam;
        float alphaDegree;
        float velocity; // a percentage
        float isDiscarded;
    } sls;

    layout (std140) uniform FlowFieldUniforms
    {
        float progress;
        float segmentNum;
        float fullLife;
        float dropRate;
        float dropRateBump;
        float speedFactor;
        float colorScheme;
        vec4 flowBoundary;
    };
    uniform float fillWidth;
    uniform float aaWidth;

    out vec4 fragColor;

    int rampColors0[8] = int[](
        0x3288bd,
        0x66c2a5,
        0xabdda4,
        0xe6f598,
        0xfee08b,
        0xfdae61,
        0xf46d43,
        0xd53e4f
    );

    int rampColors1[8] = int[](
        0x8c510a,
        0xbf812d,
        0xdfc27d,
        0xf6e8c3,
        0xc7eae5,
        0x80cdc1,
        0x35978f,
        0x01665e
    );
    int rampColors2[8] = int[](
        0x8dd3c7,
        0xffffb3,
        0xbebada,
        0xfb8072,
        0x80b1d3,
        0xfdb462,
        0xb3de69,
        0xfccde5
    );

    int[8] rampColors()
    {
        if (colorScheme == 0.0)
            return rampColors0;
        if (colorScheme == 1.0)
            return rampColors1;
        if (colorScheme == 2.0)
            return rampColors2;
    } 

    vec3 colorFromInt(int color)
    {
        float b = float(color & 0xFF) / 255.0;
        float g = float((color >> 8) & 0xFF) / 255.0;
        float r = float((color >> 16) & 0xFF) / 255.0;

        return vec3(r, g, b);
    }

    vec3 velocityColor(float speed)
    {
        float bottomIndex = floor(speed * 10.0);
        float topIndex = mix(bottomIndex + 1.0, 7.0, step(6.0, bottomIndex));
        float interval = mix(1.0, 4.0, step(6.0, bottomIndex));

        vec3 slowColor = colorFromInt(rampColors()[int(bottomIndex)]);
        vec3 fastColor = colorFromInt(rampColors()[int(topIndex)]);

        return mix(slowColor, fastColor, (speed * 10.0 - float(bottomIndex)) / interval);
    }

    float getAlpha(float param)
    {
        if (aaWidth == 0.0) return 1.0;
        // float alpha = 1.0 - sin(clamp((param * (0.5 * fillWidth + aaWidth) - 0.5 * fillWidth) / aaWidth, 0.0, 1.0) * 2.0 / 3.141592653);
        float alpha = 1.0 - sin(clamp((param * (0.5 * fillWidth + aaWidth) - 0.5 * fillWidth) / aaWidth, 0.0, 1.0) * 3.141592653 / 2.0);
        // float alpha = 1.0 - sin(param * 3.141592653 / 2.0);
        return alpha;
    }

    void main() 
    {
        if (sls.isDiscarded >= fullLife) discard; 
        float alpha = getAlpha(abs(0.0));

        // vec3 color = mix(colorFromInt(rampColors[int(sls.velocity * 7.0)]), colorFromInt(rampColors[int(sls.velocity * 7.0 + 0.5)]), fract(sls.velocity * 7.0));
        vec3 color = velocityColor(sls.velocity);
        // color = mix(vec3(0.7), color, alpha);
        // fragColor = vec4(1.0, 0.0, 0.0, 1.0);
        fragColor = vec4(color, 1.0) * alpha * sls.alphaDegree;
        // fragColor = vec4(1.0) * alpha;
    }
    `
    );
    this._segmentNumber = option.parameter.segmentNumber;
    this._speedFactor = option.parameter.speedFactor;
    this._tracksNumber = option.parameter.tracksNumber;
    this._fillWidth = option.parameter.fillWidth;
    this._aaWidth = option.parameter.aaWidth;
    this._color = option.parameter.color;
    this._primitive = option.parameter.primitive;
    this._fixedDropRate = option.parameter.fixedDropRate;
    this._extraDropRate = option.parameter.extraDropRate;
  }

  async prepareAsyncImage() {
    const promiseArr = [];
    for (let i = 0; i < 2; i++) {
      promiseArr.push(this.getImage(FlowEnum.FLOW_FIELD_IMAGE + i, this.option.flowFields[i], "flipY"));
      promiseArr.push(this.getImage(FlowEnum.SEEDING_IMAGE + i, this.option.seeding[i], "flipY"));
    }
    promiseArr.push(this.getImage(FlowEnum.PROJECTION_MAPBOX_IMAGE, this.option.projection, "flipY"));
    await Promise.all(promiseArr);
  }

  getImage(key, address, flip) {
    return new Promise((resolve, reject) => {
      axios.get(address, { responseType: "blob" }).then((res) => {
        createImageBitmap(res.data, { imageOrientation: flip, premultiplyAlpha: "none", colorSpaceConversion: "default" }).then((imageBitmap) => {
          this._imageMap.set(key, imageBitmap);
          resolve(null);
        });
      });
    });
  }

  prepareResource(gl) {
    this._gl = gl;
    // 绑定shader
    this._updateProgram = new GlProgram(gl);
    this._trajectoryProgram = new GlProgram(gl);

    this._updateProgram.setShader(gl, this._shaderScriptMap.get(FlowEnum.UPDATE_VERTEX), this._shaderScriptMap.get(FlowEnum.UPDATE_FRAGMENT), ["newInfo", "aliveTime"]);

    this._trajectoryProgram.setShader(gl, this._shaderScriptMap.get(FlowEnum.TRAJECTORY_VERTEX), this._shaderScriptMap.get(FlowEnum.TRAJECTORY_FRAGMENT));

    const maxBlockSize = Math.ceil(Math.sqrt(this.option.constraints.maxTrajectoryNum)); //1024

    this._uboMapBuffer[8] = this.option.flowBoundary.uMin;
    this._uboMapBuffer[9] = this.option.flowBoundary.vMin;
    this._uboMapBuffer[10] = this.option.flowBoundary.uMax;
    this._uboMapBuffer[11] = this.option.flowBoundary.vMax;

    // 设置sampler
    this._samplerMap.set(FlowEnum.L_SAMPLER, addSampler(gl, gl.LINEAR, gl.LINEAR, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE));
    this._samplerMap.set(FlowEnum.N_SAMPLER, addSampler(gl, gl.NEAREST, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE));

    // 设置simulationVAO buffer
    this._simulationVAO = gl.createVertexArray();
    gl.bindVertexArray(this._simulationVAO);
    const particleMapBuffer = new Float32Array(maxBlockSize * maxBlockSize * 3).fill(0);
    for (let i = 0; i < maxBlockSize * maxBlockSize; i++) {
      particleMapBuffer[i * 3 + 0] = rand(0, 1.0);
      particleMapBuffer[i * 3 + 1] = rand(0, 1.0);
      particleMapBuffer[i * 3 + 2] = 0.0;
    }
    this._simulationBuffer = makeBufferBySource(gl, gl.ARRAY_BUFFER, particleMapBuffer, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._simulationBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(0);
    const particleCountdownArray = new Float32Array(this.option.constraints.maxTrajectoryNum).fill(this.option.constraints.maxSegmentNum * 9.0);
    const lifeBuffer = makeBufferBySource(gl, gl.ARRAY_BUFFER, particleCountdownArray, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, lifeBuffer);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 1 * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // 设置simulationVAO2 buffer
    this._simulationVAO2 = gl.createVertexArray();
    gl.bindVertexArray(this._simulationVAO2);
    this._xfSimulationBuffer = makeBufferBySource(gl, gl.ARRAY_BUFFER, particleMapBuffer, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._xfSimulationBuffer);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 3 * 4, 0);
    gl.enableVertexAttribArray(0);
    const xfLifeBuffer = makeBufferBySource(gl, gl.ARRAY_BUFFER, particleCountdownArray, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, xfLifeBuffer);
    gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 1 * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // 设置renderVAO buffer
    this._renderVAO = gl.createVertexArray();
    gl.bindVertexArray(this._renderVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, lifeBuffer);
    gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 1 * 4, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // 设置renderVA02 buffer
    this._renderVAO2 = gl.createVertexArray();
    gl.bindVertexArray(this._renderVAO2);
    gl.bindBuffer(gl.ARRAY_BUFFER, xfLifeBuffer);
    gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 1 * 4, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.enableVertexAttribArray(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    // 设置XFBO buffer
    this._XFBO = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this._XFBO);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, this._xfSimulationBuffer);
    gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._xfSimulationBuffer, 0, maxBlockSize * maxBlockSize * 12);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, xfLifeBuffer);
    gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 1, xfLifeBuffer, 0, maxBlockSize * maxBlockSize * 4);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    // 设置XFBO2 buffer
    this._XFBO2 = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this._XFBO2);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, this._simulationBuffer);
    gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this._simulationBuffer, 0, maxBlockSize * maxBlockSize * 12);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, lifeBuffer);
    gl.bindBufferRange(gl.TRANSFORM_FEEDBACK_BUFFER, 1, lifeBuffer, 0, maxBlockSize * maxBlockSize * 4);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    this._UBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this._UBO);
    gl.bufferData(gl.ARRAY_BUFFER, 48, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // 设置纹理
    for (let i = 0; i < 2; i++) {
      const flowFieldTexture = createTexture(gl, gl.LINEAR, this._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + i));
      this._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + i, flowFieldTexture);

      const seedingTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGBA8, 0, 0);
      fillTexture(
        gl,
        this._imageMap.get(FlowEnum.SEEDING_IMAGE + i),
        "Integer",
        0,
        this.option.textureSize.seeding[0],
        this.option.textureSize.seeding[1],
        gl.TEXTURE_2D,
        seedingTexture,
        WebGL2RenderingContext.RGBA8,
        1,
        WebGL2RenderingContext.RGBA,
        WebGL2RenderingContext.UNSIGNED_BYTE
      );
      this._textureMap.set(FlowEnum.SEEDING_TEXTURE + i, seedingTexture);
    }
    const projectionTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RG32F, 0, 0);
    fillTexture(
      gl,
      this._imageMap.get(FlowEnum.PROJECTION_MAPBOX_IMAGE),
      "Float_Point",
      0,
      this.option.textureSize.projection[0],
      this.option.textureSize.projection[1],
      gl.TEXTURE_2D,
      projectionTexture,
      WebGL2RenderingContext.RG32F,
      1,
      WebGL2RenderingContext.RG,
      WebGL2RenderingContext.FLOAT
    );
    this._textureMap.set(FlowEnum.PROJECTION_MAPBOX_TEXTURE, projectionTexture);

    const maxBlockColumn = Math.floor(this.option.constraints.maxTextureSize / maxBlockSize);
    for (let i = 0; i < this.option.constraints.maxSegmentNum; i++) {
      const offset = {
        offsetX: (i % maxBlockColumn) * maxBlockSize,
        offsetY: Math.floor(i / maxBlockColumn) * maxBlockSize,
      };
      this._textureOffsetArray.push(offset);
    }
    particleMapBuffer.fill(0);
    const poolTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGB32F, this.option.constraints.maxTextureSize, this.option.constraints.maxTextureSize);
    this._textureMap.set(FlowEnum.POOL_TEXTURE, poolTexture);
  }

  tickLogicCount(gl) {
    this._beginBlock = (this._beginBlock + 1) % this.option.constraints.maxSegmentNum;
    this.swap();

    this._uboMapBuffer[0] = this.count / this.frequency;
    this._uboMapBuffer[1] = this._segmentNumber;
    this._uboMapBuffer[2] = this.option.constraints.maxSegmentNum * 10;
    this._uboMapBuffer[3] = this._fixedDropRate;
    this._uboMapBuffer[4] = this._extraDropRate;
    this._uboMapBuffer[5] = this._speedFactor * 0.01 * 100;
    this._uboMapBuffer[6] = this._color;

    if (this.count === this.frequency && this.flag) {
      this.flag = false;
      this.imagePre = this.imageNext;
      this.imageNext = (this.imageNext + 1) % this.option.flowFields.length;
      const that = this;
      const promiseArr = [];
      this._imageMap.set(FlowEnum.FLOW_FIELD_IMAGE + "0", this._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + "1"));
      this._imageMap.set(FlowEnum.SEEDING_IMAGE + "0", this._imageMap.get(FlowEnum.SEEDING_IMAGE + "1"));
      promiseArr.push(this.getImage(FlowEnum.FLOW_FIELD_IMAGE + "1", this.option.flowFields[this.imageNext], "flipY"));
      promiseArr.push(this.getImage(FlowEnum.SEEDING_IMAGE + "1", this.option.seeding[this.imageNext], "flipY"));
      Promise.all(promiseArr).then((res) => {
        that.flag = true;
        that.count = 0;
        that._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + "0", that._textureMap.get(FlowEnum.FLOW_FIELD_TEXTURE + "1"));
        that._textureMap.set(FlowEnum.SEEDING_TEXTURE + "0", that._textureMap.get(FlowEnum.SEEDING_TEXTURE + "1"));
        const flowFieldTexture = createTexture(gl, gl.LINEAR, that._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + "1"));

        that._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + "1", flowFieldTexture);

        const seedingTexture = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGBA8, 0, 0);
        fillTexture(
          gl,
          that._imageMap.get(FlowEnum.SEEDING_IMAGE + "1"),
          "Integer",
          0,
          that.option.textureSize.seeding[0],
          that.option.textureSize.seeding[1],
          gl.TEXTURE_2D,
          seedingTexture,
          WebGL2RenderingContext.RGBA8,
          1,
          WebGL2RenderingContext.RGBA,
          WebGL2RenderingContext.UNSIGNED_BYTE
        );
        that._textureMap.set(FlowEnum.SEEDING_TEXTURE + "1", seedingTexture);
      });
    }
  }

  swap() {
    if (this._beginBlock % 2 == 0) {
      this._sVAO = this._simulationVAO;
      this._rVAO = this._renderVAO;
      this._xfBO = this._XFBO;
      this._unPackBuffer = this._simulationBuffer;
    } else {
      this._sVAO = this._simulationVAO2;
      this._rVAO = this._renderVAO2;
      this._xfBO = this._XFBO2;
      this._unPackBuffer = this._xfSimulationBuffer;
    }
  }

  bindUBO(gl, bindingPointIndex) {
    gl.bindBuffer(gl.UNIFORM_BUFFER, this._UBO);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this._uboMapBuffer);
    gl.bindBufferRange(gl.UNIFORM_BUFFER, bindingPointIndex, this._UBO, 0, this._uboMapBuffer.length * 4.0);
  }

  tickRender(gl, matrix) {
    const maxBlockSize = Math.ceil(Math.sqrt(this.option.constraints.maxTrajectoryNum));

    this.bindUBO(gl, 0);
    // Pass 1: Simulation
    gl.bindVertexArray(this._sVAO);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this._xfBO);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.FLOW_FIELD_TEXTURE + 0));
    gl.bindSampler(0, this._samplerMap.get(FlowEnum.L_SAMPLER));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.FLOW_FIELD_TEXTURE + 1));
    gl.bindSampler(1, this._samplerMap.get(FlowEnum.L_SAMPLER));
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.SEEDING_TEXTURE + 0));
    gl.bindSampler(2, this._samplerMap.get(FlowEnum.N_SAMPLER));
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.SEEDING_TEXTURE + 1));
    gl.bindSampler(3, this._samplerMap.get(FlowEnum.N_SAMPLER));

    this._updateProgram.useProgram(gl);
    this._updateProgram.setVec1i(gl, "flowField", [0, 1]);
    this._updateProgram.setVec1i(gl, "mask", [2, 3]);
    this._updateProgram.setFloat(gl, "randomSeed", Math.random());
    this._updateProgram.setUniformBlock(gl, "FlowFieldUniforms", 0);
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.beginTransformFeedback(gl.POINTS);

    gl.drawArrays(gl.POINTS, 0, this._tracksNumber);
    gl.endTransformFeedback();
    gl.disable(gl.RASTERIZER_DISCARD);
    gl.bindVertexArray(null);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

    // Pass 2: Update particle pool

    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, this._unPackBuffer);
    const array = new Float32Array(maxBlockSize * maxBlockSize * 3);
    gl.getBufferSubData(gl.PIXEL_UNPACK_BUFFER, 0, array);

    updateTextureByBuffer(
      gl,
      0,
      maxBlockSize,
      maxBlockSize,
      gl.TEXTURE_2D,
      this._textureMap.get(FlowEnum.POOL_TEXTURE),
      this._textureOffsetArray[this._beginBlock].offsetX,
      this._textureOffsetArray[this._beginBlock].offsetY,
      WebGL2RenderingContext.RGB,
      WebGL2RenderingContext.FLOAT
    );
    gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER, null);
    if (this._segmentPrepare > 0) {
      this._segmentPrepare--;
      return;
    }
    if (this.flag) this.count++;
    // gl.finish();

    // Pass 3: Rendering by trajectorires or points
    gl.bindVertexArray(this._rVAO);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.POOL_TEXTURE));
    gl.bindSampler(0, this._samplerMap.get(FlowEnum.N_SAMPLER));
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this._textureMap.get(FlowEnum.PROJECTION_MAPBOX_TEXTURE));
    gl.bindSampler(1, this._samplerMap.get(FlowEnum.L_SAMPLER));
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendColor(0.0, 0.0, 0.0, 0.0);

    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    this._trajectoryProgram.useProgram(gl);
    this._trajectoryProgram.setInt(gl, "particlePool", 0);
    this._trajectoryProgram.setInt(gl, "projectionTexture", 1);
    this._trajectoryProgram.setInt(gl, "blockNum", this.option.constraints.maxSegmentNum);
    this._trajectoryProgram.setInt(gl, "beginBlock", this._beginBlock);
    this._trajectoryProgram.setInt(gl, "blockSize", maxBlockSize);
    this._trajectoryProgram.setFloat(gl, "currentSegmentNum", 8.0);
    this._trajectoryProgram.setFloat(gl, "fillWidth", this._fillWidth);
    this._trajectoryProgram.setFloat(gl, "aaWidth", this._aaWidth);
    this._trajectoryProgram.setFloat2(gl, "viewport", gl.canvas.width, gl.canvas.height);
    this._trajectoryProgram.setMat4(gl, "u_matrix", matrix);
    this._trajectoryProgram.setUniformBlock(gl, "FlowFieldUniforms", 0);
    // gl.clearColor(0, 0, 0, 1);
    // gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, (this._segmentNumber - 1) * 2, this._tracksNumber);

    gl.disable(gl.BLEND);

    gl.bindVertexArray(null);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  async generateCustomLayer(id) {
    const that = this;
    let mapObj;
    await this.prepareAsyncImage();
    let a = 0;
    let flag = true
    const result = {
      id: id,
      type: "custom",
      onAdd(map, gl) {
        const available_extensions = gl.getSupportedExtensions();
        for (const extension of available_extensions) {
          gl.getExtension(extension);
        }
        mapObj = map;
        that.prepareResource.call(that, gl);
      },
      render(gl, matrix) {
        if (flag) {
          console.time()
          flag = false
        }
        if (a === 1000) {
          console.timeEnd();
        } else {
          a++;
        }
        that.tickLogicCount(gl);
        that.tickRender(gl, matrix);
        mapObj.triggerRepaint();
      },
    };
    return result;
  }

  changeState(value) {
    if (!this._gl || value >= this.option.flowFields.length * this.frequency) return;
    const gl = this._gl;
    this.flag = false;
    const index = Math.floor(value / this.frequency);
    this.imagePre = index;
    this.imageNext = (index + 1) % this.option.flowFields.length;
    const promiseArr = [];
    promiseArr.push(this.getImage(FlowEnum.FLOW_FIELD_IMAGE + "0", this.option.flowFields[this.imagePre], "flipY"));
    promiseArr.push(this.getImage(FlowEnum.SEEDING_IMAGE + "0", this.option.seeding[this.imagePre], "flipY"));
    promiseArr.push(this.getImage(FlowEnum.FLOW_FIELD_IMAGE + "1", this.option.flowFields[this.imageNext], "flipY"));
    promiseArr.push(this.getImage(FlowEnum.SEEDING_IMAGE + "1", this.option.seeding[this.imageNext], "flipY"));
    Promise.all(promiseArr).then((res) => {
      this.flag = true;
      this.count = value % this.frequency;
      const flowFieldTexture0 = createTexture(gl, gl.LINEAR, this._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + "0"));
      this._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + "0", flowFieldTexture0);
      const flowFieldTexture1 = createTexture(gl, gl.LINEAR, this._imageMap.get(FlowEnum.FLOW_FIELD_IMAGE + "1"));

      this._textureMap.set(FlowEnum.FLOW_FIELD_TEXTURE + "1", flowFieldTexture1);

      const seedingTexture0 = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGBA8, 0, 0);
      fillTexture(
        gl,
        this._imageMap.get(FlowEnum.SEEDING_IMAGE + "0"),
        "Integer",
        0,
        this.option.textureSize.seeding[0],
        this.option.textureSize.seeding[1],
        gl.TEXTURE_2D,
        seedingTexture0,
        WebGL2RenderingContext.RGBA8,
        1,
        WebGL2RenderingContext.RGBA,
        WebGL2RenderingContext.UNSIGNED_BYTE
      );
      this._textureMap.set(FlowEnum.SEEDING_TEXTURE + "0", seedingTexture0);
      const seedingTexture1 = createMyTexture(gl, 1, gl.TEXTURE_2D, WebGL2RenderingContext.RGBA8, 0, 0);
      fillTexture(
        gl,
        this._imageMap.get(FlowEnum.SEEDING_IMAGE + "1"),
        "Integer",
        0,
        this.option.textureSize.seeding[0],
        this.option.textureSize.seeding[1],
        gl.TEXTURE_2D,
        seedingTexture1,
        WebGL2RenderingContext.RGBA8,
        1,
        WebGL2RenderingContext.RGBA,
        WebGL2RenderingContext.UNSIGNED_BYTE
      );
      this._textureMap.set(FlowEnum.SEEDING_TEXTURE + "1", seedingTexture1);
    });
  }
}

const addSampler = (gl, magFilter, minFilter, addressModeU, addressModeV, addressModeW) => {
  const sampler = gl.createSampler();
  gl.samplerParameteri(sampler, gl.TEXTURE_MAG_FILTER, magFilter);
  gl.samplerParameteri(sampler, gl.TEXTURE_MIN_FILTER, minFilter);
  gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_S, addressModeU);
  gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_T, addressModeV);
  if (addressModeW) {
    gl.samplerParameteri(sampler, gl.TEXTURE_WRAP_R, addressModeW);
  }
  return sampler;
};

const createMyTexture = (gl, mipLevels, target, internalFormat, width, height) => {
  const texture = gl.createTexture();
  if (width !== 0 && height !== 0) {
    gl.bindTexture(target, texture);
    gl.texStorage2D(target, mipLevels, internalFormat, width, height);
    gl.bindTexture(target, null);
  }
  return texture;
};

const makeBufferBySource = (gl, target, source, usage) => {
  const VBO = gl.createBuffer();
  gl.bindBuffer(target, VBO);
  gl.bufferData(target, source, usage);
  return VBO;
};

const fillTexture = (gl, image, dataType, level, width, height, target, texture, internalFormat, mipLevels, format, type) => {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.bindTexture(target, texture);
  gl.texStorage2D(target, mipLevels, internalFormat, width, height);
  gl.bindTexture(target, null);
  if (dataType === "Float_Point") {
    const pixelData = new Uint8Array(image.width * image.height * 4);
    const frameTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, frameTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const FBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, FBO);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, frameTexture, 0);

    gl.readPixels(0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, pixelData);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.bindTexture(target, texture);
    gl.texSubImage2D(target, level, 0, 0, width, height, format, type, new Float32Array(pixelData.buffer));
    if (mipLevels > 1) {
      gl.generateMipmap(target);
    }
    gl.bindTexture(target, null);
  } else if (dataType === "Integer") {
    gl.bindTexture(target, texture);
    gl.texSubImage2D(target, level, 0, 0, width, height, format, type, image);
    if (mipLevels > 1) {
      gl.generateMipmap(target);
    }
    gl.bindTexture(target, null);
  }
};

const createTexture = (gl, filter, data, width, height) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  if (data instanceof Uint8Array) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
};

const updateTextureByBuffer = (gl, level, width, height, target, texture, xoffset, yoffset, format, type) => {
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.bindTexture(target, texture);
  gl.texSubImage2D(target, level, xoffset, yoffset, width, height, format, type, 0);
  gl.bindTexture(target, null);
};

const FlowEnum = {
  UPDATE_VERTEX: "update_vertex",
  UPDATE_FRAGMENT: "update_fragment",
  TRAJECTORY_VERTEX: "trajectory_vertex",
  TRAJECTORY_FRAGMENT: "trajectory_fragment",
  POINT_VERTEX: "point_vertex",
  POINT_FRAGMENT: "point_fragment",
  POOL_VERTEX: "pool_vertex",
  POOL_FRAGMENT: "pool_fragment",
  L_SAMPLER: "l_sampler",
  N_SAMPLER: "n_sampler",
  FLOW_FIELD_IMAGE: "flow_field_image",
  SEEDING_IMAGE: "seeding_image",
  PROJECTION_MAPBOX_IMAGE: "projection_mapbox_image",
  PROJECTION_CESIUM_IMAGE: "projection_cesium_image",
  PROJECTION_OL_IMAGE: "projection_ol_image",
  FLOW_FIELD_TEXTURE: "flow_field_texture",
  SEEDING_TEXTURE: "seeding_texture",
  PROJECTION_MAPBOX_TEXTURE: "projection_mapbox_texture",
  PROJECTION_CESIUM_TEXTURE: "projection_cesium_texture",
  PROJECTION_OL_TEXTURE: "projection_ol_texture",
  POOL_TEXTURE: "pool_texture",
};

class GlProgram {
  constructor(gl) {
    this.program = gl.createProgram();
  }

  setShader(gl, vertexScript, fragmentScript, outVaryings) {
    if (this.program) {
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(vertexShader, vertexScript);
      gl.shaderSource(fragmentShader, fragmentScript);
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        //如果失败，则提示：
        console.log(gl.getShaderInfoLog(vertexShader));
        console.error("shader compiler error:\n" + gl.getShaderInfoLog(vertexShader));
      }

      gl.attachShader(this.program, vertexShader);
      gl.attachShader(this.program, fragmentShader);
      if (outVaryings) {
        gl.transformFeedbackVaryings(this.program, outVaryings, gl.SEPARATE_ATTRIBS);
      }
      gl.linkProgram(this.program);
    }
  }

  useProgram(gl) {
    gl.useProgram(this.program);
  }

  setFloat(gl, name, value) {
    const location = gl.getUniformLocation(this.program, name);
    gl.uniform1f(location, value);
  }

  setInt(gl, name, value) {
    const location = gl.getUniformLocation(this.program, name);
    gl.uniform1i(location, value);
  }

  setVec1i(gl, name, vector) {
    const location = gl.getUniformLocation(this.program, name);
    gl.uniform1iv(location, vector);
  }

  setFloat2(gl, name, value1, value2) {
    const uniformLocation = gl.getUniformLocation(this.program, name);
    gl.uniform2f(uniformLocation, value1, value2);
  }

  setFloat3(gl, name, value1, value2, value3) {
    const uniformLocation = gl.getUniformLocation(this.program, name);
    gl.uniform3f(uniformLocation, value1, value2, value3);
  }

  setFloat4(gl, name, value1, value2, value3, value4) {
    const uniformLocation = gl.getUniformLocation(this.program, name);
    gl.uniform4f(uniformLocation, value1, value2, value3, value4);
  }

  setVec4(gl, name, vector) {
    const uniformLocation = gl.getUniformLocation(this.program, name);
    gl.uniform4fv(uniformLocation, vector);
  }

  setMat4(gl, name, matrix) {
    const uniformLocation = gl.getUniformLocation(this.program, name);
    gl.uniformMatrix4fv(uniformLocation, false, matrix);
  }

  setUniformBlock(gl, name, blockIndex) {
    const uniformLocation = gl.getUniformBlockIndex(this.program, name);
    gl.uniformBlockBinding(this.program, uniformLocation, blockIndex);
  }
}

const rand = (min, max) => {
  if (!max) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
};
