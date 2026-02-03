document.on("ready", function () {
  Window.this.state = Window.WINDOW_SHOWN;
  console.log("I'm ready now.");
});

let images = ["bg0.jpg", "bg1.jpg", "bg2.jpg"];
let currentIndex = -1;

document.on("click", "#btn", function loadClick(evt) {
  currentIndex = (currentIndex + 1) % images.length;
  document.$("img").src = images[currentIndex];
});
