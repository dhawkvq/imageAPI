import { formatReponseTime } from "../../utils";
import supertest from "supertest";
import { app } from "../../app";
import hash from "object-hash";
import path from "path";

const request = supertest(app);

describe("testing hash function", () => {
  it("returns the same hash for object with same values", () => {
    const picOne = {
      name: "nice_one.jpeg",
      height: 50,
      width: 50,
      options: {
        depth: "5000 meters",
        land: "aho",
      },
    };
    const picTwo = {
      name: "nice_one.jpeg",
      height: 50,
      width: 50,
      options: {
        depth: "5000 meters",
        land: "aho",
      },
    };

    const firstHash = hash(picOne);
    const secondHash = hash(picTwo);
    expect(firstHash).toEqual(secondHash);
  });
});

describe("api/resize/:fileName route", () => {
  it("returns the proper content and response", async () => {
    const firstImage = await request
      .post("/api/resize/gnar.jpeg")
      .send({ width: 400 });
    const secondImage = await request
      .post("/api/resize/gnar.jpeg")
      .send({ width: 400 });

    expect(firstImage.status).toBe(200);
    expect(firstImage.headers["content-type"]).toEqual("image/jpeg");
    expect(secondImage.status).toBe(200);
    expect(secondImage.headers["content-type"]).toEqual("image/jpeg");

    const firstImageTime = formatReponseTime(
      firstImage.headers["x-response-time"]
    );
    const secondImageTime = formatReponseTime(
      secondImage.headers["x-response-time"]
    );

    expect(firstImageTime).toBeGreaterThan(secondImageTime);
  });
});

describe("api/resize route", () => {
  it("will resize image and return proper content", async () => {
    const firstImage = await request
      .post("/api/resize")
      .field("width", "300")
      .attach(
        "image",
        path.join(__dirname, "../../test-images/lookUpTree.jpeg")
      );

    const secondImage = await request
      .post("/api/resize")
      .field("width", "300")
      .attach(
        "image",
        path.join(__dirname, "../../test-images/lookUpTree.jpeg")
      );

    expect(firstImage.status).toBe(200);
    expect(firstImage.headers["content-type"]).toEqual("image/jpeg");
    expect(Buffer.isBuffer(firstImage.body)).toBeTruthy();

    const firstImageTime = formatReponseTime(
      firstImage.headers["x-response-time"]
    );
    const secondImageTime = formatReponseTime(
      secondImage.headers["x-response-time"]
    );

    expect(firstImageTime).toBeGreaterThan(secondImageTime);
  });
});

describe("/api/pictures route", () => {
  it("returns an array of jpeg image strings", async () => {
    const newImage = await request
      .post("/api/resize")
      .field("width", "300")
      .attach("image", path.join(__dirname, "../../test-images/flat_out.jpeg"));

    const fileName = newImage.headers["content-disposition"]
      .split('filename="')[1]
      .slice(0, -1);

    const res = await request.get("/api/pictures");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.includes(fileName)).toBeTruthy();
  });
});

describe("/download/:fileName route", () => {
  it("will return a buffer", async () => {
    const newImage = await request
      .post("/api/resize")
      .field("width", "300")
      .attach(
        "image",
        path.join(__dirname, "../../test-images/nitro_flick.jpeg")
      );

    const fileName = newImage.headers["content-disposition"]
      .split('filename="')[1]
      .slice(0, -1);

    const res = await request.get(`/download/${fileName}`);
    expect(res.statusCode).toBe(200);
    expect(Buffer.isBuffer(res.body)).toBeTruthy();
    expect(res.headers["content-type"]).toBe("image/jpeg");
    expect(res.headers["content-disposition"]).toBe(
      `attachment; filename="${fileName}"`
    );
  });

  it("will throw an error if excluding a file to download", (done) => {
    request
      .get("/download/")
      .then((res) => {
        expect(res.statusCode).toBe(404);
      })
      .catch((error) => {
        expect(error.message).toBe("file not found");
      });
    done();
  });

  it("will throw an error if file does not exist", (done) => {
    request
      .get("/download/myLife.jpeg")
      .then((res) => {
        expect(res.statusCode).toBe(400);
      })
      .catch((error) => {
        expect(error.message).toBe("file does not exist");
      });
    done();
  });
});
