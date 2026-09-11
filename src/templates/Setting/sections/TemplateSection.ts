import type { SettingDefinitionItem, TFile } from "obsidian";
import { t } from "src/languages";
import { NOTE_TYPES } from "../noteTypes";

export function getTemplateSettings(): SettingDefinitionItem[] {
	return [
		{
			type: "group",
			heading: t("setting.sections.templates"),
			items: NOTE_TYPES.map((noteType) => ({
				name: t(noteType.templateNameKey),
				desc: t(noteType.templateDescKey),
				control: {
					type: "file" as const,
					key: noteType.templateKey,
					filter: (file: TFile) => file.extension === "md",
				},
			})),
		},
	];
}
