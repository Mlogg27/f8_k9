import LoginPage from "./components/LoginPage.js";
import RegisterPage from "./components/RegisterPage.js";
import HomePage from "./components/HomePage.js";
import PostPage from "./components/PostPage.js";
import Navigo from "https://unpkg.com/navigo@7.1.2?module";
import {
  login,
  register,
  fetchPosts,
  refreshToken,
  savePost,
  deletePost,
} from "./modules/fetch.js";

const contentWrapper = document.querySelector(".content-wrapper");
const contentContainer = document.querySelector("#content-container");
const loaderEl = document.querySelector(".loading-container");

const render = (field, content, onRender) => {
  field.innerHTML = content();
  requestAnimationFrame(() => {
    if (onRender) onRender();
  });
};

const router = new Navigo("/", { hash: true });

const isLoggedIn = () => localStorage.getItem("access") !== null;

const defaultRoutes = {
  "/": () => {
    if (!isLoggedIn()) {
      render(contentContainer, LoginPage, attachEvents);
    } else {
      router.navigate("/home");
    }
  },
  "/home": () => {
    if (isLoggedIn()) {
      render(contentContainer, HomePage, attachHomePageEvents);
      main();
    } else {
      alert("Vui lòng đăng nhập!");
      router.navigate("/");
    }
  },
  "/register": () => {
    if (!isLoggedIn()) {
      render(contentContainer, RegisterPage, attachEvents);
    } else {
      router.navigate("/home");
    }
  },
  "/home/save_post": () => {
    if (isLoggedIn()) {
      render(contentContainer, PostPage, attachHomePageEvents);
    } else {
      alert("Vui lòng đăng nhập!");
      router.navigate("/");
    }
  },
};

for (const [path, handler] of Object.entries(defaultRoutes)) {
  router.on(path, handler);
}
router.resolve();

function attachEvents() {
  const emailInput = document.querySelector("#email");
  const passInput = document.querySelector("#pass");
  const nameInput = document.querySelector("#name");

  const loginBtn = document.querySelector(".login-btn");
  const registerBtnFirst = document.querySelector(".register-btn");
  const registerBtnSecond = document.querySelector(".register-btn-2");
  const backBtn = document.querySelector(".back-btn");

  loginBtn?.addEventListener("click", () => handleLogin(emailInput, passInput));

  registerBtnFirst?.addEventListener("click", () => {
    router.navigate("/register");
  });

  registerBtnSecond?.addEventListener("click", () =>
    handleRegister(nameInput, emailInput, passInput)
  );

  backBtn?.addEventListener("click", () => {
    showLoader();
    router.navigate("/");
    hideLoader();
  });
}

function attachHomePageEvents() {
  const logOutBtn = document.querySelector(".logOut-btn");
  const addBtn = document.querySelector(".add-btn");

  const backBtn = document.querySelector(".back-btn");
  const saveBtn = document.querySelector(".save-btn");
  const titleInput = document.querySelector("#title");
  const postContent = document.querySelector(".post-content");

  logOutBtn?.addEventListener("click", handleLogOut);
  addBtn?.addEventListener("click", handleAddPost);

  backBtn?.addEventListener("click", () => {
    showLoader();
    router.navigate("/home");
    hideLoader();
  });
  saveBtn?.addEventListener("click", () =>
    handleSavePost(titleInput, postContent)
  );
}

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateFields = (...fields) =>
  fields.every((field) => field && field.value);

async function handleLogin(emailInput, passInput) {
  showLoader();
  if (!validateFields(emailInput, passInput)) {
    alert("Vui lòng điền đủ các trường thông tin!");
    hideLoader();
    return;
  }

  if (!validateEmail(emailInput.value)) {
    alert("Email không đúng định dạng!");
    hideLoader();
    return;
  }

  try {
    const response = await login(emailInput.value, passInput.value);

    if (response.ok) {
      const token = await response.json();
      Object.entries(token).forEach(([key, value]) =>
        localStorage.setItem(key, value)
      );
      router.navigate("/home");
      alert("Đăng nhập thành công!");
      hideLoader();
    } else {
      alert("Đăng nhập thất bại do email hoặc mật khẩu không đúng!");
      router.navigate("/");
      hideLoader();
    }
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
  }
}

async function handleRegister(nameInput, emailInput, passInput) {
  showLoader();
  if (!validateFields(nameInput, emailInput, passInput)) {
    alert("Vui lòng điền đủ các trường thông tin!");
    hideLoader();
    return;
  }

  if (!validateEmail(emailInput.value)) {
    alert("Email không đúng định dạng!");
    hideLoader();
    return;
  }

  try {
    const response = await register(
      nameInput.value,
      emailInput.value,
      passInput.value
    );

    if (response.ok) {
      alert("Đăng ký thành công. Vui lòng đăng nhập tại đây!");
      router.navigate("/");
      hideLoader();
    } else {
      alert("Email đã được sử dụng, Vui lòng thay đổi!");
      emailInput.value = ``;
      hideLoader();
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký:", error);
  }
}

function handleLogOut() {
  if (confirm("Bạn chắc chắn muốn đăng xuất?")) {
    showLoader();
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.navigate("/");
    hideLoader();
    alert("Đăng xuất thành công!");
  }
}

async function main() {
  try {
    const response = await fetchPosts();
    const postTable = document.querySelector(".post-table");

    if (response.ok) {
      const data = await response.json();
      postTable.innerHTML = /*html*/ `
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Content</th>		
          <th>Action</th>
        </tr>`;
      if (data.length === 0) {
        postTable.innerHTML = `<p style="text-align: center">Hiện đang không có bài viết nào</p>`;
      }
      data.forEach((postEl) => {
        postTable.innerHTML += /*html*/ `
        <tr>
        <td style="text-align: center">${postEl.id}</td>
        <td style="text-align: center">${postEl.title}</td>
        <td style="text-align: center">${postEl.content}</td>		
        <td style="display: flex; column-gap: 5px; justify-content:center; align-items: center;">
        <button data-id=${postEl.id} class="update-btn"><i class="fa-solid fa-pen-nib"></i></button>
        <button data-id=${postEl.id} class="delete-btn"><i class="fa-solid fa-trash"></i></button>
        </td>
      </tr>
        `;
      });
      const updateButtons = document.querySelectorAll(
        "button.update-btn[data-id]"
      );
      const deleteButtons = document.querySelectorAll(
        "button.delete-btn[data-id]"
      );
      handleUpdateTablePost(updateButtons, deleteButtons, data);
    } else if (response.status === 401) {
      await attemptTokenRefresh();
      main();
    }
  } catch (e) {
    console.error("Lỗi trong khi lấy bài viết:", e);
  }
}

async function attemptTokenRefresh() {
  try {
    const response = await refreshToken();
    if (response.ok) {
      const tokenData = await response.json();
      Object.entries(tokenData).forEach(([key, value]) =>
        localStorage.setItem(key, value)
      );
    } else {
      throw new Error("Không thể làm mới token");
    }
  } catch (error) {
    alert("Phiên làm việc đã hết hạn, vui lòng đăng nhập lại.");
    handleLogOut();
  }
}

//thêm, bớt, sửa post
let currentPostID = null;

function handleAddPost() {
  showLoader();
  currentPostID = null;
  router.navigate("/home/save_post");
  hideLoader();
}

async function handleSavePost(titleInput, postContent, postID = null) {
  showLoader();
  if (!postID && !validateFields(titleInput, postContent)) {
    alert("Vui lòng điền đầy đủ các trường!");
    hideLoader();
    return;
  }

  try {
    await attemptTokenRefresh();

    const response = await savePost(
      titleInput.value,
      postContent.value,
      postID || currentPostID
    );

    if (response.ok) {
      currentPostID = null;
      router.navigate("/home");
      titleInput.value = "";
      postContent.value = "";
      hideLoader();
    } else {
      currentPostID = null;
      throw new Error("Lỗi khi cập nhật thông tin bài Post");
    }
  } catch (error) {
    router.navigate("/home");
    hideLoader();
  }
}

async function handleUpdateTablePost(updateButtons, deleteButtons, data) {
  updateButtons.forEach((updateBtnEl) => {
    updateBtnEl.addEventListener("click", (e) => {
      currentPostID = parseInt(e.currentTarget.getAttribute("data-id"));
      router.navigate("/home/save_post");

      setTimeout(() => {
        const post = data.find((ele) => ele.id === currentPostID);
        const inputPost = document.querySelector("#title");
        const postContent = document.querySelector(".post-content");

        inputPost.value = post?.title || "";
        postContent.value = post?.content || "";
      }, 0);
    });
  });

  deleteButtons.forEach((deleteBtnEl) => {
    deleteBtnEl.addEventListener("click", async (e) => {
      currentPostID = parseInt(e.currentTarget.getAttribute("data-id"));

      if (confirm("Bạn chắc chắn muốn xóa post này?")) {
        const response = await deletePost(currentPostID);
        if (response.ok) {
          alert("Xóa post thành công!");
          main();
        } else {
          alert("Không thể xóa bài viết, vui lòng thử lại.");
        }
      }
    });
  });
}

//Loading
function hideLoader() {
  contentWrapper.style.display = "block";
  loaderEl.style.display = "none";
}
function showLoader() {
  contentWrapper.style.display = "none";
  loaderEl.style.display = "block";
}
