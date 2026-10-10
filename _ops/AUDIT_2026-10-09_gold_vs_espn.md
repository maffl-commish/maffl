# Gold vs ESPN audit — 2026-10-09

> **Update (same day):** all game fixes and the draft rebuild are done on `build-fix/espn-audit-games` (PR). Re-audit after the fixes: every game and season record matches ESPN; draft leftovers are 2006 (ESPN gap) and 3 rows in `_ops/AUDIT_2026-10-09_draft_rebuild.md`.

**Games:** gold is in very good shape. All 2,726 gold games (2005–2025, both tiers) matched an ESPN game in the same week with the same two teams; ESPN has no games gold is missing. Five games are wrong (three have the wrong winner, which explains all six season W-L differences). Fixed in gold on branch `build-fix/espn-audit-games` (not merged): downstream regen is blocked, see below.

| Game | Gold had | ESPN (correct) |
|---|---|---|
| 2015 Wk 5 | BAG 86.54 def. Norseman 82.38 | **Norseman** 86.54 def. BAG 82.38 |
| 2022 Wk 6 | Number 2 Tony 91.08 | Number 2 Tony **88.96** (still wins) |
| 2022 Wk 13 | Reindeer 156.56 def. Jagoffs 63.36 | **Jagoffs** 115.10 def. Reindeer 86.44 |
| 2022 Wk 13 | V-Unit 141.94 | V-Unit **107.90** (still wins) |
| 2024 Wk 13 | Hammer Time listed as winner, 115.32–124.66 | **Big Bang** 124.66 def. Hammer Time 115.32 |

Career W-L changes (validate Gate 2 on the branch): Mike −1 W, Joe Reilly −1 W, Tony Trozzo −1 W, Brian/Ron +1 W, Jacob Nickman +1 W, Dan Reilly +1 W.

**Why it isn't merged:** `generate-matchups-data.ps1` byte-locks every finished season, so NoConsolation, Points, `matchups-data.js` and then Owner_Seasons / Owners Sheet / pages can't be regenerated for 2015/2022/2024 without a generator change (a historic-correction switch) and a Windows `-Write` run.

**Drafts** (ESPN pull with player names, `_ops/inbox/MAFFL_ESPN_Drafts.json`): 5,628 picks match exactly and 133 differ only in spelling. Prices 2020+ all match except one missing $1 pick.
- **The big one: ~57 picks name the wrong player.** The screenshots captured surnames ("Graham", "Reed", "Engram") and the name clean-up guessed the famous one: Jimmy Graham for DE Brandon Graham (2010), Ed Reed as a kicker for Jeff Reed (2010), Evan Engram in 2008 for Bobby Engram, Calvin Johnson in 2005 for Chad Johnson, Terrelle Pryor for Calvin Pryor (2017). Position_Actual was guessed with them.
- 18 picks on ESPN are missing from gold (list below).
- 3 picks credited to the wrong owner (2011 Clay Matthews, 2011 Deion Branch, 2013 Rueben Randle).
- 37 gold picks aren't on ESPN: 36 are 2006, where ESPN lost 37 picks (empty slots), so gold is the better record there; plus 2005 Morten Andersen (ESPN has 2 empty 2005 picks).
- Recommendation: rebuild gold Player / Position_Actual / NFL_Team from ESPN for every matched pick (keep Player_Raw, owner, price), add the 18, fix the 3 owners, keep 2006 as is.

**Not checked:** 2026 (the weekly ESPN pull checks it every Tuesday); 2002–04 (pre-ESPN).

---

Gold games checked: 2726 · matched to an ESPN game: 2726 · season records checked: 337

Draft picks: 5628 exact name match · 133 spelling-only · ESPN empty picks (no player) 2005: 2, 2006: 37, 2016: 7

| Check | Count |
|---|---|
| No ESPN data for season | 0 |
| Team not found on ESPN for that season | 0 |
| Game not on ESPN that week | 0 |
| On ESPN but not in gold | 0 |
| Winner/loser swapped | 2 |
| Score mismatch | 3 |
| Game type differs | 0 |
| Season W-L differs | 6 |
| Season record: team not found on ESPN | 0 |
| Draft pick count differs | 10 |
| Draft $ total differs | 1 |
| Draft: on ESPN, missing from gold | 18 |
| Draft: in gold, not on ESPN | 37 |
| Draft: probably the wrong player in gold | 57 |
| Draft: pick credited to a different owner | 3 |
| Draft: price differs (2020+) | 0 |
| Draft: spelling differs from ESPN | 133 |
| Team name differs from ESPN | 2 |

## Winner/loser swapped (2)

- Upper 2015 Wk 5 · Bad Attitude Gang 86.54 def. Swissvale Norseman 82.38 (Regular) — ESPN Swissvale Norseman 86.54 beat Bad Attitude Gang 82.38
- Upper 2024 Wk13 · Happy Valley Hammer Time 115.32 def. The Big Bang Theory 124.66 (Regular) — ESPN 115.32 – 124.66

## Score mismatch (3)

- Upper 2022 Wk 6 · Number 2 Tony 91.08 def. U-Town Fightin Ferrets 86.62 (Regular) — ESPN 88.96 – 86.62
- Upper 2022 Wk13 · Reilly's Reindeer 156.56 def. Jake's Jagoffs 63.36 (Regular) — ESPN 86.44 – 115.1
- Upper 2022 Wk13 · The V-Unit 141.94 def. Number 2 Tony 89.3 (Regular) — ESPN 107.9 – 89.3

## Season W-L differs (6)

- 2015 Brian Murello / Ron Murello (Swissvale Norseman): gold 4-9-0 vs ESPN 5-8-0
- 2015 Mike Murello (Bad Attitude Gang): gold 9-4-0 vs ESPN 8-5-0
- 2022 Jacob Nickman (Jake's Jagoffs): gold 3-11-0 vs ESPN 4-10-0
- 2022 Joe Reilly (Reilly's Reindeer): gold 7-7-0 vs ESPN 6-8-0
- 2024 Dan Reilly (The Big Bang Theory): gold 8-6-0 vs ESPN 9-5-0
- 2024 Tony Trozzo (Happy Valley Hammer Time): gold 7-7-0 vs ESPN 6-8-0

## Draft pick count differs (10)

- 2006: gold 255 picks vs ESPN 256
- 2009: gold 270 picks vs ESPN 272
- 2010: gold 270 picks vs ESPN 272
- 2011: gold 266 picks vs ESPN 272
- 2012: gold 269 picks vs ESPN 272
- 2013: gold 269 picks vs ESPN 272
- 2014: gold 271 picks vs ESPN 272
- 2016: gold 265 picks vs ESPN 272
- 2018: gold 271 picks vs ESPN 272
- 2020: gold 271 picks vs ESPN 272

## Draft $ total differs (1)

- 2020: gold $3191 vs ESPN $3192

## Draft: on ESPN, missing from gold (18)

- 2009 David Murello: R16 Rashad Jennings (RB)
- 2009 Jacob Nickman: R16 Steve Smith (WR)
- 2010 Matt Brown: R17 Anthony Gonzalez (WR)
- 2011 Chris Johnson: R8 Dwight Freeney (DE)
- 2011 Jacob Nickman: R15 Mike Williams (WR)
- 2011 Joni Murello: R12 Dez Bryant (WR)
- 2011 Todd Trozzo: R5 Ryan Mathews (RB)
- 2011 Tony Trozzo: R17 Tyvon Branch (S)
- 2011 Vincent Cavalier / Dominic Nicastro: R17 Colt McCoy (QB)
- 2012 Chris Johnson: R13 Malcom Floyd (WR)
- 2012 Jon Murello / Rick Simmons: R13 Mark Ingram (RB)
- 2012 Matt Brown: R14 Rashad Jennings (RB)
- 2013 BJ Funari: R17 Daniel Thomas (RB)
- 2013 Jon Murello / Rick Simmons: R14 Pierre Thomas (RB)
- 2013 Todd Trozzo: R3 Joseph Randle (RB)
- 2014 Brian Murello / Ron Murello: R11 Harrison Smith (S)
- 2018 Joe Reilly: R8 Khalil Mack (DE)
- 2020 Ed Peters: R17 Robby Anderson (WR)

## Draft: in gold, not on ESPN (37)

- 2005 Chris Johnson: Morton Anderson (K) $1.0
- 2005 Jacob Nickman: Nate Clements (DB) $1.0
- 2006 BJ Funari: Lawrence Maroney (RB) $11.0
- 2006 BJ Funari: Lofa Tatupu (LB) $4.0
- 2006 BJ Funari: Matt Jones (WR) $16.0
- 2006 BJ Funari: Reggie Bush (RB) $46.0
- 2006 Brian Murello / Ron Murello: Brian Calhoun (RB) $1.0
- 2006 Brian Murello / Ron Murello: Cedric Benson (FLX) $17.0
- 2006 Brian Murello / Ron Murello: Leonard Pope (TE) $1.0
- 2006 Brian Murello / Ron Murello: Marcedes Lewis (TE) $1.0
- 2006 Chris Johnson: DeMarcus Ware (LB) $1.0
- 2006 Craig Toth: A.J. Hawk (LB) $1.0
- 2006 Craig Toth: Heath Miller (TE) $15.0
- 2006 Craig Toth: Ronnie Brown (RB) $65.0
- 2006 David Murello: Frank Gore (FLX) $33.0
- 2006 Jeff Grace: Chad Jackson (WR) $2.0
- 2006 Jeff Grace: Troy Williamson (FLX) $4.0
- 2006 Jimmy Crisan: Braylon Edwards (WR) $1.0
- 2006 Jimmy Crisan: Chris Houston (CB) $1.0
- 2006 Joe Reilly: Vernand Morency (RB) $4.0
- 2006 Jon Murello / Rick Simmons: DeAngelo Williams (RB) $8.0
- 2006 Jon Murello / Rick Simmons: Mario Williams (DL) $2.0
- 2006 Josh Lavrinc: Adam Jones (DB) $1.0
- 2006 Josh Lavrinc: Brandon Jacobs (RB) $7.0
- 2006 Josh Lavrinc: Matt Leinart (QB) $3.0
- 2006 Josh Lavrinc: Reggie Brown (WR) $4.0
- 2006 Josh Lavrinc: Shawne Merriman (LB) $5.0
- 2006 Marcus Ruby: Derrick Johnson (LB) $3.0
- 2006 Marcus Ruby: Mike Nugent (K) $1.0
- 2006 Marcus Ruby: Roddy White (WR) $1.0
- 2006 Marcus Ruby: Wali Lundy (FLX) $15.0
- 2006 Mike Murello: Joseph Addai (RB) $20.0
- 2006 Mike Murello: LenDale White (RB) $5.0
- 2006 Mike Murello: Ryan Moats (FLX) $3.0
- 2006 Mike Murello: Vernon Davis (TE) $7.0
- 2006 Sean Ritson: Cadillac Williams (RB) $64.0
- 2006 Tony Trozzo: Charlie Frye (QB) $1.0

## Draft: probably the wrong player in gold (57)

- 2006 Brian Murello / Ron Murello: gold 'Matt Bryant' → ESPN 'Antonio Bryant' (WR)
- 2006 David Murello: gold 'Daryl Smith' → ESPN 'Musa Smith' (RB)
- 2006 Jacob Nickman: ESPN R14 Cedrick Wilson (WR) · gold unmatched: Jerious Norwood (RB) $5.0
- 2006 Jeff Grace: gold 'Adrian Peterson' → ESPN 'Mike Peterson' (LB)
- 2006 Jeff Grace: gold 'Vanden Bosch' → ESPN 'Kyle Vanden Bosch' (DE)
- 2006 Joe Reilly: gold 'Nate Washington' → ESPN 'Marcus Washington' (LB)
- 2006 Josh Lavrinc: gold 'Kerry Rhodes' → ESPN 'Dominic Rhodes' (RB)
- 2006 Todd Trozzo: ESPN R15 Corey Bradford (WR) · gold unmatched: Santonio Holmes (FLX) $1.0; Charlie Batch (QB) $1.0
- 2008 Chris Johnson: gold 'Cory Little' → ESPN 'Leonard Little' (DE)
- 2008 Jacob Nickman: gold 'Evan Engram' → ESPN 'Bobby Engram' (WR)
- 2009 David Murello: gold 'Rolando McClain' → ESPN 'Le'Ron McClain' (RB)
- 2009 Jimmy Crisan: ESPN R15 Keith Bulluck (LB) · gold unmatched: Randy Bullock (K) $1.0
- 2009 Jon Murello / Rick Simmons: gold 'Michael Bennett' → ESPN 'Earl Bennett' (WR)
- 2009 Marcus Ruby / Joe Ruby: ESPN R3 Chad Ochocinco (WR) · gold unmatched: Chad Johnson (WR) $21.0
- 2009 Matt Brown: gold 'Michael Griffin' → ESPN 'Cedric Griffin' (CB)
- 2009 Sean Ritson: ESPN R15 Darrius Heyward-Bey (WR) · gold unmatched: Hayward Bay (WR) $1.0
- 2009 Sean Ritson: gold 'Devery Henderson' → ESPN 'E.J. Henderson' (LB)
- 2010 BJ Funari: gold 'Ed Reed' → ESPN 'Jeff Reed' (K)
- 2010 Brian Murello / Ron Murello: gold 'Nate Washington' → ESPN 'Leon Washington' (RB)
- 2010 David Murello: ESPN R10 Keith Bulluck (LB) · gold unmatched: Stephen Tulloch (LB) $2.0
- 2010 David Murello: ESPN R16 Rashad Jennings (RB) · gold unmatched: Stephen Tulloch (LB) $2.0
- 2010 Joe Reilly: gold 'Braylon Edwards' → ESPN 'Ray Edwards' (DE)
- 2010 Jon Murello / Rick Simmons: gold 'Jimmy Graham' → ESPN 'Brandon Graham' (DE)
- 2010 Mike Murello: ESPN R15 Devin Aromashodu (WR) · gold unmatched: Oshiomogho Atogwe (S) $1.0
- 2010 Tony Trozzo: gold 'Randle El' → ESPN 'Antwaan Randle El' (WR)
- 2011 Brian Murello / Ron Murello: gold 'Hines Ward' → ESPN 'Derrick Ward' (RB)
- 2011 Marcus Ruby / Joe Ruby: gold 'Golden Tate' → ESPN 'Ben Tate' (RB)
- 2011 Todd Trozzo: gold 'Sims Walker' → ESPN 'Mike Sims-Walker' (WR)
- 2012 David Murello: gold 'Deion Branch' → ESPN 'Tyvon Branch' (S)
- 2012 David Murello: gold 'Jasper Brinkley' → ESPN 'Curtis Brinkley' (RB)
- 2012 David Murello: gold 'Lamar Miller' → ESPN 'Heath Miller' (TE)
- 2012 Joe Reilly: gold 'Bobby Rainey' → ESPN 'Chris Rainey' (RB)
- 2012 Josh Lavrinc: gold 'Mewelde Moore' → ESPN 'Lance Moore' (WR)
- 2012 Sean Ritson: gold 'Pierre Paul' → ESPN 'Jason Pierre-Paul' (DE)
- 2013 Brian Murello / Ron Murello: ESPN R5 Darrius Heyward-Bey (WR) · gold unmatched: Heyward Bey (FLX) $1.0
- 2013 David Murello: ESPN R16 Aldrick Robinson (WR) · gold unmatched: Allen Robinson II (WR) $1.0
- 2013 Josh Lavrinc: gold 'Sheldon Richardson' → ESPN 'Daryl Richardson' (RB)
- 2013 Kevin Radkowski: ESPN R1 Ben Roethlisberger (QB) · gold unmatched: Big Ben (QB) $12.0
- 2013 Kevin Radkowski: gold 'Ray Rice' → ESPN 'Sidney Rice' (WR)
- 2013 Tony Trozzo: gold 'Stephens Howling' → ESPN 'LaRod Stephens-Howling' (RB)
- 2014 Dan Reilly: ESPN R1 Ben Roethlisberger (QB) · gold unmatched: Big Ben (QB) $23.0
- 2014 Ed Peters: ESPN R6 Vernon Davis (TE) · gold unmatched: Olivier Vernon (TE) $20.0
- 2014 Jacob Nickman: gold 'Pierre Paul' → ESPN 'Jason Pierre-Paul' (DE)
- 2015 Ed Peters: ESPN R1 Ben Roethlisberger (QB) · gold unmatched: Big Ben (QB) $55.0
- 2015 Jacob Nickman: ESPN R11 Michael Griffin (S) · gold unmatched: M Griffen (DB) $1.0
- 2015 Jacob Nickman: gold 'Rueben Randle' → ESPN 'Joseph Randle' (RB)
- 2015 Todd Trozzo: gold 'Pierre Paul' → ESPN 'Jason Pierre-Paul' (DE)
- 2015 Tony Trozzo: ESPN R16 Cameron Artis-Payne (RB) · gold unmatched: Artis Payne (RB) $1.0
- 2016 BJ Funari: gold 'Green Beckham' → ESPN 'Dorial Green-Beckham' (WR)
- 2016 Bob Keslar: gold 'Devonta Freeman' → ESPN 'Jerrell Freeman' (LB)
- 2016 Jon Murello / Rick Simmons: gold 'Pacman Jones' → ESPN 'Adam Jones' (CB)
- 2017 Dan Reilly: gold 'Mychal Kendricks' → ESPN 'Eric Kendricks' (LB)
- 2017 Ed Peters: ESPN R3 Calvin Pryor III (S) · gold unmatched: Terrelle Pryor (WR) $32.0
- 2018 Chris Johnson: gold 'Mychal Kendricks' → ESPN 'Eric Kendricks' (LB)
- 2019 David Murello: ESPN R11 John Johnson III (S) · gold unmatched: Jaire Alexander (DB) $3.0
- 2019 Joe Reilly: ESPN R7 Jason Myers (K) · gold unmatched: Jakobi Meyers (K) $1.0
- 2022 Bob Keslar: gold 'Darius Leonard' → ESPN 'Shaquille Leonard' (LB)

## Draft: pick credited to a different owner (3)

- 2011 Clay Matthews: gold Todd Trozzo vs ESPN Joe Reilly
- 2011 Deion Branch: gold Tony Trozzo vs ESPN Chris Johnson
- 2013 Rueben Randle: gold Todd Trozzo vs ESPN Jon Murello / Rick Simmons

## Draft: spelling differs from ESPN (133)

- 2005 Chris Johnson: gold 'Calvin Johnson' → ESPN 'Chad Johnson' (WR)
- 2005 Craig Toth: gold 'Cory Bradford' → ESPN 'Corey Bradford' (WR)
- 2005 Craig Toth: gold 'Donovan Darius' → ESPN 'Donovin Darius' (S)
- 2005 Craig Toth: gold 'Willie McGahee' → ESPN 'Willis McGahee' (RB)
- 2005 David Murello: gold 'Johnnie Abraham' → ESPN 'John Abraham' (DE)
- 2005 David Murello: gold 'Naduku Kalu' → ESPN 'N.D. Kalu' (DE)
- 2005 Jacob Nickman: gold 'Jeremitrius Butler' → ESPN 'Jerametrius Butler' (CB)
- 2005 Jeff Grace: gold 'Domanic Rhodes' → ESPN 'Dominic Rhodes' (RB)
- 2005 Joe Reilly: gold 'Brandon Stoakley' → ESPN 'Brandon Stokley' (WR)
- 2005 Joe Reilly: gold 'Mark Bulger' → ESPN 'Marc Bulger' (QB)
- 2005 Josh Lavrinc: gold 'Adam Pacman Jones' → ESPN 'Adam Jones' (CB)
- 2005 Josh Lavrinc: gold 'Freddie Taylor' → ESPN 'Fred Taylor' (RB)
- 2005 Tony Trozzo: gold 'Braelon Edwards' → ESPN 'Braylon Edwards' (WR)
- 2005 Tony Trozzo: gold 'LeBrandon Toefield' → ESPN 'LaBrandon Toefield' (RB)
- 2005 Tony Trozzo: gold 'Marcell Shipp' → ESPN 'Marcel Shipp' (RB)
- 2005 Tony Trozzo: gold 'Patrick Kearney' → ESPN 'Patrick Kerney' (DE)
- 2005 Tony Trozzo: gold 'Terrel Suggs' → ESPN 'Terrell Suggs' (LB)
- 2006 BJ Funari: gold 'Darryl Jackson' → ESPN 'Darrell Jackson' (WR)
- 2006 BJ Funari: gold 'Phillip Rivers' → ESPN 'Philip Rivers' (QB)
- 2006 Brian Murello / Ron Murello: gold 'Mike Williams' → ESPN 'Madieu Williams' (CB)
- 2006 Chris Johnson: gold 'D'Shawn Foster' → ESPN 'DeShaun Foster' (RB)
- 2006 Craig Toth: gold 'Aaron Schoebel' → ESPN 'Aaron Schobel' (DE)
- 2006 Craig Toth: gold 'Adrian Wilson' → ESPN 'Al Wilson' (LB)
- 2006 Jimmy Crisan: gold 'Maurice Jones-Drew' → ESPN 'Maurice Drew' (RB)
- 2006 Joe Reilly: gold 'Mike Clayton' → ESPN 'Michael Clayton' (WR)
- 2006 Sean Ritson: gold 'Mark Bulger' → ESPN 'Marc Bulger' (QB)
- 2006 Sean Ritson: gold 'Wes Welker' → ESPN 'Wesley Welker' (WR)
- 2006 Todd Trozzo: gold 'Dion Branch' → ESPN 'Deion Branch' (WR)
- 2006 Todd Trozzo: gold 'Keith Bullock' → ESPN 'Keith Bulluck' (LB)
- 2007 Sean Ritson: gold 'Mark Bulger' → ESPN 'Marc Bulger' (QB)
- 2008 BJ Funari: gold 'Tavaris Jackson' → ESPN 'Tarvaris Jackson' (QB)
- 2008 Jimmy Crisan: gold 'Josh Cribbs' → ESPN 'Joshua Cribbs' (WR)
- 2008 Jimmy Crisan: gold 'Kevin Mitchell' → ESPN 'Kawika Mitchell' (LB)
- 2008 Jimmy Crisan: gold 'O.J. Atogwe' → ESPN 'Oshiomogho Atogwe' (S)
- 2008 Joe Reilly: gold 'Anthony Gonzales' → ESPN 'Anthony Gonzalez' (WR)
- 2008 Jon Murello / Rick Simmons: gold 'Jarred Allen' → ESPN 'Jared Allen' (DE)
- 2008 Josh Lavrinc: gold 'Ben Watson' → ESPN 'Benjamin Watson' (TE)
- 2008 Marcus Ruby / Joe Ruby: gold 'Roy Williams' → ESPN 'Roy E. Williams' (WR)
- 2008 Todd Trozzo: gold 'Lauren Robinson' → ESPN 'Laurent Robinson' (WR)
- 2008 Todd Trozzo: gold 'Mark Bulger' → ESPN 'Marc Bulger' (QB)
- 2009 Brian Murello / Ron Murello: gold 'Mark Bulger' → ESPN 'Marc Bulger' (QB)
- 2009 Chris Johnson: gold 'Brady James' → ESPN 'Bradie James' (LB)
- 2009 David Murello: gold 'O.J. Atogwe' → ESPN 'Oshiomogho Atogwe' (S)
- 2009 Jacob Nickman: gold 'Roy Williams' → ESPN 'Roy E. Williams' (WR)
- 2009 Jeff Grace: gold 'Carnell Williams' → ESPN 'Cadillac Williams' (RB)
- 2009 Jon Murello / Rick Simmons: gold 'Anthony Gonzales' → ESPN 'Anthony Gonzalez' (WR)
- 2009 Jon Murello / Rick Simmons: gold 'Marcedes Lewis' → ESPN 'Michael Lewis' (S)
- 2009 Todd Trozzo: gold 'Glenn Coffee' → ESPN 'Glen Coffee' (RB)
- 2009 Todd Trozzo: gold 'Jarred Allen' → ESPN 'Jared Allen' (DE)
- 2010 Chris Johnson: gold 'Chuck Woodson' → ESPN 'Charles Woodson' (CB)
- 2010 Jacob Nickman: gold 'Mewelde Moore' → ESPN 'Matt Moore' (QB)
- 2010 Jimmy Crisan: gold 'Carnell Williams' → ESPN 'Cadillac Williams' (RB)
- 2010 Joe Reilly: gold 'Steve Smith (CAR)' → ESPN 'Steve Smith' (WR)
- 2010 Jon Murello / Rick Simmons: gold 'Julius Jones' → ESPN 'Jacoby Jones' (WR)
- 2010 Jon Murello / Rick Simmons: gold 'Malcolm Floyd' → ESPN 'Malcom Floyd' (WR)
- 2010 Joni Murello: gold 'Steve Smith (NYG)' → ESPN 'Steve Smith' (WR)
- 2010 Marcus Ruby / Joe Ruby: gold 'Mike Williams (SEA)' → ESPN 'Mike Williams' (WR)
- 2010 Todd Trozzo: gold 'Mike Williams (TB)' → ESPN 'Mike Williams' (WR)
- 2011 Jacob Nickman: gold 'Jason Campell' → ESPN 'Jason Campbell' (QB)
- 2011 Jon Murello / Rick Simmons: gold 'Jay Feeley' → ESPN 'Jay Feely' (K)
- 2011 Josh Lavrinc: gold 'Kendal Hunter' → ESPN 'Kendall Hunter' (RB)
- 2011 Matt Brown: gold 'Ben Watson' → ESPN 'Benjamin Watson' (TE)
- 2011 Matt Brown: gold 'Malcolm Floyd' → ESPN 'Malcom Floyd' (WR)
- 2011 Sean Ritson: gold 'Carnell Williams' → ESPN 'Cadillac Williams' (RB)
- 2011 Sean Ritson: gold 'Stephen Jackson' → ESPN 'Steven Jackson' (RB)
- 2011 Todd Trozzo: gold 'Mike Turner' → ESPN 'Michael Turner' (RB)
- 2011 Vincent Cavalier / Dominic Nicastro: gold 'Jarred Allen' → ESPN 'Jared Allen' (DE)
- 2012 Joni Murello: gold 'Stevie Johnson' → ESPN 'Steve Johnson' (WR)
- 2012 Marcus Ruby / Joe Ruby: gold 'Shonne Greene' → ESPN 'Shonn Greene' (RB)
- 2012 Matt Brown: gold 'Stephen Jackson' → ESPN 'Steven Jackson' (RB)
- 2012 Mike Murello: gold 'Denarious Moore' → ESPN 'Denarius Moore' (WR)
- 2012 Vincent Cavalier / Dominic Nicastro: gold 'Jerrell Freeman' → ESPN 'Josh Freeman' (QB)
- 2013 BJ Funari: gold 'R Wilson' → ESPN 'Russell Wilson' (QB)
- 2013 BJ Funari: gold 'S Smith' → ESPN 'Steve Smith' (WR)
- 2013 Dan Reilly: gold 'J Brown' → ESPN 'Josh Brown' (K)
- 2013 David Murello: gold 'J Jones' → ESPN 'James Jones' (WR)
- 2013 Josh Lavrinc: gold 'J Cook' → ESPN 'Jared Cook' (TE)
- 2013 Kevin Radkowski: gold 'Mike Williams' → ESPN 'Mario Williams' (DE)
- 2013 Mike Murello: gold 'Jon Franklin' → ESPN 'Johnathan Franklin' (RB)
- 2014 BJ Funari: gold 'Steve Johnson' → ESPN 'Stevie Johnson' (WR)
- 2014 Chris Johnson: gold 'Mike Floyd' → ESPN 'Michael Floyd' (WR)
- 2014 David Murello: gold 'Stephan Taylor' → ESPN 'Stepfan Taylor' (RB)
- 2014 Ed Peters: gold 'Lagarette Blount' → ESPN 'LeGarrette Blount' (RB)
- 2014 Jon Murello / Rick Simmons: gold 'C.J. Mosely' → ESPN 'C.J. Mosley' (LB)
- 2014 Josh Lavrinc: gold 'Zac Brown' → ESPN 'Zach Brown' (LB)
- 2014 Mike Licciardi: gold 'Marquis Lee' → ESPN 'Marqise Lee' (WR)
- 2014 Mike Licciardi: gold 'Terrence West' → ESPN 'Terrance West' (RB)
- 2014 Mike Murello: gold 'Jarrell Freeman' → ESPN 'Jerrell Freeman' (LB)
- 2014 Mike Murello: gold 'Stephen Jackson' → ESPN 'Steven Jackson' (RB)
- 2014 Todd Trozzo: gold 'Malcolm Floyd' → ESPN 'Malcom Floyd' (WR)
- 2015 BJ Funari: gold 'Lad Green' → ESPN 'Ladarius Green' (TE)
- 2015 Chris Johnson: gold 'Terrence Williams' → ESPN 'Terrance Williams' (WR)
- 2015 Dan Reilly: gold 'R Wilson' → ESPN 'Russell Wilson' (QB)
- 2015 David Murello: gold 'Dev Parker' → ESPN 'DeVante Parker' (WR)
- 2015 Joe Reilly: gold 'De Freeman' → ESPN 'Devonta Freeman' (RB)
- 2015 Jon Murello / Rick Simmons: gold 'Gio Bernard' → ESPN 'Giovani Bernard' (RB)
- 2016 Brian Murello / Ron Murello: gold 'Benny Cunningham' → ESPN 'Benjamin Cunningham' (RB)
- 2016 Chris Johnson: gold 'Marcus Wheaton' → ESPN 'Markus Wheaton' (WR)
- 2016 David Murello: gold 'Chris Graham' → ESPN 'Corey Graham' (S)
- 2016 Josh Lavrinc: gold 'Emanuel Sanders' → ESPN 'Emmanuel Sanders' (WR)
- 2016 Todd Trozzo: gold 'Terrence West' → ESPN 'Terrance West' (RB)
- 2017 Bob Keslar: gold 'Jarod Davis' → ESPN 'Jarrad Davis' (LB)
- 2017 Brian Murello / Ron Murello: gold 'Corey James' → ESPN 'Cory James' (LB)
- 2017 Brian Murello / Ron Murello: gold 'Julius Peppers' → ESPN 'Jabrill Peppers' (S)
- 2017 Brian Murello / Ron Murello: gold 'Zac Brown' → ESPN 'Zach Brown' (LB)
- 2017 Chris Johnson: gold 'DeAndre Hopkins' → ESPN 'Dustin Hopkins' (K)
- 2017 Chris Johnson: gold 'Eli Rodgers' → ESPN 'Eli Rogers' (WR)
- 2017 Chris Johnson: gold 'Philip Dorsett' → ESPN 'Phillip Dorsett' (WR)
- 2017 David Murello: gold 'C.J. Mosely' → ESPN 'C.J. Mosley' (LB)
- 2017 Ed Peters: gold 'Jalen Richards' → ESPN 'Jalen Richard' (RB)
- 2017 Joe Reilly: gold 'Brandon Oliver' → ESPN 'Branden Oliver' (RB)
- 2017 Joe Reilly: gold 'Daryl Washington' → ESPN 'DeAndre Washington' (RB)
- 2017 Jon Fetrow: gold 'Terrence West' → ESPN 'Terrance West' (RB)
- 2017 Josh Lavrinc: gold 'Adore Jackson' → ESPN 'Adoree' Jackson' (CB)
- 2017 Josh Lavrinc: gold 'Rueben Foster' → ESPN 'Reuben Foster' (LB)
- 2017 Mike Licciardi: gold 'Deion Lewis' → ESPN 'Dion Lewis' (RB)
- 2017 Mike Murello: gold 'James Connor' → ESPN 'James Conner' (RB)
- 2017 Mike Murello: gold 'Tyrell Willams' → ESPN 'Tyrell Williams' (WR)
- 2017 Tony Trozzo: gold 'Jammal Williams' → ESPN 'Jamaal Williams' (RB)
- 2018 Bob Keslar: gold 'Chester Rodgers' → ESPN 'Chester Rogers' (WR)
- 2018 Brian Murello / Ron Murello: gold 'Ben Watson' → ESPN 'Benjamin Watson' (TE)
- 2018 Brian Murello / Ron Murello: gold 'C.J. Mosely' → ESPN 'C.J. Mosley' (LB)
- 2018 Chris Johnson: gold 'Chase Edmunds' → ESPN 'Chase Edmonds' (RB)
- 2018 Chris Johnson: gold 'DD Westbrook' → ESPN 'Dede Westbrook' (WR)
- 2018 Joe Reilly: gold 'Torrey Smith' → ESPN 'Telvin Smith' (LB)
- 2019 Brian Murello / Ron Murello: gold 'Dante Jones' → ESPN 'Deion Jones' (LB)
- 2019 Brian Murello / Ron Murello: gold 'David Harris' → ESPN 'Damien Harris' (RB)
- 2019 Brian Murello / Ron Murello: gold 'Robbie Anderson' → ESPN 'Robby Anderson' (WR)
- 2019 Ed Peters: gold 'Deon Lewis' → ESPN 'Dion Lewis' (RB)
- 2019 Mike Murello: gold 'James Davis' → ESPN 'Jarrad Davis' (LB)
- 2019 Mike Murello: gold 'Trequon Smith' → ESPN 'Tre'Quan Smith' (WR)
- 2019 Todd Trozzo: gold 'Chase Edmunds' → ESPN 'Chase Edmonds' (RB)
- 2019 Todd Trozzo: gold 'Marquis Brown' → ESPN 'Marquise Brown' (WR)

## Team name differs from ESPN (2)

- Upper 2005: gold 'Bad Attitude Gang' vs ESPN '$Mike's Bad Attitude Gang'
- Upper 2006: gold 'Bad Attitude Gang' vs ESPN '$Mike's Bad Attitude Gang'
