function gerar() {
  const nome = adminNome.value.toUpperCase();
  const rand = Math.random().toString(36).substr(2, 6).toUpperCase();
  const key = `ELITE-${nome}-${rand}`;

  const keys = JSON.parse(localStorage.getItem("keys") || "[]");
  keys.push(key);
  localStorage.setItem("keys", JSON.stringify(keys));

  resultado.innerText = key;
}
