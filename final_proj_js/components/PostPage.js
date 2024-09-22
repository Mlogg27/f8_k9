const PostPage = () => {
  return /*html*/ `
    <h1 class="heading">Create/Update Post</h1>
    <div class="post-form">
      <div class="input-container">
        <input type="text" id="title" placeholder="Title">
        <textarea class="post-content" placeholder="Content"></textarea>
      </div>
      <div class="button-container">
        <button class="back-btn">Back</button>
        <button class="save-btn">Save</button>
      </div>
    </div>
    `;
};
export default PostPage;
