const baseUrl = "https://tarmeezacademy.com/api/v1/";

let currentPage = 1;
let lastPage = 1;
let isLoading = false;

window.addEventListener("scroll", async () => {
  const endOfPage =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 500;
  // console.log(lastPage);
  if (endOfPage && !isLoading && currentPage <= lastPage) {
    isLoading = true;
    currentPage++;
    console.log("Loading page:", currentPage);
    await getPosts(currentPage);
    isLoading = false;
  }
});

async function getPosts(page = 1) {
  await axios
    .get(`${baseUrl}posts?limit=10&page=${page}`)
    .then(function (response) {
      // console.log(response);
      lastPage = response.data.meta.last_page;
      // console.log(lastPage);
      let data = response.data.data;
      let postCard = "";
      data.forEach((post) => {
        let author = post.author;
        let postTitle = "";
        if (post.title != null) {
          postTitle = post.title;
        }
        postCard += `
    <div class="card border-0 shadow-sm my-4">
        <div class="card-header bg-white d-flex align-items-center gap-2 text-capitalize pb-2 mb-2">
            <img
              class="rounded-circle object-fit-cover"
              width="50"
              height="50"
              src="${author.profile_image}"
              alt="User Image"
            />
            <h4 class="card-title">${author.name}</h4>
        </div>
        <img
          src="${post.image}"
          class="card-img object-fit-cover"
          alt="Post Image"
          
        />
        <div class="card-body">
            <span>${post.created_at}</span>
            <h5>${postTitle}</h5>
            <p class="card-text">${post.body}</p>
        </div>
        <div class="card-footer bg-white">
            <div class="card-text">
                <i class="fa-solid fa-comment"></i>
                <span>${post.comments_count}</span>
                <span>Comments</span>
              ${post.tags
                .map(
                  (tag) => `<span class="badge text-bg-secondary">${tag}</span>`
                )
                .join("")}

            </div>
        </div>
    </div>
  `;
      });

      let divPost = document.createElement("div");
      divPost.innerHTML = postCard;
      document.getElementById("postsContainer").appendChild(divPost);
    })
    .catch(function (error) {
      handelError(error);
    });
}
getPosts();
setupUi();

// add Posts To Page function

document.getElementById("loginBtn").addEventListener("click", login);

document.getElementById("registerBtn").addEventListener("click", register);

async function register() {
  let name = document.getElementById("register-name-input").value;
  let username = document.getElementById("register-username-input").value;
  let email = document.getElementById("register-email-input").value;
  let password = document.getElementById("register-password-input").value;
  let profileImage = document.getElementById("register-image-input").files[0];
  let registerUser = new FormData();
  registerUser.append("name", name);
  registerUser.append("username", username);
  registerUser.append("email", email);
  registerUser.append("password", password);
  registerUser.append("image", profileImage);

  await axios
    .post(`${baseUrl}register`, registerUser, {
      headers: {
        Accept: "application/json",
      },
    })
    .then(function (response) {
      let token = response.data.token;
      let user = response.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setupUi();
      closeModal(registerModal);

      showToast("You are registered", "success");
    })
    .catch(function (error) {
      let errorMessage = error.response?.data?.message || "An error occurred";

      showToast(errorMessage, "danger");
    });
}

async function login() {
  let username = document.getElementById("username-input").value;
  let password = document.getElementById("password-input").value;
  await axios
    .post(`${baseUrl}login`, {
      username,
      password,
    })
    .then(function (response) {
      let token = response.data.token;
      let user = response.data.user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setupUi();
      closeModal(loginModal);

      showToast("Login successful", "success");
    })
    .catch(function (error) {
      document.getElementById("closeModalBtn").click();

      let errorMessage = error.response?.data?.message || "An error occurred";
      showToast(errorMessage, "danger");
    });
}
// Handle error function
function handelError(error) {
  let errorMessage = document.createElement("div");
  errorMessage.innerHTML = `<span>${error.status}</span> Error: ${error.message}`;
  errorMessage.className = "error";
  document.getElementById("postsContainer").appendChild(errorMessage);
}
// ✅ دالة عامة لإظهار التوست
function showToast(message, type = "success") {
  // إزالة أي توستات قديمة
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.parentElement.remove();
  }

  // إنشاء التوست
  const alertDiv = document.createElement("div");
  alertDiv.innerHTML = `
    <div class="toast position-fixed bottom-0 end-0 z-3 m-3 align-items-center text-bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>`;

  document.body.prepend(alertDiv);

  const toastElement = alertDiv.querySelector(".toast");
  const toast = new bootstrap.Toast(toastElement);
  toast.show();

  setTimeout(() => {
    alertDiv.remove();
  }, 4000);
}

function setupUi() {
  const token = localStorage.getItem("token");

  const navLoginBtn = document.getElementById("nav-login-btn");
  const navRegisterBtn = document.getElementById("nav-register-btn");
  const navLogoutBtn = document.getElementById("nav-logout-btn");
  const userData = document.getElementById("user-data");

  if (token == null) {
    navLogoutBtn.style.display = "none";
    userData.style.display = "none";
    navLoginBtn.style.display = "inline-block";
    navRegisterBtn.style.display = "inline-block";
  } else {
    navLoginBtn.style.display = "none";
    navRegisterBtn.style.display = "none";
    navLogoutBtn.style.display = "inline-block";
    userData.style.display = "inline-block";
    uiUserData();
  }
  navLogoutBtn.addEventListener("click", logout);
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUi();
}

// Add New Post
const addNewPostBtn = document.getElementById("addNewPostBtn");
// addNewPostBtn.addEventListener("click", addNewPost);
addNewPostBtn.onclick = addNewPost;

function addNewPost() {
  const addPostBtn = document.getElementById("addPostBtn");
  addPostBtn.addEventListener("click", addNewPostsToPage);
}
async function addNewPostsToPage() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found");
    return;
  }

  const postTitle = document.getElementById("postTitle").value;
  const postBody = document.getElementById("postBody").value;
  const postImg = document.getElementById("postImg").files[0];
  if (!postTitle || !postBody || !postImg) {
    console.error("Title, body or image is missing");
    showToast("Title, body or image is missing", "danger");
    return;
  }

  let formData = new FormData();
  formData.append("title", postTitle);
  formData.append("body", postBody);
  formData.append("image", postImg);
  try {
    await axios.post(`${baseUrl}posts`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    closeModal(createNewPostModal);
    getPosts();
    showToast("Post created successfully!", "success");
  } catch (error) {
    showToast("You must be logged in to create a post.", "danger");
  }
}

function uiUserData() {
  const user = JSON.parse(localStorage.getItem("user"));

  let name = user.name;
  let email = user.email;
  let profileImage = user.profile_image;

  const userImgUi = document.getElementById("user-img-ui");
  userImgUi.src = profileImage;
  const usernameUi = document.getElementById("username-ui");
  usernameUi.textContent = name;
  const emailUi = document.getElementById("email-ui");
  emailUi.textContent = email;
}

function closeModal(modalId) {
  const modalElement = document.getElementById(modalId);
  const modalInstance =
    bootstrap.Modal.getInstance(modalElement) ||
    new bootstrap.Modal(modalElement);
  modalInstance.hide();
}
