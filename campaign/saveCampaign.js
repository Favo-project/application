const fs = require("fs");
const path = require("path");
const { executeAsyncOperation } = require("../utils");
const { default: puppeteer } = require("puppeteer");

const CANVAS_FRAME_WIDTH = 1500;

function canvasContent(design, pArea, background) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="../public/styles/fonts.css" />
        <script src="../lib/fabric.min.js" type="text/javascript"></script>
        <script
          src="../lib/fontfaceobserver.standalone.js"
          type="text/javascript"
        ></script>
        <title>Document</title>
      </head>
      <body>
        <canvas id="design"></canvas>
        <div id="loader"></div>

        <script defer>
          (async function initCanvas() {
            executeAsyncOperation = function (callback) {
              return new Promise((resolve, reject) => {
                // Execute asynchronous operation and invoke callback
                callback((error, result) => {
                  if (error) {
                    reject(error || null);
                  } else {
                    resolve(result);
                  }
                });
              });
            };

            function setPrintClip(obj, pArea) {
              obj?.set?.({
                clipPath: new fabric.Rect({
                  originX: "center",
                  originY: "center",
                  top: pArea.top,
                  left: pArea.left,
                  width: pArea.width,
                  height: pArea.height,
                  absolutePositioned: true,
                  fill: "transparent",
                  selectable: false,
                  evented: false,
                }),
              });
            }
    
            async function designObjects(canvas, objects, pArea) {
              await Promise.all(
                objects.map(async (elem) => {
                  if (elem.objType === "text") {
                    await addText(canvas, elem, pArea);
                  }
                  if (elem.objType === "icon") {
                    await addClipart(canvas, elem, pArea);
                  }
                  if (elem.objType === "image") {
                    await addImage(canvas, elem, pArea);
                  }
                })
              )
            }
    
            // add text to canvas instance
            async function addText(canvas, obj, pArea) {
              if (obj.fontFamily === "Arial") {
                const text = new fabric.Text(obj.text, {
                  ...obj,
                  top:
                    pArea.top - pArea.height / 2 + obj.relativeTop + obj.height / 2,
                });
    
                setPrintClip(text, pArea);
                canvas.add(text);
    
                return text;
              } else {
                const myfont = new FontFaceObserver(obj.fontFamily);
                await myfont.load().then(() => {
                  const text = new fabric.Text(obj.text, {
                    ...obj,
                    top:
                      pArea.top -
                      pArea.height / 2 +
                      obj.relativeTop +
                      obj.height / 2,
                  });
    
                  setPrintClip(text, pArea);
                  canvas.add(text);
    
                  return text;
                });
              }
            }
    
            // add svg to canvas instance
            async function addClipart(canvas, obj, pArea) {
              await executeAsyncOperation((cb) => {
                fabric.loadSVGFromURL(obj.url, (objects, options) => {
                  const svgObject = fabric.util.groupSVGElements(objects, options);
                  svgObject.set({
                    ...obj,
                    top:
                      pArea.top -
                      pArea.height / 2 +
                      obj.relativeTop +
                      obj.height / 2,
                  });
    
                  // changes SVG color, svg containes a lot of sub objects this iteration changes all of their colors
                  svgObject._objects.map((elem) => {
                    return elem.fill ? elem.set({ fill: obj.fill }) : elem;
                  });
    
                  setPrintClip(svgObject, pArea);
                  canvas.add(svgObject);
                  cb(null, "Operation completed");
                });
              });
            }
    
            // add image to canvas instance
            async function addImage(canvas, obj, pArea) {
              await executeAsyncOperation((cb) => {
                const imgElement = new window.Image();
                imgElement.crossOrigin = "anonymous";
                imgElement.src = obj.imgUrl;
                imgElement.onload = function () {
                  const fabricImage = new fabric.Image(imgElement);
                  fabricImage.set({
                    ...obj,
                    top:
                      pArea.top -
                      pArea.height / 2 +
                      obj.relativeTop +
                      obj.height / 2,
                  });
    
                  setPrintClip(fabricImage, pArea);
                  canvas.add(fabricImage);
                  cb(null, "Operation completed");
                };
              });
            }
    
            // set background to canvas instance
            async function setBackgroundImage(canvas, imgUrl) {
              await executeAsyncOperation((cb) => {
                const imgElement = new window.Image();
                imgElement.crossOrigin = "anonymous";
                imgElement.src = imgUrl;
                imgElement.onload = function () {
                  const fabricImage = new fabric.Image(imgElement);
                  fabricImage.set({
                    scaleX: canvas.width / fabricImage.width,
                    scaleY: canvas.height / fabricImage.height,
                    top: canvas.width / 2,
                    left: canvas.height / 2,
                    originX: "center",
                    originY: "center",
                  });
    
                  canvas.setBackgroundImage(fabricImage);
                  canvas.renderAll();
                  cb(null, "Operation completed");
                };
              });
            }
    
            const canvas = new fabric.StaticCanvas("design", {
              width: 700,
              height: 700,
            });

            await setBackgroundImage(canvas, ${JSON.stringify(background)});
    
            await designObjects(
              canvas,
              ${JSON.stringify(design)},
              ${JSON.stringify(pArea)}
            );
    
            const scaleRatio = ${CANVAS_FRAME_WIDTH} / canvas.width;
    
            canvas.setDimensions({
              width: canvas.width * scaleRatio,
              height: canvas.height * scaleRatio,
            });
    
            canvas.setZoom(scaleRatio);
    
            canvas.renderAll();
          })();
        </script>
      </body>
    </html>
    `;
}

class SaveCampaign {
  // saving all campaign products as images
  async onSave(campaign, campaignId) {
    // iterating campaign products to save them as images
    return await Promise.all(
      campaign.products.map(async (product, index) => {
        // iterating all types of products with Promise.all, and saving them as images
        const colors = await Promise.all(
          product.colors.map(async (type, idx) => {
            const htmlContentFront = canvasContent(
              campaign.design.front,
              product.printableArea.front,
              type.image.front
            );

            const htmlContentBack = canvasContent(
              campaign.design.back,
              product.printableArea.back,
              type.image.back
            );

            // product type or color names
            const typeNameFront = `${product.name}-${type.color.name}-front`;
            const typeNameBack = `${product.name}-${type.color.name}-back`;

            const htmlPathFront = path.join(
              __dirname,
              "../res",
              `canvas-${campaignId + "-" + typeNameFront}.html`
            );
            const htmlPathBack = path.join(
              __dirname,
              "../res",
              `canvas-${campaignId + "-" + typeNameBack}.html`
            );

            fs.writeFileSync(htmlPathFront, htmlContentFront);
            fs.writeFileSync(htmlPathBack, htmlContentBack);

            // saving design as image
            const imageUrlFront = await this.saveAsImage(
              htmlPathFront,
              typeNameFront,
              campaignId
            );
            const imageUrlBack = await this.saveAsImage(
              htmlPathBack,
              typeNameBack,
              campaignId
            );

            return {
              ...type,
              image: {
                ...type.image,
              },
              designImg: {
                front: imageUrlFront,
                back: imageUrlBack,
              },
            };
          })
        );

        return {
          ...product,
          colors,
        };
      })
    ).catch((err) => {
      throw err;
    });
  }

  // method for saving canvas instance as image to local storage
  async saveAsImage(htmlPath, typeName, campaignId) {
    return await executeAsyncOperation(async (cb) => {
      try {
        // defining file path
        const dirPath = path.join(
          __dirname,
          "..",
          `/public/campaigns/${campaignId.toString()}`
        );
        const filePath = `/campaigns/${campaignId}/${typeName}-${Date.now()}.webp`;
        const originalPath = path.join(__dirname, "../public", filePath);

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }

        const browser = await puppeteer.launch();

        // Create a new page
        const page = await browser.newPage();

        // Set the size of the viewport to match your canvas dimensions
        await page.setViewport({
          width: CANVAS_FRAME_WIDTH,
          height: CANVAS_FRAME_WIDTH,
        }); // Set your canvas dimensions

        // Open an HTML file with Konva.js code

        await Promise.all([
          page.goto(htmlPath), // Replace with the path to your HTML file
          page.waitForNavigation({ waitUntil: "domcontentloaded" }),
        ]);

        // Capture the canvas as a screenshot
        await page.screenshot({
          path: originalPath,
          type: "webp",
          quality: 100,
        });

        // Close the browser
        await browser.close();

        fs.unlinkSync(htmlPath);

        cb(null, filePath);
      } catch (err) {
        throw err;
      }
    });
  }
}

exports.saveCampaign = new SaveCampaign();
