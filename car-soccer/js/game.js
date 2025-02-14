class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Setup lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(0, 20, 10);
        light.castShadow = true;
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0x404040));

        // Setup camera
        this.camera.position.set(0, 30, 40);
        this.camera.lookAt(0, 0, 0);

        // Add score tracking
        this.score = {
            blue: 0,
            red: 0
        };

        // Create environment
        this.createEnvironment();
        this.createArena();
        this.createGoals();

        // Define car configurations
        this.carConfigs = {
            SPEEDSTER: {
                brand: "Veloce",
                color: 0xff0000,
                maxSpeed: 1.2,
                acceleration: 1.1,
                handling: 0.9
            },
            MUSCLE: {
                brand: "Torque",
                color: 0x0000ff,
                maxSpeed: 1.0,
                acceleration: 1.0,
                handling: 1.0
            }
        };

        // Modified controls state
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            boost: false,
            jump: false,
            mouseX: 0,
            mouseY: 0
        };

        // Create game objects with AI opponent
        this.ball = new Ball(this.scene);
        this.player = new Car(this.scene, this.carConfigs.SPEEDSTER, new THREE.Vector3(-10, 0.5, 0));
        this.aiCar = new Car(this.scene, this.carConfigs.MUSCLE, new THREE.Vector3(10, 0.5, 0));
        
        // Create AI controller
        this.aiController = new AIController(this.aiCar, this.ball);

        // Set current player
        this.currentPlayer = this.player;
        
        // Setup controls
        this.setupControls();
        
        // Start game loop
        this.animate();
    }

    createEnvironment() {
        // Skybox with better sky color
        const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyMaterial = new THREE.MeshBasicMaterial({
            color: 0x87CEEB,
            side: THREE.BackSide,
            fog: true
        });
        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);

        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);

        // Create volumetric clouds
        this.createVolumetricClouds();

        // Sun
        const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        sun.position.set(100, 100, -100);
        this.scene.add(sun);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);

        // Add directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1);
        sunLight.position.copy(sun.position);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);
    }

    createVolumetricClouds() {
        const cloudTexture = new THREE.TextureLoader().load('https://threejs.org/examples/textures/clouds.png');
        
        // Create cloud material with soft particles effect
        const cloudMaterial = new THREE.MeshStandardMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        // Create multiple cloud layers
        const createCloudLayer = (height, scale) => {
            const cloudGroup = new THREE.Group();
            const cloudCount = 15;

            for (let i = 0; i < cloudCount; i++) {
                // Create cloud plane
                const cloudGeometry = new THREE.PlaneGeometry(scale * 20, scale * 10);
                const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
                
                // Random position
                cloud.position.set(
                    Math.random() * 300 - 150,
                    height + Math.random() * 10,
                    Math.random() * 300 - 150
                );
                
                // Random rotation
                cloud.rotation.z = Math.random() * Math.PI * 2;
                cloud.rotation.y = Math.random() * Math.PI * 2;
                
                // Store initial position for animation
                cloud.userData.initialX = cloud.position.x;
                cloud.userData.speed = Math.random() * 0.05 + 0.02;
                
                cloudGroup.add(cloud);
            }
            
            return cloudGroup;
        };

        // Create multiple layers of clouds at different heights
        this.cloudLayers = [
            createCloudLayer(50, 1),
            createCloudLayer(70, 1.5),
            createCloudLayer(90, 2)
        ];

        this.cloudLayers.forEach(layer => this.scene.add(layer));
    }

    createArena() {
        // Ground with texture
        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
        grassTexture.wrapS = THREE.RepeatWrapping;
        grassTexture.wrapT = THREE.RepeatWrapping;
        grassTexture.repeat.set(8, 8);

        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(80, 80),
            new THREE.MeshStandardMaterial({ 
                map: grassTexture,
                roughness: 0.8,
                metalness: 0.2
            })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Field lines
        const fieldLines = new THREE.Group();
        
        // Center circle
        const centerCircle = new THREE.Mesh(
            new THREE.RingGeometry(8, 8.3, 32),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        centerCircle.rotation.x = -Math.PI / 2;
        centerCircle.position.y = 0.01;
        fieldLines.add(centerCircle);

        // Center line
        const centerLine = new THREE.Mesh(
            new THREE.PlaneGeometry(0.3, 80),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        centerLine.rotation.x = -Math.PI / 2;
        centerLine.position.y = 0.01;
        fieldLines.add(centerLine);

        this.scene.add(fieldLines);

        // Walls with transparent material
        const wallGeometry = new THREE.BoxGeometry(80, 10, 2);
        const wallMaterial = new THREE.MeshPhysicalMaterial({ 
            color: 0x88ccff,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.9
        });

        const wallNorth = new THREE.Mesh(wallGeometry, wallMaterial);
        wallNorth.position.z = -40;
        wallNorth.position.y = 5;
        this.scene.add(wallNorth);

        const wallSouth = new THREE.Mesh(wallGeometry, wallMaterial);
        wallSouth.position.z = 40;
        wallSouth.position.y = 5;
        this.scene.add(wallSouth);

        const wallEast = new THREE.Mesh(wallGeometry, wallMaterial);
        wallEast.rotation.y = Math.PI / 2;
        wallEast.position.x = 40;
        wallEast.position.y = 5;
        this.scene.add(wallEast);

        const wallWest = new THREE.Mesh(wallGeometry, wallMaterial);
        wallWest.rotation.y = Math.PI / 2;
        wallWest.position.x = -40;
        wallWest.position.y = 5;
        this.scene.add(wallWest);
    }

    createGoals() {
        // Create deeper goals
        const goalDepth = 5;
        
        // Goal structure geometry
        const goalGeometry = new THREE.BoxGeometry(20, 10, goalDepth);
        const sideWallGeometry = new THREE.BoxGeometry(goalDepth, 10, goalDepth);
        const roofGeometry = new THREE.BoxGeometry(20, goalDepth, goalDepth);
        
        // Materials
        const blueGoalMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x0000ff,
            transparent: true,
            opacity: 0.2
        });
        const redGoalMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            transparent: true,
            opacity: 0.2
        });

        // Create goal structures
        const createGoal = (position, material) => {
            const goalGroup = new THREE.Group();

            // Back wall
            const backWall = new THREE.Mesh(goalGeometry, material);
            backWall.position.z = position.z;
            goalGroup.add(backWall);

            // Side walls
            const leftWall = new THREE.Mesh(sideWallGeometry, material);
            leftWall.position.set(-10 + goalDepth/2, 0, position.z - goalDepth/2);
            goalGroup.add(leftWall);

            const rightWall = new THREE.Mesh(sideWallGeometry, material);
            rightWall.position.set(10 - goalDepth/2, 0, position.z - goalDepth/2);
            goalGroup.add(rightWall);

            // Roof
            const roof = new THREE.Mesh(roofGeometry, material);
            roof.position.set(0, 5, position.z - goalDepth/2);
            goalGroup.add(roof);

            goalGroup.position.y = 5;
            return goalGroup;
        };

        // Create both goals
        this.blueGoal = createGoal(new THREE.Vector3(0, 0, -40), blueGoalMaterial);
        this.redGoal = createGoal(new THREE.Vector3(0, 0, 40), redGoalMaterial);
        
        this.scene.add(this.blueGoal, this.redGoal);

        // Goal posts (white frames)
        const postGeometry = new THREE.CylinderGeometry(0.2, 0.2, 10);
        const postMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

        const createGoalFrame = (z) => {
            const frame = new THREE.Group();
            
            // Vertical posts
            const leftPost = new THREE.Mesh(postGeometry, postMaterial);
            leftPost.position.set(-10, 5, z);
            frame.add(leftPost);

            const rightPost = new THREE.Mesh(postGeometry, postMaterial);
            rightPost.position.set(10, 5, z);
            frame.add(rightPost);

            // Crossbar
            const crossbarGeometry = new THREE.CylinderGeometry(0.2, 0.2, 20);
            crossbarGeometry.rotateZ(Math.PI / 2);
            const crossbar = new THREE.Mesh(crossbarGeometry, postMaterial);
            crossbar.position.set(0, 10, z);
            frame.add(crossbar);

            return frame;
        };

        this.scene.add(createGoalFrame(-40), createGoalFrame(40));
    }

    setupControls() {
        // Keyboard controls (ZQSD)
        window.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'z': this.controls.forward = true; break;
                case 's': this.controls.backward = true; break;
                case 'q': this.controls.left = true; break;
                case 'd': this.controls.right = true; break;
                case 'shift': this.controls.boost = true; break;
                case ' ': this.controls.jump = true; break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.key.toLowerCase()) {
                case 'z': this.controls.forward = false; break;
                case 's': this.controls.backward = false; break;
                case 'q': this.controls.left = false; break;
                case 'd': this.controls.right = false; break;
                case 'shift': this.controls.boost = false; break;
                case ' ': this.controls.jump = false; break;
            }
        });

        // Mouse controls
        window.addEventListener('mousemove', (e) => {
            this.controls.mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            this.controls.mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    checkCollisions() {
        // Ball-Car collisions
        const cars = [this.player, this.aiCar];
        cars.forEach(car => {
            const distance = car.mesh.position.distanceTo(this.ball.mesh.position);
            if (distance < 3) {
                const direction = new THREE.Vector3()
                    .subVectors(this.ball.mesh.position, car.mesh.position)
                    .normalize();
                this.ball.velocity.add(direction.multiplyScalar(0.5));
            }
        });
    }

    checkGoal() {
        const ballPos = this.ball.mesh.position;
        
        // Check blue goal with improved detection
        if (ballPos.z < -38 && Math.abs(ballPos.x) < 10 && ballPos.y < 10) {
            this.score.red++;
            this.resetBall();
            this.createGoalEffect(ballPos.clone(), 0xff0000);
            this.showGoalMessage("RED TEAM SCORES!");
        }
        
        // Check red goal with improved detection
        if (ballPos.z > 38 && Math.abs(ballPos.x) < 10 && ballPos.y < 10) {
            this.score.blue++;
            this.resetBall();
            this.createGoalEffect(ballPos.clone(), 0x0000ff);
            this.showGoalMessage("BLUE TEAM SCORES!");
        }

        // Update score display
        document.getElementById('score').textContent = 
            `${this.score.blue} - ${this.score.red}`;
    }

    resetBall() {
        this.ball.mesh.position.set(0, 1, 0);
        this.ball.velocity.set(0, 0, 0);
    }

    createGoalEffect(position, color) {
        const particles = [];
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(0.2),
                new THREE.MeshBasicMaterial({ 
                    color: color,
                    transparent: true
                })
            );
            
            particle.position.copy(position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                Math.random() * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            
            this.scene.add(particle);
            particles.push(particle);
        }

        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > 2000) {
                particles.forEach(p => this.scene.remove(p));
                return;
            }

            particles.forEach(particle => {
                particle.position.add(particle.velocity);
                particle.velocity.y -= 0.01; // gravity
                particle.material.opacity = 1 - (elapsed / 2000);
            });

            requestAnimationFrame(animate);
        };
        animate();
    }

    showGoalMessage(message) {
        const goalMessage = document.createElement('div');
        goalMessage.style.position = 'fixed';
        goalMessage.style.top = '50%';
        goalMessage.style.left = '50%';
        goalMessage.style.transform = 'translate(-50%, -50%)';
        goalMessage.style.color = 'white';
        goalMessage.style.fontSize = '48px';
        goalMessage.style.fontWeight = 'bold';
        goalMessage.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
        goalMessage.style.zIndex = '1000';
        goalMessage.textContent = message;
        
        document.body.appendChild(goalMessage);

        // Animate and remove the message
        setTimeout(() => {
            goalMessage.style.transition = 'opacity 1s';
            goalMessage.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(goalMessage);
            }, 1000);
        }, 2000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update player
        this.currentPlayer.update(this.controls, 0.016, true);
        
        // Update AI
        const aiControls = this.aiController.update();
        this.aiCar.update(aiControls, 0.016, false);
        
        // Update ball and other game objects
        this.ball.update();

        // Update camera to follow player
        this.currentPlayer.updateCamera(this.camera);

        // Check collisions and goals
        this.checkCollisions();
        this.checkGoal();

        // Animate clouds
        this.cloudLayers.forEach(layer => {
            layer.children.forEach(cloud => {
                cloud.position.x += cloud.userData.speed;
                if (cloud.position.x > 150) {
                    cloud.position.x = -150;
                }
                cloud.position.y += Math.sin(Date.now() * 0.001) * 0.01;
            });
        });

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
const game = new Game(); 