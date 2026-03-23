# Hephaestus

Browser extension with improvements for █████████ and ████████ ██████.

## Installation

<a href="https://ifv.banocean.com/downloads/firefox"><img src="./docs/add to firefox.svg"></a><img width=10px><a href="https://ifv.banocean.com/downloads/chrome"><img src="./docs/add to chrome.svg"></a>

[Installation guide [PL]](https://ifv.banocean.com)<br>
[Adding the extension to browsers for development](#development-workflow)

## Features

<details>
    <summary>Mobile navigation</summary>

| Before:                                                            | After:                                                            |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| <img src="./docs/screenshots/mobileNavBefore.png" width="300px" /> | <img src="./docs/screenshots/mobileNavAfter.png" width="300px" /> |

</details>
<details>
    <summary>PWA support</summary>
    <img src="./docs/screenshots/pwa.png" width="300px" />
</details>

<details>
    <summary>Attendance statistics in a separate tab</summary>

| Before:                                                             | After:                                                             |
| ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| <img src="./docs/screenshots/attendanceBefore.png" width="300px" /> | <img src="./docs/screenshots/attendanceAfter.png" width="300px" /> |

</details>
<details>
    <summary>Hide weekends in monthly calendars</summary>

| Before:                                                               | After:                                                               |
| --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <img src="./docs/screenshots/hideWeekendsBefore.png" width="300px" /> | <img src="./docs/screenshots/hideWeekendsAfter.png" width="300px" /> |

</details>
<details>
    <summary>Display full name</summary>

| Before:                                                        | After:                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| <img src="./docs/screenshots/fnameBefore.png" width="300px" /> | <img src="./docs/screenshots/fnameAfter.png" width="300px" /> |

</details>
<details>
    <summary>A cleaner student dashboard</summary>

Before:

<img src="./docs/screenshots/whiteboardBefore.png" width="800px" />

After:

<img src="./docs/screenshots/whiteboardAfter.png" width="800px" />
</details>

<details>
    <summary>A cleaner █████████ home</summary>

| Before:                                                         | After:                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| <img src="./docs/screenshots/evHomeBefore.png" width="300px" /> | <img src="./docs/screenshots/evHomeAfter.png" width="300px" /> |

</details>

<details>
    <summary>Other minor enhancements</summary>

- Hiding WCAG controls
- Aligning detailed grades button
- Redirecting to board
- Auto-redirecting to █████████ login page
      </details>

## Development Workflow

### Build the extension

1. Make sure you have [Bun](https://bun.sh/) installed.
2. Install required dependencies and setup project using `bun install`.
3. Execute `bunx wxt prepare` to prepare types for futher development.
4. Use `bun dev`/`dev:firefox` to start development server or `bun build`/`bun build:firefox` to build a package.

### Firefox

To load add-on from files in Firefox, you need to go to `about:debugging#/runtime/this-firefox` and click `Load Temporary Add-on...`. After that you need to select the `manifest.json` file from `.output/` folder in the file picker.<br>
<img src="./docs/screenshots/firefoxDebug.png">

### Chrome

To load extension from files in Chrome, you need to go to `chrome://extensions/` and click `Load unpacked` (with Developer mode enabled)<br>
<img src="./docs/screenshots/chromeDebug.png">

## License

This project is licensed under the [MIT License](./LICENSE).

## Contributions

Contributions to this project are welcome. Feel free to [open issues](https://github.com/yoper12/ifv/issues) and [submit pull requests](https://github.com/yoper12/ifv/pulls).
