# cd backend && yarn dev
# cd author-service && yarn dev

npx concurrently \
  "cd ./author-service && yarn && yarn dev" \
  "cd ./book-service && yarn && yarn dev" \
  "cd ./backend && yarn && yarn dev" \
  "cd ./helper && yarn"