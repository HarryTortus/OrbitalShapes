let shapes = [];
let gravitySlider, lSystemSlider, sizeSlider;
let sliderContainer, buttonContainer, controlContainer;
let versionNumber = "0.44"; // Updated version number
let selectedShape = 'circle';
let motionActive = false;
const MAX_SHAPES = 100;
let barHeight = 60;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    background(0);

    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

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

    let leftControls = createDiv('').style('display', 'flex')
        .style('gap', '10px')
        .parent(controlContainer);

    let motionButton = createButton('▶')
        .mousePressed(() => {
            motionActive = !motionActive;
            motionButton.html(motionActive ? '⏸' : '▶');
        })
        .style('width', '60px')
        .style('height', '60px')
        .style('font-size', '48px')
        .style('background', '#888')
        .style('color', '#3fd16b')
        .style('border', 'none')
        .style('cursor', 'pointer')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .parent(leftControls);

    let restartButton = createButton('⟳')
        .mousePressed(() => {
            shapes = [];
            gravitySlider.value(2.5);
            lSystemSlider.value(0);
            sizeSlider.value(20);
        })
        .style('width', '60px')
        .style('height', '60px')
        .style('font-size', '48px')
        .style('background', '#888')
        .style('color', '#3fd16b')
        .style('border', 'none')
        .style('cursor', 'pointer')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .parent(leftControls);

    sliderContainer = createDiv('').style('display', 'flex')
        .style('gap', '10px')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .parent(controlContainer);

    function createLabeledSlider(labelText, min, max, defaultValue) {
        let container = createDiv('').style('display', 'flex')
            .style('flex-direction', 'column')
            .style('align-items', 'center')
            .parent(sliderContainer);
        let slider = createSlider(min, max, defaultValue, 0.1)
            .style('width', '150px')
            .style('height', '20px')
            .style('accent-color', '#3fd16b')
            .parent(container);
        createSpan(labelText).style('color', 'white').parent(container);
        return slider;
    }

    gravitySlider = createLabeledSlider('Gravity', 0, 5, 2.5);
    lSystemSlider = createLabeledSlider('Randomize Movement', 0, 10, 0);
    sizeSlider = createLabeledSlider('Size', 10, min(windowWidth, windowHeight) * 0.20, 20);

    buttonContainer = createDiv('').style('display', 'flex')
        .style('gap', '20px')
        .style('margin-right', '20px')
        .parent(controlContainer);

    function createShapeButton(shapeType, clipPath) {
        let button = createButton('')
            .mousePressed(() => {
                selectedShape = shapeType;
                updateShapeButtonColors();
            })
            .style('width', '30px')
            .style('height', '30px')
            .style('background', '#000')
            .style('border', 'none')
            .style('clip-path', clipPath)
            .parent(buttonContainer);
        return button;
    }

    let circleButton = createShapeButton('circle', 'circle(50%)');
    let squareButton = createShapeButton('square', 'none');
    let triangleButton = createShapeButton('triangle', 'polygon(50% 0%, 0% 100%, 100% 100%)');

    function updateShapeButtonColors() {
        circleButton.style('background', selectedShape === 'circle' ? '#3fd16b' : '#000');
        squareButton.style('background', selectedShape === 'square' ? '#3fd16b' : '#000');
        triangleButton.style('background', selectedShape === 'triangle' ? '#3fd16b' : '#000');
    }
    updateShapeButtonColors();

     let shapeLabel = createSpan("Select Shape")
        .style('color', 'white')
        .style('text-align', 'center')
        .style('display', 'block')
        .style('position', 'absolute')
        .parent(controlContainer);

    setTimeout(() => {
        shapeLabel.style('width', buttonContainer.elt.offsetWidth + 'px');
        let labelX = buttonContainer.elt.offsetLeft + (buttonContainer.elt.offsetWidth - shapeLabel.elt.offsetWidth) / 2;
        shapeLabel.style('left', labelX + 'px');
        shapeLabel.style('top', controlContainer.elt.offsetHeight - shapeLabel.elt.offsetHeight + 'px');
    }, 0);
    
}

function draw() {
    background(0, 20);
    fill(255);
    textSize(16);
    text(`Version: ${versionNumber}`, 10, 30);

    if (motionActive) {
        for (let i = shapes.length - 1; i >= 0; i--) {
            shapes[i].update();
            shapes[i].display();

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
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = sizeSlider.value();
        this.updateMass();
        this.velX = random(-.5, .5);
        this.velY = random(-.5, .5);
        this.color = color(random(255), random(255), random(255));
        this.rotation = random(360);
        this.rotationSpeed = random(-.1, .1);
    }

    updateMass() {
        if (this.type === 'circle') {
            this.mass = PI * (this.size / 2) * (this.size / 2);
        } else if (this.type === 'square') {
            this.mass = this.size * this.size;
        } else if (this.type === 'triangle') {
            this.mass = (this.size * this.size * sqrt(3) / 4);
        }
        this.mass /= 10; // Adjust mass scale as needed
    }

    update() {
        // Gravitational pull based on size
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);

                let minDistance = (this.size + other.size) / 2;
                distance = max(distance, minDistance); // Prevent
                let force = (gravitySlider.value() * this.mass * other.mass) / (distance * distance);

                let angle = atan2(dy, dx);

                let forceX = cos(angle) * force;
                let forceY = sin(angle) * force;

                this.velX += forceX / this.mass;
                this.velY += forceY / this.mass;

                other.velX -= forceX / other.mass; // Equal and opposite force
                other.velY -= forceY / other.mass;
            }
        }

        // Randomize Movement
        this.velX += (noise(this.x * 0.01, this.y * 0.01) - 0.5) * lSystemSlider.value() * 0.01;
        this.velY += (noise(this.x * 0.01 + 100, this.y * 0.01 + 100) - 0.5) * lSystemSlider.value() * 0.01;

        this.x += this.velX;
        this.y += this.velY;

        this.rotation += this.rotationSpeed;

        // Collision detection
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);
                let minDist = (this.size + other.size) / 2;
        
                if (distance < minDist) {
                    // Resolve overlap by moving objects apart
                    let overlap = minDist - distance;
                    let angle = atan2(dy, dx);
                    let separationX = cos(angle) * overlap * 0.5;
                    let separationY = sin(angle) * overlap * 0.5;
        
                    this.x -= separationX;
                    this.y -= separationY;
                    other.x += separationX;
                    other.y += separationY;
        
                    // Compute elastic collision response
                    let nx = dx / distance;
                    let ny = dy / distance;
                    let relativeVelX = this.velX - other.velX;
                    let relativeVelY = this.velY - other.velY;
                    let velocityAlongNormal = relativeVelX * nx + relativeVelY * ny;
        
                    if (velocityAlongNormal > 0) continue; // Skip if already moving apart
        
                    let e = 1; // Coefficient of restitution (1 = perfectly elastic)
                    let impulse = (-(1 + e) * velocityAlongNormal) / (this.mass + other.mass);
                    let impulseX = impulse * nx;
                    let impulseY = impulse * ny;
        
                    this.velX -= impulseX * other.mass;
                    this.velY -= impulseY * other.mass;
                    other.velX += impulseX * this.mass;
                    other.velY += impulseY * this.mass;
                }
            }
        }
        
    }

    isOffScreen() {
        const margin = this.size * 2;
        return (
            this.x + margin < 0 ||
            this.x - margin > width ||
            this.y + margin < 0 ||
            this.y - margin > height - barHeight
        );
    }

    display() {
        noStroke();
        fill(this.color);
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        if (this.type === 'circle') {
            ellipse(0, 0, this.size);
        } else if (this.type === 'square') {
            rectMode(CENTER);
            rect(0, 0, this.size, this.size);
        } else if (this.type === 'triangle') {
            triangle(0, -this.size / 2, -this.size / 2, this.size / 2, this.size / 2, this.size / 2);
        }
        pop();
    }
}

// Helper function to clamp values within a range (OUTSIDE the Shape class)
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}let shapes = [];
let gravitySlider, lSystemSlider, sizeSlider;
let sliderContainer, buttonContainer, controlContainer;
let versionNumber = "0.43"; // Updated version number
let selectedShape = 'circle';
let motionActive = false;
const MAX_SHAPES = 100;
let barHeight = 60;

function setup() {
    createCanvas(windowWidth, windowHeight);
    frameRate(30);
    background(0);

    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

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

    let leftControls = createDiv('').style('display', 'flex')
        .style('gap', '10px')
        .parent(controlContainer);

    let motionButton = createButton('▶')
        .mousePressed(() => {
            motionActive = !motionActive;
            motionButton.html(motionActive ? '⏸' : '▶');
        })
        .style('width', '60px')
        .style('height', '60px')
        .style('font-size', '48px')
        .style('background', '#888')
        .style('color', '#3fd16b')
        .style('border', 'none')
        .style('cursor', 'pointer')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .parent(leftControls);

    let restartButton = createButton('⟳')
        .mousePressed(() => {
            shapes = [];
            gravitySlider.value(2);
            lSystemSlider.value(0);
            sizeSlider.value(20);
        })
        .style('width', '60px')
        .style('height', '60px')
        .style('font-size', '48px')
        .style('background', '#888')
        .style('color', '#3fd16b')
        .style('border', 'none')
        .style('cursor', 'pointer')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .parent(leftControls);

    sliderContainer = createDiv('').style('display', 'flex')
        .style('gap', '10px')
        .style('justify-content', 'center')
        .style('align-items', 'center')
        .parent(controlContainer);

    function createLabeledSlider(labelText, min, max, defaultValue) {
        let container = createDiv('').style('display', 'flex')
            .style('flex-direction', 'column')
            .style('align-items', 'center')
            .parent(sliderContainer);
        let slider = createSlider(min, max, defaultValue, 0.1)
            .style('width', '150px')
            .style('height', '20px')
            .style('accent-color', '#3fd16b')
            .parent(container);
        createSpan(labelText).style('color', 'white').parent(container);
        return slider;
    }

    gravitySlider = createLabeledSlider('Gravity', 0, 10, 2);
    lSystemSlider = createLabeledSlider('Randomize Movement', 0, 10, 0);
    sizeSlider = createLabeledSlider('Size', 10, min(windowWidth, windowHeight) * 0.20, 20);

    buttonContainer = createDiv('').style('display', 'flex')
        .style('gap', '20px')
        .style('margin-right', '20px')
        .parent(controlContainer);

    function createShapeButton(shapeType, clipPath) {
        let button = createButton('')
            .mousePressed(() => {
                selectedShape = shapeType;
                updateShapeButtonColors();
            })
            .style('width', '30px')
            .style('height', '30px')
            .style('background', '#000')
            .style('border', 'none')
            .style('clip-path', clipPath)
            .parent(buttonContainer);
        return button;
    }

    let circleButton = createShapeButton('circle', 'circle(50%)');
    let squareButton = createShapeButton('square', 'none');
    let triangleButton = createShapeButton('triangle', 'polygon(50% 0%, 0% 100%, 100% 100%)');

    function updateShapeButtonColors() {
        circleButton.style('background', selectedShape === 'circle' ? '#3fd16b' : '#000');
        squareButton.style('background', selectedShape === 'square' ? '#3fd16b' : '#000');
        triangleButton.style('background', selectedShape === 'triangle' ? '#3fd16b' : '#000');
    }
    updateShapeButtonColors();

     let shapeLabel = createSpan("Select Shape")
        .style('color', 'white')
        .style('text-align', 'center')
        .style('display', 'block')
        .style('position', 'absolute')
        .parent(controlContainer);

    setTimeout(() => {
        shapeLabel.style('width', buttonContainer.elt.offsetWidth + 'px');
        let labelX = buttonContainer.elt.offsetLeft + (buttonContainer.elt.offsetWidth - shapeLabel.elt.offsetWidth) / 2;
        shapeLabel.style('left', labelX + 'px');
        shapeLabel.style('top', controlContainer.elt.offsetHeight - shapeLabel.elt.offsetHeight + 'px');
    }, 0);
    
}

function draw() {
    background(0, 20);
    fill(255);
    textSize(16);
    text(`Version: ${versionNumber}`, 10, 30);

    if (motionActive) {
        for (let i = shapes.length - 1; i >= 0; i--) {
            shapes[i].update();
            shapes[i].display();

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
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = sizeSlider.value();
        this.updateMass();
        this.velX = random(-.5, .5);
        this.velY = random(-.5, .5);
        this.color = color(random(255), random(255), random(255));
        this.rotation = random(360);
        this.rotationSpeed = random(-.1, .1);
    }

    updateMass() {
        if (this.type === 'circle') {
            this.mass = PI * (this.size / 2) * (this.size / 2);
        } else if (this.type === 'square') {
            this.mass = this.size * this.size;
        } else if (this.type === 'triangle') {
            this.mass = (this.size * this.size * sqrt(3) / 4);
        }
        this.mass /= 10; // Adjust mass scale as needed
    }

    update() {
        // Gravitational pull based on size
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);

                let minDistance = (this.size + other.size) / 2;
                distance = max(distance, minDistance); // Prevent
                let force = (gravitySlider.value() * this.mass * other.mass) / (distance * distance);

                let angle = atan2(dy, dx);

                let forceX = cos(angle) * force;
                let forceY = sin(angle) * force;

                this.velX += forceX / this.mass;
                this.velY += forceY / this.mass;

                other.velX -= forceX / other.mass; // Equal and opposite force
                other.velY -= forceY / other.mass;
            }
        }

        // --- L-System Influence
        this.velX += (noise(this.x * 0.01, this.y * 0.01) - 0.5) * lSystemSlider.value() * 0.01;
        this.velY += (noise(this.x * 0.01 + 100, this.y * 0.01 + 100) - 0.5) * lSystemSlider.value() * 0.01;

        this.x += this.velX;
        this.y += this.velY;

        this.rotation += this.rotationSpeed;

        // Collision detection
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);
                let minDist = (this.size + other.size) / 2;
        
                if (distance < minDist) {
                    // Resolve overlap by moving objects apart
                    let overlap = minDist - distance;
                    let angle = atan2(dy, dx);
                    let separationX = cos(angle) * overlap * 0.5;
                    let separationY = sin(angle) * overlap * 0.5;
        
                    this.x -= separationX;
                    this.y -= separationY;
                    other.x += separationX;
                    other.y += separationY;
        
                    // Compute elastic collision response
                    let nx = dx / distance;
                    let ny = dy / distance;
                    let relativeVelX = this.velX - other.velX;
                    let relativeVelY = this.velY - other.velY;
                    let velocityAlongNormal = relativeVelX * nx + relativeVelY * ny;
        
                    if (velocityAlongNormal > 0) continue; // Skip if already moving apart
        
                    let e = 1; // Coefficient of restitution (1 = perfectly elastic)
                    let impulse = (-(1 + e) * velocityAlongNormal) / (this.mass + other.mass);
                    let impulseX = impulse * nx;
                    let impulseY = impulse * ny;
        
                    this.velX -= impulseX * other.mass;
                    this.velY -= impulseY * other.mass;
                    other.velX += impulseX * this.mass;
                    other.velY += impulseY * this.mass;
                }
            }
        }
        
    }

    isOffScreen() {
        const margin = this.size * 2;
        return (
            this.x + margin < 0 ||
            this.x - margin > width ||
            this.y + margin < 0 ||
            this.y - margin > height - barHeight
        );
    }

    display() {
        noStroke();
        fill(this.color);
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        if (this.type === 'circle') {
            ellipse(0, 0, this.size);
        } else if (this.type === 'square') {
            rectMode(CENTER);
            rect(0, 0, this.size, this.size);
        } else if (this.type === 'triangle') {
            triangle(0, -this.size / 2, -this.size / 2, this.size / 2, this.size / 2, this.size / 2);
        }
        pop();
    }
}

// Helper function to clamp values within a range (OUTSIDE the Shape class)
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
