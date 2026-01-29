function verificarKey() {
  const key = document.getElementById("keyInput").value.trim();
  const keys = JSON.parse(localStorage.getItem("adminKeys")) || [];

  if (!keys.includes(key)) {
    alert("KEY inválida");
    return;
  }

  document.getElementById("keyTela").style.display = "none";
  document.getElementById("painel").style.display = "block";
}
