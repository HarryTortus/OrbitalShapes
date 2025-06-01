// script.js for Orbital Shapes (v0.51 - Bouncy Border & Vibrancy)

let shapes = [];
// HTML Element References
let gravitySliderEl, lSystemSliderEl, sizeSliderEl;
let motionButtonEl, restartButtonEl, fullscreenButtonEl, bouncyBorderToggleEl; // Added bouncyBorderToggleEl
let circleButtonEl, squareButtonEl, triangleButtonEl;
let p5Canvas; 

let versionNumber = "0.51"; // Updated version
let selectedShape = 'circle'; 
let motionActive = false;
const MAX_SHAPES = 100;

// App-specific settings
const appSettings = {
    backgroundColor: '#000000', 
    gravity: 2.5,
    randomize: 0,
    size: 20,
    bouncyBorder: false // New setting for bouncy border
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
        console.error("One or more control elements could not be found in the DOM. Check IDs.");
        return; 
    }

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
        // Reset to default values from appSettings initial or desired defaults
        appSettings.gravity = 2.5; 
        appSettings.randomize = 0;   
        appSettings.size = 20;    
        appSettings.bouncyBorder = false; // Reset bouncy border on restart
        
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
            // Remove shapes if they go off-screen AND bouncy borders are OFF
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

function windowResized() {
    const mainTitle = document.getElementById('mainTitle');
    const controlsPanel = document.getElementById('controlsPanel');
    const sketchContainer = document.getElementById('sketch-container');
    const siteFooter = document.getElementById('site-footer');

    let newCanvasWidth, newCanvasHeight;
    
    let canvasMarginBottom = 15; 
    const canvasEl = document.querySelector('#p5-canvas-placeholder canvas');
    if (canvasEl && sketchContainer) { 
        canvasMarginBottom = parseFloat(getComputedStyle(canvasEl).marginBottom);
        if(isNaN(canvasMarginBottom)) canvasMarginBottom = 15; // Fallback if parse fails
    }


    if (document.fullscreenElement) {
        document.body.classList.add('fullscreen-active');
        newCanvasWidth = window.innerWidth;
        newCanvasHeight = window.innerHeight;
    } else {
        document.body.classList.remove('fullscreen-active');

        if (!sketchContainer) { 
             console.error("Sketch container not found during resize.");
             newCanvasWidth = window.innerWidth * 0.8; 
             newCanvasHeight = window.innerHeight * 0.5; 
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
}

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


// Shape class (using appSettings for slider values)
class Shape {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = appSettings.size; 
        this.updateMass();
        this.velX = random(-0.5, 0.5);
        this.velY = random(-0.5, 0.5);
        
        // VIBRANT COLORS using HSB mode
        push(); // Isolate colorMode change
        colorMode(HSB, 360, 100, 100); // Hue, Saturation, Brightness (max values)
        this.color = color(random(360), 90 + random(10), 90 + random(10) ); // Random hue, high saturation & brightness
        pop(); // Restore previous colorMode (usually RGB by default after this)

        this.rotation = random(TWO_PI);
        this.rotationSpeed = random(-0.03, 0.03); 
    }

    updateMass() {
        let area;
        if (this.type === 'circle') {
            area = PI * pow(this.size / 2, 2);
        } else if (this.type === 'square') {
            area = pow(this.size, 2);
        } else if (this.type === 'triangle') {
            area = (sqrt(3) / 4) * pow(this.size, 2); 
        } else {
            area = pow(this.size, 2); 
        }
        this.mass = constrain(area / 150, 0.5, 50); 
    }

    update() {
        // 1. Apply Forces (Gravity, Randomize) - (Same as your v0.50)
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

        // 2. Speed Limit - (Same as your v0.50)
        const maxSpeed = 3 + appSettings.gravity; 
        let currentSpeed = sqrt(this.velX * this.velX + this.velY * this.velY);
        if (currentSpeed > maxSpeed) {
            this.velX = (this.velX / currentSpeed) * maxSpeed;
            this.velY = (this.velY / currentSpeed) * maxSpeed;
        }

        // 3. Update Position
        this.x += this.velX;
        this.y += this.velY;
        this.rotation += this.rotationSpeed;

        // 4. Inter-Shape Collisions (ALWAYS ON) - (Same as your v0.50)
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
                    let restitution = 0.8; 
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
        
        // 5. Bouncy Border Logic (Conditional Deflection) - NEW
        if (appSettings.bouncyBorder) {
            const radius = this.size / 2; 

            if (this.x - radius < 0 && this.velX < 0) { 
                this.x = radius;        
                this.velX *= -1;        
            } else if (this.x + radius > width && this.velX > 0) { 
                this.x = width - radius; 
                this.velX *= -1;        
            }

            if (this.y - radius < 0 && this.velY < 0) { 
                this.y = radius;        
                this.velY *= -1;        
            } else if (this.y + radius > height && this.velY > 0) { 
                this.y = height - radius; 
                this.velY *= -1;        
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

    display() { // Same as your v0.50
        noStroke();
        fill(this.color); // This will now use the vibrant HSB-defined color
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
