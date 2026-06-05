const STORIES = [
  {
    tab:"01",
    theme:"blue",
    left:"components/01_blue/spaceship.svg?v=2",
    right:"components/01_blue/starchart.svg?v=2",
    portraitLight:"images/portraits/01_light_blue.webp",
    portraitDark:"images/portraits/01_dark_blue.webp",
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
    theme:"green",
    left:"components/02_green/birds.svg?v=2",
    right:"components/02_green/tree.svg?v=2",
    portraitLight:"images/portraits/02_light_green.webp",
    portraitDark:"images/portraits/02_dark_green.webp",
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
    theme:"yellow",
    left:"components/03_yellow/dune.svg?v=2",
    right:"components/03_yellow/sun.svg?v=2",
    portraitLight:"images/portraits/03_light_yellow.webp",
    portraitDark:"images/portraits/03_dark_yellow.webp",
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
    theme:"red",
    left:"components/04_red/mushroom-cloud.svg?v=3",
    right:"components/04_red/airplanes.svg?v=2",
    portraitLight:"images/portraits/04_light_red.webp",
    portraitDark:"images/portraits/04_dark_red.webp",
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
    theme:"purple",
    left:"components/05_purple/constellations.svg?v=2",
    right:"components/05_purple/mushrooms.svg?v=3",
    portraitLight:"images/portraits/05_light_lilac.webp",
    portraitDark:"images/portraits/05_dark_purple.webp",
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
const railLeftEl = document.getElementById("rail-left");
const railRightEl = document.getElementById("rail-right");
const portraitLightEl = document.getElementById("portrait-light");
const portraitDarkEl = document.getElementById("portrait-dark");

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

function renderRails() {
  const s = STORIES[active];

  if (s.theme) {
    document.body.dataset.theme = s.theme;
  }

  if (railLeftEl && s.left) {
    railLeftEl.src = s.left;
  }

  if (railRightEl && s.right) {
    railRightEl.src = s.right;
  }

  // swap the portrait to this tab's colour (it bleeds light↔dark in CSS)
  if (portraitLightEl && s.portraitLight) {
    portraitLightEl.src = s.portraitLight;
  }
  if (portraitDarkEl && s.portraitDark) {
    portraitDarkEl.src = s.portraitDark;
  }
}

function render() {
  renderTabs();
  renderStory();
  renderRails();
}

render();