# cd backend && yarn dev
# cd author-service && yarn dev

# npx concurrently \
#   "cd ./backend && yarn" \
#   "cd ./author-service && yarn" \
#   "cd ./book-service && yarn" \
#   "npx ts-node-dev ./backend/app.ts" \
#   "npx ts-node-dev ./author-service/app.ts" \
#   "npx ts-node-dev ./book-service/app.ts"

npx concurrently \
  "cd ./author-service && yarn && yarn dev" \
  "cd ./book-service && yarn && yarn dev" \
  "cd ./backend && yarn && yarn dev" \
  "cd ./helper && yarn"