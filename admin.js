function loginAdmin() {
  const keyDigitada = document.getElementById("adminKey").value.trim();
  const keys = JSON.parse(localStorage.getItem("adminKeys")) || [];

  const admin = keys.find(k => k.key === keyDigitada);

  if (!admin) {
    alert("KEY inválida");
    return;
  }

  localStorage.setItem("adminLogado", JSON.stringify(admin));
  mostrarPainel(admin);
}

function mostrarPainel(admin) {
  document.getElementById("login").style.display = "none";
  document.getElementById("painel").style.display = "block";
  document.getElementById("nomeAdmin").innerText = admin.nome;
}

function logout() {
  localStorage.removeItem("adminLogado");
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  const admin = JSON.parse(localStorage.getItem("adminLogado"));
  if (admin) {
    mostrarPainel(admin);
  }
});
