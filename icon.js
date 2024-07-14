import sharp from "sharp";

const inputFile = "./input.png";

const resizeConfigs = [
  { fileName: "EnmityIcon-Icon-20_Normal@2x.png", width: 40, height: 40 },
  { fileName: "EnmityIcon-Icon-60_Normal@2x.png", width: 120, height: 120 },
  { fileName: "EnmityIcon-Icon-Small_Normal@2x.png", width: 58, height: 58 },
  { fileName: "EnmityIcon-Icon-Small-40_Normal@2x.png", width: 80, height: 80 },
  { fileName: "EnmityIcon60x60@2x.png", width: 120, height: 120 },
  { fileName: "EnmityIcon76x76@2x~ipad.png", width: 152, height: 152 },
];

resizeConfigs.forEach(({ fileName, width, height }) => {
  sharp(inputFile)
    .resize(width, height)
    .toFile(`Icons/${fileName}`, (err, info) => {
      if (err) {
        console.error(`Error resizing ${fileName}:`, err);
      } else {
        console.log(`Successfully resized ${fileName} to ${width}x${height}`);
      }
    });
});
