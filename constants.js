import { exec } from "child_process";
class Shell {
  static async run(command = "ls", after) {
    return await new Promise((resolve) => {
      exec(command, (stderr, stdout) => {
        after === null || after === void 0 ? void 0 : after(stderr, stdout);
        resolve(stdout);
      });
    });
  }
  static async runSilently(command = "ls", after = (stderr, stdout) => {}) {
    return await new Promise((resolve) => {
      const finalCommand = command.includes("&")
        ? command.split("&")[0] + "> /dev/null " + "&" + command.split("&")[1]
        : command + " > /dev/null";
      exec(finalCommand, (stderr, stdout) => {
        after(stderr, stdout);
        resolve(stdout);
      });
    });
  }
}

class Constants {}
Constants.IPA_FETCH_LINK =
  "https://ipa.aspy.dev/discord/stable/Discord_226.1.ipa";
export { Shell, Divider, Constants };
