function openMeno() {
  var menoMobileEl = document.getElementById("menoMobileEl");
  menoMobileEl.classList.remove("hidden");
}
function closeMeno() {
  menoMobileEl.classList.add("hidden");
}

const like = (like) => {
  const postEl = like.parentNode;
  const postId = postEl.querySelector("[name=postId]").value;

  const likeBtn = document.querySelector("#like-btn");

  likeBtn.classList.toggle("like-btn-click");

  fetch("/post/like/" + postId, {
    method: "POST",
  })
    .then((result) => {})
    .catch((err) => {
      alert("لطفا دوباره تلاش کنید!");
    });
};

var previewImage = function (event) {
  var output = document.getElementById("output");
  output.src = URL.createObjectURL(event.target.files[0]);
  output.onload = function () {
    URL.revokeObjectURL(output.src); // free memory
  };
};

var saveBtn = document.getElementById("save");
if (saveBtn) {
  saveBtn.addEventListener("click", function handleClick() {
    saveBtn.textContent = "لطفا صبر کنید ...";
  });
}

var swiper = new Swiper(".blog-slider", {
  direction: "horizontal",
  autoplay: {
    delay: 4000,
  },
  spaceBetween: 30,
  effect: "fade",
  loop: true,
  mousewheel: {
    invert: false,
  },
  // autoHeight: true,
  pagination: {
    el: ".blog-slider__pagination",
    clickable: true,
  },
});
