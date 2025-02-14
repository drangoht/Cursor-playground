class AIController {
    constructor(car, ball) {
        this.car = car;
        this.ball = ball;
        this.controls = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            boost: false,
            jump: false
        };
        this.state = 'chase_ball'; // chase_ball, return_goal, attack
        this.lastStateChange = Date.now();
    }

    update() {
        const ballPos = this.ball.mesh.position;
        const carPos = this.car.mesh.position;
        
        // Calculate distances and angles
        const distanceToBall = carPos.distanceTo(ballPos);
        const angleToTarget = Math.atan2(
            ballPos.x - carPos.x,
            ballPos.z - carPos.z
        );
        
        // Get car's current forward direction
        const carDirection = new THREE.Vector3(0, 0, -1);
        carDirection.applyQuaternion(this.car.mesh.quaternion);
        const currentAngle = Math.atan2(carDirection.x, carDirection.z);
        
        // Calculate angle difference
        let angleDiff = angleToTarget - currentAngle;
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        // Reset controls
        Object.keys(this.controls).forEach(key => this.controls[key] = false);

        // State machine for AI behavior
        switch(this.state) {
            case 'chase_ball':
                this.chaseBall(angleDiff, distanceToBall);
                break;
            case 'return_goal':
                this.returnToGoal();
                break;
            case 'attack':
                this.attackBall(angleDiff, distanceToBall);
                break;
        }

        // State transitions
        this.updateState(carPos, ballPos);

        return this.controls;
    }

    chaseBall(angleDiff, distanceToBall) {
        // Steering
        if (angleDiff > 0.1) {
            this.controls.left = true;
        } else if (angleDiff < -0.1) {
            this.controls.right = true;
        }

        // Movement
        if (Math.abs(angleDiff) < 1) {
            this.controls.forward = true;
            if (distanceToBall > 20) {
                this.controls.boost = true;
            }
        }

        // Jump when close to ball and ball is in air
        if (distanceToBall < 5 && this.ball.mesh.position.y > 1) {
            this.controls.jump = true;
        }
    }

    returnToGoal() {
        const goalPos = new THREE.Vector3(0, 0, 35); // Slightly in front of goal
        const distanceToGoal = this.car.mesh.position.distanceTo(goalPos);
        
        const angleToGoal = Math.atan2(
            goalPos.x - this.car.mesh.position.x,
            goalPos.z - this.car.mesh.position.z
        );

        // Similar steering logic as chaseBall
        const carDirection = new THREE.Vector3(0, 0, -1);
        carDirection.applyQuaternion(this.car.mesh.quaternion);
        const currentAngle = Math.atan2(carDirection.x, carDirection.z);
        
        let angleDiff = angleToGoal - currentAngle;
        if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (angleDiff > 0.1) {
            this.controls.left = true;
        } else if (angleDiff < -0.1) {
            this.controls.right = true;
        }

        if (Math.abs(angleDiff) < 1) {
            this.controls.forward = true;
        }
    }

    attackBall(angleDiff, distanceToBall) {
        this.chaseBall(angleDiff, distanceToBall);
        if (distanceToBall < 10) {
            this.controls.boost = true;
        }
    }

    updateState(carPos, ballPos) {
        const now = Date.now();
        if (now - this.lastStateChange < 1000) return; // Minimum time in each state

        const distanceToGoal = carPos.distanceTo(new THREE.Vector3(0, 0, 40));
        const ballDistanceToGoal = ballPos.distanceTo(new THREE.Vector3(0, 0, 40));

        if (ballPos.z < 0 && carPos.z > 20) {
            this.state = 'return_goal';
        } else if (ballDistanceToGoal < 20 && carPos.z < ballPos.z) {
            this.state = 'attack';
        } else {
            this.state = 'chase_ball';
        }

        this.lastStateChange = now;
    }
} 