// import appRoot from "./preload";

const child_process = window.require("child_process");
const path = window.require("path");


// console.log(appRoot);
// This function will output the lines from the script
// and will return the full combined output
// as well as exit code when it's done (using the callback).
function runScript(command, args, cwd, normalCallback, errorCallback, finishCallback) {
  const child = child_process.spawn(command, args, {
    cwd,
    shell: true
  });
  // You can also use a variable to save the output for when the script closes later
  child.on("error", errorCallback);

  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (data) => {
    // Here is the output
    data = data.toString();
    normalCallback(data.toString());
    console.log("ondata", data);
  });

  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (data) => {
    // Return some data to the renderer process with the mainprocess-response ID
    errorCallback(data.toString());
    // Here is the output from the command
    console.log(data);
  });

  child.on("close", (code) => {
    // Here you can get the exit code of the script
    switch (code) {
      case 0:
        // dialog.showMessageBox({
        //     title: 'Title',
        //     type: 'info',
        //     message: 'End process.\r\n'
        // });
        // message.success('succeed');
        console.log("job succeed");
        finishCallback();
        break;
      default:
        break;
    }
  });

  const killChild = () => {
    if (process.platform === "win32") {
      child_process.spawn("taskkill", ["/im", command, "/f", "/t"]);
      return;
    }
    child.kill(9);
  };

  child.killChild = killChild;

  return child;
}

const calculateImage = (input, model, normalCallback, errorCallback, finishCallback, binaryPath) => {
  const realesrganBinaryPath = binaryPath;

  const outputFile = path.join(path.dirname(input), `${path.basename(input)}.out.png`);
  console.log(outputFile);

  // runScript(`bash`,
  //   [
  //     "-c",
  //     "sleep 4",
  //   ],
  //   realesrganBinaryPath,
  //   () => {
  //     finishCallback(undefined);
  // });

  const bin =
    process.platform === "win32"
      ? "realesrgan-ncnn-vulkan.exe"
      : "realesrgan-ncnn-vulkan";

  const args = ["-i", input, "-o", outputFile, "-n", model];

  console.log(`command: ${bin} ${args.join(" ")}`);

  return runScript(
    bin,
    args,
    realesrganBinaryPath,
    normalCallback,
    errorCallback,
    () => {
      finishCallback(outputFile);
    }
  );
};


export default calculateImage;
