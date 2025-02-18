let shapes = [];
let sliderA, sliderB, sliderC;
let sliderContainer;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    
    // Create sliders at the bottom of the screen with a gray border
    sliderContainer = createDiv('').style('position', 'absolute')
                                     .style('bottom', '10px')
                                     .style('left', '50%')
                                     .style('transform', 'translateX(-50%)')
                                     .style('padding', '10px')
                                     .style('background', '#888')
                                     .style('border-radius', '10px');
    
    sliderA = createSlider(1, 10, 5, 0.1).parent(sliderContainer);
    sliderB = createSlider(1, 10, 5, 0.1).parent(sliderContainer);
    sliderC = createSlider(1, 10, 5, 0.1).parent(sliderContainer);
}

function draw() {
    background(0, 20); // Fading effect
    
    for (let shape of shapes) {
        shape.update();
        shape.display();
    }
}

function mousePressed() {
    // Prevent shapes from being added when clicking on sliders
    if (mouseY < height - 50) {
        let s = new Shape(width / 2, height / 2); // Start movement in the middle
        shapes.push(s);
    }
}

class Shape {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(20, 50);
        this.color = color(random(255), random(255), random(255));
    }
    update() {
        let a = sliderA.value();
        let b = sliderB.value();
        let c = sliderC.value();
        this.x += sin(frameCount * 0.01 * a) * b;
        this.y += cos(frameCount * 0.01 * b) * c;
    }
    display() {
        fill(this.color);
        noStroke();
        ellipse(this.x, this.y, this.size);
    }
}

