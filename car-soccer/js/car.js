class Car {
    constructor(scene, config, position) {
        this.velocity = new THREE.Vector3();
        this.boosting = false;
        this.jumping = false;
        this.rotation = new THREE.Vector3();
        
        // Create car body
        this.createCarModel(scene, config);
        this.mesh.position.copy(position);
        
        // Camera setup
        this.cameraOffset = new THREE.Vector3(0, 5, 10);
        this.targetCameraOffset = new THREE.Vector3(0, 5, 10);
    }

    createCarModel(scene, config) {
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(2, 0.75, 4);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: config.color,
            metalness: 0.8,
            roughness: 0.2
        });
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.castShadow = true;

        // Roof
        const roofGeometry = new THREE.BoxGeometry(1.8, 0.5, 2);
        const roofMesh = new THREE.Mesh(roofGeometry, bodyMaterial);
        roofMesh.position.y = 0.5;
        roofMesh.position.z = -0.3;
        this.mesh.add(roofMesh);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        
        const wheelPositions = [
            { x: -1.1, z: -1.2 },
            { x: 1.1, z: -1.2 },
            { x: -1.1, z: 1.2 },
            { x: 1.1, z: 1.2 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, -0.3, pos.z);
            this.mesh.add(wheel);
        });

        // Windshield
        const windshieldGeometry = new THREE.PlaneGeometry(1.7, 1);
        const windshieldMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x88ccff,
            transparent: true,
            opacity: 0.5
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 0.4, -0.8);
        windshield.rotation.x = Math.PI / 4;
        this.mesh.add(windshield);

        scene.add(this.mesh);
    }

    update(controls, deltaTime, isCurrentPlayer) {
        // Movement based on car's forward direction
        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.mesh.quaternion);

        // ZQSD controls with further reduced speed
        if (controls.forward) { // Z key
            this.velocity.add(forward.multiplyScalar(0.03));
        }
        if (controls.backward) { // S key
            this.velocity.add(forward.multiplyScalar(-0.02));
        }
        if (controls.left) { // Q key
            this.mesh.rotation.y += 0.02;
        }
        if (controls.right) { // D key
            this.mesh.rotation.y -= 0.02;
        }

        // Mouse control with reduced sensitivity
        if (isCurrentPlayer && controls.mouseX !== undefined) {
            const steerAmount = controls.mouseX * 0.0003;
            this.mesh.rotation.y -= steerAmount;
        }

        // Boost with reduced speed
        if (controls.boost) {
            this.velocity.add(forward.multiplyScalar(0.04));
            if (isCurrentPlayer) {
                this.createBoostParticles();
            }
        }

        // Slower jump
        if (controls.jump && !this.jumping && this.mesh.position.y <= 0.5) {
            this.velocity.y = 0.3;
            this.jumping = true;
        }

        // Physics with more friction
        this.velocity.multiplyScalar(0.96); // More friction
        this.velocity.y -= 0.01; // Reduced gravity
        this.mesh.position.add(this.velocity);

        // Ground collision
        if (this.mesh.position.y < 0.5) {
            this.mesh.position.y = 0.5;
            this.velocity.y = 0;
            this.jumping = false;
        }

        // Arena bounds
        const bounds = 30;
        this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -bounds, bounds);
        this.mesh.position.z = THREE.MathUtils.clamp(this.mesh.position.z, -bounds, bounds);

        // Update car tilt based on movement
        this.mesh.rotation.z = -this.velocity.x * 0.1;
        this.mesh.rotation.x = this.velocity.z * 0.1;
    }

    createBoostParticles() {
        // Simple particle effect for boost
        const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.8
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Position behind the car
        const backward = new THREE.Vector3(0, 0, 1);
        backward.applyQuaternion(this.mesh.quaternion);
        particle.position.copy(this.mesh.position).add(backward.multiplyScalar(2));
        
        this.mesh.parent.add(particle);

        // Animate and remove particle
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 500) {
                this.mesh.parent.remove(particle);
                return;
            }
            
            particle.scale.multiplyScalar(0.95);
            particle.material.opacity *= 0.95;
            
            requestAnimationFrame(animate);
        };
        animate();
    }

    updateCamera(camera) {
        // Calculate desired camera position
        const idealOffset = new THREE.Vector3();
        idealOffset.copy(this.cameraOffset).applyQuaternion(this.mesh.quaternion);
        idealOffset.add(this.mesh.position);

        // Smoothly interpolate camera position
        camera.position.lerp(idealOffset, 0.1);
        
        // Look at car position slightly above
        const targetPosition = this.mesh.position.clone();
        targetPosition.y += 1;
        camera.lookAt(targetPosition);
    }
} 