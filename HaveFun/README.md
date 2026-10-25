# HaveFun

HaveFun is a small browser platformer about carrying a kind message to the end of a painted world. Hitting an obstacle makes you lose a word, but you can go back, find it, and keep moving.

The game moves through three visual styles: oil painting, watercolor, and ASCII art. Each section has its own atmosphere, obstacles, and music.

## Controls

- `B` or `←` — move left
- `F` or `→` — move right
- `↑` or `Space` — jump
- `R` — recall a nearby lost word

Touch controls are included for smaller screens.

## Run locally

For the simplest option, open `web/index.html` in a modern browser. No installation is required.

If your browser restricts local files, run this from the project folder:

```bash
python3 -m http.server 8080 --directory web

## Built with

HTML, CSS, JavaScript, Canvas, and the Web Audio API. No build step is required.

## Development note

This project was developed with AI assistance for code and visual prototyping. The final design, direction, testing, and project decisions were guided by the creator.
