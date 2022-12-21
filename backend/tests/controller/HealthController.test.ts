import "mocha";
import chai, { expect } from "chai";
import chaiHttp from "chai-http";
import app from "../../src/server";
import sinon from "sinon";

chai.use(chaiHttp);
chai.should();

describe("HealthController", () => {
  describe("Check health endpoint", () => {

    it("should return 200 and true(response) when request health endpoint", async () => {
    const baseUrl = "/health";

      const response = await chai.request(app).get(baseUrl);

      expect(response.status).equal(200);
      expect(response.body).deep.equal(true);

      sinon.restore();
    });
  });
});
