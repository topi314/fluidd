---
title: Customize
icon: lucide/palette
---

# Customize

Fluidd allows you to adjust the layout of your dashboard, set a theme color,
and control which components are visible.

## Application Layout

Fluidd's dashboard uses a multi-column layout. On desktop, cards are arranged
across left and right columns. On mobile, they collapse into a single column.

To adjust the layout, open the side menu and click **Adjust Layout**:

- **Drag** cards between columns or reorder them within a column using the
  drag handles.
- **Enable or disable** individual cards using the checkboxes — disabled
  cards are hidden from the dashboard.
- **Add Camera Tile** places another camera card. Choose every enabled webcam
  or one webcam in the dialog. That choice stays on the tile. The original
  camera card keeps its own camera menu. In layout mode, a remove button on
  an added camera tile deletes that tile.
- **Add Iframe** places a card that embeds an external `http` or `https` page.
  Set its title, URL and height when you add it, and change it later from the
  card menu. In layout mode, a remove button deletes the tile.
- Click **Exit Layout** when you are done, or **Reset Layout** to restore
  the default arrangement. Reset drops camera and iframe tiles you added.

![Dashboard layout editor with draggable card handles](/assets/images/layout.png)

## Sidebar

**Settings → Sidebar**, directly under General, adds entries to the left
navigation. Each entry needs a title, an absolute `http` or `https` address,
an icon, and a position. Position chooses which built-in item the entry sits
below. **Top** places it above Home. Entries that share a position keep the
order they have in this list. A position whose item is hidden moves up to the
nearest visible item.

- **External link** opens that address in a new browser tab.
- **Page** opens that address inside Fluidd, in a sandboxed iframe.

Entries are saved with your other interface settings and stay in place after a
reload.

## Themes

### Theme Presets

Fluidd lets you choose a community preset, apply a color of your
choosing — along with either a dark or light theme.

Community presets are themed around popular 3D printing brands and
communities. If you'd like to see your logo supported here, let us know!

You can also set any custom primary color and independently toggle between
dark and light mode without using a preset.

![Theme settings showing community presets and a custom color picker](/assets/images/theme.png)

### Custom Themes

Fluidd supports custom stylesheets and background images. All custom
theming is configured through a `.fluidd-theme` folder within your printer's
configuration directory.

#### Custom Background

To use a custom background, upload your `background.png` file into the
above-mentioned `.fluidd-theme` folder.
Currently, the following file extensions are supported:

- `.jpg`
- `.jpeg`
- `.png`
- `.gif`

#### Custom Styling

To apply custom CSS, create a `custom.css` file and upload it to the
`.fluidd-theme` directory. After reloading Fluidd the changes should become
visible.

!!! tip "Custom CSS"
    Custom CSS is applied globally. Fluidd uses Vuetify 2 CSS classes. Use
    your browser's developer tools (++f12++) to inspect element classes before
    writing custom selectors.

## Hiding Components

Fluidd allows you to hide macros, output pins, fans and sensors by prefixing
them with an underscore (`_`).

By doing this — you're removing them from Fluidd. This can be handy in
situations where you have a large quantity of macros, or whereby you have an
output pin you may have no need to control in UI.

Some examples;

```ini title="printer.cfg"
[gcode_macro _MY_MACRO]
gcode:
  G28
```

```ini title="printer.cfg"
[output_pin _BEEPER]
pin: z:P1.30
```

```ini title="printer.cfg"
[temperature_sensor _MCU]
sensor_type: MCU
```

Macros can also be hidden directly from the Fluidd settings by toggling their
visibility, in order to not change their name. For full macro management
options including categories and colors, see the [Macros](features/macros.md) page.

![Macro settings panel with visibility toggles for each macro](/assets/images/macro_visibility.png)

Note that the underscore prefix controls macro and pin/sensor visibility only.
Dashboard widget cards (temperature, toolhead, etc.) are shown or hidden via
the **Layout** settings instead.
