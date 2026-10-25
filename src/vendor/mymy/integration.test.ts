import { describe, it, expect } from "vitest";
import { compileStory } from "../../story-engine/compiler";
import { testStory } from "../../story-engine/testStory";
import { dispatch } from "../../engine";
import { initialRuntime } from "../../schema";
import fixture from "../../../tests/fixtures/mymy-ui/story.json";
describe("Mymy adapters preserve shared story engine", () => {
  it("compiles authored KKT and verifies read → call → Instagram unlock", () => {
    const { story, work } = compileStory(fixture);
    expect(testStory(story, work)).toEqual([]);
    let state = dispatch(work, initialRuntime(work), "read", "kkt-last");
    expect(state.incomingCall?.target).toBe("test-call");
    state = dispatch(work, state, "callAnswered", "test-call");
    state = dispatch(work, state, "callEnded", "test-call");
    expect(state.unlocked).toContain("ig-after-call");
  });
});
