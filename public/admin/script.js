document.addEventListener("DOMContentLoaded", function () {
  // Exibe alerta de erro se houver parâmetro erro=1 na URL
  const params = new URLSearchParams(window.location.search);
  if (params.get("erro") === "1") {
    const errorDiv = document.getElementById("login-error");
    if (errorDiv) {
      errorDiv.textContent = "Login ou senha incorretos.";
      errorDiv.style.display = "block";
    } else {
      alert("Login ou senha incorretos. Por favor, tente novamente!");
    }
  }
});
