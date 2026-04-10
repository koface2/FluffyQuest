# GitHub Pages Deployment for FluffyQuest

This branch is used to deploy the game via GitHub Pages. The main entry point is `index.html` and all assets are located in the `assets/` directory. To play the game, visit the GitHub Pages URL after deployment.

## How to Deploy
1. Push the following files and folders to the `gh-pages` branch:
   - `index.html`
   - `game.js`
   - `assets/`
2. In your repository settings, set GitHub Pages to deploy from the `gh-pages` branch (root).
3. Visit the provided GitHub Pages URL to play the game.

## Notes
- All asset paths in `index.html` and `game.js` must be relative and point to the correct files in the `assets/` folder.
- If you add or update assets, make sure to push them to the `gh-pages` branch as well.
