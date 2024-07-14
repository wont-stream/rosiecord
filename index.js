/**
 * -~-~-~ Main Discord Patch Script -~-~-~
 * Build to Patch Enmity, Icons, Fonts, and Other Tweaks into the Base Discord IPA.
 * Created by Rosie "Acquite" on Thursday 22nd December 2022.
 * Last updated by Rosie "Acquite" on Thursday 6th July 2023.
 * Required Dependencies: plutil, local-dirs[Fonts, Packs, Icons, Patches{Required, Optional}], Azule, Theos, NodeJS (run `npm i`)
 */
import fs from "fs";
import { Shell, Constants } from "./constants.js";
class Main {
  constructor(type, outputType) {
    this.type = type;
    this.outputType = outputType;
  }
  load(path) {
    return JSON.parse(fs.readFileSync(path).toString());
  }
  async get(item) {
    const ipaArray = [];
    await Shell.run(item, (_, stdout) => {
      stdout
        .split("\n")
        .filter((ipa) => ipa !== "")
        .forEach((ipa) => ipaArray.push(ipa));
    });
    return ipaArray;
  }
  async Main(callable) {
    await callable();
  }
}
class State {
  constructor(state, name) {
    this.state = state;
    this.name = name;
  }
}
class Inject {
  constructor(type, outputType, hasClean, getParam) {
    this.type = type;
    this.outputType = outputType;
    this.hasClean = hasClean;
    this.getParam = getParam;
  }
  async run(M, callable) {
    const requiredPatches = (await M.get(this.getParam)).filter((item) => {
      if (!this.hasClean) return true;
      return process.argv[2] == "k2genmity"
        ? item !==
            (item.includes("Development")
              ? "Enmity.Development.Official.deb"
              : "Enmity.deb")
        : item !== "K2genmity.Development.deb";
    });
    const stdoutIpas = await M.get(`ls Dist`);
    const tweakStates = requiredPatches.map((ipa) => new State("pending", ipa));

    for (const i in requiredPatches) {
      let patched = 0;
      for (const j in stdoutIpas) {
        const ipaName = stdoutIpas[j].split(".")[0];
        const patchName = requiredPatches[i];
        await callable(ipaName, patchName);
        patched++;
        const isComplete = patched === stdoutIpas.length;
        // @ts-ignore
        isComplete
          ? (tweakStates.find((patch) => patch.name === patchName).state =
              "success")
          : null;
      }
    }
  }
}
const EntryPoint = async (index, ipaName) => {
  switch (index) {
    case 0: {
      const M = new Main("IPA", "Different Fonts");
      await M.Main(async () => {
        var _a;
        const ipaList = [...(await M.get("ls Fonts/ttf"))];
        const ipaStates = ipaList.map((ipa) => new State("pending", ipa));

        await Shell.runSilently(
          `zip -q -r Dist/Discord-${
            ipaName.split("_")[1]
          }_GGSans-Font.ipa Payload & wait $!`,
          async (stderr, _) => {
            ipaStates[0].state = stderr ? "failure" : "success";
          }
        );
        await Shell.runSilently(`rm -rf Payload & wait $!`);
        for (const Font of ipaList.filter((ipa) => ipa !== "GGSans")) {
          await Shell.runSilently(
            `unzip -qq -o Dist/Discord-${ipaName.split("_")[1]}_GGSans-Font.ipa`
          );
          await Shell.runSilently(
            `cp -rf Fonts/ttf/${Font}/* Payload/Discord.app/`
          );
          await Shell.runSilently(
            `zip -q -r Dist/Discord-${
              ipaName.split("_")[1]
            }_${Font}-Font.ipa Payload & wait $!`
          );
          await Shell.runSilently(`rm -rf Payload & wait $!`);
          ((_a = ipaStates.find((ipa) => ipa.name === Font)) !== null &&
          _a !== void 0
            ? _a
            : { state: null }
          ).state = "success";
        }
      });
      break;
    }
    case 1: {
      const M = new Main("Tweak", "Required Tweaks");
      await M.Main(async () => {
        await new Inject(
          "Tweak",
          "all Required Tweaks",
          true,
          "ls Patches/Required"
        ).run(M, async (ipaName, patchName) => {
          if (ipaName.includes("GGSans")) return;
          await Shell.run(
            `Azule/azule -U -i Dist/${ipaName}.ipa -o Dist -f $PWD/Patches/Required/${patchName} -v & wait $!`
          );
          await Shell.run(
            `mv Dist/${ipaName}+${patchName}.ipa Dist/${ipaName}.ipa`
          );
        });
      });
      break;
    }
    case 2: {
      const M = new Main("Pack", "Icon Packs");
      await M.Main(async () => {
        await new Inject("Pack", "all Icon Packs", true, "ls Packs").run(
          M,
          async (ipaName, patchName) => {
            if (ipaName.includes("GGSans")) return;
            await Shell.run(`unzip -qq -o Dist/${ipaName}.ipa`);
            await Shell.runSilently(
              `cp -rf Packs/${patchName}/Assets.car Payload/Discord.app/`
            );
            await Shell.runSilently(
              `cp -rf Packs/${patchName}/* Payload/Discord.app/assets/`
            );
            await Shell.runSilently(
              `rm -f Payload/Discord.app/assets/Assets.car`
            );
            await Shell.runSilently(
              `zip -q -r Dist/${ipaName}+${patchName}_Icons.ipa Payload`
            );
            await Shell.runSilently(`rm -rf Payload`);
          }
        );
      });
      break;
    }
    case 3: {
      const M = new Main("Tweak", "Optional Variations");
      await M.Main(async () => {
        await new Inject(
          "Flowercord",
          "Flowercord",
          false,
          "ls Patches/Optional"
        ).run(M, async (ipaName, patchName) => {
          if (ipaName.includes("GGSans")) return;
          await Shell.run(
            `Azule/azule -U -i Dist/${ipaName}.ipa -o Dist -f $PWD/Patches/Optional/${patchName} -v & wait $!`
          );
          await Shell.run(
            `mv Dist/${ipaName}+${patchName}.ipa Dist/${ipaName}+Flowercord.ipa`
          );
        });
      });
      break;
    }
    default:
      break;
  }
};

const main = async () => {
  const IPA_LINK = Constants.IPA_FETCH_LINK;
  // Gets just the IPA Name, "Discord_158" or whatever
  const [, IPA_VERSION] = IPA_LINK.match(/.*Discord(.*)\..*\.ipa/);
  const IPA_NAME = `Discord${
    IPA_VERSION.startsWith("_") ? IPA_VERSION : `_${IPA_VERSION}`
  }`;

  await Shell.runSilently(
    `mkdir -p Dist/ & wait $!; rm -rf Dist/* & wait $!; rm -rf Payload & wait $!`
  );

  await Shell.runSilently(`mkdir Ipas; rm -rf Ipas/* & wait $!;`);
  await Shell.runSilently(`curl ${IPA_LINK} -o Ipas/${IPA_NAME}.ipa`);
  const IPA_DIR = `Ipas/${IPA_NAME}.ipa`;

  await Shell.runSilently(`unzip -o ${IPA_DIR} & wait $!`);

  await Shell.runSilently(
    `plutil -insert CFBundleURLTypes.1 -xml "<dict><key>CFBundleURLName</key><string>Enmity</string><key>CFBundleURLSchemes</key><array><string>enmity</string></array></dict>" ${"Payload/Discord.app/Info.plist"} & wait $!`
  );
};
// await Shell.runSilently(`cp -rf Icons/* Payload/Discord.app/`)
// await Shell.runSilently(`plutil -replace CFBundleIcons -xml "<dict><key>CFBundlePrimaryIcon</key><dict><key>CFBundleIconFiles</key><array><string>EnmityIcon60x60</string></array><key>CFBundleIconName</key><string>EnmityIcon</string></dict></dict>" ${"Payload/Discord.app/Info.plist"} & wait $!`)
// await Shell.runSilently(`plutil -replace CFBundleIcons~ipad -xml "<dict><key>CFBundlePrimaryIcon</key><dict><key>CFBundleIconFiles</key><array><string>EnmityIcon60x60</string><string>EnmityIcon76x76</string></array><key>CFBundleIconName</key><string>EnmityIcon</string></dict></dict>" ${"Payload/Discord.app/Info.plist"} & wait $!`, (stderr) => {
//     Shell.write(stderr
//         ? `${S.FAILURE} An error occurred while removing Discord's ${M.PINK}\"Supported Device Limits\"${M.RED}.${M.ENDC}\n`
//         : `${S.SUCCESS} Successfully Patched ${M.PINK}\"Discord's Icons\"${M.GREEN} to ${M.PINK}\"Enmity's Icons\"${M.GREEN}.${M.ENDC}\n`
//     )
// })

await Shell.run(
  `plutil -replace UISupportsDocumentBrowser -bool true ${"Payload/Discord.app/Info.plist"} & wait $!`
);
await Shell.run(
  `plutil -replace UIFileSharingEnabled -bool true ${"Payload/Discord.app/Info.plist"} & wait $!`
);

for (let i = 0; i <= 3; i++) {
  const IPA_LINK = Constants.IPA_FETCH_LINK;
  // Gets just the IPA Name, "Discord_158" or whatever
  const [, IPA_VERSION] = IPA_LINK.match(/.*Discord(.*)\..*\.ipa/);
  await EntryPoint(
    i,
    `Discord${IPA_VERSION.startsWith("_") ? IPA_VERSION : `_${IPA_VERSION}`}`
  );
  // await new Promise((resolve) => setTimeout(() => resolve(), 2000));
}
// const errors: any[] = [];
// for (const Ipa of await M.get(`ls Dist`)) {
//     await Shell.run(`unzip -qq -o Dist/${Ipa}`, (stderr) => stderr && errors.push(stderr));
//     await Shell.run(`ldid -S Payload/Discord.app/Discord`, (stderr) => stderr && errors.push(stderr))
//     for (const Framework of await M.get('ls Payload/Discord.app/Frameworks/*.dylib')) {
//         await Shell.run(`ldid -S ${Framework}`, (stderr) => stderr && errors.push(stderr))
//     }
//     await Shell.runSilently(`zip -q -r Dist/${Ipa} Payload & wait $!`)
//     await Shell.runSilently(`rm -rf Payload & wait $!`)
// }
// Shell.write(errors.length > 0
//     ? `${S.FAILURE} An error occurred while signing ${M.PINK}\"Discord and Frameworks\"${M.RED}.${M.ENDC}\n`
//     : `${S.SUCCESS} Successfully signed ${M.PINK}\"Discord\"${M.GREEN} and signed ${M.PINK}\"Frameworks\"${M.GREEN}.${M.ENDC}\n`
// )
// errors.length > 0 && Shell.write(errors);

await main();
