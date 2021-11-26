const child_process = window.require("child_process");
const path = window.require("path");

function runScript(command, args, cwd, normalCallback, errorCallback, finishCallback) {

  // escape whitespaces first
  const child = child_process.spawn(command, args, {
    cwd,
    shell: true
  });

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
    // output from the command
    console.log(data);
  });

  child.on("close", (code) => {
    // get the exit code of the script
    switch (code) {
      case 0:
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

  const bin =
    process.platform === "win32"
      ? "realesrgan-ncnn-vulkan.exe"
      : "realesrgan-ncnn-vulkan";

  const args = ["-i", `"${input}"`, "-o", `"${outputFile}"`, "-n", model];

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
