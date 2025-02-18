let shapes = [];
let gravitySlider, lSystemSlider, collisionSlider, sizeSlider;
let sliderContainer, buttonContainer, controlContainer;
let versionNumber = "0.14"; // Change this for version updates
let selectedShape = 'circle'; // Default shape
let motionActive = false; // Start paused
const MAX_SHAPES = 100;

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
                                    .style('padding', '10px')
                                    .style('background', '#888')
                                    .style('display', 'flex')
                                    .style('flex-wrap', 'wrap')
                                    .style('justify-content', 'space-between')
                                    .style('align-items', 'center');
    
    let leftControls = createDiv('').style('display', 'flex')
                                   .style('gap', '10px')
                                   .parent(controlContainer);

    let motionButton = createButton('▶')
                        .mousePressed(() => {
                            motionActive = !motionActive;
                            motionButton.html(motionActive ? '⏸' : '▶');
                        })
                        .style('width', '30px')
                        .style('height', '30px')
                        .style('background', '#888')
                        .style('color', '#3fd16b')
                        .style('border', 'none')
                        .style('cursor', 'pointer')
                        .parent(leftControls);
    
    let restartButton = createButton('⟳')
                        .mousePressed(() => {
                            shapes = [];
                            gravitySlider.value(5);
                            lSystemSlider.value(5);
                            collisionSlider.value(5);
                            sizeSlider.value(50);
                        })
                        .style('width', '30px')
                        .style('height', '30px')
                        .style('background', '#888')
                        .style('color', '#3fd16b')
                        .style('border', 'none')
                        .style('cursor', 'pointer')
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
        let slider = createSlider(min, max, defaultValue, 0.1).style('width', '150px')
                                                               .style('height', '20px')
                                                               .style('accent-color', '#3fd16b')
                                                               .parent(container);
        createSpan(labelText).style('color', 'white').parent(container);
        return slider;
    }
    
    gravitySlider = createLabeledSlider('Gravity', 0, 10, 5);
    lSystemSlider = createLabeledSlider('L-System', 0, 10, 5);
    collisionSlider = createLabeledSlider('Collision Intensity', 0, 10, 5);
    sizeSlider = createLabeledSlider('Size', 10, min(windowWidth, windowHeight) * 0.75, 50);
    
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
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    if (mouseY < height - 50) {
        if (shapes.length >= MAX_SHAPES) {
            shapes.shift();
        }
        let s = new Shape(mouseX, mouseY, selectedShape);
        shapes.push(s);
    }
}


