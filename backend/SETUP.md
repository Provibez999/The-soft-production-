# Events & Classes back end: setup (about 10 minutes)

The website reads upcoming events from a Google Sheet and saves sign-ups into the same Sheet.

1. Make a new Google Sheet. Rename the first tab to **Events**.
2. In row 1 of that tab type these headings, one per column (A to I):
   `type | title | date | time | place | price | details | status | visible`
3. Add events below, one per row:
   - **type**: Event or Class
   - **date**: like 2027-03-14 (year-month-day)
   - **status**: Open, Full, or leave empty
   - **visible**: type `no` to hide a row without deleting it
4. In the Sheet, tap **Extensions → Apps Script**. Delete what is there and paste everything from `backend/Code.gs`. Save.
5. Tap **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Deploy and allow the permissions it asks for.
6. Copy the **Web app URL** (it starts with `https://script.google.com/macros/s/`).
7. Open `events.html` in GitHub and paste that URL between the quotes in `var SOFT_BACKEND = '';` then save.

After this, new rows in the **Events** tab show on the page, and sign-ups appear in a **Signups** tab.
If you change the script later, use **Deploy → Manage deployments → Edit → New version**.
