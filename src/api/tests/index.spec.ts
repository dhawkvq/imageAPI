import { resizeImage } from "..";
import path from "path";
import fs from "fs";
import { uploadPaths } from "../../config";

const image = path.join(__dirname, "../../test-images/nitro_flick.jpeg");

console.log("check");

describe("resizeImage function", () => {
  it("returns the proper content", (done) => {
    const picWidth = 300;
    fs.readFile(image, (error, buffer) => {
      if (error) throw error;
      resizeImage(buffer, `${uploadPaths.api}/nitro_flick_resized.jpeg`, {
        picWidth,
      }).then(({ height, width }) => {
        expect(height).toBeInstanceOf(Number);
        expect(width).toBeInstanceOf(Number);
        expect(width).toEqual(picWidth);
        done();
      });
    });
  });

  it("throws error when called without height or width", (done) => {
    fs.readFile(image, (error, buffer) => {
      if (error) throw error;
      resizeImage(
        buffer,
        `${uploadPaths.api}/nitro_flick_resized.jpeg`,
        {}
      ).catch((error) => {
        expect(error.message).toBe(
          "either height or width is required for resizing"
        );
        done();
      });
    });
  });
});
