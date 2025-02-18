let shapes = [];
let gravitySlider, lSystemSlider, collisionSlider, sizeSlider;
let sliderContainer, buttonContainer, controlContainer;
let versionNumber = "0.23"; // Updated version number
let selectedShape = 'circle';
let motionActive = false;
const MAX_SHAPES = 100;
let barHeight = 100; // Adjust bar height for the full bottom area

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    background(0);

    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // ... (rest of your setup code for controls and sliders remains the same)
}


function draw() {
    background(0, 20);
    fill(255);
    textSize(16);
    text(`Version: ${versionNumber}`, 10, 30);

    if (motionActive) {
        for (let shape of shapes) {
            shape.update();
            shape.display();
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
    // Check if the click is within the canvas area (excluding the bottom bar)
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
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = sizeSlider.value();
        this.mass = this.size / 10;
        this.velX = random(-2, 2);  // Random initial velocity
        this.velY = random(-2, 2);
        this.color = color(random(255), random(255), random(255));
        this.rotation = random(360); // Random initial rotation
        this.rotationSpeed = random(-2, 2); //Random rotation speed
    }

    update() {
        // Apply gravity (simplified)
        this.velY += gravitySlider.value() * this.mass / 100; // Adjusted gravity strength

        // Apply "L-System" influence (you'll likely want to refine this)
        this.velX += (noise(this.x * 0.01, this.y * 0.01) - 0.5) * lSystemSlider.value() * 0.1;
        this.velY += (noise(this.x * 0.01 + 100, this.y * 0.01 + 100) - 0.5) * lSystemSlider.value() * 0.1;

        // Update position
        this.x += this.velX;
        this.y += this.velY;

        this.rotation += this.rotationSpeed; // Update rotation

        // Bounce off edges (more realistic bouncing)
        if (this.x + this.size / 2 > width || this.x - this.size / 2 < 0) {
            this.velX *= -0.8; // Reduce velocity on bounce
            this.x = constrain(this.x, this.size/2, width - this.size/2); //prevent clipping
        }
        if (this.y + this.size / 2 > height - barHeight || this.y - this.size / 2 < 0) {
            this.velY *= -0.8;
            this.y = constrain(this.y, this.size/2, height - barHeight - this.size/2);
        }

        // Collision detection and response (simplified)
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);
                let minDist = (this.size + other.size) / 2;

                if (distance < minDist) {
                    let angle = atan2(dy, dx);
                    let overlap = minDist - distance;

                    // Separate the shapes (basic collision response)
                    let pushX = overlap * cos(angle) * 0.5; // Distribute push evenly
                    let pushY = overlap * sin(angle) * 0.5;

                    this.x -= pushX;
                    this.y -= pushY;
                    other.x += pushX;
                    other.y += pushY;

                    // Adjust velocities (basic bounce)
                    let thisVel = createVector(this.velX, this.velY);
                    let otherVel = createVector(other.velX, other.velY);
                    this.velX = otherVel.x;
                    this.velY = otherVel.y;
                    other.velX = thisVel.x;
                    other.velY = thisVel.y;
                }
            }
        }
    }

    display() {
        noStroke();
        fill(this.color);
        push(); // Start a new drawing state
        translate(this.x, this.y); // Move to the shape's position
        rotate(this.rotation); // Apply rotation
        if (this.type === 'circle') {
            ellipse(0, 0, this.size); // Draw at the translated origin
        } else if (this.type === 'square') {
            rectMode(CENTER);
            rect(0, 0, this.size, this.size);
        } else if (this.type === 'triangle') {
            triangle(0, -this.size / 2, -this.size / 2, this.size / 2, this.size / 2, this.size / 2);
        }
        pop(); // Restore the previous drawing state
    }
}
