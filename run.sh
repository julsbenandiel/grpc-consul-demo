# cd backend && yarn dev
# cd author-service && yarn dev

npx concurrently \
  "npx ts-node-dev ./backend/app.ts" \
  "npx ts-node-dev ./author-service/app.ts" \
  "npx ts-node-dev ./book-service/server.ts"