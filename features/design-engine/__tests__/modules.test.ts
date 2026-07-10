import { describe, expect, it } from "vitest";
import { evaluateDesign } from "../core/evaluate";
import { grindingRubberModule } from "../modules/grinding-rubber";
import { grindingRubberDefaults } from "../modules/grinding-rubber/schema";

describe("grinding-rubber", () => {
  it("validates diameter constraints", () => {
    const model = evaluateDesign(grindingRubberModule, {
      ...grindingRubberDefaults,
      icCap: 250,
    });
    expect(model.valid).toBe(false);
  });

  it("builds cylinder solid with holes", () => {
    const model = evaluateDesign(grindingRubberModule, grindingRubberDefaults);
    expect(model.valid).toBe(true);
    expect(model.solidSpec?.kind).toBe("cylinder");
  });
});
