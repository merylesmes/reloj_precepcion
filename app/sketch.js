document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.querySelector('.button_start');
    const startScreen = document.querySelector('.start_screen');
    const appScreen = document.querySelector('.app');
    const finalTimeScreen = document.querySelector('.final_time');
    const timeDisplay = document.querySelector('.time_display');

    startButton.addEventListener('click', function () {
        startScreen.style.display = 'none';
        appScreen.style.display = 'block';

        new p5(s => {
            let numSegundos = 120;
            let numMinutos = 60;
            let numHoras = 24;

            let radioBase = 100;
            let incrementoRadio = 50;
            let rotacionSegundos = 0;
            let rotacionMinutos = 0;
            let rotacionHoras = 0;

            let velocidadSegundos = 0.01;
            let velocidadMinutos = 0.005;
            let velocidadHoras = 0.002;

            let nivelesSegundos = new Array(numSegundos).fill(0);
            let nivelesMinutos = new Array(numMinutos).fill(0);
            let nivelesHoras = new Array(numHoras).fill(0);

            let conexiones = [];
            let contadorSeg = 0;
            let contadorMin = 0;
            let contadorHor = 0;
            let clockStarted = false;
            let finalTime = '';

            let presionandoS = false;
            let presionandoM = false;
            let presionandoH = false;
            let ultimoIncremento = 0;
            let intervaloIncremento = 200; // en milisegundos


            s.setup = () => {
                s.createCanvas(window.innerWidth, window.innerHeight);
                s.frameRate(60);
                s.noCursor();
                s.textFont('Montserrat');
            }

            s.draw = () => {
                s.background(20);
                s.translate(s.width / 2, s.height / 2);

                rotacionSegundos += velocidadSegundos;
                rotacionMinutos += velocidadMinutos;
                rotacionHoras += velocidadHoras;

                dibujarAnillo(numSegundos, radioBase + 2 * incrementoRadio, rotacionSegundos, s.color(255, 165, 0), nivelesSegundos, true);
                dibujarAnillo(numMinutos, radioBase + incrementoRadio, rotacionMinutos, s.color(0, 255, 128), nivelesMinutos, true);
                dibujarAnillo(numHoras, radioBase, rotacionHoras, s.color(135, 206, 250), nivelesHoras, false);

                s.noStroke();
                s.fill(255);
                s.textSize(16);
                s.text("Segundos: " + contadorSeg, -s.width / 2 + 20, -s.height / 2 + 30);
                s.text("Minutos: " + contadorMin, -s.width / 2 + 20, -s.height / 2 + 50);
                s.text("Horas: " + contadorHor, -s.width / 2 + 20, -s.height / 2 + 70);

                dibujarConexiones();

                if (s.millis() - ultimoIncremento > intervaloIncremento) {
                    if (presionandoS) añadirSegundos();
                    if (presionandoM) añadirMinutos();
                    if (presionandoH) añadirHoras();
                    ultimoIncremento = s.millis();
                }


                if (!clockStarted) {
                    clockStarted = true;

                    setTimeout(() => {
                        finalTime = getFinalTime();
                        timeDisplay.textContent = `Hora Final: ${finalTime}`;
                        finalTimeScreen.style.display = 'block';
                        finalTimeScreen.style.transition = 'opacity 1s';
                        finalTimeScreen.style.opacity = '1';
                        s.noLoop();
                        appScreen.style.display = 'none';
                    }, 30000);
                }
            }

            function getFinalTime() {
                const hours = String(contadorHor).padStart(2, '0');
                const minutes = String(contadorMin).padStart(2, '0');
                const seconds = String(contadorSeg).padStart(2, '0');
                return `${hours}:${minutes}:${seconds}`;
            }

            function dibujarAnillo(numDivisiones, radio, rotacion, c, niveles, crecerHaciaFuera) {
                s.strokeWeight(2);
                s.noFill();
                s.stroke(c);

                for (let i = 0; i < numDivisiones; i++) {
                    let anguloInicio = s.TWO_PI / numDivisiones * i + rotacion;
                    let x1 = s.cos(anguloInicio) * radio;
                    let y1 = s.sin(anguloInicio) * radio;

                    let radioModificado = crecerHaciaFuera ? radio + niveles[i] * 50 : radio - niveles[i] * 50;
                    let x2 = s.cos(anguloInicio) * radioModificado;
                    let y2 = s.sin(anguloInicio) * radioModificado;

                    s.line(x1, y1, x2, y2);
                }
            }

            s.keyPressed = () => {
                if (s.key === 's') presionandoS = true;
                if (s.key === 'm') presionandoM = true;
                if (s.key === 'h') presionandoH = true;
            };

            s.keyReleased = () => {
                if (s.key === 's') presionandoS = false;
                if (s.key === 'm') presionandoM = false;
                if (s.key === 'h') presionandoH = false;
            };


            function añadirSegundos(indice) {
                if (contadorSeg === 60) {
                    contadorSeg = 0;
                    añadirMinutos(indice);
                } else {
                    indice = getIndiceActivo(numSegundos, rotacionSegundos);
                    nivelesSegundos[indice] = s.constrain(nivelesSegundos[indice] + 0.1, 0, 1);
                    contadorSeg++;

                    if (contadorSeg % 10 === 0) {
                        let i2 = getIndiceActivo(numMinutos, rotacionMinutos);
                        conexiones.push([indice, 0, i2, 1]); // segundos -> minutos
                    }
                }
            }

            function añadirMinutos(indice) {
                if (contadorMin === 60) {
                    añadirHoras(indice);
                    contadorMin = 0;
                } else {
                    indice = getIndiceActivo(numMinutos, rotacionMinutos);
                    nivelesMinutos[indice] = s.constrain(nivelesMinutos[indice] + 0.1, 0, 1);
                    contadorMin++;

                    if (contadorMin % 5 === 0) {
                        let i2 = getIndiceActivo(numHoras, rotacionHoras);
                        conexiones.push([indice, 1, i2, 2]); // minutos -> horas
                    }
                }
            }

            function añadirHoras(indice) {
                if (contadorHor === 24) {
                    contadorHor = 0;
                } else {
                    indice = getIndiceActivo(numHoras, rotacionHoras);
                    nivelesHoras[indice] = s.constrain(nivelesHoras[indice] + 0.1, 0, 1);
                    contadorHor++;
                }
            }

            function getIndiceActivo(numDivisiones, rotacion) {
                let anguloPorDivision = s.TWO_PI / numDivisiones;
                return Math.floor((rotacion / anguloPorDivision) % numDivisiones);
            }

            function dibujarConexiones() {
                s.strokeWeight(1);
                for (let conexion of conexiones) {
                    let [i1, tipo1, i2, tipo2] = conexion;

                    let [x1, y1] = getCoordenadas(i1, tipo1);
                    let [x2, y2] = getCoordenadas(i2, tipo2);

                    s.stroke(255, 255, 255, 100);
                    s.line(x1, y1, x2, y2);
                }
            }

            function getCoordenadas(indice, tipo) {
                let radio = radioBase;
                let rotacion = 0;
                let num = 0;

                if (tipo === 0) {
                    radio += 2 * incrementoRadio;
                    rotacion = rotacionSegundos;
                    num = numSegundos;
                } else if (tipo === 1) {
                    radio += incrementoRadio;
                    rotacion = rotacionMinutos;
                    num = numMinutos;
                } else if (tipo === 2) {
                    radio += 0;
                    rotacion = rotacionHoras;
                    num = numHoras;
                }

                let angulo = s.TWO_PI / num * indice + rotacion;
                return [s.cos(angulo) * radio, s.sin(angulo) * radio];
            }
        });

    });
});
