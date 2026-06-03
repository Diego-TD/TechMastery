import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import { modules } from "./test.setup";

describe("myFunctions", () => {
  test("add numbers", async () => {
    const t = convexTest(schema, modules);
    const number = 3;

    await t.mutation(api.myFunctions.addNumber, { value: number });

    const result = await t.query(api.myFunctions.listNumbers, { count: 1 });

    expect(result).toMatchObject({
      viewer: null,
      numbers: [number],
    });
  });
});
