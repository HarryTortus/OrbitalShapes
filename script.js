// script.js for Orbital Shapes (with Bouncy Border)

let shapes = [];
// HTML Element References
let gravitySliderEl, lSystemSliderEl, sizeSliderEl;
let motionButtonEl, restartButtonEl, fullscreenButtonEl, bouncyBorderToggleEl; // Added bouncyBorderToggleEl
let circleButtonEl, squareButtonEl, triangleButtonEl;
let p5Canvas; 

let versionNumber = "0.49"; // Updated version
let selectedShape = 'circle'; 
let motionActive = false;
const MAX_SHAPES = 100;

// App-specific settings
const appSettings = {
    backgroundColor: '#000000', 
    gravity: 2.5,
    randomize: 0,
    size: 20,
    bouncyBorder: false // New setting, default to OFF
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
    p5Canvas = createCanvas(1, 1); 
    if (canvasPlaceholder && p5Canvas) {
        p5Canvas.parent(canvasPlaceholder); 
    } else {
        console.error("Canvas placeholder not found or canvas could not be created.");
        return;
    }
    frameRate(30);
    setupControls(); 
    windowResized(); 
}

function setupControls() {
    motionButtonEl = document.getElementById('motionButton');
    restartButtonEl = document.getElementById('restartButton');
    fullscreenButtonEl = document.getElementById('fullscreenButton');
    bouncyBorderToggleEl = document.getElementById('bouncyBorderToggle'); // Get the new toggle

    gravitySliderEl = document.getElementById('gravitySlider');
    lSystemSliderEl = document.getElementById('lSystemSlider');
    sizeSliderEl = document.getElementById('sizeSlider');

    circleButtonEl = document.getElementById('circleButton');
    squareButtonEl = document.getElementById('squareButton');
    triangleButtonEl = document.getElementById('triangleButton');

    if (!(motionButtonEl && restartButtonEl && fullscreenButtonEl && bouncyBorderToggleEl && 
          gravitySliderEl && lSystemSliderEl && sizeSliderEl && 
          circleButtonEl && squareButtonEl && triangleButtonEl)) {
        console.error("One or more control elements could not be found. Check IDs.");
        return; 
    }

    // Initialize controls from appSettings
    appSettings.gravity = parseFloat(gravitySliderEl.value);
    appSettings.randomize = parseFloat(lSystemSliderEl.value);
    appSettings.size = parseFloat(sizeSliderEl.value);
    bouncyBorderToggleEl.checked = appSettings.bouncyBorder; // Initialize checkbox
    
    document.querySelectorAll('.controls input[type="range"]').forEach(slider => {
        updateSliderValueDisplay(slider);
        updateRangeSliderFill(slider); 
    });
    
    motionButtonEl.addEventListener('click', () => {
        motionActive = !motionActive;
        motionButtonEl.innerHTML = motionActive ? '⏸' : '▶';
    });

    restartButtonEl.addEventListener('click', () => {
        shapes = [];
        gravitySliderEl.value = 2.5; 
        lSystemSliderEl.value = 0;   
        sizeSliderEl.value = 20;    
        bouncyBorderToggleEl.checked = false; // Reset bouncy border on restart
        
        appSettings.gravity = parseFloat(gravitySliderEl.value);
        appSettings.randomize = parseFloat(lSystemSliderEl.value);
        appSettings.size = parseFloat(sizeSliderEl.value);
        appSettings.bouncyBorder = bouncyBorderToggleEl.checked; // Update setting

        document.querySelectorAll('.controls input[type="range"]').forEach(slider => {
            updateSliderValueDisplay(slider);
            updateRangeSliderFill(slider);
        });
        motionActive = false; 
        motionButtonEl.innerHTML = '▶';
        if (typeof background === 'function' && appSettings.backgroundColor) {
            background(appSettings.backgroundColor); 
        }
    });

    fullscreenButtonEl.addEventListener('click', () => { /* ... (same as before) ... */ });

    // Event listener for the new Bouncy Border toggle
    bouncyBorderToggleEl.addEventListener('change', () => {
        appSettings.bouncyBorder = bouncyBorderToggleEl.checked;
    });

    gravitySliderEl.addEventListener('input', () => handleSliderInput(gravitySliderEl, 'gravity'));
    lSystemSliderEl.addEventListener('input', () => handleSliderInput(lSystemSliderEl, 'randomize'));
    sizeSliderEl.addEventListener('input', () => handleSliderInput(sizeSliderEl, 'size'));

    circleButtonEl.addEventListener('click', () => selectShapeHandler('circle'));
    squareButtonEl.addEventListener('click', () => selectShapeHandler('square'));
    triangleButtonEl.addEventListener('click', () => selectShapeHandler('triangle'));

    updateShapeButtonVisuals(); 

    const versionDisplayEl = document.getElementById('versionDisplay');
    if(versionDisplayEl) versionDisplayEl.textContent = `v${versionNumber}`;

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(event =>
        document.addEventListener(event, () => windowResized())
    );
}

function handleSliderInput(sliderElement, settingName) { /* ... (same as before) ... */ }
function updateSliderValueDisplay(sliderElement) { /* ... (same as before) ... */ }
function selectShapeHandler(shapeType) { /* ... (same as before) ... */ }
function updateShapeButtonVisuals() { /* ... (same as before) ... */ }
function windowResized() { /* ... (same as before - using the version that maximizes vertical fill) ... */ }
function mousePressed() { /* ... (same as before) ... */ }
function touchStarted() { /* ... (same as before) ... */ }
function touchEnded() { /* ... (same as before) ... */ }


function draw() {
    let bgColor = appSettings.backgroundColor;
    if (bgColor.length === 7) { 
        background(color(bgColor + '2A')); 
    } else {
        background(bgColor); 
    }

    if (motionActive) {
        for (let i = shapes.length - 1; i >= 0; i--) {
            shapes[i].update();
            shapes[i].display();
            // MODIFIED: Only remove if bouncyBorder is OFF and shape is off-screen
            if (!appSettings.bouncyBorder && shapes[i].isOffScreen()) {
                shapes.splice(i, 1);
            }
        }
    } else {
        for (let shape of shapes) {
            shape.display(); 
        }
    }
}


// Shape class
class Shape {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = appSettings.size; 
        this.updateMass();
        this.velX = random(-0.5, 0.5);
        this.velY = random(-0.5, 0.5);
        this.color = color(random(180, 255), random(180, 255), random(180, 255), 220); 
        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.03, 0.03); 
    }

    updateMass() { /* ... (same as before) ... */ }

    update() {
        // Gravitational pull and Randomize Movement logic (same as before)
        // ... (previous gravity and randomize logic) ...
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);
                let minInteractionDistance = (this.size + other.size) / 4; 
                distance = max(distance, minInteractionDistance); 
                let forceMagnitude = (appSettings.gravity * this.mass * other.mass) / (distance * distance);
                if (distance < (this.size + other.size) / 2) { 
                   forceMagnitude = -forceMagnitude * 2; 
                }
                let angle = atan2(dy, dx);
                let forceX = cos(angle) * forceMagnitude;
                let forceY = sin(angle) * forceMagnitude;
                this.velX += forceX / this.mass;
                this.velY += forceY / this.mass;
            }
        }
        const noiseStrength = appSettings.randomize * 0.005; 
        this.velX += (noise(this.x * 0.01, this.y * 0.01, frameCount * 0.005) - 0.5) * noiseStrength;
        this.velY += (noise(this.x * 0.01 + 100, this.y * 0.01 + 100, frameCount * 0.005) - 0.5) * noiseStrength;
        const maxSpeed = 3 + appSettings.gravity; 
        let currentSpeed = sqrt(this.velX * this.velX + this.velY * this.velY);
        if (currentSpeed > maxSpeed) {
            this.velX = (this.velX / currentSpeed) * maxSpeed;
            this.velY = (this.velY / currentSpeed) * maxSpeed;
        }


        // Update position
        this.x += this.velX;
        this.y += this.velY;
        this.rotation += this.rotationSpeed;

        // Bouncy Border Logic
        if (appSettings.bouncyBorder) {
            const radius = this.size / 2; // Effective radius for collision
            if (this.x - radius < 0) {
                this.x = radius;
                this.velX *= -1;
            } else if (this.x + radius > width) {
                this.x = width - radius;
                this.velX *= -1;
            }
            if (this.y - radius < 0) {
                this.y = radius;
                this.velY *= -1;
            } else if (this.y + radius > height) {
                this.y = height - radius;
                this.velY *= -1;
            }
        }

        // Collision with other shapes (same as before)
        for (let other of shapes) {
            if (other !== this) {
                // ... (previous detailed elastic collision logic) ...
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distCenter = sqrt(dx * dx + dy * dy);
                let minDist = (this.size + other.size) / 2;

                if (distCenter < minDist && distCenter > 0) { 
                    let overlap = (minDist - distCenter);
                    let angle = atan2(dy, dx); 
                    let moveX = cos(angle) * overlap * 0.5; 
                    let moveY = sin(angle) * overlap * 0.5;

                    this.x -= moveX; this.y -= moveY;
                    other.x += moveX; other.y += moveY;

                    let normalX = dx / distCenter; 
                    let normalY = dy / distCenter;
                    let relVelX = this.velX - other.velX;
                    let relVelY = this.velY - other.velY;
                    let velAlongNormal = relVelX * normalX + relVelY * normalY;

                    if (velAlongNormal > 0) continue; 

                    let restitution = 0.8; 
                    let invMassSum = (1 / this.mass) + (1 / other.mass);
                    if (invMassSum === 0) continue; 
                    
                    let impulse = (-(1 + restitution) * velAlongNormal) / invMassSum;
                    
                    let impulseX = impulse * normalX;
                    let impulseY = impulse * normalY;

                    this.velX += impulseX / this.mass;
                    this.velY += impulseY / this.mass;
                    other.velX -= impulseX / other.mass;
                    other.velY -= impulseY / other.mass;
                }
            }
        }
    }

    isOffScreen() {
        // This method is still useful for the non-bouncy case
        const margin = this.size * 1.5; 
        return (
            this.x + margin < 0 ||
            this.x - margin > width ||
            this.y + margin < 0 ||
            this.y - margin > height 
        );
    }

    display() { /* ... (same as before) ... */ }
}
