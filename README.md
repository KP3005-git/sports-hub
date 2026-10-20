**Live site:** https://kp3005-git.github.io/sports-hub/

GitHub Pages serves `index.html` from the `main` branch (folder `/`). That file is the site; an empty `.nojekyll` keeps Pages from processing it with Jekyll.

# Game Day HQ ⚡

> **Renamed (Oct 20, 2026):** the site was "BLITZ ⚡ Sports Hub"; it is now **Game Day HQ**, and the shared picks area (Blitz + Court) is the **🎯 Picks Desk**. The per-pick analyst tags (⚡ Blitz / 🏀 Court) and the All / Blitz / Court selector still name the individual analyst. The file name (`sports-hub.html`), the tab id `blitz` / `#records` link, and every localStorage key are unchanged, so saved teams, bets, layouts and settings carry over.

A personal, season-long scoreboard and bet tracker for **College Football, Men's College Basketball, NFL and NBA**.
It's a single file, `sports-hub.html`. No server, no account, no install, and nothing is published anywhere.

## Open it
1. Copy `sports-hub.html` anywhere on your computer (Desktop is fine).
2. Double-click it to open it in Chrome, Edge, Firefox or Safari. You need an internet connection, because scores come live from ESPN's free public feed.
3. Bookmark it. Links like `sports-hub.html#cfb/live`, `#nba`, `#bets` and `#mine` open straight to a tab or filter. The short `#live` link also works.

Tabs: **⭐ My Teams · CFB · CBB · NFL · NBA · Bets · Settings**
- CFB and NFL go **by week**: ◀ ▶, a week dropdown, a date picker, and "This week". CBB and NBA go **by day**: the arrows skip to the next or previous day with games, and there's a date picker and "Today".
- Nothing is hardcoded. It always opens on the current week or today, so it works all season and keeps working next season.
- Off-season and no-game days say so, with a button to jump to the next game day or opening day.
- It auto-refreshes every 30s **only while a game is live** (halftime, end of a quarter, OT and delays all count as live). Otherwise it waits until the next start time.
- Alerts and filters: upset alerts, close-game alerts, RED ZONE, down and distance, possession 🏈, TV network, and filter buttons with counts (All / Live / Upcoming / Final / Alerts / Top 25 / ⭐ Mine). Your filter is remembered for each league.

## Rearrange cards (drag and drop)
Grab the small **⠿⠿ handle** at the top of any card and drag it, with a mouse or a finger. This works on every league tab (your teams, favorite players, all games), in My Teams, and for Live & Open bet slips.
- Order is saved per view in this browser. League tabs save it per week (CFB/NFL) or per day (CBB/NBA). It survives the 30-second auto-refresh and reloads, and a refresh never fires mid-drag.
- New games without a saved spot go after the ones you placed. Games that drop off the list are ignored.
- Your favorites stay pinned at the top until you move them.
- **↺ Reset layout** in each view puts that view back to the default order.

## On your phone (iPhone / Android)
No hosting needed: your PC serves the file over your home Wi-Fi.
1. On the PC, in the folder that holds `sports-hub.html`, run `python -m http.server 8000` (keep that window open). Find the PC's local IP (`ipconfig` on Windows, e.g. `192.168.1.23`). Windows may ask to allow Python through the firewall on **private** networks; allow it.
2. On the iPhone (same Wi-Fi), open Safari at `http://<pc-ip>:8000/sports-hub.html`.
3. Share → **Add to Home Screen**. It opens full-screen as **Game Day HQ** with its ⚡ icon.
- Only devices on your home network can reach it while the server runs; nothing is published online. Away from home it won't load (by design).
- Data lives **per browser**: the phone has its own localStorage, separate from the PC's (and the Home Screen app can be separate from Safari tabs). Picks still come from the Google Sheet, but your teams, favorite players, fantasy roster and hub-only bets need to be copied over once with **Settings → Backup & restore** (export on the PC, import on the phone), or re-added.
- **Tap** a score card to open game details (double-click on desktop). Details open full screen; the gold **✕ Close** button stays at the top while you scroll.
- **Reorder cards on the phone:** tap **↕ Reorder** (next to ↺ Reset layout), then use the **▲ ▼** buttons on each card, or press and drag the big **⠿⠿** handle. Tap **✓ Done** in the bar at the bottom. The order is saved exactly like the desktop drag order (same storage).
- Tap a player row in 👥 Players to see his plays; tap badges such as injury statuses to see the info that shows on hover on desktop.
- Wide tables (box scores, team stats, bets, Picks Desk records, injuries) scroll sideways inside their box; the page itself never scrolls sideways.

## Add your teams
**Settings → My Teams.** Type a team name (e.g. "colts") and click the result. Favorites:
- are pinned at the top of their league tab and highlighted in gold. If a team is on a bye or has no game today, its next game is shown instead.
- show up in the **⭐ My Teams** tab, which lists every favorite's live, today's or next game across all leagues.

You can also set them in the file. At the top of the `<script>` in `sports-hub.html`, edit:
```js
const MY_TEAMS = { cfb:[{id:'2509',name:'Purdue Boilermakers',abbr:'PUR'}], cbb:[], nfl:[], nba:[] };
const MY_PLAYERS = [ {id:'1966', league:'nba', name:'LeBron James'} ];
```
These seed objects are only read the first time the page opens in a browser. After that, Settings is the source of truth. "Reset to file config" re-reads `MY_TEAMS`. Teams can be exported and imported as JSON on their own.

**Favorite players** (Settings → Favorite Players): the player's team is looked up live from ESPN each time, so trades are picked up automatically. Each card shows the next or current game and a live or final **PTS / REB / AST** line, or the last game's line, including preseason. Their team's game is highlighted on the league tab with a 👑 badge. Inactive or injured players get a badge, and a retired player shows "not on an active roster".

**Fantasy (Yahoo)** (Settings → Fantasy): paste your Yahoo league link and add your roster players. The hub looks up each player's NFL team from ESPN, or you can pick the team by hand. NFL games with your players get a blue **FF: names** badge. This does **not** log into Yahoo. A live Yahoo roster sync would need Yahoo OAuth (a developer app and sign-in), which could be added later.

## Bets: the Google Sheet is the source of truth
**Bet log sheet:** [Sports Hub – Bet Log](https://docs.google.com/spreadsheets/d/18Rr-vtGEaRRzV4UbiD0_vOWC929ZBlms7TMdE0NvYFU/edit), with tabs **Placed**, **Recommendations** and **README**.
- Blitz (football analyst), Court (basketball analyst) or you add one row per bet. Each time the Bets tab opens or refreshes, the hub reads both tabs and grades them. A bar shows **🟢 Synced from Google Sheet · time**.
- **The sheet must be shared as "Anyone with the link → Viewer"** (Share → General access). Never give the link edit access. Until it's shared, the hub shows "Couldn't reach the Google Sheet… showing cached copy".
- If you're offline or the sheet can't be reached, the hub falls back to the last synced copy.
- Your local tweaks in the hub (result override, cash-out amount, closing odds, "verified", manual prop results) are kept on top of the sheet's rows. Anything filled in the sheet wins.
- Rows deleted from the sheet disappear from the hub. Bets logged in the hub itself are marked **hub only**, and a **📋 Copy row for sheet** button gives you a tab-separated row to paste into the sheet (or just ask Blitz for football / Court for basketball to log it).
- The sheet ID lives in Settings → Google Sheet. Pasting a full sheet URL there also works.

### Sheet format (for Blitz and Court)
Row 1 is the header; don't rename or reorder it. Write values RAW: numbers as plain numbers, everything else as text.

**Placed:** `id | date | sportsbook | bet_type | stake | odds | boosted | odds_note | odds_entered_at | odds_verified_at | closing_odds | closing_entered_at | result_override | cashout_amount | notes | legs`

**Recommendations:** `id | date | sportsbook | bet_type | odds | boosted | odds_note | odds_entered_at | odds_verified_at | verdict | closing_odds | closing_entered_at | result_override | notes | legs`

- `id`: unique string. `date`: YYYY-MM-DD. `bet_type`: moneyline / spread / total / parlay / prop. `stake`: dollars. `odds`: American ticket odds as a number (262, -110), always typed from the ticket. `boosted`: TRUE/FALSE.
- `odds_entered_at` / `odds_verified_at` / `closing_entered_at`: ISO timestamps. `closing_odds`: American (for CLV). `verdict`: Consider / Wait / Pass.
- `result_override`: blank = auto-grade, or won / lost / push / void / cashout. `cashout_amount`: total $ returned.
- `legs`: a JSON array in one cell, for example
  `[{"league":"cfb","eventId":"401858488","market":"spread","selection":"194","selectionName":"Ohio State","line":-2.5,"odds":null,"game":"Ohio State at Indiana"}]`
  Shorthand also works: `league|eventId|market|selection|line|legOdds`, with legs separated by `;`, e.g. `cfb|401856724|moneyline|251||;cfb|401858488|spread|194|-2.5|`.
  `selection` = ESPN team id (moneyline/spread), `over`/`under` (total), or free text (prop). `line` = the selected team's spread or the total.
- Rows with problems (bad odds, no legs, unknown league…) are skipped, and the hub lists them by row number under the sync bar.
- **Optional Recommendations columns** (add them as new header cells at the right end, after `legs`; the hub reads columns by header name, and blank is fine):
  - `confidence`: one of `high` / `med-high` / `medium` / `low-med` / `low`, or a number `1`–`5` (also `4/5`). Case doesn't matter. If the column is blank or missing, the hub tries to read it from `notes` ("Low conf.", "Med-High confidence", "conf 4/5", "confidence: high", "⭐⭐⭐"), and otherwise shows n/a.
  - `graded_at`: ISO 8601 time the result was decided, with the offset, e.g. `2026-10-18T16:30:00-04:00`. It is shown in the Picks Desk records table. Grading doesn't depend on it.
  - `analyst`: who made the pick, `Blitz` or `Court` (case and spaces don't matter; any other name is shown as written). See the next section for how a blank is filled in.
  - A leg can also carry `"date":"2026-10-18"` (the game day). If it's missing, the hub uses ESPN's game date, then the row's `date`.

### Logging format for Court (basketball picks)
Court logs NBA and CBB picks into the **same sheet and tabs** (Recommendations, and Placed for anything Kaelen actually bets), with exactly Blitz's columns and rules above. The only differences:
- **`id`**: start it with `court-`, e.g. `court-20261020-nba-phi-ny-sp` or `court-20261121-cbb-pur-ala-ml`. Blitz keeps `blitz-…`.
- **`analyst`** (optional column at the right end): `Court`. If it's present it always wins. With no column or a blank cell, the hub uses the id prefix (`blitz-` → Blitz, `court-` → Court), then the sport of the legs (all basketball → Court; football or mixed football + basketball → Blitz). All of this lives in one helper, `analystOf()`. **Note:** the NBA rows logged on Oct 20 are named `blitz-20261020-nba-…`, so they count as Blitz.
- **Legs**: `"league":"nba"` or `"league":"cbb"`, `eventId` = the ESPN event id (e.g. tonight's PHI @ NY is `401909089`), `selection` = the ESPN team id for moneyline/spread (NY = `18`), `over`/`under` for totals. Example:
  `[{"league":"nba","eventId":"401909089","market":"spread","selection":"20","selectionName":"Philadelphia 76ers","line":4.5,"odds":-105,"game":"Philadelphia 76ers at New York Knicks"}]`
- **Props**: add `"athleteId":"<ESPN athlete id>"` to the leg (LeBron = `1966`) so injury warnings match by id, e.g. `{"league":"nba","eventId":"401909089","market":"prop","selection":"LeBron James O 15.5 points","line":15.5,"odds":-112,"athleteId":"1966"}`. Props are never auto-graded, so set `result_override` (won/lost/push) once the game ends.
- Moneyline, spread and total auto-grade from ESPN final scores for NBA and CBB the same way as football. Overtime is included because the final score is used. Parlays may mix sports.

### Logging and grading
**Bets → + Log placed bet**, or hit **+ slip** on any game card. This creates a hub-only entry and shows the row to paste into the sheet.
- Fields: sportsbook (defaults to FanDuel, editable), date, stake, American odds, bet type (moneyline / spread / total / parlay / prop), legs (each tied to an ESPN game), selection, line, and optional leg odds.
- **You always type the odds yourself.** They are never auto-filled. The time you entered them is saved, and you can mark them "verified" once you've checked the ticket.
- **Auto-graded** from ESPN live and final scores: moneyline, spread and total legs, including live WINNING / COVERING / NEEDS N MORE badges and the ticket status (ON TRACK, IN DANGER, CASHED, LOST). Finals are saved into the bet, so history survives even if ESPN changes.
- **Manual**: props, plus any leg or ticket through the Result picker (Won / Lost / Push / Void / Cash out with an amount).
- History shows record, total staked, net P/L, ROI, CLV (closing odds you enter), and breakdowns by sportsbook and bet type. Set a **unit size** in Settings to also see P/L in units.
- **Recommendations** are tracked separately from placed bets, with a verdict (Consider / Wait / Pass). They are never counted in P/L. "Log as placed" turns one into a real bet, and you enter the odds you actually got.
- Your real 10/17/2026 FanDuel 3-leg parlay ($5 at +262 boosted) is preloaded. It grades **LOST, −$5.00** (Texas lost 27–24 to Florida).

Nothing connects to FanDuel or any sportsbook. The book's own grading is official.

### Keeping picks current
While the hub is open it re-reads the sheet in the background on every tab, at most once every 2 minutes. New rows from Blitz or Court get their 🎯 chips without a reload. If a saved filter such as **Live** or **⭐ Mine** hides an upcoming game that an analyst has picks on, a note above the cards lists those games and has a **Show all games** button.

## 🎯 Picks Desk records (how good are Blitz's and Court's picks?)
This tab (also reachable at `#records`) grades **the analysts' Recommendations only**, as if each **Consider** pick were a flat **$5** bet at the odds they logged (boosted odds as logged). Kaelen's placed bets and real P/L stay in 💸 Bets and are never mixed in. The tab only **reads** the sheet (gviz GET, plus the cached copy when offline); it never writes to it.
- **Analysts:** a selector (All / Blitz / Court, plus any other name found in the `analyst` column) filters every number, chart and table below it. Side-by-side summary cards above show each analyst's record, win %, P/L, ROI and Pass/Wait accuracy for the current league and range filters. Click a card to select that analyst. Pick cards in game details and the Bets list carry the analyst's tag (⚡ Blitz, 🏀 Court). The section is titled with the analyst's name when every pick on a game is theirs, and **Picks** when it's mixed.
- **Grading:** `result_override` (won / lost / push) wins if it's set. Otherwise the same auto-grader as Bets runs on ESPN scores. Props without an override, and games not yet final, count as **pending**. A void or cashout override drops the pick from the record.
- **Record:** Consider W-L-P and win % (pushes excluded), $5 flat P/L, and ROI on settled stakes. A warning shows while fewer than 30 Consider picks are graded.
- **Charts** (inline SVG, toggle per day / per week, weeks start Monday): win % by period and cumulative, the cumulative record, cumulative $5 P/L, and Pass/Wait call accuracy. A pick's day is its game's day.
- **Pass / Wait calls:** a call is **right** when the bet lost, **wrong** when it won, and a push isn't counted.
- **CLV** (only on picks with `closing_odds`): the average in cents (American odds with the ±100 gap removed, so −110 → −105 is +5¢), in implied-probability points, in price %, and the share of picks that beat the close.
- **Breakdowns:** straight / props / parlays, each bet type, and confidence level (n/a when none is found; the tab says how many rows had one and from which source).
- **Filters:** league (All / CFB / NFL / CBB / NBA) and range (Last 7 days / Last 30 days / Season since Aug 1 / All). The graded-picks table (date, game, pick, verdict, odds, result, $5 P/L) sorts by date when you click the header. Rows whose `id` contains `TEST` (e.g. `TEST-…`, `court-TEST-…`) are flagged as test data.

## Fantasy: live points (🏆 Fantasy tab)
The hub scores your roster itself from ESPN's public NFL box scores. It does **not** connect to Yahoo; Yahoo's own numbers are always the official ones.

- **What's scored**
  - Passing yards and TDs, interceptions.
  - Rushing and receiving yards and TDs, receptions.
  - 2-point conversions (pass, rush or catch), fumbles lost.
  - Kick and punt return TDs.
  - **K:** field goals by distance and PATs.
  - **D/ST:** sacks, interceptions, fumble recoveries, defensive and return TDs, safeties and points allowed.
- **Default scoring = Yahoo's default league settings (Half-PPR).** Source: Yahoo Help, "Default league settings in Fantasy Football" (help.yahoo.com/kb/default-league-settings-fantasy-football-sln6489.html).
  - Offense:
    - 0.5 per reception; 1 pt per 25 pass yds; pass TD 4; INT −1.
    - 1 pt per 10 rush/rec yds; rush/rec/return TD 6; 2-pt conversion 2; fumble lost −2.
    - Fractional points are on (e.g. 189 pass yds = 7.56).
  - Kicker: FG 0–39 yds 3, 40–49 yds 4, 50+ yds 5; PAT 1.
  - D/ST:
    - Sack 1, INT 2, fumble recovery 2, TD 6, safety 2, block 2.
    - Points allowed: 0 → 10, 1–6 → 7, 7–13 → 4, 14–20 → 1, 21–27 → 0, 28–34 → −1, 35+ → −4.
- **Presets** (Settings → Fantasy scoring): Yahoo Half-PPR (default), Yahoo PPR and Yahoo Standard. Every value is editable; once you change one, the preset shows **Custom**. Pick a preset again to reset.
- **Fantasy tab**
  - Roster table: slot, player, team, opponent, game status and score, stat line, a per-stat breakdown, points and a status (FINAL / LIVE / PRE / BYE / INACTIVE / NO DATA).
  - Tick or untick **Start** to move a player between starters and bench. Totals update right away.
  - Use the week selector (Prev / Next / dropdown / This week) to look at past weeks.
  - Auto-refresh runs every 30 s while a rostered game is live.
- On the NFL tab, the **FF** badge shows each rostered player's points for that game.
- **Add players** in Settings → Fantasy.
  - Search ESPN to add a player; this stores the ESPN athlete id and position.
  - Or add one by hand with a name, team and position (Player / K / DST). Hand-added players are matched to the box score by name.
- **Limits**
  - Blocked kicks aren't in ESPN's box score, so they score 0.
  - Return *yards* aren't scored.
  - 2-pt conversions and FG distances are read from ESPN's scoring-play text (best effort).
  - D/ST points allowed uses the opponent's final score, including points the offense gave up. Yahoo's count can differ.
  - Past weeks use the player's *current* team, so a traded player shows his new team's game.
  - Stat corrections aren't applied.

## Highlights (🎬 tab) and game details
- **Highlights board.** Video clips from ESPN's public data for CFB, CBB, NFL and NBA, newest first. Each card shows:
  - thumbnail and headline;
  - league and game;
  - duration (when ESPN provides it, which is mainly game-summary clips);
  - publish time.
- **Links.** Every link is the ESPN-provided `links.web.href` from that data (https://*.espn.com only) and opens ESPN in a new tab. The hub never builds or guesses a video URL. Clips without an ESPN web link are skipped.
- **Sources.**
  - League news feeds: the items with `type: "Media"`.
  - Team news feeds (`news?team={id}`) for:
    - My Teams;
    - favorite players' current teams;
    - fantasy roster teams.
  - The `videos` array of the current or last game summary for My Teams and favorite players' teams.
  - Results are cached for 5 minutes; **↻ Refresh** forces a reload.
- **Filters** (remembered):
  - League: All / CFB / CBB / NFL / NBA, with counts.
  - Everything or **⭐ My teams & players**.
  - Today / This week (default) / All.
- **"Mine" tags:**
  - ⭐ My Teams, e.g. Purdue: ESPN tagged the clip with that team.
  - 👑 Favorite player, e.g. LeBron: ESPN tagged him, or his name is in the headline.
  - 👑 His current team, e.g. "76ers (LeBron James)".
  - 🏆 Fantasy roster player: ESPN tagged the athlete id, or a hand-added player's name is in the headline. A roster player's team alone doesn't count.
- When nothing matches, the board says **No video available**.
- **Game detail modal.**
  - Score cards that an analyst (Blitz or Court) has picks on show a blue **🎯 N** chip (N = number of picks). Click it to open the game. Bet-slip leg cards in the tracker don't show it.
  - **How to open it:**
    - **Double-click any score card**: league tabs, My Teams, favorite-player cards and bet-slip legs (including stored finals).
    - Or tap **▶ details** on the card (touch), or **Game details** on a highlight.
    - Double-clicking never starts a drag, because dragging works only from the ⠿⠿ handle. A double-click on the handle itself is ignored.
  - **What's in it** (all from ESPN's game summary):
    - Score, status, TV, venue, and the score-by-period table.
    - **🏈 Field position** (CFB and NFL only, right under the score). The away end zone is always on the left and home on the right, in team colors from ESPN, with yard lines every 10 yards. While live it shows the ball on the line of scrimmage with the offense's abbreviation and an arrow (away drives →, home drives ←), a yellow line to gain (or "GOAL TO GO"), shading between the two, and a line like "HOU ball · 1st & 10 at HOU 31". Inside the 20 the field gets a red border, a red tint and a RED ZONE badge. It also has states for pregame ("Kickoff at …"), halftime, between quarters (ball kept, "End of 1st"), right after a score ("Extra point" / "Kickoff"), and Final (no ball). It's hidden when ESPN has no spot. Data is the summary's latest play (same source as the situation box), falling back to the scoreboard. It updates on the 20 s refresh, and the node is left untouched when nothing changed. It's never drawn for NBA/CBB.
    - **🎯 Picks Desk** (right under the score; the subtitle names the analysts with picks on the game, e.g. "Blitz · 2 on this game", or "Blitz & Court" when there are none): every recommendation with a leg on this game (matched by ESPN event id). Each shows the verdict badge (Consider green / Wait amber / Pass grey), bet type, the leg's selection, line and leg odds, overall odds (🚀 BOOSTED if flagged), sportsbook and Blitz's notes. Parlays say "Parlay leg (3 legs, +648)" and list the other legs. Legs are graded with the bet tracker's own logic (pending / covering / FINAL WON / LOST / PUSH; props stay manual). Your placed bets on the game appear underneath as **Your bets**. With no picks it says "No picks from Blitz for this game." If the sheet can't be read (e.g. not shared by link yet) a hint appears and the cached / hub-only picks are still shown.
    - **Current situation** while live: down & distance, red zone, possession and last play. Down & distance and possession come from the summary's latest plays, so they match the play list. The scoreboard snapshot is used only when the summary has no plays yet. Right after a score the box shows just the last play.
    - **Win probability**, when ESPN provides it: the current split plus a line chart over the game.
    - **Leaders** per team (passing / rushing / receiving / sacks / tackles, or points / rebounds / assists).
    - **Team stats**, side by side.
    - **👥 Players**: the full ESPN box score, showing every player ESPN lists with stats. Football has one table per ESPN category (Passing, Rushing, Receiving, Fumbles, Defense, Interceptions, Kick/Punt returns, Kicking, Punting), with ESPN's labels, column order and team totals. Basketball has one table per team, starters then bench, plus a Team totals row; DNP players are collapsed under "Did not play (N)". There's an **Away / Home / Both** toggle (remembered). Click a column header to sort (desc → asc → off). Click a player to see his plays: basketball uses ESPN's play participants (athlete id); football matches his name in the play text ("C.Stroud", "#1 T.Richard"), so an odd play can be missed or mis-attributed. Fantasy roster players get ⭐ plus their points from the Fantasy scoring code, and a rostered D/ST gets a badge on the team header (NFL). Favorite players such as LeBron get 👑. Tables scroll sideways on phones with the name column pinned. The 20 s refresh keeps the toggle, sort, opened players and sideways scroll, and leaves the section untouched when nothing changed. Pregame it says "Player stats appear once the game starts."
    - **Live play-by-play**, newest first. Football is grouped by **drive** (result badge, "in progress" on the current drive). Basketball is grouped by **period**. Scoring plays are highlighted, and an **All plays / Scoring plays only** filter is remembered.
    - Highlights, "Open on ESPN ↗", and + slip for unfinished games.
  - **Live refresh** runs every **20 s** while the game is live. It keeps your scroll position in both the modal and the play-by-play box, and it keeps the drives or periods you opened. A new drive or period opens automatically.
  - Close it with **Esc**, **✕**, or a click on the backdrop.
- Limits:
  - The game summary can trail ESPN's scoreboard by a few seconds.
  - Play-by-play and win probability show only when ESPN publishes them for that game, which can be missing for some lower-division college games.
  - ESPN's news feeds return about the latest 50 items per feed, so older clips drop off.
  - The board's durations mostly come from game summaries.
  - CBB has little video in the off-season.
  - Some clips may be geo- or sign-in-restricted on ESPN's side.

## 🩹 Injuries (tab, game details, and alerts for your players)
Everything comes from ESPN's public injury data. The hub only reads it and doesn't connect to any team or fantasy site.
- **🩹 Injuries tab:** a league-wide list per league, with buttons for All / CFB / CBB / NFL / NBA, a team dropdown, a status dropdown (Out, IR, Doubtful, Questionable, Day-to-day, Suspended, or ⭐ My players) and a search box (player, team, injury, note). It shows the player, position, team, a colored status badge, the injury, ESPN's estimated return, when ESPN last updated it, and the latest note. A card per league shows how many players are listed and when the data was last updated.
- **Game details → 🩹 Injuries:** both teams, from the game's own ESPN summary combined with the league list, most serious first. For finished games the status is ESPN's latest and can be newer than the game.
- **Your players:** a banner on ⭐ My Teams and 🏆 Fantasy (e.g. "⚠️ 3 of your players on ESPN's injury report: 1 out · 1 on IR · 1 questionable") covers your fantasy roster, favorite players (LeBron) and players on your My Teams (Purdue). Tap a name to open him in the Injuries tab. Fantasy rows get a status badge, and the 👥 Players box score marks injured players with 🩹 and a short status.
- **Analyst picks (Blitz and Court):** a prop whose player is on the injury report shows a ⚠️ warning with the status and note. The player is matched by the leg's `athleteId` if the analyst logged one, otherwise by the name before " O " / " U " in `selection`.
- **Offline and refresh:** the last download is cached in this browser (localStorage key `sportsHub.injuries.v1`, separate from your backup data). It's refreshed at most every 15 minutes, or 2 minutes after a failed try, and only while a page that uses it is open. If ESPN can't be reached, the cached copy is shown with its time.

**What ESPN actually has** (checked Oct 18, 2026):

| League | League list (`…/injuries`) | Game summary `injuries` |
|---|---|---|
| NFL | ✅ 32 teams, 268 injured. ESPN returns at most 25 items per team, and most are "Active" news notes (532), which the hub hides. Long-term IR players can fall off that cap. | ✅ newest 5 per team, no notes |
| NBA | ✅ 28 teams, 90 listed (mostly Day-To-Day, plus Out) | ✅ (e.g. PHI @ NY, Oct 20) |
| College football | ⚠️ only 3 items: 1 from 2020 (hidden as over a year old) and 2 "Active" notes from 2022, so effectively nothing | ❌ no `injuries` in college summaries |
| Men's college basketball | ⚠️ empty list (preseason) | ❌ |

So Purdue players can't really be checked: ESPN doesn't publish college injury data through these feeds. The page says so instead of showing "all clear".

## Back up your data (important)
Bets live in the Google Sheet. Everything else (teams, players, fantasy, layout, local bet tweaks, and a cached copy of the sheet) is saved in your browser's localStorage, on that computer and in that browser only. Clearing browser data wipes it.
- **Settings → Full backup (JSON)** downloads everything: teams, players, fantasy, bets and recommendations. Do this regularly.
- **Bets CSV / Recs CSV** open in Excel or Google Sheets.
- **Import (merge)** adds or updates items by `id`. **Import (replace all)** restores a backup exactly.

## JSON format (so Blitz, Court or anything else can log bets)
Import accepts a full backup, any subset of these keys, or a bare array (treated as `placedBets`). Merge matches on `id`.
```json
{
  "app": "blitz-sports-hub", "schemaVersion": 1, "exportedAt": "2026-10-17T21:00:00Z",
  "settings": { "defaultBook": "FanDuel", "unitSize": null },
  "myTeams": { "cfb": [{"id":"2509","name":"Purdue Boilermakers","abbr":"PUR"}], "cbb": [], "nfl": [], "nba": [] },
  "favoritePlayers": [{ "id": "1966", "league": "nba", "name": "LeBron James" }],
  "fantasy": { "leagueUrl": "", "roster": [{ "name": "Jonathan Taylor", "athleteId": "4242335", "teamId": "11", "teamAbbr": "IND" }] },
  "placedBets": [{
    "id": "fd-20261017-cfb-3leg",          // any unique string
    "date": "2026-10-17",                  // YYYY-MM-DD placed
    "book": "FanDuel",
    "betType": "parlay",                   // moneyline | spread | total | parlay | prop
    "stake": 5,                            // dollars
    "odds": 262,                           // American ticket odds, typed from the ticket
    "oddsNote": "boosted",
    "oddsEnteredAt": "2026-10-17T20:59:00Z", "oddsVerifiedAt": null,
    "closingOdds": null, "closingEnteredAt": null,   // for CLV
    "resultOverride": null,                // null = auto | won | lost | push | void | cashout
    "payoutOverride": null,                // total $ returned (cash-outs, odd pushes)
    "notes": "",
    "legs": [{
      "league": "cfb",                     // cfb | cbb | nfl | nba
      "eventId": "401856724",              // ESPN game id (null for props without a game)
      "date": "2026-10-17",
      "game": "Florida at Texas",
      "market": "moneyline",               // moneyline | spread | total | prop
      "selection": "251",                  // ESPN team id (ML/spread) | "over"/"under" (total) | free text (prop)
      "selectionName": "Texas",
      "line": null,                        // spread line for the selected team (-2.5) or total (51.5)
      "odds": null,                        // optional leg odds
      "manual": null                       // null = auto | won | lost | push
    }]
  }],
  "recommendations": [{ "...same shape as a bet, but no stake...": "", "verdict": "Consider" }]
}
```
(The `//` comments are documentation only. Real JSON files can't contain comments.)
ESPN game ids come from the scoreboard feed (`events[].id`) or the game's ESPN URL (`.../game/_/gameId/401856724`).

## Data sources and CORS (tested from file:// in headless Chrome)
| Used for | Endpoint | CORS from file:// |
|---|---|---|
| Scores | `site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard` (CFB `groups=80&limit=300`, CBB `groups=50&limit=400`, weeks via `seasontype&week&dates=YEAR`, days via `dates=YYYYMMDD`) | ✅ |
| Team schedule (next/last game) | `.../teams/{id}/schedule[?seasontype=N]` | ✅ |
| Live game / grading / box score | `.../summary?event={id}` | ✅ |
| Player info (current team, status) | `site.web.api.espn.com/apis/common/v3/sports/{sport}/{league}/athletes/{id}` | ✅ |
| Team and player search | `site.web.api.espn.com/apis/search/v2?type=team|player&query=` | ✅ |
| NFL team list (fantasy dropdown) | `.../football/nfl/groups` | ✅ |
| Highlights (video) | `site.api.espn.com/apis/site/v2/sports/{sport}/{league}/news?limit=50[&team={id}]` (items with `type: "Media"`) and `.../summary?event={id}` → `videos[]` | ✅ (needs a normal browser user agent. ESPN rejects the default `HeadlessChrome` UA, so the tests set a desktop UA) |
| Injuries (league-wide) | `site.api.espn.com/apis/site/v2/sports/{sport}/{league}/injuries` (NFL ≈ 8.7 MB, so it's downloaded at most every 15 min and only the injured players are cached) | ✅ |
| Injuries (one game) | `.../summary?event={id}` → `injuries[]` (newest 5 per team) | ✅ |
| ❌ not used for injuries | `sports.core.api.espn.com/v2/sports/{sport}/leagues/{league}/teams/{id}/injuries` (CORS ✅, but each entry is a separate `$ref` request, which would mean hundreds of requests) and athlete `injuries` on `site.web.api.espn.com/.../athletes/{id}` (CORS ✅, one request per player) | ✅ but not used |
| ❌ not used | `.../teams` and `.../teams/{id}` | **No CORS header, so they're blocked from file://** |
| Bet log (Google Sheet) | `docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:json;responseHandler:CB&headers=1&sheet={tab}`, loaded as a `<script>` (JSONP) | ✅ JSONP works. **The gviz CSV (`tqx=out:csv`) and `/export?format=csv` are CORS-blocked from file://**, so they aren't used. The sheet must be link-viewable. |

ESPN's feed is free but unofficial and undocumented. If ESPN changes it, the page shows an error banner and keeps the last good data.

## Developer notes
`tests/` holds the Playwright checks used to verify the build: `smoke.py` (all tabs, console errors), `mobile.py` (88 checks: iPhone 13 and iPhone SE in WebKit, Pixel 7 in Chromium, over http://localhost and file://; no sideways scroll on every tab, tap-to-open, full-screen details with sticky close, Reorder mode ▲▼ and touch drag persisting after reload, player-row tap, tap tooltips, PWA meta, ESPN + Sheet loading from an http origin, desktop unchanged), `functional.py` (navigation, filters and persistence, favorites, fantasy, a parlay entered through the UI and graded against Oct 17 finals, edge cases, import and export), `fantasy.py` (22 checks: scoring against TB at DAL, 2026 week 5, checked by hand; K, D/ST, bye, inactive, PPR and custom presets, starter toggle, week selector, simulated live state with 30 s refresh, FF badge points), `gamedetail.py` (25 checks: double-click on the league grid, My Teams, a bet leg and a stored final; a live CFB game with situation, 20 s refresh, and scroll and open drives kept; NFL and NBA preseason finals with drives or periods newest first, leaders, team stats, win probability and the scoring filter; the drag handle doesn't open the modal and drag still works; Esc, ✕ and backdrop close; a touch tap on ▶ details), `highlights.py` (21 checks: cards load from file://, every link comes verbatim from ESPN's responses, filters and persistence, Purdue/LeBron/fantasy tagging, today filter, a mocked empty state, and the game detail modal opened from a highlight and from game cards, covering pre-game, live refresh and closing), `players.py [--shot]` (22 checks: every table cell, player count, category order, labels, totals, starters/bench and DNP versus ESPN JSON for 3 CFB summaries, the live-saved NFL HOU vs JAX and NBA BOS @ PHI / MIA @ ORL; LeBron 👑 and his 39 participant plays; fantasy ⭐ points on a TEST roster versus independent half-PPR math; toggle, sort, expand, mobile sideways scroll and their survival across refresh; no-flicker node reuse; pregame and missing data; drag and double-click; `--shot` saves screenshots 18–19), `fieldpos.py [--shot]` (21 checks: replays all 496 plays of three CFB summaries saved in the 4th quarter on Oct 17 and an NFL summary saved live, checking the ball spot, direction, arrow, red zone and line to gain against each play's own yardLine and team; pregame, halftime, end of quarter, extra point/kickoff, final, missing data, no field for NBA/CBB; a live game if one is on; refresh keeps the node; `--shot` saves screenshot 17), `blitzpicks.py <sheet-dump> [--shot]` (25 checks: 🎯 chips and counts on NFL cards, the picks section for DAL at GB / CAR at PHI built from a copy of Blitz's real rows, parlay and prop display, final-game grading on Florida at Texas with hub-only rows labeled TEST DATA, Your bets, empty state, the 401 hint with cached picks, chip click, double-click and drag still working, and the success path with a mocked shared sheet; `--shot` saves screenshot 16), `blitzrecord.py [--shot]` (24 checks: Part A reads the real sheet through the page and recomputes the record, pending count, Pass/Wait calls and confidence parsing on its own from public gviz and ESPN; Part B uses 12 `TEST-*` fixture rows and 1 TEST placed bet with mocked gviz/ESPN, checked against hand math: record, P/L, ROI, calls, CLV cents/pp/%, type and confidence breakdowns, chart points per day and week, league and range filters, table sort, separation from Bets, and only GET requests to the sheet; `--shot` saves screenshot 20 from the TEST fixture), `injuries.py [--shot]` (31 checks: CORS from file:// for every injury endpoint, with `/teams?enable=injuries` as a blocked control; the Injuries tab against an independent recount of the exact ESPN responses for all 4 leagues; league, team, status and search filters; the 15-minute cache with no extra requests and only stale leagues refetched; the modal for real NFL CHI @ ATL, NBA PHI @ NY and CFB OSU @ IU; mobile; the offline cached copy and the 2-minute retry; TEST data for a fantasy roster of real injured players matched by id and by name+team, LeBron and Purdue entries, a Stroud box-score mark and Blitz prop warnings; `--shot` saves screenshots 21–22 from real data), `mnf_picks.py [--shot]` (16 checks against the real sheet and ESPN for WSH @ SF on Oct 19: a fresh profile, a profile with yesterday's cache, a page left open since before Blitz logged (the regression), a saved Live filter, columns reordered in the sheet, the Bets list, and read-only access; `--shot` saves screenshot 23), `analysts.py [--shot]` (27 checks: the attribution rule against an independent re-implementation for every real sheet row and unit cases, then real opening-night NBA games on Oct 20 with REAL Blitz rows plus TEST Court rows appended by a gviz mock: chips and tooltips, the modal title and per-card tags, NBA/CBB grading against ESPN's own finals including NBA and CBB overtime and an NFL+NBA parlay, props pending, NBA prop injury warnings by athlete id, the hidden-picks note, Pick records selector/cards/KPIs/charts against hand math, background sync on the NBA and CBB tabs, and GET-only sheet access; `--shot` saves screenshot 24), `sheet_dnd.py <sheet-dump>` (sheet sync parsing, grading, local overrides, deleted rows, offline fallback, copy-row, plus drag and drop with mouse and touch, refresh, reload, filters and reset), and `screenshots.py [sheet-dump]` (screenshot 13 uses a roster labeled DEMO, which is cleared afterwards; 14–15 show the Highlights board and the game detail modal). Each test runs in a throwaway browser profile, so the shipped file contains no test data.
