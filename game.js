const canvas = document.getElementById('game');
const game = canvas.getContext("2d");
let canvasSize;
let canvasElement;
let vidas = 3;
let tiempo;
let intervaloEjecucion;
let playerTime = 0;
let recordTime = document.getElementById("record");
let pResultadoRecord = document.getElementById("resultadoRecord");

let spanVidas = document.getElementById("vidas");
let spanTiempo = document.getElementById("tiempo");
const playerPosition = {
  y: undefined,
  x: undefined
}

const giftposition = {
  y: undefined,
  x: undefined
}

const bombPosition = []
// bandera para no volver a pintar las bombas en el array
let flag = true;



//creo un objeto literal del mapa, y agrego una propiedad que es el nivel y otra que es una funcion render
const map={
    lvl:0,
    render:function () {
      if(map.lvl>=maps.length){
        winGame();
        return;
      }
        // Encontramos el mapa y lo preparamos como queremos
        const Map = maps[this.lvl].match(/[IXO\-]+/g).map(a => a.split(""))
        //  le configuramos las propiedades de los elementos que vamos a dibujar
        game.font = canvasElement + "px Verdana"
        game.textAlign = "5px";
        game.clearRect(0, 0, canvasSize, canvasSize);
        // recorremos el mapa para poder obtener las coordenadas de cada una de las posiciones que necesitamos
        Map.forEach((y, yi) => {
        y.forEach((x, xi) => {
            const posX = xi;
            const posY = yi;
            game.fillText(emojis[x], posX * canvasElement, (posY + 1) * canvasElement);
        
        // guardamos las coordenadas del jugador en la posición de la puerta
        if(x == "O"){
            if(playerPosition.x == undefined  && playerPosition.y == undefined){
              playerPosition.x = posX;
              playerPosition.y = posY;
            } 
        // Mostramos las vidas la primera vez
        spanVidas.innerHTML = emojis["live"].repeat(vidas);
          
        // Guardar el tiempo inicial en la variable tiempo
        if (tiempo == undefined) {
          tiempo = Date.now();
          intervaloEjecucion = setInterval(renderTime, 100);
          showRecord();

        }

        //guardamos la posicion del regalo en la variable giftposition
        } else if(x == "I"){
          giftposition.x = posX;
          giftposition.y = posY;
        } // guardamos las coordenadas de las bombas
        else if(x == "X" && flag){
          bombPosition.push({
            x:posX,
            y:posY})
      }

        });
    });
    flag = false;
    }
}

window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize)


function setCanvasSize() {
    window.innerHeight > window.innerWidth
        ? canvasSize = window.innerWidth * 0.9
        : canvasSize = window.innerHeight * 0.7;


    canvas.setAttribute("height", canvasSize)
    canvas.setAttribute("width", canvasSize)
    canvasElement = canvasSize / 10;
    startGame()
}

function startGame() {
    map.render()
    movePlayer()

}


//Funcion para pintar el tiempo en el HTML

function timeFormat(time_msec){
  const time = ~~(time_msec /1000);
  const min = (time / 60) | 0;
  const sec =  time - (min * 60);    
  const msec = ((time_msec / 10) | 0) - (time * 100);
  return min +':'+ ((sec < 10 ? '0' : 0) + sec) + ':' + ((msec < 10 ? '0' : 0) + msec);
}
function renderTime() {
  playerTime = Date.now() - tiempo;
  spanTiempo.innerHTML = timeFormat(playerTime);
}

function showRecord() {
  recordTime.innerHTML = localStorage.getItem("record_time");
}

function movePlayer() {
  game.fillText(emojis["PLAYER"], playerPosition.x * canvasElement, (playerPosition.y + 1) * canvasElement);
}

function winGame() {
    console.log ("Ganaste");
    clearInterval(intervaloEjecucion);

    const recordTime = localStorage.getItem("record_time");
    if (recordTime){
      if(recordTime >= playerTime){
        localStorage.setItem("record_time", playerTime);
        pResultadoRecord.innerHTML =  ("Felicidades superaste el record");
      } else{
        pResultadoRecord.innerHTML =  ("No superaste el record");
      }
    } else {
      localStorage.setItem("record_time", playerTime);
      pResultadoRecord.innerHTML =  ("Este es tu primer record, vuelve a intentarlo y superalo");
    }
}


function move(direction) {
  switch (direction) {
      case "arriba":
          if (playerPosition.y > 0) {
              playerPosition.y -= 1; // **CAMBIO: mover en la cuadrícula en lugar de píxeles**
          }
          break;
      case "izquierda":
          if (playerPosition.x > 0) {
              playerPosition.x -= 1; // **CAMBIO: mover en la cuadrícula en lugar de píxeles**
          }
          break;
      case "derecha":
          if (playerPosition.x < 9) { // **CAMBIO: usar límites de la cuadrícula**
              playerPosition.x += 1; // **CAMBIO: mover en la cuadrícula en lugar de píxeles**
          }
          break;
      case "abajo":
          if (playerPosition.y < 9) { // **CAMBIO: usar límites de la cuadrícula**
              playerPosition.y += 1; // **CAMBIO: mover en la cuadrícula en lugar de píxeles**
          }
          break;
  }
  startGame();
  win();
  bombCollision();
  
}

//Funcion de ganar
function win(){
  if (playerPosition.x == giftposition.x && playerPosition.y == giftposition.y) {
    map.lvl++;
    bombPosition.splice(0, bombPosition.length);
    flag = true;
    startGame();

}
}

//Funcion de colision con bombas
function bombCollision(){
  bombPosition.forEach((bomb) => {
    if(playerPosition.x == bomb.x && playerPosition.y == bomb.y){
      playerPosition.x = undefined;
      playerPosition.y = undefined;
      startGame();
      vidas--;
      verificarVidas();
      spanVidas.innerHTML = emojis["live"].repeat(vidas);
    }
  })
}


//Funcion de verificacion de vidas
function verificarVidas(){
  if(vidas == 0){
    console.log("Perdiste");
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    vidas = 3;
    map.lvl = 0;
    bombPosition.splice(0, bombPosition.length);
    flag = true;
    tiempo = undefined;
    spanTiempo.innerHTML = "0";
    startGame();
  }
}

// Movimiento de las flechas html
document.getElementById("up").addEventListener("click", () => move("arriba"));
document.getElementById("left").addEventListener("click", () => move("izquierda"));
document.getElementById("right").addEventListener("click", () => move("derecha"));
document.getElementById("down").addEventListener("click", () => move("abajo"));

// Movimiento de las flechas del teclado
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      move("arriba");
      break;
    case "ArrowLeft":
      move("izquierda");
      break;
    case "ArrowRight":
      move("derecha");
      break;
    case "ArrowDown":
      move("abajo");
      break;
  }
});