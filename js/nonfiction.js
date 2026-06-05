/* nonfiction.js — renders the non-fiction tabs/cards. Every tab number uses
   the dark dress green, and the card margin-rule + read-more link use that
   same green (set in nonfiction.css). Unlike stories.js it does NOT touch the
   rails, portrait, or body[data-theme] — those stay fixed here. */
const NONFIC = [
  {
    tab:"01",
    label:"Field Notes",
    title:"Field Notes",
    link:"#",
    paras:[
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure."
    ]
  },
  {
    tab:"02",
    label:"On Reading",
    title:"On Reading",
    link:"#",
    paras:[
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione."
    ]
  },
  {
    tab:"03",
    label:"A Working Life",
    title:"A Working Life",
    link:"#",
    paras:[
      "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit sed quia non numquam eius modi.",
      "Tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem ut enim ad minima veniam quis nostrum exercitationem."
    ]
  },
  {
    tab:"04",
    label:"Marginalia",
    title:"Marginalia",
    link:"#",
    paras:[
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos.",
      "Et harum quidem rerum facilis est et expedita distinctio nam libero tempore cum soluta nobis est eligendi optio cumque nihil."
    ]
  }
];

const tabsEl = document.getElementById("tabs");
const storyEl = document.getElementById("story");

let active = 0;

function renderTabs() {
  tabsEl.innerHTML = "";

  NONFIC.forEach((s, i) => {
    const b = document.createElement("button");

    // all numbers use the dark dress green
    b.className =
      "tab tab--green" +
      (i === active ? " is-active" : "");

    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", i === active ? "true" : "false");

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
  const s = NONFIC[active];

  storyEl.innerHTML =
    '<h2 class="story-title">' + s.title + '</h2>' +
    s.paras.map(p => '<p>' + p + '</p>').join("") +
    '<a class="read-more" href="' + s.link + '">Read the full piece →</a>';
}

function render() {
  renderTabs();
  renderStory();
}

render();
