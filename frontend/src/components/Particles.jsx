import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles() {
    const points = useRef();

    const count = 700;

    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
        positions[i] =
            (Math.random() - 0.5) * 12;
    }

    useFrame(() => {
        if (!points.current) return;

        points.current.rotation.y += 0.0005;
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>

            <pointsMaterial
                size={0.025}
                color="#00d9ff"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

export default Particles;