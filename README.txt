Neon Shatter: deploy notes (Cloudflare Pages)

Files
  index.html   page markup
  style.css    styles
  audio.js     sound effects + original background music
  game.js      game logic + Lagos Life (Vatar) integration
  _headers     security headers (frame-ancestors for Lagos Life)
  functions/claim.js   purchase check, answers at /claim

Deploy: upload this folder as the Pages project (build output = this folder, no build command).
Secret: Settings > Variables and Secrets > VATAR_SECRET (vtr_test_... in the sandbox, vtr_live_... after approval).
Products (Vatar dashboard, all CONSUMABLE): extra_life, power_start, double_score, neon_pack
