const shows = [
  {
    title: "我的出走日記",
    tag: "療癒",
    identity: "匿名",
    reason: "它沒有急著把我變好，只是安靜陪我承認：我真的累了。",
    likes: 128,
    saves: 46,
  },
  {
    title: "機智醫生生活",
    tag: "療癒",
    identity: "公開",
    reason: "看完會想好好吃飯、好好工作，也好好珍惜身邊的人。",
    likes: 116,
    saves: 52,
  },
  {
    title: "二十五，二十一",
    tag: "成長",
    identity: "匿名",
    reason: "它讓我想起自己曾經那麼用力相信明天，也沒有白費。",
    likes: 104,
    saves: 41,
  },
  {
    title: "鬼怪",
    tag: "戀愛",
    identity: "公開",
    reason: "浪漫不是完美，是有人把你的孤單記得很久很久。",
    likes: 97,
    saves: 38,
  },
  {
    title: "非常律師禹英禑",
    tag: "成長",
    identity: "匿名",
    reason: "它很溫柔地說：不一樣也可以站在世界中間。",
    likes: 89,
    saves: 34,
  },
  {
    title: "黑暗榮耀",
    tag: "痛快",
    identity: "匿名",
    reason: "它不是叫人忘記，而是讓人相信傷口也能長出力量。",
    likes: 84,
    saves: 29,
  },
];

const rankingGrid = document.querySelector("#rankingGrid");
const storyGrid = document.querySelector("#storyGrid");
const tagButtons = document.querySelectorAll("[data-filter]");
const submitForm = document.querySelector("#submitForm");
const formNote = document.querySelector("#formNote");
const themeToggle = document.querySelector("#themeToggle");
const requestTag = document.querySelector("#requestTag");

let activeFilter = "全部";

function groupedShows() {
  return shows
    .reduce((groups, show) => {
      const existing = groups.find((item) => item.title === show.title);
      if (existing) {
        existing.count += 1;
        existing.likes += show.likes;
        existing.saves += show.saves;
        existing.tags.add(show.tag);
        existing.reasons.push(show.reason);
      } else {
        groups.push({
          title: show.title,
          count: 1,
          likes: show.likes,
          saves: show.saves,
          tags: new Set([show.tag]),
          reasons: [show.reason],
        });
      }
      return groups;
    }, [])
    .sort((a, b) => b.likes + b.saves - (a.likes + a.saves));
}

function renderRanking() {
  rankingGrid.innerHTML = groupedShows()
    .slice(0, 3)
    .map((show, index) => {
      const tags = Array.from(show.tags)
        .map((tag) => `<span class="mini-pill">${tag}</span>`)
        .join("");
      return `
        <article class="rank-card">
          <div class="rank-top">
            <span class="rank-number">${String(index + 1).padStart(2, "0")}</span>
            <span class="mini-pill">${show.count} 則理由</span>
          </div>
          <h3>${show.title}</h3>
          <p>${show.reasons[0]}</p>
          <div class="rank-meta">
            ${tags}
            <span class="mini-pill">${show.likes} 讚</span>
            <span class="mini-pill">${show.saves} 收藏</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStories() {
  const visibleShows =
    activeFilter === "全部" ? shows : shows.filter((show) => show.tag === activeFilter);

  storyGrid.innerHTML = visibleShows
    .map((show, index) => {
      return `
        <article class="story-card">
          <div class="story-kicker">
            <span class="mini-pill">${show.tag}</span>
            <span class="identity">${show.identity}</span>
          </div>
          <h3>${show.title}</h3>
          <p class="reason">${show.reason}</p>
          <div class="card-actions">
            <button class="small-action" type="button" data-like="${index}" aria-label="按讚 ${show.title}" title="按讚">
              +${show.likes}
            </button>
            <button class="small-action" type="button" data-save="${index}" aria-label="收藏 ${show.title}" title="收藏">
              ☆ ${show.saves}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function rerender() {
  renderRanking();
  renderStories();
}

tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    tagButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderStories();
  });
});

storyGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const visibleShows =
    activeFilter === "全部" ? shows : shows.filter((show) => show.tag === activeFilter);
  const show = visibleShows[Number(button.dataset.like ?? button.dataset.save)];
  if (!show) return;

  if (button.dataset.like !== undefined) {
    show.likes += 1;
  }

  if (button.dataset.save !== undefined) {
    show.saves += 1;
  }

  button.classList.add("active");
  rerender();
});

submitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(submitForm);
  const reason = String(formData.get("reason")).trim();

  if (reason.length > 100) {
    formNote.textContent = "推薦理由超過 100 字，請再收斂一點。";
    return;
  }

  shows.unshift({
    title: String(formData.get("title")).trim(),
    tag: String(formData.get("tag")),
    identity: String(formData.get("identity")),
    reason,
    likes: 1,
    saves: 0,
  });

  activeFilter = "全部";
  tagButtons.forEach((item) => item.classList.toggle("active", item.dataset.filter === "全部"));
  submitForm.reset();
  formNote.textContent = "已加入本機預覽。正式版會接 Google 登入與審核。";
  rerender();
  document.querySelector("#stories").scrollIntoView({ behavior: "smooth", block: "start" });
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("cool");
});

requestTag.addEventListener("click", () => {
  formNote.textContent = "新 tag 申請會進審核佇列，避免情緒分類失控。";
  document.querySelector("#submit").scrollIntoView({ behavior: "smooth", block: "center" });
});

rerender();
