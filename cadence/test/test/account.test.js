import path from "path";
import { init, getAccountAddress } from "flow-js-testing";

beforeEach(async (done) => {
  const basePath = path.resolve(__dirname, "../cadence");
  const port = 8080;
  init(basePath, port);
  done();
});

describe("Accounts", () => {
  test("Create Accounts", async () => {
    const Alice = await getAccountAddress("Alice");
    const Bob = await getAccountAddress("Bob");
    const Charlie = await getAccountAddress("Charlie");
    const Dave = await getAccountAddress("Dave");

    console.log("Four accounts were created with following addresses:\n", {
      Alice,
      Bob,
      Charlie,
      Dave,
    });
  });
});
