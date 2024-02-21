const fs = require("fs");
const path = require("path");

const deleteDirectory = async (campaignId) => {
  try {
    const originalPath = path.join(
      __dirname,
      "../public/campaigns",
      campaignId
    );

    if (fs.existsSync(originalPath)) {
      fs.rmSync(originalPath, {
        recursive: true,
        force: true,
      });
    } else {
      console.error("Directory does not exist");
    }
  } catch (e) {
    console.error("Error deleting directory:", e?.message);
  }
};

module.exports = deleteDirectory;
