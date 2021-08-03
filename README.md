# HOW TO
- To build production run `dotnet publish -r win10-x64 -c Release --self-contained false` or use `assemble.bat` from cmd
- The production build you can find at `/bin/Release/netcoreapp3.1/win10-x64/publish`
- Allow access to the folder you serve the application from
- `sa, AdminDom4`

## Bare temps
- bare temps are added in complementHandler
- they stay intact up to the chains out point
- they are used for meters rendering

## Meters
- Are rendered in `pullPoyas` and `pullLuch` functions

## The app config file
- within `index.html` the `config.js` are loaded
- it sets global window variables, that are used further

## web.config file
- within the `web.config` file there is a property `aspNetCore`
- it contains the tag `hostingModel`. By default its value is `inprocess`
- that means IIS handles this app directly (the process `w3wp` is up within the running windows processes)
- if you change that to `outofprocess` - it will override default behaviour. In this case
 the app will be hosted by Kestrel server and IIS will be a proxy between internet and Kestrel.
 The sign of such behavior is that now `w3wp` runs `dotnet` process additionally (look at process list).
 The Kestrel scheme is way more slower. That's why you should avoid `outofprocess` in production deployment
- By the way.. when you develop in vscode, Kestrel is used by the environment of the developing infrastructure.

## version control
- app current version is hardcoded in `App.js`
- there is entry `AppVersion` in `appsettings.json`. It contains server app version string.
- on each force page update or router path change (see App.js) it checks the two versions correspondence.
- if local app version is differ from server version, page reloaded and the notice is shown
- to recap, in the new release you have to alter two strings to be equal - in `App.js` and `appsettings.json`