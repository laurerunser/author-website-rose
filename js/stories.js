const STORIES = [
  {
    tab:"01",
    theme:"blue",
    label:"The Saltglass Sea",
    title:"The Saltglass Sea",
    link:"#",
    paras:[
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute.",
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    ]
  },
  {
    tab:"02",
    label:"Nine Moons of Auber",
    title:"Nine Moons of Auber",
    link:"#",
    paras:[
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
      "Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo nemo enim.",
      "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit sed quia non numquam."
    ]
  },
  {
    tab:"03",
    label:"The Cartographer's Wife",
    title:"The Cartographer's Wife",
    link:"#",
    paras:[
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque.",
      "Corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident similique sunt in culpa.",
      "Et harum quidem rerum facilis est et expedita distinctio nam libero tempore cum soluta nobis est eligendi optio."
    ]
  },
  {
    tab:"04",
    label:"A Brief History of Static",
    title:"A Brief History of Static",
    link:"#",
    paras:[
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates.",
      "Repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur a sapiente delectus ut aut.",
      "Reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat omnis dolor."
    ]
  },
  {
    tab:"05",
    label:"Telegrams from the Belt",
    title:"Telegrams from the Belt",
    link:"#",
    paras:[
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel.",
      "Illum qui dolorem eum fugiat quo voluptas nulla pariatur at vero eos et accusamus et iusto odio dignissimos.",
      "Nam libero tempore cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat."
    ]
  }
];

const tabsEl = document.getElementById("tabs");
const storyEl = document.getElementById("story");

let active = 0;

function renderTabs() {
  tabsEl.innerHTML = "";

  STORIES.forEach((s, i) => {
    const b = document.createElement("button");

    b.className =
      "tab" +
      (s.theme ? " tab--" + s.theme : "") +
      (i === active ? " is-active" : "");

    b.setAttribute("role", "tab");
    b.setAttribute(
      "aria-selected",
      i === active ? "true" : "false"
    );

    b.innerHTML =
      '<span class="num">' + s.tab + '</span>' +
      '<span class="lbl">' + s.label + '</span>';

    b.addEventListener("click", () => {
      active = i;
      render();
    });

    tabsEl.appendChild(b);
  });
}

function renderStory() {
  const s = STORIES[active];

  storyEl.innerHTML =
    '<h2 class="story-title">' + s.title + '</h2>' +
    s.paras.map(
      p => '<p>' + p + '</p>'
    ).join("") +
    '<a class="read-more" href="' +
    s.link +
    '">Read the full piece →</a>';
}

function render() {
  renderTabs();
  renderStory();
}

render();