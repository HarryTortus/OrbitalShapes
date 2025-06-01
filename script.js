// Orbital Shapes - script.js (Refactored)

let shapes = [];
// HTML Element References
let gravitySliderEl, lSystemSliderEl, sizeSliderEl;
let motionButtonEl, restartButtonEl, fullscreenButtonEl;
let circleButtonEl, squareButtonEl, triangleButtonEl;
let p5Canvas;

let versionNumber = "0.47"; // Updated version
let selectedShape = 'circle'; // Default selected shape
let motionActive = false;
const MAX_SHAPES = 100;

// App-specific settings (mimicking Line Flow structure)
const appSettings = {
    backgroundColor: '#000000', // Canvas background for Orbital Shapes
    // Initial values for sliders (can also be read from HTML value attributes)
    gravity: 2.5,
    randomize: 0,
    size: 20,
};

// Helper to update the visual fill of range sliders
function updateRangeSliderFill(inputElement) {
    if (!inputElement) return;
    const min = parseFloat(inputElement.min || 0);
    const max = parseFloat(inputElement.max || 1);
    const value = parseFloat(inputElement.value);
    const percentage = ((value - min) / (max - min)) * 100;
    inputElement.style.setProperty('--range-progress', `${percentage}%`);
}

function setup() {
    const canvasPlaceholder = document.getElementById('p5-canvas-placeholder');
    p5Canvas = createCanvas(1, 1); // Create a 1x1 canvas initially
    p5Canvas.parent(canvasPlaceholder); // Parent it to the placeholder

    frameRate(30);
    // Background is drawn in windowResized and draw loop

    setupControls(); // Initialize and get references to HTML controls
    windowResized(); // Call to set initial canvas size and draw background
}

function setupControls() {
    // Get button elements
    motionButtonEl = document.getElementById('motionButton');
    restartButtonEl = document.getElementById('restartButton');
    fullscreenButtonEl = document.getElementById('fullscreenButton'); // Get fullscreen button

    // Get slider elements
    gravitySliderEl = document.getElementById('gravitySlider');
    lSystemSliderEl = document.getElementById('lSystemSlider');
    sizeSliderEl = document.getElementById('sizeSlider');

    // Get shape selector button elements
    circleButtonEl = document.getElementById('circleButton');
    squareButtonEl = document.getElementById('squareButton');
    triangleButtonEl = document.getElementById('triangleButton');

    // Set initial values from appSettings (or could read from HTML value attributes)
    gravitySliderEl.value = appSettings.gravity;
    lSystemSliderEl.value = appSettings.randomize;
    sizeSliderEl.value = appSettings.size;


    // Update slider value displays and fill
    document.querySelectorAll('.controls input[type="range"]').forEach(slider => {
        updateSliderValueDisplay(slider);
        updateRangeSliderFill(slider); // Initial fill
    });
    
    // Add event listeners for buttons
    motionButtonEl.addEventListener('click', () => {
        motionActive = !motionActive;
        motionButtonEl.innerHTML = motionActive ? '⏸' : '▶';
    });

    restartButtonEl.addEventListener('click', () => {
        shapes = [];
        // Reset sliders to default values (HTML and appSettings)
        gravitySliderEl.value = 2.5; // Default gravity
        lSystemSliderEl.value = 0;   // Default randomize
        sizeSliderEl.value = 20;    // Default size
        
        appSettings.gravity = parseFloat(gravitySliderEl.value);
        appSettings.randomize = parseFloat(lSystemSliderEl.value);
        appSettings.size = parseFloat(sizeSliderEl.value);

        document.querySelectorAll('.controls input[type="range"]').forEach(slider => {
            updateSliderValueDisplay(slider);
            updateRangeSliderFill(slider);
        });
        motionActive = false; // Optionally stop motion
        motionButtonEl.innerHTML = '▶';
        background(appSettings.backgroundColor); // Clear canvas
    });

    fullscreenButtonEl.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(`Error: ${err.message} (${err.name})`));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    });

    // Add event listeners for sliders
    gravitySliderEl.addEventListener('input', () => handleSliderInput(gravitySliderEl, 'gravity'));
    lSystemSliderEl.addEventListener('input', () => handleSliderInput(lSystemSliderEl, 'randomize'));
    sizeSliderEl.addEventListener('input', () => handleSliderInput(sizeSliderEl, 'size'));

    // Add event listeners for shape selector buttons
    circleButtonEl.addEventListener('click', () => selectShapeHandler('circle'));
    squareButtonEl.addEventListener('click', () => selectShapeHandler('square'));
    triangleButtonEl.addEventListener('click', () => selectShapeHandler('triangle'));

    // Initialize active shape button style
    updateShapeButtonVisuals();

    // Display version number
    const versionDisplayEl = document.getElementById('versionDisplay');
    if(versionDisplayEl) versionDisplayEl.textContent = `Version: ${versionNumber}`;

    // Fullscreen change listeners
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(event =>
        document.addEventListener(event, () => windowResized()) // Recalculate on any FS change
    );
}

function handleSliderInput(sliderElement, settingName) {
    appSettings[settingName] = parseFloat(sliderElement.value);
    updateSliderValueDisplay(sliderElement);
    updateRangeSliderFill(sliderElement);
}

function updateSliderValueDisplay(sliderElement) {
    const valueDisplayId = sliderElement.id + '-value';
    const valueDisplayElement = document.getElementById(valueDisplayId);
    if (valueDisplayElement) {
        valueDisplayElement.textContent = parseFloat(sliderElement.value).toFixed(sliderElement.step.includes('.') ? 1:0);
    }
}

function selectShapeHandler(shapeType) {
    selectedShape = shapeType;
    updateShapeButtonVisuals();
}

function updateShapeButtonVisuals() {
    const buttons = [
        { el: circleButtonEl, shape: 'circle' },
        { el: squareButtonEl, shape: 'square' },
        { el: triangleButtonEl, shape: 'triangle' }
    ];
    buttons.forEach(item => {
        if (item.el) { // Check if element exists
            if (item.shape === selectedShape) {
                item.el.classList.add('active-shape');
                item.el.style.backgroundColor = 'var(--shape-active-color)';
            } else {
                item.el.classList.remove('active-shape');
                item.el.style.backgroundColor = 'var(--shape-inactive-color)';
            }
        }
    });
}


function draw() {
    background(color(appSettings.backgroundColor + '33')); // Hex with alpha for trails (e.g., '33' for ~20% opacity)

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
            shape.display(); // Display static shapes if motion is not active
        }
    }
}

function windowResized() {
    const mainTitle = document.getElementById('mainTitle');
    const controlsPanel = document.getElementById('controlsPanel');
    const sketchContainer = document.getElementById('sketch-container');
    const siteFooter = document.getElementById('site-footer');

    let newCanvasWidth, newCanvasHeight;
    const CANVAS_MARGIN_BOTTOM = 20; // As defined in CSS for canvas

    if (document.fullscreenElement) {
        document.body.classList.add('fullscreen-active');
        newCanvasWidth = window.innerWidth;
        newCanvasHeight = window.innerHeight;
    } else {
        document.body.classList.remove('fullscreen-active');

        newCanvasWidth = sketchContainer.clientWidth; // Uses the content width of sketchContainer

        const titleStyle = mainTitle ? window.getComputedStyle(mainTitle) : {};
        const titleHeight = mainTitle ? (mainTitle.offsetHeight + parseFloat(titleStyle.marginTop || 0) + parseFloat(titleStyle.marginBottom || 0)) : 0;
        
        const controlsPanelStyle = controlsPanel ? window.getComputedStyle(controlsPanel) : {};
        const controlsHeight = controlsPanel ? (controlsPanel.offsetHeight + parseFloat(controlsPanelStyle.marginTop || 0) + parseFloat(controlsPanelStyle.marginBottom || 0)) : 0;
        
        const footerStyle = siteFooter ? window.getComputedStyle(siteFooter) : {};
        const footerTotalHeight = siteFooter ? (siteFooter.offsetHeight + parseFloat(footerStyle.marginTop || 0) + parseFloat(footerStyle.marginBottom || 0)) : 0;

        const bodyStyle = window.getComputedStyle(document.body);
        const bodyVerticalPadding = parseFloat(bodyStyle.paddingTop || 0) + parseFloat(bodyStyle.paddingBottom || 0);
        
        let availableHeightForCanvasAndItsMargin = window.innerHeight - bodyVerticalPadding - titleHeight - controlsHeight - footerTotalHeight;
        let maxCanvasHeight = availableHeightForCanvasAndItsMargin - CANVAS_MARGIN_BOTTOM;

        // For Orbital shapes, let's aim for a 16:9 or fill available, rather than square like Line Flow
        let desiredCanvasHeight = newCanvasWidth * (9/16); // Aspect ratio
        
        if (desiredCanvasHeight > maxCanvasHeight) {
            desiredCanvasHeight = maxCanvasHeight; // Cap by available height
             // Optionally adjust width to maintain aspect ratio if height is capped
            // newCanvasWidth = desiredCanvasHeight * (16/9);
            // newCanvasWidth = Math.min(newCanvasWidth, sketchContainer.clientWidth); // Ensure it doesn't exceed sketch container
        }
        newCanvasHeight = desiredCanvasHeight;
        
        newCanvasWidth = Math.max(50, newCanvasWidth); 
        newCanvasHeight = Math.max(50, newCanvasHeight);

        // Dynamically update max for sizeSlider (optional, can be complex)
        // let newMaxSize = Math.min(newCanvasWidth, newCanvasHeight) * 0.25;
        // sizeSliderEl.max = Math.max(50, newMaxSize); // Ensure max is not too small
        // if (parseFloat(sizeSliderEl.value) > parseFloat(sizeSliderEl.max)) {
        //     sizeSliderEl.value = sizeSliderEl.max;
        //     handleSliderInput(sizeSliderEl, 'size');
        // }
        // updateRangeSliderFill(sizeSliderEl); // Update fill if max changed
    }

    resizeCanvas(newCanvasWidth, newCanvasHeight);
    background(appSettings.backgroundColor); // Ensure full redraw of background
}


function mousePressed() {
    // Check if the mouse is within the canvas bounds
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        if (shapes.length >= MAX_SHAPES) {
            shapes.shift(); // Remove the oldest shape
        }
        let s = new Shape(mouseX, mouseY, selectedShape);
        shapes.push(s);
        return false; // Prevent default browser action
    }
}

function touchStarted() {
    if (touches.length > 0) {
        const touchX = touches[0].x;
        const touchY = touches[0].y;
        // Check if the touch is within the canvas bounds
        if (touchX > 0 && touchX < width && touchY > 0 && touchY < height) {
            if (shapes.length >= MAX_SHAPES) {
                shapes.shift();
            }
            let s = new Shape(touchX, touchY, selectedShape);
            shapes.push(s);
            return false; // Prevent default browser action (like scrolling)
        }
    }
}
// touchEnded is not strictly needed if spawning on touchStarted, unless you implement drag-to-spawn velocity.


// Shape class - constructor and update methods need to use appSettings for slider values
class Shape {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = appSettings.size; // Use appSettings.size
        this.updateMass();
        this.velX = random(-.5, .5);
        this.velY = random(-.5, .5);
        this.color = color(random(150,255), random(150,255), random(150,255), 230); // Brighter, slightly transparent
        this.rotation = random(TWO_PI); // Use TWO_PI for radians
        this.rotationSpeed = random(-0.05, 0.05); // Slower rotation
    }

    updateMass() {
        // Simplified mass calculation for example
        this.mass = (PI * this.size * this.size) / 1000; 
        if (this.type === 'square') {
            this.mass *= 1.2; // Squares slightly heavier
        } else if (this.type === 'triangle') {
            this.mass *= 0.8; // Triangles slightly lighter
        }
    }

    update() {
        // Gravitational pull
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distanceSq = dx * dx + dy * dy;
                let distance = sqrt(distanceSq);

                let minInteractionDistance = (this.size + other.size) / 20; // smaller interaction influence
                distance = max(distance, minInteractionDistance); 
                
                let force = (appSettings.gravity * this.mass * other.mass) / (distance * distance); // Use appSettings.gravity
                if (distance < (this.size + other.size) / 2) { // stronger force if overlapping (repulsion)
                   force = -force * 0.5; // Make it repulsive if too close before collision logic
                }


                let angle = atan2(dy, dx);
                let forceX = cos(angle) * force;
                let forceY = sin(angle) * force;

                this.velX += forceX / this.mass;
                this.velY += forceY / this.mass;
                // No equal and opposite force here to simplify and make it more like a central puller for each
            }
        }

        // Randomize Movement
        const noiseFactor = appSettings.randomize * 0.001; // Use appSettings.randomize
        this.velX += (noise(this.x * 0.01, this.y * 0.01, frameCount * 0.01) - 0.5) * noiseFactor;
        this.velY += (noise(this.x * 0.01 + 100, this.y * 0.01 + 100, frameCount * 0.01) - 0.5) * noiseFactor;

        // Max speed
        const maxSpeed = 5;
        this.velX = constrain(this.velX, -maxSpeed, maxSpeed);
        this.velY = constrain(this.velY, -maxSpeed, maxSpeed);

        this.x += this.velX;
        this.y += this.velY;
        this.rotation += this.rotationSpeed;

        // Collision detection and response
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distCenter = sqrt(dx * dx + dy * dy);
                let minDist = (this.size + other.size) / 2;

                if (distCenter < minDist) {
                    // Resolve overlap
                    let overlap = (minDist - distCenter);
                    let angle = atan2(dy, dx);
                    let moveX = cos(angle) * overlap * 0.5;
                    let moveY = sin(angle) * overlap * 0.5;

                    this.x -= moveX; this.y -= moveY;
                    other.x += moveX; other.y += moveY;

                    // Elastic collision response
                    let normalX = dx / distCenter;
                    let normalY = dy / distCenter;
                    let relVelX = this.velX - other.velX;
                    let relVelY = this.velY - other.velY;
                    let velAlongNormal = relVelX * normalX + relVelY * normalY;

                    if (velAlongNormal > 0) continue; // Objects are already moving apart

                    let restitution = 0.85; // Slightly less than perfectly elastic
                    let impulse = (-(1 + restitution) * velAlongNormal) / (1/this.mass + 1/other.mass); // Adjusted for mass

                    this.velX += impulse * normalX / this.mass;
                    this.velY += impulse * normalY / this.mass;
                    other.velX -= impulse * normalX / other.mass;
                    other.velY -= impulse * normalY / other.mass;
                }
            }
        }
    }

    isOffScreen() {
        const margin = this.size * 2; // Increased margin for off-screen check
        return (
            this.x + margin < 0 ||
            this.x - margin > width ||
            this.y + margin < 0 ||
            this.y - margin > height // Canvas height is the boundary now
        );
    }

    display() {
        noStroke();
        fill(this.color);
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        rectMode(CENTER); // Ensure rect mode is center for square
        if (this.type === 'circle') {
            ellipse(0, 0, this.size, this.size);
        } else if (this.type === 'square') {
            rect(0, 0, this.size, this.size);
        } else if (this.type === 'triangle') {
            // Equilateral triangle centered
            let r = this.size / 2; // "Radius" for points
            triangle(0, -r, -r * cos(PI/6), r * sin(PI/6), r * cos(PI/6), r * sin(PI/6));
        }
        pop();
    }
}
