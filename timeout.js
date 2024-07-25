const { spawn } = require("child_process");
const timeoutSeconds = 10;

const childProcess = spawn("npm", ["run", "dev"], { stdio: "inherit" });

setTimeout(() => {
  console.log(
    `Timeout of ${timeoutSeconds} seconds reached. Killing the process.`,
  );
  childProcess.kill();
  process.exit(0);
}, timeoutSeconds * 1000);

childProcess.on("exit", (code) => {
  console.log(`Child process exited with code ${code}`);
  process.exit(code);
});
