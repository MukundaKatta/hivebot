import { describe, it, expect } from "vitest";
import { Hivebot } from "../src/core.js";
describe("Hivebot", () => {
  it("init", () => { expect(new Hivebot().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Hivebot(); await c.process(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Hivebot(); await c.process(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
