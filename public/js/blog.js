const sendComment = (btn) => {
  const postEl = btn.parentNode;
  const postId = postEl.querySelector("[name=postId]").value;
  let comment = postEl.querySelector("[name=comment]").value;
  let email = postEl.querySelector("[name=email]").value;

  fetch("/blog/post/comment/" + postId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, comment: comment }),
  })
    .then((result) => {
      postEl.querySelector("[name=comment]").value = "";
      postEl.querySelector("[name=email]").value = "";
      alert("کامنت شما به ثبت رسید . در صورت تایید نمایش داده میشود");
    })
    .catch((err) => console.log(err));
};

const like = (like) => {
  const postEl = like.parentNode;
  const postId = postEl.querySelector("[name=postId]").value;
  fetch("/blog/post/like/" + postId, {
    method: "POST",
  })
    .then((result) => {
      const likeBtn = document.querySelector("#like-btn");
      likeBtn.classList.toggle("like-btn-click");
    })
    .catch((err) => {
      alert("pls try again");
    });
};
