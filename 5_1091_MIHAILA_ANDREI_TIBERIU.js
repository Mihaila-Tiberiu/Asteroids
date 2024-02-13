class Joc {
    #canvas;
    #ctx;
    #canvasWidth;
    #canvasHeight;
    #factorScalare;

    #shipX;
    #shipY;
    #shipAngle;

    #document;

    #forwardSpeed; // veche implementare, nefolosit
    #rotationSpeed;
    #sideSpeed; // viteza de deplasare a navei

    #rockets;
    #rocketSpeed;
    #maxRockets;

    #asteroids;
    #asteroidsNumber;


    #lives;
    #score;
    #pointsThreshold;

    constructor(canvasId, document) {
        this.#canvas = document.getElementById(canvasId);

        this.#ctx = this.#canvas.getContext('2d');
        this.#ctx.imageSmoothingEnabled = true;
        this.#canvasWidth = this.#canvas.width;
        this.#canvasHeight = this.#canvas.height;
        this.#asteroids = [];
        this.#factorScalare = Math.min(this.#canvasWidth / 800);

        this.#shipX = this.#canvasWidth/2;
        this.#shipY = this.#canvasHeight/2;
        this.#shipAngle = 0;

        this.#document = document;

        this.#forwardSpeed = 2.5;
        this.#rotationSpeed = Math.PI / 60;
        this.#sideSpeed = 2.5;

        this.#rockets = [];
        this.#rocketSpeed = 7;
        this.#maxRockets = 3;

        this.#asteroidsNumber = 10;
        
        this.#lives = 3;
        this.#score = 0;
        this.#pointsThreshold = 200; //scor necesar pentru obtinere noua viata - threshold / limita

        this.#addEventListeners();

    }

    // lansare racheta
    #launchRocket() {
        // check daca sunt 3 rachete deja lansate
        if (this.#rockets.length < this.#maxRockets) {
            // calcul pozitie initiala racheta in functie de nava
            const rocket = {
                x: this.#shipX,
                y: this.#shipY,
                velocityX: Math.sin(this.#shipAngle) * this.#rocketSpeed,
                velocityY: -Math.cos(this.#shipAngle) * this.#rocketSpeed,
                radius: 5, // raza racheta
                color: 'white' // culoare racheta
            };

            // adaugare racheta in array-ul de rachete
            this.#rockets.push(rocket);
        }
    }

    // updatare rachete
    #updateRockets() {
        for (let i = this.#rockets.length - 1; i >= 0; i--) {
            const rocket = this.#rockets[i];
            
            rocket.x += rocket.velocityX;
            rocket.y += rocket.velocityY;

            // detectare coliziune cu asteroizi
            for (let j = this.#asteroids.length - 1; j >= 0; j--) {
                const asteroid = this.#asteroids[j];
    
                // detectare coliziune
                const dx = rocket.x - asteroid.x;
                const dy = rocket.y - asteroid.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                if (distance < rocket.radius + asteroid.value * 10 * this.#factorScalare) {
                    // racheta a avut o coliziune cu asteroidul, se sterge racheta
                    this.#rockets.splice(i, 1);
    
                    // scadere valoare asteroid cu 1
                    asteroid.value -= 1;
                    if (asteroid.value <= 0) {
                        // stergere asteroid daca are valoarea <=0
                        this.#asteroids.splice(j, 1);
                        this.#score += 100;

                        if (this.#score % this.#pointsThreshold == 0) {
                            this.#lives++; // crestere numar de vieti o data ce s-a trecut thresholdul
                            // this.#score = 0; // scorul se poate reseta de aici daca este cazul
                        }
                    }

                    if (this.#asteroids.length === 0) {
                        window.alert('Ai castigat jocul! :D'); // mesaj castig
                        window.location.reload(); // refresh la pagina pentru a reincepe jocul
                    }

                    break;
                }
            }

            // stergere rachete OOB
            if (rocket.x < 0 || rocket.x > this.#canvasWidth || rocket.y < 0 || rocket.y > this.#canvasHeight) {
                this.#rockets.splice(i, 1);
            }
        }
    }

    // desenare rachete
    #drawRockets() {
        for (const rocket of this.#rockets) {
            this.#ctx.fillStyle = rocket.color;
            this.#ctx.beginPath();
            this.#ctx.arc(rocket.x, rocket.y, rocket.radius, 0, Math.PI * rocket.radius);
            this.#ctx.fill();
        }
    }

    // creare asteroid
    #createAsteroid() {
        const asteroid = {
            x: Math.random() * this.#canvasWidth,
            y: Math.random() * this.#canvasHeight,
            velocityX: Math.random(),
            velocityY: Math.random(),
            value: (Math.floor(Math.random() * 4) + 1) // valoare asteroid
        };
        this.#asteroids.push(asteroid);
    }

    // desenare asteroizi
    #drawAsteroids() {
    
        for (const asteroid of this.#asteroids) {
          
            // setare culoare  
            if (asteroid.value === 1) {
                this.#ctx.strokeStyle = 'cyan';
            } else if (asteroid.value === 2) {
                this.#ctx.strokeStyle  = 'yellow';
            } else if (asteroid.value === 3) {
                this.#ctx.strokeStyle  = 'pink';
            } else {
                this.#ctx.strokeStyle  = 'magenta';
            }
        
            // desenare asteroid
            this.#ctx.beginPath();
            this.#ctx.arc(asteroid.x, asteroid.y, asteroid.value*10*this.#factorScalare, 0, Math.PI * 2);
            this.#ctx.stroke();
        
            this.#ctx.fillStyle = 'white';
            this.#ctx.font = asteroid.value*20*this.#factorScalare + 'px Arial';
            const text = asteroid.value.toString();
            const textWidth = this.#ctx.measureText(text).width;

            // centrare text
            this.#ctx.fillText(
            text,
            asteroid.x - textWidth / 2,
            asteroid.y + asteroid.value*this.#factorScalare*14 / 2
            );
    
            // actualizare pozitie asteroid
            asteroid.x += asteroid.velocityX;
            asteroid.y += asteroid.velocityY;

            // verificare coliziune cu marginile ecranului
            if (asteroid.x > this.#canvasWidth || asteroid.x < 0) {
                asteroid.velocityX *= -1;
            }
            if (asteroid.y > this.#canvasHeight || asteroid.y < 0) {
                asteroid.velocityY *= -1;
            }
        }
    }

    // desenare nava
    #drawShip() {
        this.#ctx.save();
        this.#ctx.translate(this.#shipX, this.#shipY);
        this.#ctx.rotate(this.#shipAngle);

        // desenare triunghi
        this.#ctx.beginPath();
        this.#ctx.moveTo(0, -15);
        this.#ctx.lineTo(10, 15);
        this.#ctx.lineTo(-10, 15);
        this.#ctx.closePath();

        // setare culori
        this.#ctx.fillStyle = 'white';
        this.#ctx.strokeStyle = 'white';
        this.#ctx.lineWidth = 2;
        this.#ctx.fill();
        this.#ctx.stroke();

        this.#ctx.restore();
    }
    
    #addEventListeners() {
        const keysPressed = new Set();
    
        const keyDownHandler = (event) => {
            keysPressed.add(event.key);
    
            if (event.key === 'x') {
                this.#launchRocket();
            }
        };
    
        const keyUpHandler = (event) => {
            keysPressed.delete(event.key);
        };
    
        this.#document.addEventListener('keydown', keyDownHandler);
        this.#document.addEventListener('keyup', keyUpHandler);
    
        const handleMovement = () => {
            this.#handleShipMovement(keysPressed);
            requestAnimationFrame(handleMovement);
        };
    
        handleMovement();
    }
    
    #handleShipMovement(keysPressed) {

        if (keysPressed.has('ArrowLeft')) {
            this.#moveShipLeft();
        } else if (keysPressed.has('ArrowRight')) {
            this.#moveShipRight();
        }

    
        if (keysPressed.has('ArrowUp')) {
            this.#moveShipForward();
        } else if (keysPressed.has('ArrowDown')) {
            this.#moveShipBackward();
        }
    
        if (keysPressed.has('z')) {
            this.#rotateShipLeft();
        } else if (keysPressed.has('c')) {
            this.#rotateShipRight();
        }
    }
    

    #rotateShipLeft() {
        this.#shipAngle -= this.#rotationSpeed; // schimbare unghi spre stanga
    }

    #rotateShipRight() {
        this.#shipAngle += this.#rotationSpeed; // schimbare unghi spre dreapta
    }

    #moveShipForward() {
        this.#shipY -= this.#sideSpeed;
        // this.#shipX += Math.sin(this.#shipAngle) * this.#forwardSpeed; // mod x
        // this.#shipY -= Math.cos(this.#shipAngle) * this.#forwardSpeed; // mod y
    }

    #moveShipBackward() {
        this.#shipY += this.#sideSpeed;
        // this.#shipX -= Math.sin(this.#shipAngle) * this.#forwardSpeed; // mod x
        // this.#shipY += Math.cos(this.#shipAngle) * this.#forwardSpeed; // mod y
    }

    #moveShipLeft(){
        this.#shipX -= this.#sideSpeed;
    }

    #moveShipRight(){
        this.#shipX += this.#sideSpeed;
    }


    #drawLivesAndScore() {
        this.#ctx.font = '20px Arial';
        this.#ctx.fillStyle = 'white';
        this.#ctx.fillText(`Vieti: ${this.#lives}`, 20, 30);
        this.#ctx.fillText(`Scor: ${this.#score}`, this.#canvasWidth - 120, 30);
    }


    #update(){
        this.#ctx.fillStyle = 'black';
        this.#ctx.fillRect(0, 0, this.#canvasWidth, this.#canvasHeight);


        const halfShipWidth = 10; // jumatate din nava (20 / 2)
        const shipHeight = 30; // inaltimea navei (15 - (-15))

        // wrap nava
        if (this.#shipX - halfShipWidth > this.#canvasWidth) {
            this.#shipX = -halfShipWidth;
        } else if (this.#shipX + halfShipWidth < 0) {
            this.#shipX = this.#canvasWidth + halfShipWidth;
        }
    
        if (this.#shipY - shipHeight / 2 > this.#canvasHeight) {
            this.#shipY = -shipHeight / 2;
        } else if (this.#shipY + shipHeight / 2 < 0) {
            this.#shipY = this.#canvasHeight + shipHeight / 2;
        }

        this.#drawLivesAndScore();
        this.#updateRockets();

        this.#drawRockets();
        this.#drawAsteroids();
        this.#drawShip();

        // coliziune intre nava si asteroizi
        for (const asteroid of this.#asteroids) {
            const dx = asteroid.x - this.#shipX;
            const dy = asteroid.y - this.#shipY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // detectare coliziune cu un asteroid
            if (distance < asteroid.value * 10 * this.#factorScalare + 15) { // se ia in calcul si inaltimea navei
                this.#lives--; // scadere viata
                this.#asteroids = [];

                this.#shipX = this.#canvasWidth/2;
                this.#shipY = this.#canvasHeight/2;
                this.#shipAngle = 0;

                this.start();

                // game over
                if (this.#lives <= 0) {
                    window.alert('Ai pierdut jocul! :('); // mesaj de game over
                    window.location.reload(); // refresh la pagina pentru a reincepe jocul
                }
            }
        }

        requestAnimationFrame(() => this.#update());
    }

    // functia de start a jocului
    start() {
        // creare asteroizi initiali
        for (let i = 0; i < this.#asteroidsNumber; i++) {
          this.#createAsteroid();
        }
    
        // pornim update loop al jocului
        this.#update();
    }
}