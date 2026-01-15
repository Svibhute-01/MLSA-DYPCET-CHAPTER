function includeHTML(id, file) {
  fetch(file)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    })
    .catch(err => console.error("Error loading file:", file, err));
}

document.addEventListener("DOMContentLoaded", function () {
  includeHTML("navbar", "navbar.html");
  includeHTML("footer", "footer.html");
});
