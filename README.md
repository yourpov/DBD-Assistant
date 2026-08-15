# DBD Assistant

A small Tauri assistant app for **Dead by Daylight**

## Features

- **INI Editor**: edit the `WindowsClient`/`EGSClient` config files
- **Game Controls**: start, close, or restart the game
- **Region Control**: block matchmaking regions
- **DBD Data**: stats, lookup tools, and game data
- **About**: credits and transparency

## Screenshots

|                                                                         |                                                          |
| :---------------------------------------------------------------------: | :------------------------------------------------------: |
| **INI Editor**<br>![INI Editor](assets/media/iniEditor.png)             | **DBD Data**<br>![DBD Data](assets/media/dbdData.png)    |
| **Game Controls**<br>![Game Controls](assets/media/gameControls.png)    | **About**<br>![About](assets/media/About.png)            |
| **Region Control**<br>![Region Control](assets/media/regionControl.png) |                                                          |

## Development

```bash
npm install
npm run dev       # frontend server
npm run tauri dev # development
npm run build     # prod build
```

## License

Source code is licensed a [MIT](LICENSE) license.


> Dead by Daylight, its logos, artwork, and other game assets are the property of
> Behaviour Interactive Inc. and are **not** covered by that license. This is an
> unofficial fan project, not affiliated with or endorsed by Behaviour Interactive.

Live game data comes from [dbd.tricky.lol](https://dbd.tricky.lol), [deadbyqueue.com](https://deadbyqueue.com), and [eigenvoid.dev](https://eigenvoid.dev/projects/dead-by-daylight-bloodweb-data).