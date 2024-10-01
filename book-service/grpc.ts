import { exec } from "node:child_process"
import fs from "node:fs"

fs.rmSync("./generated/book.ts")

exec(`
  protoc \
    --plugin=./node_modules/.bin/protoc-gen-ts_proto \
    --ts_proto_opt=outputServices=grpc-js \
    --proto_path ../protocol-buffers \
    --ts_proto_out=generated ../protocol-buffers/book.proto
`,
  (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
  });