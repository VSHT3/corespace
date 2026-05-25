## Running dev

- `nohup npm run dev > /tmp/dev.log 2>&1 &`
  - this runs the dev server in the background
- `kill $(lsof -ti:3000)`
  - this kills the dev server
