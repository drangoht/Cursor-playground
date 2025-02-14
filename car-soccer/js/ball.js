class Ball {
    constructor(scene) {
        this.velocity = new THREE.Vector3();
        
        // Create ball
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 1, 0);
        this.mesh.castShadow = true;
        scene.add(this.mesh);
    }

    update() {
        // Apply physics
        this.velocity.multiplyScalar(0.98); // Air resistance
        this.velocity.y -= 0.01; // Gravity
        this.mesh.position.add(this.velocity);

        // Ground collision
        if (this.mesh.position.y < 1) {
            this.mesh.position.y = 1;
            this.velocity.y = Math.abs(this.velocity.y) * 0.5;
        }

        // Arena bounds
        const bounds = 30;
        if (Math.abs(this.mesh.position.x) > bounds) {
            this.mesh.position.x = Math.sign(this.mesh.position.x) * bounds;
            this.velocity.x *= -0.5;
        }
        if (Math.abs(this.mesh.position.z) > bounds) {
            this.mesh.position.z = Math.sign(this.mesh.position.z) * bounds;
            this.velocity.z *= -0.5;
        }
    }
} 