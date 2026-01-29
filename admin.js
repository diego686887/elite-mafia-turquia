function verificarKey() {
  const keyDigitada = document.getElementById("adminKey").value.trim();
  const keys = JSON.parse(localStorage.getItem("adminKeys")) || [];

  const admin = keys.find(k => k.key === keyDigitada);

  if (!admin) {
    alert("KEY inválida");
    return;
  }

  localStorage.setItem("adminLogado", JSON.stringify(admin));
  liberarPainel(admin);
}

function liberarPainel(admin) {
  document.getElementById("keyBox").style.display = "none";
  document.getElementById("painel").style.display = "block";
  document.getElementById("nomeAdmin").innerText = admin.nome;
}

function logout() {
  localStorage.removeItem("adminLogado");
  location.reload();
}

// AUTO LOGIN SE JÁ TIVER KEY
document.addEventListener("DOMContentLoaded", () => {
  const admin = JSON.parse(localStorage.getItem("adminLogado"));
  if (admin) {
    liberarPainel(admin);
  }
});
