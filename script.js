// PARTICLE BACKGROUND

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

for (let i = 0; i < 100; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    ctx.fillStyle = "#00f7ff";
    ctx.fillRect(p.x, p.y, 2, 2);

    p.y += 0.5;

    if (p.y > canvas.height) {
      p.y = 0;
    }
  });

  requestAnimationFrame(animate);
}

animate();


// EVENT SYSTEM

function createEvent(){
  let name = document.getElementById("eventName").value;
  let time = document.getElementById("eventTime").value;

  let div = document.createElement("div");
  div.innerText = "📅 " + name + " at " + time;

  document.getElementById("eventList").appendChild(div);
}


// GIVEAWAY SYSTEM

function createGiveaway(){
  let name = document.getElementById("giveName").value;
  let endTime = new Date(document.getElementById("giveTime").value);

  let div = document.createElement("div");
  document.getElementById("giveList").appendChild(div);

  setInterval(() => {

    let now = new Date();
    let diff = endTime - now;

    if(diff <= 0){
      div.innerText = "🏆 " + name + " WINNER ANNOUNCED";
    } else {
      let s = Math.floor(diff / 1000) % 60;
      let m = Math.floor(diff / 60000) % 60;
      let h = Math.floor(diff / 3600000);

      div.innerText = "🎁 " + name + " ends in " + h + "h " + m + "m " + s + "s";
    }

  }, 1000);
}


// BLOCK RIGHT CLICK (basic protection)
document.addEventListener("contextmenu", e => e.preventDefault());