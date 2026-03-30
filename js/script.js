const loginBtn = document.querySelector('button.w-full'); // Grabs your SIGN IN button
const passwordField = document.getElementById('passwordInput');

const peekPassword = () => {
    const passwordField = document.getElementById("passwordInput");

    if (!passwordField) return;

    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
};

function handleLogin() {
    const emailField = document.querySelector('input[type="text"]');
    const passwordField = document.getElementById('passwordInput');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    const loginBtn = document.getElementById('loginBtn');

    const VALID_USER = "admin@innobridge.com";
    const VALID_PASS = "12345";

    //Blank Check
    if (emailField.value.trim() === "" || passwordField.value.trim() === "") {
        alert("Fields cannot be empty!");
        return;
    }

    // 2. Credential Check (
    if (emailField.value !== VALID_USER || passwordField.value !== VALID_PASS) {
        alert("Invalid Username or Password. Please try again.");
        // Clear password field for security
        passwordField.value = "";
        return;
    }

    // 3. If correct, show loading effect
    btnText.classList.add('opacity-0');
    spinner.classList.remove('hidden');
    loginBtn.disabled = true;

    setTimeout(() => {
        alert("Welcome back, Admin!");
        window.location.href = "index.html";
    }, 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();
});

function searchPapers() {

  const query = document.getElementById("searchInput").value;

  // Fake data (simulate API)
  const data = [
    {
      title: "Deep Learning for Image Classification",
      authors: "John Doe, Jane Smith",
      year: "2024",
      abstract: "This paper explores CNNs for image classification..."
    },
    {
      title: "AI in Healthcare",
      authors: "A. Kumar, R. Singh",
      year: "2023",
      abstract: "Using machine learning for disease prediction..."
    }
  ];

  const container = document.getElementById("resultsContainer");
  const count = document.getElementById("resultCount");

  container.innerHTML = "";

  data.forEach(paper => {
    const div = document.createElement("div");

    div.className = "border-b pb-4";

    div.innerHTML = `
      <h2 class="text-lg font-semibold text-blue-600 hover:underline cursor-pointer">
        ${paper.title}
      </h2>
      <p class="text-sm text-gray-600">
        ${paper.authors} • ${paper.year}
      </p>
      <p class="text-gray-700 mt-2 text-sm">
        ${paper.abstract}
      </p>
    `;

    container.appendChild(div);
  });

  count.innerText = `About ${data.length} results for "${query}"`;

}   