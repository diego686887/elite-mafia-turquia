function gerarKey() {
  const nome = document.getElementById("nomeAdmin").value.trim().toUpperCase();

  if (!nome) {
    alert("Digite o nome do admin");
    return;
  }

  const numeros = Math.floor(100000 + Math.random() * 900000);
  const key = `ELITE-${nome}-${numeros}`;

  let keys = JSON.parse(localStorage.getItem("adminKeys")) || [];
  keys.push({ nome, key });

  localStorage.setItem("adminKeys", JSON.stringify(keys));

  document.getElementById("keyGerada").innerText = key;
}
