import { DEFAULT_SETTING } from "src/constants";
import type { TSetting, TWeekCalculationMode } from "src/types";
import { dashToJWeekDash, dateToJWeekDash, jalaliDashToDate } from "src/utils/dashUtils";
import {
	getWeekStartCalculator,
	jalaliToDate,
	jalaliToGregorian,
	jalaliToStartWeek,
} from "src/utils/dateUtils";
import { toDayFormat, toWeekFormat } from "src/utils/formatters";

const issue94Settings = {
	...DEFAULT_SETTING,
	language: "fa",
	dateFormat: "jalali",
	dailyNoteFormat: "jYYYY-jMM-jDD",
	weekCalculation: "jalali-first-week-start",
} as const satisfies Partial<TSetting>;

function resolveWeekPlaceholders(
	currentDate: Date,
	dailyNoteBasename: string,
	settings: Pick<TSetting, "dateFormat" | "weekCalculation"> = issue94Settings,
) {
	const mode = settings.weekCalculation;
	return {
		currentWeek: dateToJWeekDash(currentDate, undefined, { mode }),
		noteWeek: dashToJWeekDash(dailyNoteBasename, settings.dateFormat, { mode }),
	};
}

function referenceJalaliFirstWeekStartId(jy: number, jm: number, jd: number): string {
	const date = jalaliToDate(jy, jm, jd);
	const week1 = jalaliToStartWeek(jy, 1, "sat");
	const week1Start = jalaliToDate(week1.jy, week1.jm, week1.jd);
	const dayMs = 1000 * 60 * 60 * 24;
	const diff = Math.round((date.getTime() - week1Start.getTime()) / dayMs);

	if (diff >= 0) {
		return toWeekFormat(jy, Math.floor(diff / 7) + 1);
	}

	const previousYear = jy - 1;
	const previousWeek1 = jalaliToStartWeek(previousYear, 1, "sat");
	const previousStart = jalaliToDate(previousWeek1.jy, previousWeek1.jm, previousWeek1.jd);
	const previousDiff = Math.round((date.getTime() - previousStart.getTime()) / dayMs);
	return toWeekFormat(previousYear, Math.floor(previousDiff / 7) + 1);
}

function jalaliDash(jy: number, jm: number, jd: number): string {
	return toDayFormat(jy, jm, jd);
}

describe("Issue #94: {{هفته جاری}} vs {{هفته یادداشت}}", () => {
	it("returns the same week id for today and today's daily note (jalali-first-week-start)", () => {
		const jy = 1405;
		const jm = 7;
		const jd = 25;
		const currentDate = jalaliToDate(jy, jm, jd);
		const noteName = jalaliDash(jy, jm, jd);
		const expected = referenceJalaliFirstWeekStartId(jy, jm, jd);

		const { currentWeek, noteWeek } = resolveWeekPlaceholders(currentDate, noteName);

		expect(expected).toBe("1405-W31");
		expect(currentWeek).toBe(expected);
		expect(noteWeek).toBe(expected);
		expect(currentWeek).toBe(noteWeek);
	});

	it("uses current date for {{هفته جاری}} and note date for {{هفته یادداشت}} when they differ", () => {
		const currentDate = jalaliToDate(1405, 7, 25); // 1405-W31
		const noteName = jalaliDash(1405, 7, 24); // previous day → 1405-W30

		const { currentWeek, noteWeek } = resolveWeekPlaceholders(currentDate, noteName);

		expect(currentWeek).toBe(referenceJalaliFirstWeekStartId(1405, 7, 25));
		expect(noteWeek).toBe(referenceJalaliFirstWeekStartId(1405, 7, 24));
		expect(currentWeek).not.toBe(noteWeek);
	});

	it.each([
		"jalali-first-week-start",
		"jalali-first-day-of-year",
		"gregorian-first-week-start",
		"gregorian-first-day-of-year",
	] as const satisfies readonly TWeekCalculationMode[])(
		"keeps current/note week ids equal for the same calendar day in mode %s",
		(mode) => {
			const jy = 1405;
			const jm = 7;
			const jd = 25;
			const currentDate = jalaliToDate(jy, jm, jd);
			const noteName = jalaliDash(jy, jm, jd);
			const calculator = getWeekStartCalculator(mode);
			const { jy: weekYear, weekNumber } = calculator.getWeekNumber(currentDate, "sat");
			const expected = toWeekFormat(weekYear, weekNumber);

			const { currentWeek, noteWeek } = resolveWeekPlaceholders(currentDate, noteName, {
				dateFormat: "jalali",
				weekCalculation: mode,
			});

			expect(currentWeek).toBe(expected);
			expect(noteWeek).toBe(expected);
		},
	);
});

describe("Week boundary identifiers (jalali-first-week-start)", () => {
	it.each([
		[1405, 7, 24, "1405-W30"],
		[1405, 7, 25, "1405-W31"],
		[1405, 7, 26, "1405-W31"],
		[1405, 8, 1, "1405-W31"],
		[1405, 8, 2, "1405-W32"],
	] as const)("%i-%i-%i resolves to %s via both placeholder paths", (jy, jm, jd, expected) => {
		const date = jalaliToDate(jy, jm, jd);
		const dash = jalaliDash(jy, jm, jd);
		const { currentWeek, noteWeek } = resolveWeekPlaceholders(date, dash);

		expect(referenceJalaliFirstWeekStartId(jy, jm, jd)).toBe(expected);
		expect(currentWeek).toBe(expected);
		expect(noteWeek).toBe(expected);
	});

	it("assigns the same identifier to every day inside a week and a new one after the boundary", () => {
		const weekDays = [
			[1405, 7, 25],
			[1405, 7, 26],
			[1405, 7, 27],
			[1405, 7, 28],
			[1405, 7, 29],
			[1405, 7, 30],
			[1405, 8, 1],
		] as const;

		const ids = weekDays.map(([jy, jm, jd]) =>
			dashToJWeekDash(jalaliDash(jy, jm, jd), "jalali", {
				mode: "jalali-first-week-start",
			}),
		);

		expect(new Set(ids).size).toBe(1);
		expect(ids[0]).toBe("1405-W31");
		expect(
			dashToJWeekDash(jalaliDash(1405, 8, 2), "jalali", { mode: "jalali-first-week-start" }),
		).toBe("1405-W32");
	});
});

describe("Jalali year boundary (jalali-first-week-start)", () => {
	it.each([
		[1403, 12, 30, "1403-W52"],
		[1404, 1, 1, "1403-W52"],
		[1404, 1, 2, "1404-W1"],
		[1404, 1, 8, "1404-W1"],
		[1404, 1, 9, "1404-W2"],
		[1404, 12, 29, "1404-W52"],
		[1405, 1, 1, "1405-W1"],
		[1405, 1, 7, "1405-W1"],
	] as const)("%i-%i-%i → %s", (jy, jm, jd, expected) => {
		expect(referenceJalaliFirstWeekStartId(jy, jm, jd)).toBe(expected);

		const date = jalaliToDate(jy, jm, jd);
		const dash = jalaliDash(jy, jm, jd);
		const { currentWeek, noteWeek } = resolveWeekPlaceholders(date, dash);

		expect(currentWeek).toBe(expected);
		expect(noteWeek).toBe(expected);
	});
});

describe("jalaliDashToDate normalization", () => {
	it("returns the same UTC-noon instant as jalaliToDate (not local midnight)", () => {
		const jy = 1405;
		const jm = 7;
		const jd = 25;
		const fromDash = jalaliDashToDate(jalaliDash(jy, jm, jd));
		const fromParts = jalaliToDate(jy, jm, jd);

		expect(fromDash).not.toBeNull();
		expect(fromDash?.toISOString()).toBe(fromParts.toISOString());
		expect(fromDash?.toISOString().endsWith("T12:00:00.000Z")).toBe(true);

		const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd);
		const localMidnight = new Date(gy, gm - 1, gd);
		expect(localMidnight.getTime()).not.toBe(fromParts.getTime());
	});

	it("round-trips Jalali day components through Gregorian conversion", () => {
		const samples = [
			[1403, 1, 1],
			[1403, 12, 30],
			[1404, 12, 29],
			[1405, 7, 25],
		] as const;

		for (const [jy, jm, jd] of samples) {
			const date = jalaliDashToDate(jalaliDash(jy, jm, jd));
			expect(date).not.toBeNull();
			const back = jalaliToGregorian(jy, jm, jd);
			expect(date?.toISOString()).toBe(jalaliToDate(jy, jm, jd).toISOString());
			expect(back.gy).toBeGreaterThan(2000);
		}
	});
});
