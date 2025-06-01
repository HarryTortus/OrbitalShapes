// script.js for Orbital Shapes (Troubleshooting Version)

let shapes = [];
// HTML Element References
let gravitySliderEl, lSystemSliderEl, sizeSliderEl;
let motionButtonEl, restartButtonEl, fullscreenButtonEl, bouncyBorderToggleEl;
let circleButtonEl, squareButtonEl, triangleButtonEl;
let p5Canvas; 

let versionNumber = "0.49"; // Or your current version
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

function updateRangeSliderFill(inputElement) {
    if (!inputElement) return;
    const min = parseFloat(inputElement.min || 0);
    const max = parseFloat(inputElement.max || 1);
    const value = parseFloat(inputElement.value);
    const percentage = ((value - min) / (max - min)) * 100;
    inputElement.style.setProperty('--range-progress', `${percentage}%`);
}

function setup() {
    console.log("p5.js setup() called.");
    const canvasPlaceholder = document.getElementById('p5-canvas-placeholder');
    p5Canvas = createCanvas(1, 1); 
    if (canvasPlaceholder && p5Canvas) {
        p5Canvas.parent(canvasPlaceholder); 
        console.log("Canvas created and parented to #p5-canvas-placeholder.");
    } else {
        console.error("FATAL: Canvas placeholder #p5-canvas-placeholder not found or p5.js canvas could not be created.");
        return; 
    }
    frameRate(30);
    
    if (!setupControls()) {
        console.error("FATAL: setupControls() failed. The simulation might be unstable or controls non-functional.");
    }
    
    windowResized(); 
    console.log("p5.js setup() finished.");
}

function setupControls() {
    console.log("setupControls() called.");
    const controlIds = {
        motionButtonEl: 'motionButton',
        restartButtonEl: 'restartButton',
        fullscreenButtonEl: 'fullscreenButton',
        bouncyBorderToggleEl: 'bouncyBorderToggle',
        gravitySliderEl: 'gravitySlider',
        lSystemSliderEl: 'lSystemSlider',
        sizeSliderEl: 'sizeSlider',
        circleButtonEl: 'circleButton',
        squareButtonEl: 'squareButton',
        triangleButtonEl: 'triangleButton'
    };

    let allControlsFound = true;

    // Assign elements and check
    // This creates global variables, which is okay in this p5 sketch context
    motionButtonEl = document.getElementById(controlIds.motionButtonEl);
    restartButtonEl = document.getElementById(controlIds.restartButtonEl);
    fullscreenButtonEl = document.getElementById(controlIds.fullscreenButtonEl);
    bouncyBorderToggleEl = document.getElementById(controlIds.bouncyBorderToggleEl);
    gravitySliderEl = document.getElementById(controlIds.gravitySliderEl);
    lSystemSliderEl = document.getElementById(controlIds.lSystemSliderEl);
    sizeSliderEl = document.getElementById(controlIds.sizeSliderEl);
    circleButtonEl = document.getElementById(controlIds.circleButtonEl);
    squareButtonEl = document.getElementById(controlIds.squareButtonEl);
    triangleButtonEl = document.getElementById(controlIds.triangleButtonEl);

    // Check if elements were found by checking the global variables directly
    for (const elVarKey in controlIds) {
        // A bit of a trick: window[elVarKey] accesses the global variable named by the string elVarKey
        if (!window[elVarKey.substring(0, elVarKey.length -2)]) { // e.g., motionButtonEl from "motionButtonEl" key
            console.error(`Control element with ID '${controlIds[elVarKey]}' (expected as ${elVarKey}) not found.`);
            allControlsFound = false;
        }
    }
    
    if (!allControlsFound) {
        console.error("One or more critical control elements are missing from the HTML or have incorrect IDs. UI setup cannot proceed reliably.");
        return false; // Indicate failure
    }
    
    appSettings.gravity = parseFloat(gravitySliderEl.value);
    appSettings.randomize = parseFloat(lSystemSliderEl.value);
    appSettings.size = parseFloat(sizeSliderEl.value);
    bouncyBorderToggleEl.checked = appSettings.bouncyBorder; 
    
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
        bouncyBorderToggleEl.checked = false; 
        
        appSettings.gravity = parseFloat(gravitySliderEl.value);
        appSettings.randomize = parseFloat(lSystemSliderEl.value);
        appSettings.size = parseFloat(sizeSliderEl.value);
        appSettings.bouncyBorder = bouncyBorderToggleEl.checked; 

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
    console.log("Canvas margin bottom:", canvasMarginBottom);

    if (document.fullscreenElement) {
        console.log("Fullscreen active.");
        document.body.classList.add('fullscreen-active');
        newCanvasWidth = window.innerWidth;
        newCanvasHeight = window.innerHeight;
    } else {
        document.body.classList.remove('fullscreen-active');
        console.log("Fullscreen not active.");

        if (!sketchContainer) { 
             console.error("Sketch container not found during resize! Using fallback dimensions.");
             newCanvasWidth = Math.max(50, window.innerWidth * 0.8); 
             newCanvasHeight = Math.max(50, window.innerHeight * 0.5);
        } else {
            newCanvasWidth = sketchContainer.clientWidth; 
            console.log("Sketch container clientWidth:", newCanvasWidth);
        }

        const titleStyle = mainTitle ? window.getComputedStyle(mainTitle) : { marginTop: '0px', marginBottom: '0px' };
        const titleHeight = mainTitle ? (mainTitle.offsetHeight + parseFloat(titleStyle.marginTop) + parseFloat(titleStyle.marginBottom)) : 0;
        
        const controlsPanelStyle = controlsPanel ? window.getComputedStyle(controlsPanel) : { marginTop: '0px', marginBottom: '0px' };
        const controlsHeight = controlsPanel ? (controlsPanel.offsetHeight + parseFloat(controlsPanelStyle.marginTop) + parseFloat(controlsPanelStyle.marginBottom)) : 0;
        
        const footerStyle = siteFooter ? window.getComputedStyle(siteFooter) : { marginTop: '0px', marginBottom: '0px' };
        const footerTotalHeight = siteFooter ? (siteFooter.offsetHeight + parseFloat(footerStyle.marginTop) + parseFloat(footerStyle.marginBottom)) : 0;

        const bodyStyle = window.getComputedStyle(document.body);
        const bodyVerticalPadding = parseFloat(bodyStyle.paddingTop) + parseFloat(bodyStyle.paddingBottom);
        
        console.log(`Heights: title=${titleHeight}, controls=${controlsHeight}, footer=${footerTotalHeight}, bodyVPad=${bodyVerticalPadding}`);

        let availableHeightForCanvasBlock = window.innerHeight - bodyVerticalPadding - titleHeight - controlsHeight - footerTotalHeight;
        console.log("Available height for canvas block (before subtracting margin):", availableHeightForCanvasBlock);
        let maxCanvasHeight = availableHeightForCanvasBlock - canvasMarginBottom;
        console.log("Max canvas height (after subtracting margin):", maxCanvasHeight);

        newCanvasHeight = maxCanvasHeight; 
        
        newCanvasWidth = Math.max(50, newCanvasWidth); 
        newCanvasHeight = Math.max(50, Math.min(4000, newCanvasHeight)); 
        console.log(`Final calculated canvas dimensions: ${newCanvasWidth} x ${newCanvasHeight}`);
    }

    if (typeof resizeCanvas === 'function') {
        resizeCanvas(newCanvasWidth, newCanvasHeight);
        console.log("resizeCanvas() called with:", newCanvasWidth, newCanvasHeight);
    } else {
        console.error("resizeCanvas function not found!");
    }
    
    if (typeof background === 'function' && appSettings && appSettings.backgroundColor) {
      background(appSettings.backgroundColor); 
      console.log("Initial background drawn.");
    } else {
        console.error("Background function or appSettings not available for initial draw.");
    }
    console.log("windowResized() finished.");
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
            shapes[i].update(); // Simplified update
            shapes[i].display();
            // TEMPORARILY DISABLED SHAPE REMOVAL
            // if (!appSettings.bouncyBorder && shapes[i].isOffScreen()) {
            //     shapes.splice(i, 1);
            // }
        }
    } else {
        for (let shape of shapes) {
            shape.display(); 
        }
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
        this.mass = constrain(area / 200, 0.5, 50); 
    }

    update() {
        // Simplified Update - Gravity and Randomize only
        for (let other of shapes) {
            if (other !== this) {
                let dx = other.x - this.x;
                let dy = other.y - this.y;
                let distance = sqrt(dx * dx + dy * dy);
                let minInteractionDistance = (this.size + other.size) / 4; 
                distance = max(distance, minInteractionDistance); 
                let forceMagnitude = (appSettings.gravity * this.mass * other.mass) / (distance * distance);
                // Removed repulsive force for this simplification
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

        this.x += this.velX;
        this.y += this.velY;
        this.rotation += this.rotationSpeed;

        // TEMPORARILY DISABLED BOUNCY BORDER LOGIC
        // if (appSettings.bouncyBorder) {
        //     const radius = this.size / 2; 
        //     if (this.x - radius < 0 && this.velX < 0) { 
        //         this.x = radius;
        //         this.velX *= -1;
        //     } else if (this.x + radius > width && this.velX > 0) {
        //         this.x = width - radius;
        //         this.velX *= -1;
        //     }
        //     if (this.y - radius < 0 && this.velY < 0) {
        //         this.y = radius;
        //         this.velY *= -1;
        //     } else if (this.y + radius > height && this.velY > 0) {
        //         this.y = height - radius;
        //         this.velY *= -1;
        //     }
        // }

        // TEMPORARILY DISABLED INTER-SHAPE COLLISION LOGIC
        // for (let other of shapes) {
        //     if (other !== this) {
        //         // ... (detailed elastic collision logic) ...
        //     }
        // }
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
