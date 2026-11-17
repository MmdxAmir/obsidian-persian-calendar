import { DEFAULT_SETTING } from "src/constants";
import type PersianCalendarPlugin from "src/main";
import NotePathBuilder from "src/services/NotePathBuilder";
import type { TSetting } from "src/types";
import { clearCompiledPatternCache } from "src/utils/dateEngine/compiler";
import { DatePatternFormatError } from "src/utils/dateEngine/errors";
import { formatPattern } from "src/utils/dateEngine/formatter";
import { getWeekStartCalculator } from "src/utils/dateUtils";

beforeEach(() => {
	clearCompiledPatternCache();
});

function createBuilder(settingOverrides: Partial<TSetting> = {}) {
	const plugin = {
		setting: { ...DEFAULT_SETTING, ...settingOverrides },
	} as unknown as PersianCalendarPlugin;

	return new NotePathBuilder(plugin);
}

describe("NotePathBuilder.buildEngineContext", () => {
	it("derives the Jalali season from a full Jalali date", () => {
		const builder = createBuilder();
		expect(builder.buildEngineContext({ jy: 1403, jm: 4, jd: 10 }).season).toBe(2);
	});

	it("derives the Jalali season from a full Gregorian date alone", () => {
		const builder = createBuilder();
		const ctx = builder.buildEngineContext({ gy: 2024, gm: 7, gd: 1 });
		expect(ctx.jy).toBeDefined();
		expect(ctx.jm).toBeDefined();
		expect(ctx.season).toBeDefined();
	});

	it("derives Gregorian fields from a full Jalali date", () => {
		const builder = createBuilder();
		const ctx = builder.buildEngineContext({ jy: 1403, jm: 1, jd: 1 });
		expect(ctx.gy).toBeDefined();
		expect(ctx.gm).toBeDefined();
		expect(ctx.gd).toBeDefined();
	});

	it("anchors to the season's first month/day when only the season is known", () => {
		const builder = createBuilder();
		const ctx = builder.buildEngineContext({ jy: 1403, season: 3 });
		// Season 3 (Paeez) starts at Jalali month 7.
		expect(ctx.jm).toBe(7);
		expect(ctx.jd).toBe(1);
		expect(ctx.gy).toBeDefined();
	});
});

describe("NotePathBuilder - mixed-calendar dynamic paths (regression)", () => {
	it("resolves YYYY/jQQ for the yearly note path instead of throwing", () => {
		const builder = createBuilder({ yearlyNotesPath: "YYYY/jQQ" });
		expect(() => builder.buildYearlyNotePath(1403)).not.toThrow();
	});

	it("resolves jYYYY/jQQ for the yearly note path", () => {
		const builder = createBuilder({ yearlyNotesPath: "jYYYY/jQQ" });
		expect(() => builder.buildYearlyNotePath(1403)).not.toThrow();
	});

	it("resolves YYYY/jQQQQ for the yearly note path", () => {
		const builder = createBuilder({ yearlyNotesPath: "YYYY/jQQQQ" });
		expect(() => builder.buildYearlyNotePath(1403)).not.toThrow();
	});

	it("resolves YYYY/jMMMM for the yearly note path", () => {
		const builder = createBuilder({ yearlyNotesPath: "YYYY/jMMMM" });
		const { filePath } = builder.buildYearlyNotePath(1403);
		expect(filePath).toContain("Farvardin");
	});

	it("resolves jYYYY/MM for the yearly note path", () => {
		const builder = createBuilder({ yearlyNotesPath: "jYYYY/MM" });
		expect(() => builder.buildYearlyNotePath(1403)).not.toThrow();
	});

	it("resolves YYYY/jMM for the yearly note path", () => {
		const builder = createBuilder({ yearlyNotesPath: "YYYY/jMM" });
		const { filePath } = builder.buildYearlyNotePath(1403);
		expect(filePath).toMatch(/\d{4}\/01\//);
	});

	it("resolves YYYY/jQQ for the seasonal note path", () => {
		const builder = createBuilder({ seasonalNotesPath: "YYYY/jQQ" });
		expect(() => builder.buildSeasonalNotePath(1403, 3)).not.toThrow();
	});

	it("resolves jYYYY/MM for the seasonal note path", () => {
		const builder = createBuilder({ seasonalNotesPath: "jYYYY/MM" });
		expect(() => builder.buildSeasonalNotePath(1403, 3)).not.toThrow();
	});

	it("still resolves purely Gregorian yearly paths", () => {
		const builder = createBuilder({ yearlyNotesPath: "YYYY/MM/DD" });
		expect(() => builder.buildYearlyNotePath(1403)).not.toThrow();
	});

	it("still resolves purely Jalali seasonal paths", () => {
		const builder = createBuilder({ seasonalNotesPath: "jYYYY/jQQQQ" });
		expect(() => builder.buildSeasonalNotePath(1403, 1)).not.toThrow();
	});

	it("still resolves the default daily/weekly/monthly note paths", () => {
		const builder = createBuilder();
		expect(() => builder.buildDailyNotePath(1403, 1, 1)).not.toThrow();
		expect(() => builder.buildWeeklyNotePath(1403, 1)).not.toThrow();
		expect(() => builder.buildMonthlyNotePath(1403, 1)).not.toThrow();
	});

	it("resolves mixed YYYY/jQQ for the monthly note path (full context already available)", () => {
		const builder = createBuilder({ monthlyNotesPath: "YYYY/jQQ" });
		expect(() => builder.buildMonthlyNotePath(1403, 4)).not.toThrow();
	});

	it("still throws a DatePatternFormatError when a field genuinely cannot be derived", () => {
		const builder = createBuilder();
		expect(() => formatPattern("jMM", builder.buildEngineContext({ jy: 1403 }))).toThrow(
			DatePatternFormatError,
		);
	});
});

describe("NotePathBuilder - weekly note folder month", () => {
	function weekly(
		weekCalculation: TSetting["weekCalculation"],
		weeklyPathMonth: TSetting["weeklyPathMonth"],
		path: string,
		year: number,
		week: number,
	) {
		return createBuilder({ weekCalculation, weeklyPathMonth, weeklyNotesPath: path }).buildWeeklyNotePath(
			year,
			week,
		);
	}

	it("defaults to the start of the week", () => {
		const path = "jYYYY/jMM/[W]ww";
		const defaultPath = createBuilder({ weeklyNotesPath: path }).buildWeeklyNotePath(1403, 9);
		const explicitStart = weekly("jalali-first-week-start", "start", path, 1403, 9);
		expect(defaultPath.filePath).toBe(explicitStart.filePath);
	});

	it("selects the start or end month when a Jalali week crosses months within one year", () => {
		const calculator = getWeekStartCalculator("jalali-first-week-start");
		expect(calculator.getStartOfWeek(1403, 9)).toMatchObject({ jy: 1403, jm: 2 });
		expect(calculator.getEndOfWeek(1403, 9)).toMatchObject({ jy: 1403, jm: 3 });

		const path = "jYYYY/jMM/[W]ww";
		expect(weekly("jalali-first-week-start", "start", path, 1403, 9).filePath).toBe(
			"1403/02/W09/1403-W09.md",
		);
		expect(weekly("jalali-first-week-start", "end", path, 1403, 9).filePath).toBe(
			"1403/03/W09/1403-W09.md",
		);
	});

	it("selects the start or end month when a Gregorian week crosses months within one year", () => {
		const calculator = getWeekStartCalculator("gregorian-first-week-start");
		expect(calculator.getStartOfWeek(2024, 4)).toMatchObject({ gy: 2024, gm: 1 });
		expect(calculator.getEndOfWeek(2024, 4)).toMatchObject({ gy: 2024, gm: 2 });

		const path = "YYYY/MM/[W]ww";
		expect(weekly("gregorian-first-week-start", "start", path, 2024, 4).filePath).toBe(
			"2024/01/W04/2024-W04.md",
		);
		expect(weekly("gregorian-first-week-start", "end", path, 2024, 4).filePath).toBe(
			"2024/02/W04/2024-W04.md",
		);
	});


	it("does not move the first full week across a year boundary", () => {
		const jalali = getWeekStartCalculator("jalali-first-week-start");
		expect(jalali.getStartOfWeek(1404, 1).jy).toBe(1404);
		expect(jalali.getEndOfWeek(1404, 1).jy).toBe(1404);

		const gregorian = getWeekStartCalculator("gregorian-first-week-start");
		expect(gregorian.getStartOfWeek(2024, 1).gy).toBe(2024);
		expect(gregorian.getEndOfWeek(2024, 1).gy).toBe(2024);
	});

	it("keeps a Gregorian final full week in its own year while selecting the endpoint month", () => {
		const calculator = getWeekStartCalculator("gregorian-first-week-start");
		expect(calculator.getStartOfWeek(2024, 52)).toMatchObject({ gy: 2024, gm: 12 });
		expect(calculator.getEndOfWeek(2024, 52)).toMatchObject({ gy: 2025, gm: 1 });

		const path = "YYYY/MM/[W]ww";
		expect(weekly("gregorian-first-week-start", "start", path, 2024, 52).filePath).toBe(
			"2024/12/W52/2024-W52.md",
		);
		expect(weekly("gregorian-first-week-start", "end", path, 2024, 52).filePath).toBe(
			"2024/01/W52/2024-W52.md",
		);
	});

	it("keeps a Jalali first-day-of-year week in its own year while using the selected endpoint month", () => {
		const calculator = getWeekStartCalculator("jalali-first-day-of-year");
		expect(calculator.getStartOfWeek(1404, 1)).toMatchObject({ jy: 1403, jm: 12 });
		expect(calculator.getEndOfWeek(1404, 1)).toMatchObject({ jy: 1404, jm: 1 });

		const path = "jYYYY/jMM/[W]ww";
		expect(weekly("jalali-first-day-of-year", "start", path, 1404, 1).filePath).toBe(
			"1404/12/W01/1404-W01.md",
		);
		expect(weekly("jalali-first-day-of-year", "end", path, 1404, 1).filePath).toBe(
			"1404/01/W01/1404-W01.md",
		);
	});

	it("keeps a Gregorian first-day-of-year week in its own year while using the selected endpoint month", () => {
		const calculator = getWeekStartCalculator("gregorian-first-day-of-year");
		expect(calculator.getStartOfWeek(2024, 1)).toMatchObject({ gy: 2023, gm: 12 });
		expect(calculator.getEndOfWeek(2024, 1)).toMatchObject({ gy: 2024, gm: 1 });

		const path = "YYYY/MM/[W]ww";
		expect(weekly("gregorian-first-day-of-year", "start", path, 2024, 1).filePath).toBe(
			"2024/12/W01/2024-W01.md",
		);
		expect(weekly("gregorian-first-day-of-year", "end", path, 2024, 1).filePath).toBe(
			"2024/01/W01/2024-W01.md",
		);
	});

	it("allows the final full Jalali week to use the next year's month without changing its week year", () => {
		const calculator = getWeekStartCalculator("jalali-first-week-start");
		expect(calculator.getStartOfWeek(1405, 53)).toMatchObject({ jy: 1405, jm: 12 });
		expect(calculator.getEndOfWeek(1405, 53)).toMatchObject({ jy: 1406, jm: 1 });

		const path = "jYYYY/jMM/[W]ww";
		expect(weekly("jalali-first-week-start", "start", path, 1405, 53).filePath).toBe(
			"1405/12/W53/1405-W53.md",
		);
		expect(weekly("jalali-first-week-start", "end", path, 1405, 53).filePath).toBe(
			"1405/01/W53/1405-W53.md",
		);
	});

	it("keeps the selected calendar's week year while deriving the other calendar's date fields from the endpoint", () => {
		const jalaliPath = "jYYYY/YYYY/jMM";
		const jalaliEnd = weekly("jalali-first-day-of-year", "end", jalaliPath, 1404, 1);
		expect(jalaliEnd.filePath).toMatch(/^1404\/2025\/01\/1404-W1\.md$/);

		const gregorianPath = "YYYY/jYYYY/MM";
		const gregorianEnd = weekly("gregorian-first-day-of-year", "end", gregorianPath, 2024, 1);
		expect(gregorianEnd.filePath).toMatch(/^2024\/1402\/01\/2024-W1\.md$/);
	});
});

