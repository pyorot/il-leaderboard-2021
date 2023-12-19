# IL Scripts

**Archival Notice**  
This project was reinvented into [**il-leaderboard-2023**](https://github.com/pyorot/il-leaderboard-2023), a comprehensive set of scripts for an IL leaderboard.

**Version Notice**  
This code was last published on 2021/07/01 (tagged here as a release); since then, some changes have been made, notably the addition of a row/column of threshold (video requirement) times for every level in specifically the "ILs" sheet, as well as code for an [IL verification sheet](https://docs.google.com/spreadsheets/d/1bMud9itn7NLJo82mWzv9Z16i8Q6n9aYbBqoDynZE854). This code is not generalised, and the below readme is for the 2021/07/01 version.

---

This is a Google Apps Script project originally written and used for the [Super Mario Sunshine Individual Level Leaderboards](https://docs.google.com/spreadsheets/d/12wDUXjLqmcUuWSEXWc1fHNJc24KlfyCh0pvibZYEQM0) to automate highlighting and data calculations like the points ranking, as well as to manage protected ranges so players can only edit their own rows/columns. It uses two auxiliary sheets – a [backend](https://docs.google.com/spreadsheets/d/1TmUN3wpUNRCEVTKu1rBXVXtF3KRerCENoIlEhoFCNng) to cache calculated points/ranks and a directory to store user aliases and Google account email addresses.

## Google Apps Script Setup
The scripts are accessible at Tools > Script editor. They are written in JavaScript using the [Google Apps Script API](https://developers.google.com/apps-script/overview), and can be developed offline/maintained with version control using the [Google Clasp utility](https://github.com/google/clasp), which simply downloads/uploads the whole repository, ignoring non-JS/HTML files (like Git files).

*Clasp requires [Node.js](https://nodejs.org/) and you must [turn on API access](https://script.google.com/u/1/home/usersettings) for the account you want to use it with.*

## Design and Usage Principles
The two Bolder...Segs.js files contain the older code; this will cover the newer code spanning the rest of the files. Entry.js is the logic that chooses between them, depending on which sheet it applies to.
1. There's one entrypoint into the script (`ILScriptEntry()`), that should be bound to an [**installable edit trigger**](https://developers.google.com/apps-script/guides/triggers/installable) by the sheet owner account. Also ensure that the owner account has edit access to all auxiliary sheets (those mentioned in #5 and #6).
2. In the code, per-tab parameters are stored in global variables, which work like static variables if assigned to outside a function – the assignment happens before any function runs.
3. In the code, the sheets are always indexed using 0 ≤ p ≤ P (players) and 0 ≤ l ≤ L (levels), regardless of which is row and which is column. This corresponds to absolute row/col numbers on the actual sheets via a positive offset (`P_START` and `L_START`). Mentally, always count using p and l.
4. For the sheet to be fast and scale well, the subroutines that edit it are split into three functions, which have different latencies:
    * `updateLevel` (fast): formats each time in that level and updates points+ranks using cached values for all other levels – used when a player edits a cell;
    * `updateSheet` (slow): clears whole cache and recalculates points/ranks for all levels, and does no formatting (see note below) – used when a mod rearranges rows/columns;
    * `initSheet` (glacial): runs `updateLevel` on every level – used one-off to resync all formatting on the sheet e.g. when creating the sheet or changing colours.
5. Therefore, the sheet relies on a [backend sheet](https://docs.google.com/spreadsheets/d/1TmUN3wpUNRCEVTKu1rBXVXtF3KRerCENoIlEhoFCNng) to store cached points+ranks. To get this working, for each tab on the main sheet, add two tabs to the backend sheet whose names are that name followed by a space and then a letter `P` or `R`. The grid layout of each sheet should match the grid layout of the corresponding main sheet, so the script pastes data in the right place. On the `P` sheet specifically, add formulae before the data section along the levels axis, for things like points, medals and submissions counts (see the example). The values given by the formulae you include here are what the script pastes back to the main sheet once it's done updating each time. 
6. The permissions scripts rely on a user directory sheet. This should be view-restricted to protect privacy but is really simple to describe. It has two tabs:
    * **Users**: top row is header, with the exact words: `email`, `name 1`, `name 2`, `name 3`, `name 4`, `name 5`. Then list an email address for a Google account, next to any aliases it may appear under on the sheets (cells may be left blank).
    * **Mods**: top row is header, first column says `global`, and other columns have (optional) names of tabs on the main sheet. These columns are independent and contain lists of email addresses for moderator Google accounts – `global` for whole-sheet mods, and then each individual tab for additional tab-specific mods. These accounts have edit access to that entire tab.
7. The code has a global mutex that forces executions to be in series. Likewise, all functions update things and so are idempotent. This means the sheet should always end up correctly updated if functions don't time out, but in case they do, things can be synced by triggering the function again, e.g. copy+pasting multiple cells to trigger `updateSheet`. Important to bear in mind for any mod shuffling many rows/columns.

*`updateSheet` doesn't reformat because that requires individually requesting the colour of each cell's text, and individually requesting linked URLs is already really slow (neither is batchable into a single call yet).*

## How-To Permissions Scripts for Mods
The scripts are at Tools > Script Editor in the sheet menu. The useful functions are:
* `setProtectionRow` for setting a single row according to directory;
* `addMod` for adding one person by email to every protected range in a sheet;
* `verifyProtections` checks all the protections on a sheet agree w/ the directory for users and mods.

The workflow is first update the user directory, then run scripts like this:
![script editor annotation](https://cdn.discordapp.com/attachments/745757359569240075/823564369874387054/unknown.png)

1. Pick Permissions.gs out of the file menu;
2. Find the function you want and edit the parameters at the top;
3. Pick that function in the drop-down menu;
4. Click "Run".
