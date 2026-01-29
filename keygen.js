function gerar() {
  const key = "ELITE-" + Math.random().toString(36).substr(2, 8).toUpperCase();

  let keys = JSON.parse(localStorage.getItem("adminKeys")) || [];
  keys.push(key);
  localStorage.setItem("adminKeys", JSON.stringify(keys));

  document.getElementById("out").innerText = key;
}
