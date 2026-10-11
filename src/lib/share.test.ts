import { describe, expect, it } from "vitest";
import { m } from "./labels";
import { shareDate, shareText, shareUrl, squares } from "./share";

const base = {
  name: "Ten a Day",
  date: new Date(2026, 9, 11, 12, 0),
  listLine: m.share.listLine,
  question: m.share.question,
};

describe("share text", () => {
  it("matches the format in the brief", () => {
    // Protocols 1, 2, 3, 5, 6, 7 and 10 done.
    const mask = 0b1001110111;
    const text = shareText({ ...base, mask, streak: 4, url: "https://example.org/?ref=abc1234" });
    expect(text).toBe(
      [
        "Ten a Day · Sun, 11 Oct",
        "7/10  ■■■□■■■□□■",
        "Streak: 4 days",
        "Water, light, training, focus, sigh, late light, dim evening, dark sleep, food + walk, quiet time.",
        "What's yours?",
        "https://example.org/?ref=abc1234",
      ].join("\n"),
    );
  });

  it("omits the streak line at zero and uses the singular at one", () => {
    expect(shareText({ ...base, mask: 0, streak: 0, url: "" })).not.toContain("Streak");
    expect(shareText({ ...base, mask: 0, streak: 1, url: "" })).toContain("Streak: 1 day\n");
  });

  it("leaves out the URL line when there is no address", () => {
    expect(shareText({ ...base, mask: 0, streak: 0, url: "" }).endsWith("What's yours?")).toBe(true);
  });

  it("orders squares by protocol number", () => {
    expect(squares(1)).toBe("■□□□□□□□□□");
    expect(squares(1 << 9)).toBe("□□□□□□□□□■");
  });

  it("formats the date without the device locale", () => {
    expect(shareDate(new Date(2026, 0, 5))).toBe("Mon, 5 Jan");
  });

  it("builds the referral link", () => {
    expect(shareUrl("https://example.org/", "abc1234")).toBe("https://example.org/?ref=abc1234");
    expect(shareUrl("https://example.org", "")).toBe("https://example.org/");
    expect(shareUrl("", "abc1234")).toBe("");
  });
});
