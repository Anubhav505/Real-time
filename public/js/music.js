const audio = document.getElementById("myAudio");
const playPauseButton = document.getElementById("playPause");
const progressBar = document.getElementById("progressBar");
const currentTimeDisplay = document.getElementById("currentTime");

// Toggle play/pause
playPauseButton.addEventListener("click", () => {
  if (audio.paused) {
    audio.play().catch((error) => console.error("Error playing audio:", error));
    playPauseButton.innerHTML = '<i class="fa-solid fa-pause"></i>'; // Change icon to pause
  } else {
    audio.pause();
    playPauseButton.innerHTML = '<i class="fa-solid fa-play"></i>'; // Change icon to play
  }
});
