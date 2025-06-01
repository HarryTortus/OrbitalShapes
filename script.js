// script.js for Orbital Shapes (Complete)

let shapes = [];
// HTML Element References
let gravitySliderEl, lSystemSliderEl, sizeSliderEl;
let motionButtonEl, restartButtonEl, fullscreenButtonEl;
let circleButtonEl, squareButtonEl, triangleButtonEl;
let p5Canvas; // To hold the p5.js canvas element

let versionNumber = "0.50"; // Updated version
let selectedShape = 'circle'; // Default selected shape
let motionActive = false;
const MAX_SHAPES = 100;

// App-specific settings
const appSettings = {
    backgroundColor: '#000000', // Canvas background for Orbital Shapes
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
    if (canvasPlaceholder && p5Canvas) {
        p5Canvas.parent(canvasPlaceholder); // Parent it to the placeholder
    } else {
        console.error("Canvas placeholder not found or canvas could not be created.");
        return;
    }

    frameRate(30);
    // Initial background draw will be handled by the first call to windowResized()

    setupControls(); // Initialize and get references to HTML controls
    windowResized(); // Call to set initial canvas size and draw background
}

function setupControls() {
    // Get button elements
    motionButtonEl = document.getElementById('motionButton');
    restartButtonEl = document.getElementById('restartButton');
    fullscreenButtonEl = document.getElementById('fullscreenButton');

    // Get slider elements
    gravitySliderEl = document.getElementById('gravitySlider');
    lSystemSliderEl = document.getElementById('lSystemSlider');
    sizeSliderEl = document.getElementById('sizeSlider');

    // Get shape selector button elements
    circleButtonEl = document.getElementById('circleButton');
    squareButtonEl = document.getElementById('squareButton');
    triangleButtonEl = document.getElementById('triangleButton');

    // Check if all elements were found (basic check)
    if (!(motionButtonEl && restartButtonEl && fullscreenButtonEl && gravitySliderEl && lSystemSliderEl && sizeSliderEl && circleButtonEl && squareButtonEl && triangleButtonEl)) {
        console.error("One or more control elements could not be found in the DOM. Check IDs.");
        return; // Stop setup if critical elements are missing
    }

    // Set initial values for sliders from appSettings or HTML default
    appSettings.gravity = parseFloat(gravitySliderEl.value);
    appSettings.randomize = parseFloat(lSystemSliderEl.value);
    appSettings.size = parseFloat(sizeSliderEl.value);
    
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
        
        appSettings.gravity = parseFloat(gravitySliderEl.value);
        appSettings.randomize = parseFloat(lSystemSliderEl.value);
        appSettings.size = parseFloat(sizeSliderEl.value);

        document.querySelectorAll('.controls input[type="range"]').forEach(slider => {
            updateSliderValueDisplay(slider);
            updateRangeSliderFill(slider);
        });
        motionActive = false; 
        motionButtonEl.innerHTML = '▶';
        if (typeof background === 'function' && appSettings.backgroundColor) {
            background(appSettings.backgroundColor); // Clear canvas
        }
    });

    fullscreenButtonEl.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(`Fullscreen error: ${err.message} (${err.name})`));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    });

    gravitySliderEl.addEventListener('input', () => handleSliderInput(gravitySliderEl, 'gravity'));
    lSystemSliderEl.addEventListener('input', () => handleSliderInput(lSystemSliderEl, 'randomize'));
    sizeSliderEl.addEventListener('input', () => handleSliderInput(sizeSliderEl, 'size'));

    circleButtonEl.addEventListener('click', () => selectShapeHandler('circle'));
    squareButtonEl.addEventListener('click', () => selectShapeHandler('square'));
    triangleButtonEl.addEventListener('click', () => selectShapeHandler('triangle'));

    updateShapeButtonVisuals(); // Initialize active shape button style

    const versionDisplayEl = document.getElementById('versionDisplay');
    if(versionDisplayEl) versionDisplayEl.textContent = `v${versionNumber}`;

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(event =>
        document.addEventListener(event, () => windowResized())
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
        let value = parseFloat(sliderElement.value);
        // Check if step is decimal to determine precision
        let step = parseFloat(sliderElement.step);
        if (step > 0 && step < 1) { // If step is like 0.1, 0.01 etc.
            let decimalPlaces = Math.max(0, (step.toString().split('.')[1] || '').length);
            valueDisplayElement.textContent = value.toFixed(decimalPlaces);
        } else {
            valueDisplayElement.textContent = value.toFixed(0);
        }
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

function draw() {
    // Use a hex alpha value for trails. '1A' is ~10% opacity, '33' is ~20%.
    // For very subtle trails, try a lower alpha. For no trails, just use appSettings.backgroundColor.
    let bgColor = appSettings.backgroundColor;
    if (bgColor.length === 7) { // if it's #RRGGBB
        background(color(bgColor + '2A')); // Appending alpha, e.g. #0000002A for subtle trails
    } else {
        background(bgColor); // Fallback if it's not a 6-digit hex
    }


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
    const mainTitle = document.getElementById('mainTitle');
    const controlsPanel = document.getElementById('controlsPanel');
    const sketchContainer = document.getElementById('sketch-container');
    const siteFooter = document.getElementById('site-footer');

    let newCanvasWidth, newCanvasHeight;
    
    // Try to get actual margin from canvas if it exists, otherwise default
    let canvasMarginBottom = 15; // Default
    const canvasEl = document.querySelector('#p5-canvas-placeholder canvas');
    if (canvasEl && sketchContainer) { // Ensure sketchContainer also exists for context
        canvasMarginBottom = parseFloat(getComputedStyle(canvasEl).marginBottom);
    }


    if (document.fullscreenElement) {
        document.body.classList.add('fullscreen-active');
        newCanvasWidth = window.innerWidth;
        newCanvasHeight = window.innerHeight;
    } else {
        document.body.classList.remove('fullscreen-active');

        if (!sketchContainer) { // Guard against missing sketchContainer
             console.error("Sketch container not found during resize.");
             newCanvasWidth = window.innerWidth * 0.8; // Fallback
             newCanvasHeight = window.innerHeight * 0.5; // Fallback
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

        newCanvasHeight = maxCanvasHeight; // Fill available vertical space
        
        newCanvasWidth = Math.max(50, newCanvasWidth); 
        newCanvasHeight = Math.max(50, Math.min(4000, newCanvasHeight)); // Min height 50, Max reasonable height
    }

    if (typeof resizeCanvas === 'function') { // p5.js global mode
        resizeCanvas(newCanvasWidth, newCanvasHeight);
    }
    
    if (typeof background === 'function' && appSettings && appSettings.backgroundColor) {
      background(appSettings.backgroundColor); 
    }
}

// Original Interaction Logic (mouse/touch)
function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) { // Check canvas bounds
        if (shapes.length >= MAX_SHAPES) {
            shapes.shift(); 
        }
        let s = new Shape(mouseX, mouseY, selectedShape);
        shapes.push(s);
        return false; // Prevent default browser actions
    }
}

let touchStartX, touchStartY; // Store initial touch position for tap-like behavior

function touchStarted() {
    if (touches.length > 0) {
        const touchX = touches[0].x;
        const touchY = touches[0].y;
        if (touchX > 0 && touchX < width && touchY > 0 && touchY < height) { // Check canvas bounds
            touchStartX = touchX; // Store start position for a tap
            touchStartY = touchY;
            // Spawning on touchEnd now to avoid issues with multi-touch or drag attempts
            return false; // Prevent default actions like scrolling
        }
    }
}

function touchEnded() {
    // Check if it was a simple tap (no significant movement from touchStartX/Y)
    // and if touchStartX/Y were set (meaning touchStarted inside canvas)
    if (touchStartX !== undefined && touchStartY !== undefined && touches.length === 0) { 
        // You might add a small threshold here if you want to allow minor drag for a tap
        // For now, any release after a start inside canvas is a tap.
        if (shapes.length >= MAX_SHAPES) {
            shapes.shift();
        }
        let s = new Shape(touchStartX, touchStartY, selectedShape);
        shapes.push(s);
    }
    // Reset touch start coordinates
    touchStartX = undefined;
    touchStartY = undefined;
}


// Shape class (using appSettings for slider values)
class Shape {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = appSettings.size; // Use global appSettings
        this.updateMass();
        this.velX = random(-0.5, 0.5);
        this.velY = random(-0.5, 0.5);
        this.color = color(random(180, 255), random(180, 255), random(180, 255), 220); // Brighter, slightly less alpha
        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.03, 0.03); // Slightly slower rotation
    }

    updateMass() {
        // Using a more area-proportional mass, then scaled
        let area;
        if (this.type === 'circle') {
            area = PI * pow(this.size / 2, 2);
        } else if (this.type === 'square') {
            area = pow(this.size, 2);
        } else if (this.type === 'triangle') {
            // Area of equilateral triangle: (sqrt(3)/4) * side^2. Assuming this.size is related to side.
            // For simplicity, treat it similar to square/circle for now or use a rough factor.
            area = (sqrt(3) / 4) * pow(this.size, 2); 
        } else {
            area = pow(this.size, 2); // Default
        }
        this.mass = constrain(area / 200, 0.5, 50); // Scaled and constrained mass
    }

    update() {
        // Gravitational pull
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);
                
                // Prevent extreme forces at very small distances / division by zero
                let minInteractionDistance = (this.size + other.size) / 4; // Allow closer interaction before clamping
                distance = max(distance, minInteractionDistance); 
                
                let forceMagnitude = (appSettings.gravity * this.mass * other.mass) / (distance * distance);
                
                // Simple collision/overlap based repulsion (stronger if very close)
                if (distance < (this.size + other.size) / 2) { 
                   forceMagnitude = -forceMagnitude * 2; // Repulsive force if overlapping
                }

                let angle = atan2(dy, dx);
                let forceX = cos(angle) * forceMagnitude;
                let forceY = sin(angle) * forceMagnitude;

                this.velX += forceX / this.mass;
                this.velY += forceY / this.mass;
                // Simpler gravity - not applying equal/opposite to others to make it less chaotic
            }
        }

        // Randomize Movement
        const noiseStrength = appSettings.randomize * 0.005; // Adjusted strength
        this.velX += (noise(this.x * 0.01, this.y * 0.01, frameCount * 0.005) - 0.5) * noiseStrength;
        this.velY += (noise(this.x * 0.01 + 100, this.y * 0.01 + 100, frameCount * 0.005) - 0.5) * noiseStrength;

        // Speed limit
        const maxSpeed = 3 + appSettings.gravity; // Max speed can increase slightly with gravity
        let currentSpeed = sqrt(this.velX * this.velX + this.velY * this.velY);
        if (currentSpeed > maxSpeed) {
            this.velX = (this.velX / currentSpeed) * maxSpeed;
            this.velY = (this.velY / currentSpeed) * maxSpeed;
        }

        this.x += this.velX;
        this.y += this.velY;
        this.rotation += this.rotationSpeed;

        // Collision with other shapes (more detailed elastic collision)
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distCenter = sqrt(dx * dx + dy * dy);
                let minDist = (this.size + other.size) / 2;

                if (distCenter < minDist && distCenter > 0) { // Added distCenter > 0
                    // Resolve overlap first
                    let overlap = (minDist - distCenter);
                    let angle = atan2(dy, dx); // dx and dy are from this to other
                    let moveX = cos(angle) * overlap * 0.5; // move 'this' away from 'other'
                    let moveY = sin(angle) * overlap * 0.5;

                    this.x -= moveX; this.y -= moveY;
                    other.x += moveX; other.y += moveY;

                    // Elastic collision response
                    let normalX = dx / distCenter; // Normal from this to other
                    let normalY = dy / distCenter;
                    let relVelX = this.velX - other.velX;
                    let relVelY = this.velY - other.velY;
                    let velAlongNormal = relVelX * normalX + relVelY * normalY;

                    if (velAlongNormal > 0) continue; // Objects are already moving apart along this normal

                    let restitution = 0.8; // Coefficient of restitution
                    // Total mass for impulse calculation: 1/m1 + 1/m2 = (m1+m2)/(m1*m2)
                    // Impulse magnitude j = -(1+e) * velAlongNormal / (1/m1 + 1/m2)
                    let invMassSum = (1 / this.mass) + (1 / other.mass);
                    if (invMassSum === 0) continue; // Avoid division by zero if masses are infinite (should not happen here)
                    
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
        const margin = this.size * 1.5; // Adjusted margin
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
            let r = this.size * 0.577; // Factor to make equilateral triangle side roughly 'this.size'
            triangle(0, -r * 2/sqrt(3) * 0.866,  // Top point
                    -r, r / sqrt(3) * 0.866,      // Bottom-left
                     r, r / sqrt(3) * 0.866);     // Bottom-right
        }
        pop();
    }
}

// Helper function (if needed elsewhere, currently not used by this revised script)
// function clamp(value, min, max) {
//     return Math.max(min, Math.min(max, value));
// }
