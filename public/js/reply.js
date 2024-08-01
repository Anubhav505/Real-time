function showButton(event) {
  event.stopPropagation();
  document.getElementById("welcomeButton").style.display = "block";
}

document.addEventListener("click", function () {
  document.getElementById("welcomeButton").style.display = "none";
});
