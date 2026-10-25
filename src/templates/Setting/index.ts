import type { App, SettingDefinitionItem } from "obsidian";
import { PluginSettingTab, Setting } from "obsidian";
import SocialLinks from "src/components/SocialLinks";
import { getDirection, onLocalChange, t } from "src/languages";
import type PersianCalendarPlugin from "src/main";
import { getEventSettings } from "./sections/EventSection";
import { getExtraCalendarSettings } from "./sections/ExtraCalendarSection";
import { getGeneralSettings } from "./sections/GeneralSection";
import { getHolidaySettings } from "./sections/HolidaySection";
import { getNameSettings } from "./sections/NameSection";
import { getPathSettings } from "./sections/PathSection";
import { tokenize, defaultTokenRegistry } from "src/utils/dateEngine";
import { getTemplateSettings } from "./sections/TemplateSection";
import { createSettingChangeHandler, getNestedValue } from "./settingEffects";

export default class CalendarSettingTab extends PluginSettingTab {
	readonly plugin: PersianCalendarPlugin;

	private readonly applySettingChange: (key: string, value: unknown) => Promise<void>;

	constructor(app: App, plugin: PersianCalendarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.applySettingChange = createSettingChangeHandler(plugin, () => this.update());
		this.plugin.register(onLocalChange(() => this.update()));
	}

	getControlValue(key: string): unknown {
		return getNestedValue(this.plugin.setting, key);
	}

	private renderBanner(setting: Setting): void {
		setting.settingEl.addClass("persian-calendar-banner");

		const contentEl = setting.settingEl.createDiv({
			cls: "persian-calendar-banner-content",
		});

		contentEl.createDiv({
			cls: "persian-calendar-banner-title",
			text: t("setting.banner.title"),
		});

		SocialLinks(contentEl);
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		await this.applySettingChange(key, value);
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: "",
				searchable: false,
				render: (setting: Setting) => {
					setting.settingEl.empty();

					this.containerEl.addClass("persian-calendar");
					this.containerEl.style.direction = getDirection();

					this.renderBanner(new Setting(setting.settingEl));
				},
			},

			...getGeneralSettings(),
			...getPathSettings(),
			{
				name: t("setting.paths.weekly.monthBoundary.name"),
				desc: t("setting.paths.weekly.monthBoundary.desc"),
				searchable: false,
				render: (setting: Setting) => {
					let visible = false;
					try {
						const tokens = tokenize(this.plugin.setting.weeklyNotesPath, defaultTokenRegistry).filter((part) => part.type === "token").map((part) => part.token);
						const weekIndex = tokens.findIndex((token) => token.field === "week");
						visible = weekIndex > 0 && tokens.slice(0, weekIndex).some((token) => ["jm", "gm", "season", "quarter"].includes(token.field));
					} catch { visible = false; }
					setting.settingEl.style.display = visible ? "" : "none";
					if (!visible) return;
					setting.setName(t("setting.paths.weekly.monthBoundary.name"));
					setting.setDesc(t("setting.paths.weekly.monthBoundary.desc"));
					setting.addDropdown((dropdown) => dropdown.addOption("start", t("setting.paths.weekly.monthBoundary.options.start")).addOption("end", t("setting.paths.weekly.monthBoundary.options.end")).setValue(this.plugin.setting.weeklyPathMonth).onChange((value) => void this.setControlValue("weeklyPathMonth", value)));
				},
			},
			...getNameSettings(),
			...getTemplateSettings(),
			...getExtraCalendarSettings(),
			...getHolidaySettings(),
			...getEventSettings(),
		];
	}
}
