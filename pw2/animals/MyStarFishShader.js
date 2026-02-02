
// MyStarFishShader.js
// Provides a procedural shader material for starfish, with perlin noise and color variation.
// All functions are documented for clarity and maintainability.

import * as THREE from 'three';

/**
 * Creates a custom ShaderMaterial for starfish, with procedural color and pattern.
 * @param {number} baseColor - The base color of the starfish (hex).
 * @param {number} seed - Seed for randomization of pattern and color.
 * @returns {THREE.ShaderMaterial} The configured shader material.
 */
function createStarShaderMaterial(baseColor = 0xff9966, seed = Math.random() * 1000) {
    return new THREE.ShaderMaterial({
        vertexShader: /* glsl */ `
            #include <common>
            #include <shadowmap_pars_vertex>
            
            varying vec2 vUv;
            varying vec3 vPos;

            void main() {
                vUv = uv;
                vPos = position;
                
                // Transform normal for shadow mapping
                vec3 transformedNormal = normalMatrix * normal;
                
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                
                #include <shadowmap_vertex>
            }
        `,
        fragmentShader: /* glsl */ `
            precision mediump float;
            
            #include <common>
            #include <packing>
            #include <shadowmap_pars_fragment>

            uniform vec3 uBaseColor;
            uniform float uSeed;
            uniform vec3 uEmissive;

            varying vec2 vUv;
            varying vec3 vPos;

            // Permutes a vector for pseudo-randomness
            vec3 permute(vec3 x) {
                return mod((x * 34.0) + 1.0, 289.0);
            }

            // Simple Perlin noise implementation for patterning
            float perlinNoise(vec3 P) {
                vec3 Pi0 = floor(P);
                vec3 Pi1 = Pi0 + 1.0;
                Pi0 = mod(Pi0, 289.0);
                Pi1 = mod(Pi1, 289.0);
                vec3 Pf0 = fract(P);
                vec3 Pf1 = Pf0 - 1.0;

                vec3 ix = vec3(Pi0.x, Pi1.x, Pi0.x);
                vec3 iy = vec3(Pi0.y, Pi0.y, Pi1.y);
                vec3 iz0 = vec3(Pi0.z);
                vec3 iz1 = vec3(Pi1.z);

                vec3 px = permute(permute(ix) + iy);
                vec3 p0 = permute(px + iz0);
                vec3 p1 = permute(px + iz1);

                vec3 g0 = p0 / 7.0 - 1.0;
                vec3 g1 = p1 / 7.0 - 1.0;

                vec3 norm0 = normalize(g0);
                vec3 norm1 = normalize(g1);

                vec3 fade_xyz = Pf0 * Pf0 * Pf0 * (Pf0 * (Pf0 * 6.0 - 15.0) + 10.0);

                float n0 = dot(norm0, Pf0);
                float n1 = dot(norm1, Pf1);

                return mix(n0, n1, fade_xyz.z);
            }

            // Generates a small random color offset for variety
            vec3 randomColorOffset(float seed) {
                float r = fract(sin(seed * 12.345) * 4567.0) * 0.2 - 0.1;
                float g = fract(sin(seed * 54.321) * 8765.0) * 0.2 - 0.1;
                float b = fract(sin(seed * 91.137) * 3456.0) * 0.2 - 0.1;
                return vec3(r, g, b);
            }

            void main() {
                float n1 = perlinNoise(vec3(vUv * 3.0, vPos.x));
                float n2 = perlinNoise(vec3(vPos * 0.5 + uSeed));

                float pattern = (n1 * 0.6 + n2 * 0.4) * 0.15;
                vec3 offset = randomColorOffset(uSeed) * 0.4;

                // Clamp base color to prevent overflow
                vec3 base = clamp(uBaseColor + offset + pattern, 0.0, 1.0);
                vec3 finalColor = base * (1.0 + clamp(uEmissive, 0.0, 0.3));

                // global brightness reduction
                finalColor *= 0.6;

                // Calculate shadows
                float shadowMask = 1.0;
                #ifdef USE_SHADOWMAP
                    #if NUM_DIR_LIGHT_SHADOWS > 0
                        shadowMask = texture2DCompare(directionalShadowMap[0], vDirectionalShadowCoord[0].xy, vDirectionalShadowCoord[0].z);
                    #endif
                #endif
                
                // Apply shadow to final color (mix between shadowed and lit)
                finalColor *= mix(0.3, 1.0, shadowMask);

                // soft gamma for nicer highlights
                finalColor = pow(clamp(finalColor, 0.0, 1.0), vec3(1.2));

                gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
            }
        `,
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            {
                uBaseColor: { value: new THREE.Color(baseColor) },
                uSeed: { value: seed },
                uEmissive: { value: new THREE.Color(0x222222) }
            }
        ]),
        lights: true,
        side: THREE.DoubleSide
    });
}

// Export the createStarShaderMaterial function for use in other modules.
export { createStarShaderMaterial };
