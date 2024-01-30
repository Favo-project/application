const { fabric } = require("fabric");
const { registerFont } = require("canvas");
const fs = require("fs");
const path = require("path");
const { executeAsyncOperation } = require("../utils");

class SaveCampaign {
  // saving all campaign products as images
  async onSave(campaign, campaignId) {
    // iterating campaign products to save them as images
    return await Promise.all(
      campaign.products.map(async (product, index) => {
        // iterating all types of products with Promise.all, and saving them as images
        const colors = await Promise.all(
          product.colors.map(async (type, idx) => {
            // static canvas instance for front designs of campaign
            const frontDesign = new fabric.StaticCanvas(null, {
              width: 700,
              height: 700,
            });

            // static canvas instance for back designs of campaign
            const backDesign = new fabric.StaticCanvas(null, {
              width: 700,
              height: 700,
            });

            // iterates and adds all objects to front canvas instance
            await this.designObjects(
              frontDesign,
              campaign.design.front,
              product.printableArea.front
            );

            // iterates and adds all objects to back canvas instance
            await this.designObjects(
              backDesign,
              campaign.design.back,
              product.printableArea.back
            );

            // product type or color names
            const typeNameFront = `${product.name}-${type.color.name}-front`;
            const typeNameBack = `${product.name}-${type.color.name}-back`;

            // setting canvas background
            await this.setBackgroundImage(frontDesign, type.image.front);
            await this.setBackgroundImage(backDesign, type.image.back);

            // saving design as image
            const imageUrlFront = await this.saveAsImage(
              frontDesign,
              typeNameFront,
              campaignId
            );
            const imageUrlBack = await this.saveAsImage(
              backDesign,
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

  // iterates and adds all objects to front canvas instance
  async designObjects(canvas, objects, pArea) {
    await Promise.all(
      objects.map(async (elem) => {
        if (elem.objType === "text") {
          this.addText(canvas, elem, pArea);
        }
        if (elem.objType === "icon") {
          await this.addClipart(canvas, elem, pArea);
        }
        if (elem.objType === "image") {
          await this.addImage(canvas, elem, pArea);
        }
      })
    ).catch((err) => {
      throw err;
    });
  }

  // add text to canvas instance
  addText(canvas, obj, pArea) {
    const text = new fabric.Text(obj.text, {
      ...obj,
      top: pArea.top - pArea.height / 2 + obj.relativeTop + obj.height / 2,
      fontWeight: "Regular",
    });

    canvas.add(text);
    canvas.renderAll();
  }

  // add svg to canvas instance
  async addClipart(canvas, obj, pArea) {
    await executeAsyncOperation((cb) => {
      fabric.loadSVGFromURL(obj.url, (objects, options) => {
        const svgObject = fabric.util.groupSVGElements(objects, options);
        svgObject.set({
          ...obj,
          top: pArea.top - pArea.height / 2 + obj.relativeTop + obj.height / 2,
        });

        // changes SVG color, svg containes a lot of sub objects this iteration changes all of their colors
        svgObject._objects.map((elem) => {
          return elem.fill ? elem.set({ fill: obj.fill }) : elem;
        });

        canvas.add(svgObject);
        canvas.renderAll();
        cb(null, "Operation completed");
      });
    });
  }

  // add image to canvas instance
  async addImage(canvas, obj, pArea) {
    await executeAsyncOperation((cb) => {
      fabric.Image.fromURL(obj.imgUrl, (image) => {
        image.set({
          ...obj,
          top: pArea.top - pArea.height / 2 + obj.relativeTop + obj.height / 2,
        });

        canvas.add(image);
        canvas.renderAll();
        cb(null, "Operation completed");
      });
    });
  }

  // set background to canvas instance
  async setBackgroundImage(canvas, imgUrl) {
    await executeAsyncOperation((cb) => {
      fabric.Image.fromURL(imgUrl, (image) => {
        image.set({
          scaleX: canvas.width / image.width,
          scaleY: canvas.height / image.height,
          top: canvas.width / 2,
          left: canvas.height / 2,
          originX: "center",
          originY: "center",
        });

        canvas.setBackgroundImage(image);
        canvas.renderAll();
        cb(null, "Operation completed");
      });
    });
  }

  // method for saving canvas instance as image to local storage
  async saveAsImage(canvas, typeName, campaignId) {
    return await executeAsyncOperation(async (cb) => {
      try {
        // converting canvas to base64 image URL
        const dataURL = canvas.toDataURL({
          quality: 1, // quality identifier for jpeg
          format: "jpeg",
          multiplier: 2, // scales canvas by the value, scales its quality
        });

        // converting base64 to Buffer data
        const base64Data = dataURL.split(",")[1];
        const decodedImage = Buffer.from(base64Data, "base64");

        // defining file path
        const dirPath = path.join(
          __dirname,
          "..",
          `/public/campaigns/${campaignId.toString()}`
        );
        const filePath = `/campaigns/${campaignId}/${typeName}-${Date.now()}.jpeg`;
        const originalPath = path.join(__dirname, "../public", filePath);

        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
        }

        // saving the file to local storage
        fs.writeFile(originalPath, decodedImage, () => {
          cb(null, filePath);
        });
      } catch (err) {
        throw err;
      }
    });
  }
}

module.exports = new SaveCampaign();
