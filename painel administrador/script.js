document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const username = document.getElementById("username");
  const password = document.getElementById("password");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const login = username.value.trim();
    const senha = password.value.trim();

    if (!login || !senha) {
      alert("Por favor, preencha todos os campos.");
    } else {
      alert("Login realizado com sucesso!");
      // Aqui você pode redirecionar ou enviar dados ao backend
    }
  });
});
