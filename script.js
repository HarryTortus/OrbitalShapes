// script.js for Orbital Shapes (Corrected Setup & Bouncy Border)

let shapes = [];
// HTML Element References (will be assigned in setupControls)
let gravitySliderEl, lSystemSliderEl, sizeSliderEl;
let motionButtonEl, restartButtonEl, fullscreenButtonEl, bouncyBorderToggleEl;
let circleButtonEl, squareButtonEl, triangleButtonEl;
let p5Canvas; 

let versionNumber = "0.51"; // Updated version
let selectedShape = 'circle'; 
let motionActive = false;
const MAX_SHAPES = 100;

const appSettings = {
    backgroundColor: '#000000', 
    gravity: 2.5,
    randomize: 0,
    size: 20,
    bouncyBorder: false 
};

// --- UTILITY FUNCTIONS ---
function updateRangeSliderFill(inputElement) {
    if (!inputElement) return;
    const min = parseFloat(inputElement.min || 0);
    const max = parseFloat(inputElement.max || 1);
    const value = parseFloat(inputElement.value);
    const percentage = ((value - min) / (max - min)) * 100;
    inputElement.style.setProperty('--range-progress', `${percentage}%`);
}

// --- P5.JS SETUP & DRAW ---
function setup() {
    console.log("p5.js setup() called.");
    const canvasPlaceholder = document.getElementById('p5-canvas-placeholder');
    p5Canvas = createCanvas(1, 1); 
    if (canvasPlaceholder && p5Canvas) {
        p5Canvas.parent(canvasPlaceholder); 
        console.log("Canvas created and parented to #p5-canvas-placeholder.");
    } else {
        console.error("FATAL: Canvas placeholder #p5-canvas-placeholder not found or p5.js canvas could not be created.");
        // No field will appear if this happens.
        return; 
    }
    frameRate(30);
    
    if (!setupControls()) { // If setupControls returns false, it means a critical error.
        console.error("FATAL: setupControls() failed due to missing HTML elements. Field may not appear or function correctly.");
        // We might still attempt to draw a canvas, but controls will be broken.
        // For robustness, it might be better to halt or show an error to the user on the page.
    }
    
    windowResized(); // Always call to size the canvas.
    console.log("p5.js setup() finished.");
}

function draw() {
    let bgColor = appSettings.backgroundColor;
    if (bgColor && bgColor.length === 7 && bgColor.startsWith('#')) { 
        background(color(bgColor + '2A')); 
    } else {
        background(bgColor || '#000000'); 
    }

    if (motionActive) {
        for (let i = shapes.length - 1; i >= 0; i--) {
            shapes[i].update();
            shapes[i].display();
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

// --- CONTROL UI SETUP ---
function setupControls() {
    console.log("setupControls() called.");
    let allControlsFound = true;

    // Get elements and check each one immediately
    motionButtonEl = document.getElementById('motionButton');
    if (!motionButtonEl) { console.error("HTML Control Error: Element with ID 'motionButton' not found."); allControlsFound = false; }

    restartButtonEl = document.getElementById('restartButton');
    if (!restartButtonEl) { console.error("HTML Control Error: Element with ID 'restartButton' not found."); allControlsFound = false; }

    fullscreenButtonEl = document.getElementById('fullscreenButton');
    if (!fullscreenButtonEl) { console.error("HTML Control Error: Element with ID 'fullscreenButton' not found."); allControlsFound = false; }

    bouncyBorderToggleEl = document.getElementById('bouncyBorderToggle');
    if (!bouncyBorderToggleEl) { console.error("HTML Control Error: Element with ID 'bouncyBorderToggle' not found."); allControlsFound = false; }

    gravitySliderEl = document.getElementById('gravitySlider');
    if (!gravitySliderEl) { console.error("HTML Control Error: Element with ID 'gravitySlider' not found."); allControlsFound = false; }

    lSystemSliderEl = document.getElementById('lSystemSlider');
    if (!lSystemSliderEl) { console.error("HTML Control Error: Element with ID 'lSystemSlider' not found."); allControlsFound = false; }

    sizeSliderEl = document.getElementById('sizeSlider');
    if (!sizeSliderEl) { console.error("HTML Control Error: Element with ID 'sizeSlider' not found."); allControlsFound = false; }

    circleButtonEl = document.getElementById('circleButton');
    if (!circleButtonEl) { console.error("HTML Control Error: Element with ID 'circleButton' not found."); allControlsFound = false; }

    squareButtonEl = document.getElementById('squareButton');
    if (!squareButtonEl) { console.error("HTML Control Error: Element with ID 'squareButton' not found."); allControlsFound = false; }

    triangleButtonEl = document.getElementById('triangleButton');
    if (!triangleButtonEl) { console.error("HTML Control Error: Element with ID 'triangleButton' not found."); allControlsFound = false; }

    if (!allControlsFound) {
        // If any critical element is missing, it's not safe to proceed with setting values or adding listeners.
        return false; // Indicate setup failure
    }
    
    // Initialize controls FROM THEIR HTML 'value' ATTRIBUTES or appSettings defaults
    // This prevents errors if an element was technically found but something else is wrong with appSettings.
    // The HTML should be the source of truth for initial default values where possible.
    gravitySliderEl.value = appSettings.gravity; // This was the line causing the error if gravitySliderEl was null
    lSystemSliderEl.value = appSettings.randomize;
    sizeSliderEl.value = appSettings.size;
    bouncyBorderToggleEl.checked = appSettings.bouncyBorder; 

    // Update appSettings from the actual initial values of the controls
    appSettings.gravity = parseFloat(gravitySliderEl.value);
    appSettings.randomize = parseFloat(lSystemSliderEl.value);
    appSettings.size = parseFloat(sizeSliderEl.value);
    // bouncyBorder already set from appSettings.bouncyBorder

    document.querySelectorAll('.controls input[type="range"]').forEach(slider => {
        updateSliderValueDisplay(slider);
        updateRangeSliderFill(slider); 
    });
    
    // Event Listeners
    motionButtonEl.addEventListener('click', () => {
        motionActive = !motionActive;
        motionButtonEl.innerHTML = motionActive ? '⏸' : '▶';
    });

    restartButtonEl.addEventListener('click', () => {
        shapes = [];
        // Reset to default values defined in appSettings initial state
        appSettings.gravity = 2.5; 
        appSettings.randomize = 0;   
        appSettings.size = 20;    
        appSettings.bouncyBorder = false; 
        
        // Update HTML controls to reflect these defaults
        gravitySliderEl.value = appSettings.gravity;
        lSystemSliderEl.value = appSettings.randomize;
        sizeSliderEl.value = appSettings.size;
        bouncyBorderToggleEl.checked = appSettings.bouncyBorder;

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

    fullscreenButtonEl.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message} (${err.name})`));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    });

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
        document.addEventListener(event, windowResized)
    );
    console.log("setupControls() finished successfully.");
    return true; 
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
        let value = parseFloat(sliderElement.value);
        let step = parseFloat(sliderElement.step);
        let decimalPlaces = 0;
        if (step > 0 && step < 1) { 
            const stepString = step.toString();
            if (stepString.includes('.')) {
                decimalPlaces = stepString.split('.')[1].length;
            }
        }
        valueDisplayElement.textContent = value.toFixed(decimalPlaces);
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
        if (item.el) { 
            if (item.shape === selectedShape) {
                item.el.classList.add('active-shape');
            } else {
                item.el.classList.remove('active-shape');
            }
        }
    });
}

function windowResized() {
    console.log("windowResized() called.");
    const mainTitle = document.getElementById('mainTitle');
    const controlsPanel = document.getElementById('controlsPanel');
    const sketchContainer = document.getElementById('sketch-container');
    const siteFooter = document.getElementById('site-footer');

    let newCanvasWidth, newCanvasHeight;
    
    let canvasMarginBottom = 15; 
    if (p5Canvas && p5Canvas.elt && p5Canvas.elt.parentNode) { 
        const currentMargin = parseFloat(getComputedStyle(p5Canvas.elt).marginBottom);
        if (!isNaN(currentMargin)) {
            canvasMarginBottom = currentMargin;
        }
    }

    if (document.fullscreenElement) {
        document.body.classList.add('fullscreen-active');
        newCanvasWidth = window.innerWidth;
        newCanvasHeight = window.innerHeight;
    } else {
        document.body.classList.remove('fullscreen-active');

        if (!sketchContainer) { 
             console.error("Sketch container not found during resize! Using fallback dimensions.");
             newCanvasWidth = Math.max(50, window.innerWidth * 0.8); 
             newCanvasHeight = Math.max(50, window.innerHeight * 0.5);
        } else {
            newCanvasWidth = sketchContainer.clientWidth; 
        }

        const titleStyle = mainTitle ? window.getComputedStyle(mainTitle) : { marginTop: '0px', marginBottom: '0px' };
        const titleHeight = mainTitle ? (mainTitle.offsetHeight + parseFloat(titleStyle.marginTop) + parseFloat(titleStyle.marginBottom)) : 0;
        
        const controlsPanelStyle = controlsPanel ? window.getComputedStyle(controlsPanel) : { marginTop: '0px', marginBottom: '0px' };
        const controlsHeight = controlsPanel ? (controlsPanel.offsetHeight + parseFloat(controlsPanelStyle.marginTop) + parseFloat(controlsPanelStyle.marginBottom)) : 0;
        
        const footerStyle = siteFooter ? window.getComputedStyle(siteFooter) : { marginTop: '0px', marginBottom: '0px' };
        const footerTotalHeight = siteFooter ? (siteFooter.offsetHeight + parseFloat(footerStyle.marginTop) + parseFloat(footerStyle.marginBottom)) : 0;

        const bodyStyle = window.getComputedStyle(document.body);
        const bodyVerticalPadding = parseFloat(bodyStyle.paddingTop) + parseFloat(bodyStyle.paddingBottom);
        
        let availableHeightForCanvasBlock = window.innerHeight - bodyVerticalPadding - titleHeight - controlsHeight - footerTotalHeight;
        let maxCanvasHeight = availableHeightForCanvasBlock - canvasMarginBottom;

        newCanvasHeight = maxCanvasHeight; 
        
        newCanvasWidth = Math.max(50, newCanvasWidth); 
        newCanvasHeight = Math.max(50, Math.min(4000, newCanvasHeight)); 
    }

    if (typeof resizeCanvas === 'function') {
        resizeCanvas(newCanvasWidth, newCanvasHeight);
    }
    
    if (typeof background === 'function' && appSettings && appSettings.backgroundColor) {
      background(appSettings.backgroundColor); 
    }
    console.log("windowResized() finished, canvas: " + newCanvasWidth + "x" + newCanvasHeight);
}

// --- MOUSE & TOUCH INPUT ---
function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) { 
        if (shapes.length >= MAX_SHAPES) {
            shapes.shift(); 
        }
        let s = new Shape(mouseX, mouseY, selectedShape);
        shapes.push(s);
        return false; 
    }
}

let touchStartX, touchStartY; 

function touchStarted() {
    if (touches.length > 0) {
        const touchX = touches[0].x;
        const touchY = touches[0].y;
        if (touchX > 0 && touchX < width && touchY > 0 && touchY < height) { 
            touchStartX = touchX; 
            touchStartY = touchY;
            return false; 
        }
    }
}

function touchEnded() {
    if (touchStartX !== undefined && touchStartY !== undefined && touches.length === 0) { 
        if (shapes.length >= MAX_SHAPES) {
            shapes.shift();
        }
        let s = new Shape(touchStartX, touchStartY, selectedShape);
        shapes.push(s);
    }
    touchStartX = undefined;
    touchStartY = undefined;
}


// --- SHAPE CLASS ---
class Shape {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = appSettings.size; 
        this.updateMass();
        this.velX = random(-0.5, 0.5);
        this.velY = random(-0.5, 0.5);
        // Vibrant colors
        this.color = color(random(200, 255), random(200, 255), random(200, 255)); 
        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.03, 0.03); 
    }

    updateMass() { /* ... (same as previous working version) ... */ }

    update() {
        // 1. Apply Forces (Gravity, Randomize)
        // ... (Gravity and Randomize logic from previous working version) ...
        // Gravity:
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);
                let minInteractionDistance = (this.size + other.size) / 4; // Example value
                distance = max(distance, minInteractionDistance); 
                
                let forceMagnitude = (appSettings.gravity * this.mass * other.mass) / (distance * distance);
                
                if (distance < (this.size + other.size) / 2.5) { 
                   forceMagnitude = -forceMagnitude * 0.5; 
                }

                let angle = atan2(dy, dx);
                let forceX = cos(angle) * forceMagnitude;
                let forceY = sin(angle) * forceMagnitude;
                this.velX += forceX / this.mass;
                this.velY += forceY / this.mass;
            }
        }
        // Randomize:
        const noiseStrength = appSettings.randomize * 0.005; 
        this.velX += (noise(this.x * 0.01, this.y * 0.01, frameCount * 0.005) - 0.5) * noiseStrength;
        this.velY += (noise(this.x * 0.01 + 100, this.y * 0.01 + 100, frameCount * 0.005) - 0.5) * noiseStrength;


        // 2. Speed Limit
        // ... (Speed limit logic from previous working version) ...
        const maxSpeed = 2.5 + appSettings.gravity * 0.5; 
        let currentSpeed = sqrt(this.velX * this.velX + this.velY * this.velY);
        if (currentSpeed > maxSpeed) {
            this.velX = (this.velX / currentSpeed) * maxSpeed;
            this.velY = (this.velY / currentSpeed) * maxSpeed;
        }


        // 3. Update Position
        this.x += this.velX;
        this.y += this.velY;
        this.rotation += this.rotationSpeed;

        // 4. Inter-Shape Collisions (ALWAYS ON)
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distCenter = sqrt(dx * dx + dy * dy);
                let minDist = (this.size + other.size) / 2;

                if (distCenter < minDist && distCenter > 0.001) { 
                    let overlap = (minDist - distCenter);
                    let normalX = dx / distCenter;
                    let normalY = dy / distCenter;
                    
                    let moveX = normalX * overlap * 0.5; 
                    let moveY = normalY * overlap * 0.5;

                    this.x -= moveX; this.y -= moveY;
                    other.x += moveX; other.y += moveY;

                    let relVelX = this.velX - other.velX;
                    let relVelY = this.velY - other.velY;
                    let velAlongNormal = relVelX * normalX + relVelY * normalY;

                    if (velAlongNormal > 0) continue; 

                    let restitution = 0.75; 
                    let invMassSum = (1 / this.mass) + (1 / other.mass);
                    if (invMassSum <= 0) invMassSum = 0.0001; 
                    
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
        
        // 5. Bouncy Border Logic (Conditional Deflection)
        if (appSettings.bouncyBorder) {
            const radius = this.size / 2; 

            if (this.x - radius < 0 && this.velX < 0) { // Moving left and hitting left wall
                this.x = radius;        // Correct position
                this.velX *= -1;        // Simple deflection (reverse horizontal velocity)
            } else if (this.x + radius > width && this.velX > 0) { // Moving right and hitting right wall
                this.x = width - radius; // Correct position
                this.velX *= -1;        // Simple deflection
            }

            if (this.y - radius < 0 && this.velY < 0) { // Moving up and hitting top wall
                this.y = radius;        // Correct position
                this.velY *= -1;        // Simple deflection (reverse vertical velocity)
            } else if (this.y + radius > height && this.velY > 0) { // Moving down and hitting bottom wall
                this.y = height - radius; // Correct position
                this.velY *= -1;        // Simple deflection
            }
        }
    }

    isOffScreen() {
        const margin = this.size * 1.5; 
        return (
            this.x + margin < 0 ||
            this.x - margin > width ||
            this.y + margin < 0 ||
            this.y - margin > height 
        );
    }

    display() {
        noStroke();
        fill(this.color);
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        rectMode(CENTER); 
        if (this.type === 'circle') {
            ellipse(0, 0, this.size, this.size);
        } else if (this.type === 'square') {
            rect(0, 0, this.size, this.size);
        } else if (this.type === 'triangle') {
            let h = this.size * (sqrt(3)/2); 
            triangle(0, -h * 2/3, -this.size/2, h * 1/3, this.size/2, h * 1/3);
        }
        pop();
    }
}
