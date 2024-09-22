const domain = "http://103.159.51.69:2000";

const apiRequest = async (
  endpoint,
  method,
  body = null,
  requiresAuth = false
) => {
  const headers = { "Content-Type": "application/json" };

  if (requiresAuth) {
    headers["Authorization"] = `Bearer ${localStorage.getItem("access")}`;
  }

  const response = await fetch(`${domain}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  return response;
};

export const login = async (email, password) => {
  return await apiRequest("/login", "POST", { email, password });
};

export const register = async (name, email, password) => {
  return await apiRequest("/master/user", "POST", { name, email, password });
};

export const fetchPosts = async () => {
  return await apiRequest("/post", "GET", null, true);
};

export const refreshToken = async () => {
  return await apiRequest("/login/get_new_token", "POST", {
    refresh: localStorage.getItem("refresh"),
  });
};

export const savePost = async (title, content, id) => {
  const path = id === null ? "/post" : `/post/${id}`;
  const method = id === null ? "POST" : "PUT";
  const response = await apiRequest(path, method, { title, content }, true);
  return response;
};
export const deletePost = async (id) => {
  const response = await apiRequest(`/post/${id}`, "DELETE", null, true);
  return response;
};
