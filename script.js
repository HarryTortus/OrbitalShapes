let shapes = [];
let gravitySlider, lSystemSlider, collisionSlider, sizeSlider;
let sliderContainer, buttonContainer, controlContainer;
let versionNumber = "0.24";
let selectedShape = 'circle';
let motionActive = false;
const MAX_SHAPES = 100;
let barHeight = 100;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    background(0);

    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // --- Control Setup (Restored) ---
    controlContainer = createDiv('').style('position', 'absolute')
        .style('bottom', '0')
        .style('left', '0')
        .style('width', '100%')
        .style('height', barHeight + 'px')
        .style('padding', '10px')
        .style('background', '#888')
        .style('display', 'flex')
        .style('flex-wrap', 'wrap')
        .style('justify-content', 'space-between')
        .style('align-items', 'center')
        .style('z-index', '10');

    // ... (All the slider and button creation code goes here - same as before)
    // ... (Make sure to include it all)

}

function draw() {
    background(0, 20);
    fill(255);
    textSize(16);
    text(`Version: ${versionNumber}`, 10, 30);

    if (motionActive) {
        for (let i = shapes.length - 1; i >= 0; i--) { // Iterate backwards for safe removal
            shapes[i].update();
            shapes[i].display();

            // Remove off-screen shapes (more aggressively)
            if (shapes[i].isOffScreen()) {
                shapes.splice(i, 1);
            }
        }
    } else {
        for (let shape of shapes) {
            shape.display();
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    if (mouseY < height - barHeight) {
        if (shapes.length >= MAX_SHAPES) {
            shapes.shift();
        }
        let s = new Shape(mouseX, mouseY, selectedShape);
        shapes.push(s);
    }
}

class Shape {
    constructor(x, y, type) {
        // ... (constructor remains the same)
    }

    update() {
        this.velY += gravitySlider.value() * this.mass / 100;

        // --- L-System Influence (Simplified for now) ---
        // (You'll want to replace this with a real L-system implementation)
        this.velX += (noise(this.x * 0.01, this.y * 0.01) - 0.5) * lSystemSlider.value() * 0.1;
        this.velY += (noise(this.x * 0.01 + 100, this.y * 0.01 + 100) - 0.5) * lSystemSlider.value() * 0.1;

        this.x += this.velX;
        this.y += this.velY;

        this.rotation += this.rotationSpeed;

        // Collision detection (simplified)
        for (let other of shapes) {
            if (other !== this) {
                // ... (collision code remains the same)
            }
        }
    }

    isOffScreen() {
        const margin = this.size * 2; // Increased margin for removal
        return (
            this.x + margin < 0 ||
            this.x - margin > width ||
            this.y + margin < 0 ||
            this.y - margin > height - barHeight
        );
    }

    display() {
        // ... (display code remains the same)
    }
}
