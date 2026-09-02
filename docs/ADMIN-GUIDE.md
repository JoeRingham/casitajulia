# Looking after the Casita Julia site

Everything is managed from the admin panel: **casitajulia.com/admin**

You'll be asked for the site password first (the same one you give friends),
then the admin username and password (Joe sets these up).

---

## Bookings — the calendar

**Bookings** (top of the sidebar). The page opens with a month calendar of
everything, then the list below. Prev / Today / Next move between months; click
any bar to open that entry.

**Create new** to add one. Every entry has:

- **Type** — one of:
  - *Guest stay* — a friend staying. Adds a **Guest name** field.
  - *Our stay* — the family using it. (This is the default.)
  - *Block* — maintenance, a closed season, anything else. Adds a **Reason**
    field, and the date fields are labelled **Block start / Block end**.
- **Check-in / Check-out** — like a hotel. The nights from check-in up to (not
  including) check-out are unavailable; the check-out day is free again.
  - To leave a night free for the cleaner after a stay, just set check-out to
    the guest's departure day — they don't sleep that night, and the next entry
    can't start before it.
  - To block a **whole calendar day** (say the 5th), set check-in to the 4th and
    check-out to the 6th.
- **Note** — optional, admin-only. For a Block or Our stay it's used as the
  label on the calendar.

Calendar colours: **green** = guest stay, **blue** = our stay, **amber** =
block.

If dates overlap another entry, the panel stops you and names the clash.
Entries that only *touch* (one checks out the day the next checks in) are fine —
that's a same-day handover.

To change or cancel, open it from the list and edit or delete it.

## Editing the two content pages

There are two, and they work identically:

- **Content → Stay Guide** — the practical page (`/info`): wifi, keys, arrival,
  house rules, bins, local tips.
- **Content → The Villa** — the about-the-house page (`/villa`): the house, the
  garden, getting here.

Each row is one **section** on that page. You can:

- **Edit** — click a row, change the heading or text, Save.
- **Add** — "Create new", give it a heading and text, Save.
- **Reorder** — drag the rows up and down in the list.
- **Hide without deleting** — open the section and untick "Show on site".

The text box is a normal editor — headings, bold, lists, links all work.

### Adding photos to a section

Inside a section there's an **Images** list. For each image: pick or upload a
photo, and optionally add a caption. They show as a grid under the section's
text, in the order you arrange them. Drag to reorder.

## Photos library

**Content → Media** is where every image lives. You can upload here directly, or
upload while adding an image to a section — either way it lands in the same
library and the same photo can be reused on both pages.

## Home page wording, photo, and "How to book" text

**Content → General**

- **Home page heading / introduction** — the top of the landing page.
- **Home page photo** — the large image near the top of the home page. Optional.
- **How to book** — the note on the calendar page telling friends to message you.
- **Footer line** — the small text at the bottom of every page.

## Changing the passwords

- **The friends password** (the one you hand out): Joe changes this — it's a
  server setting, not something in this admin panel. Changing it signs every
  friend out, so they'll need the new password next visit.
- **The admin password**: Joe sets it up initially. Change it yourself from the
  account menu, top-right of the admin panel — that sticks, even across updates
  to the site. If it's ever forgotten, Joe can reset it.

## Adding another admin (e.g. so Julia and Neal each have a login)

**Admin → Users → Create new**. Any admin can add another.
