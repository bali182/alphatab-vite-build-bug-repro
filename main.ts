import { AlphaTabApi } from "@coderline/alphatab";

new AlphaTabApi(document.getElementById("at-root")!, {
  core: {
    tex: true,
    fontDirectory: "/font/",
    engine: "svg",
  },
});

console.log("I'm imported!");
