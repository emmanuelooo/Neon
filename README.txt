NEON SHATTER, deploy folder (Cloudflare Pages)

Upload this whole folder as your Pages project ("build output directory" = this folder, no build command):
  index.html          the page (now has the #mn button + Surge and Zen modes your game.js already expects)
  game.js             v4 with fixes
  _headers            CSP + frame-ancestors for Lagos Life
  functions/claim.js  the purchase check (must stay at functions/claim.js so it answers at /claim)

In Cloudflare: Settings > Variables and Secrets > add VATAR_SECRET (type Secret).
  Sandbox: vtr_test_...   Live (after approval): vtr_live_...

In the Vatar dashboard, create 4 products as CONSUMABLE (not one-off):
  extra_life, power_start, double_score, neon_pack
