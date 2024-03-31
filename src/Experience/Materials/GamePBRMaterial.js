import * as THREE from 'three';

class ShaderManager {
    static shaderCode = {};
    static threejs = null;
};

export class GamePBRMaterial extends THREE.MeshStandardMaterial {

    #uniforms_ = {};
    #shader_ = null;

    constructor(shaderType, parameters) {
        super(parameters);

        this.#shader_ = null;
        this.#uniforms_ = {};

        ShaderManager.threejs.SetupMaterial(this);

        const previousCallback = this.onBeforeCompile;

        this.onBeforeCompile = (shader) => {
            shader.fragmentShader = ShaderManager.shaderCode[shaderType].fsh;
            shader.vertexShader = ShaderManager.shaderCode[shaderType].vsh;
            shader.uniforms.time = { value: 0.0 };
            shader.uniforms.playerPos = { value: new THREE.Vector3(0.0) };

            for (let k in this.#uniforms_) {
                shader.uniforms[k] = this.#uniforms_[k];
            }

            this.#shader_ = shader;

            previousCallback(shader);
        };

        this.onBeforeRender = () => {
            if (shaderType == 'BUGS') {
                let a = 0;
            }
            let a = 0;
        }

        this.customProgramCacheKey = () => {
            let uniformStr = '';
            for (let k in this.#uniforms_) {
                uniformStr += k + ':' + this.#uniforms_[k].value + ';';
            }
            return shaderType + uniformStr;
        }
    }

    setFloat(name, value) {
        this.#uniforms_[name] = { value: value };
        if (this.#shader_) {
            this.#shader_.uniforms[name] = this.#uniforms_[name];
        }
    }

    setVec2(name, value) {
        this.#uniforms_[name] = { value: value };
        if (this.#shader_) {
            this.#shader_.uniforms[name] = this.#uniforms_[name];
        }
    }

    setVec3(name, value) {
        this.#uniforms_[name] = { value: value };
        if (this.#shader_) {
            this.#shader_.uniforms[name] = this.#uniforms_[name];
        }
    }

    setVec4(name, value) {
        this.#uniforms_[name] = { value: value };
        if (this.#shader_) {
            this.#shader_.uniforms[name] = this.#uniforms_[name];
        }
    }

    setMatrix(name, value) {
        this.#uniforms_[name] = { value: value };
        if (this.#shader_) {
            this.#shader_.uniforms[name] = this.#uniforms_[name];
        }
    }

    setTexture(name, value) {
        this.#uniforms_[name] = { value: value };
        if (this.#shader_) {
            this.#shader_.uniforms[name] = this.#uniforms_[name];
        }
    }

    setTextureArray(name, value) {
        this.#uniforms_[name] = { value: value };
        if (this.#shader_) {
            this.#shader_.uniforms[name] = this.#uniforms_[name];
        }
    }
}
