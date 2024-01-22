const element = {
  password: document.querySelector("#password"),
  email: document.querySelector("#email"),
  submit: document.querySelector("#submitUserInfo"),
  emailError: document.querySelector("#emailError"),
  passwordError: document.querySelector("#passwordError"),
  globalError: document.querySelector("#globalError"),
};

// Fonction pour vérifier si l'e-mail est valide
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

let boutonLogin = element.submit.addEventListener("click", (a) => {
  a.preventDefault();

  // Réinitialiser les messages d'erreur
  element.emailError.textContent = "";
  element.passwordError.textContent = "";
  element.globalError.textContent = "";

  // Vérifier si l'e-mail est vide
  if (!element.email.value.trim()) {
    element.emailError.textContent = "Veuillez remplir l'e-mail.";
    element.emailError.classList.add("error-message"); // Apply red color
    return;
  }

  // Vérifier si l'e-mail est valide
  if (!isValidEmail(element.email.value)) {
    element.emailError.textContent = "Veuillez saisir un e-mail valide.";
    element.emailError.classList.add("error-message"); // Apply red color
    return;
  }

  // Vérifier si le mot de passe est vide
  if (!element.password.value.trim()) {
    element.passwordError.textContent = "Veuillez remplir le mot de passe.";
    element.passwordError.classList.add("error-message"); // Apply red color
    return;
  }

  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: element.email.value,
      password: element.password.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message || data.error) {
        // Afficher un message d'erreur sur la page
        if (data.error === "Invalid email") {
          element.emailError.textContent = "L'e-mail est incorrect.";
        } else if (data.error === "Invalid password") {
          element.passwordError.textContent = "Le mot de passe est incorrect.";
        } else {
          // Set the global error message and apply the error-message class
          element.globalError.textContent =
            "Erreur dans l'identifiant ou le mot de passe";
          element.globalError.classList.add("error-message"); // Apply red color
        }
      } else {
        sessionStorage.setItem("Token", data.token);
        sessionStorage.setItem("isConnected", JSON.stringify(true));
        window.location.replace("index.html");
      }
    });
});
