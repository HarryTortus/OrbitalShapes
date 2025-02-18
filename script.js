let shapes = [];
let sliderA, sliderB, sliderC;

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    
    // Create sliders
    sliderA = createSlider(1, 10, 5, 0.1);
    sliderB = createSlider(1, 10, 5, 0.1);
    sliderC = createSlider(1, 10, 5, 0.1);
    sliderA.position(10, 10);
    sliderB.position(10, 40);
    sliderC.position(10, 70);
}

function draw() {
    background(0, 20); // Fading effect
    
    for (let shape of shapes) {
        shape.update();
        shape.display();
    }
}

function mousePressed() {
    let s = new Shape(mouseX, mouseY);
    shapes.push(s);
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
