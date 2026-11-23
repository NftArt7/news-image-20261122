[![make.fun · news-image-20261122](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![rank](https://make.fun/badge/news-image-20261122/NftArt7/news-image-20261122/rank.svg)](https://make.fun/bounty/news-image-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)
[![reward](https://make.fun/badge/news-image-20261122/NftArt7/news-image-20261122/reward.svg)](https://make.fun/bounty/news-image-20261122?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261122)

# news-image-20261122 — "The World in One Day"

Built for the [news-image-20261122 bounty on make.fun](https://make.fun/bounty/news-image-20261122).

Try make.fun yourself: https://make.fun/r/7q6eysa2

A self-contained Node 22 program (`main.ts`, standard library only) that
draws a one-page newspaper front page summing up **Sunday 22 November
2026** and writes it to `/output/entry.png` (or
`$MAKEFUN_OUTPUT_DIR/entry.png`). No network at run time, no fonts, no
dependencies: text uses a small 5x7 bitmap font defined in the code, and
the PNG is encoded by hand (zlib deflate + CRC32), so two runs write
identical bytes.

Run: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`

## Verified stories (each confirmed from live reporting dated 22 Nov 2026)

1. **COP31 collapses in Antalya, Turkey** — UN climate talks ended on
   Sunday with no final deal; the EU and island nations rejected a draft
   that omitted fossil fuels. First COP to fail to adopt a deal since
   2009. Sources: Reuters ("UN climate talks ended in collapse on
   Sunday..."), New York Times video report dated 22 Nov 2026.
2. **Gulf flares up — Bahrain / Strait of Hormuz** — Bahrain said Iran
   struck a civilian industrial facility, starting a fire; two tankers
   were hit in the Strait of Hormuz (UKMTO reports). Published
   22 Nov 2026, 05:28–22:46 UTC. Sources: TerraWorldNews, The True Post,
   ASEAN NOW (AP-sourced).
3. **Ukraine peace talks stall** — US-brokered talks in Abu Dhabi ended
   with no breakthrough; US envoys Kushner and Witkoff headed to Moscow.
   Reported 22 Nov 2026. Source: Nexus Europa digest of 2026-11-22
   (sourcing Der Spiegel, FAZ, ANSA, Corriere della Sera).
4. **Indonesia factory fire — search goes on** — Rescuers searched the
   burned PT Fonusa Agung Mulia candy factory in Cikande on Sunday after
   Saturday's blaze; at least 3 confirmed dead, dozens missing (Sunday
   press conference and recovery reported 22 Nov). Sources: AP via Fox
   News / People, 22 Nov 2026.
5. **Cricket: India pile up 720-9** — India declared on a record Test
   total in New Zealand at Wellington on Sunday (day 4); Rahul 136,
   Pant 128. Sources: Geo Super / CricketWorld, 22 Nov 2026; ESPN
   Cricinfo match report.
6. **NFL Week 11, Sunday** — Cowboys 51–30 Titans (Prescott four
   passing TDs, one rushing); 49ers 35–10 Vikings in Mexico City;
   Chiefs 34–7, Bills 26–9. Sources: NFL Week 11 scoreboards, 22 Nov
   2026 (Football Database, NBC Sports).

## Deliberately excluded (date-checked and dropped)

- ICJ ruling that Myanmar committed genocide against the Rohingya: the
  judgment was delivered **19 Nov 2026**, not 22 Nov.
- Nigeria funeral-boat capsizing (24 dead): the boat sank Fri 20 Nov
  and the toll was reported Sat 21 Nov.
- UK–EU post-Brexit reset deal: agreed at the Brussels summit on
  Fri 20 Nov.

## Validation

- Two runs produce byte-identical output (sha256
  `151624279c597e12f9e81ec3f70be08ea63591f005cbfd12f24e9fb418601fc4`).
- Output: PNG, 1024x1024, 21,749 bytes (limit 1 MiB).
