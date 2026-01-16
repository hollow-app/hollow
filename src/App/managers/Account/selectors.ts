import { RootState } from "../../store/types";

export const selectCharacter = (state: RootState) => state.account;
export const selectLevel = (state: RootState) => state.account.level;
export const selectXp = (state: RootState) => state.account.xp;
export const selectAchievements = (state: RootState) =>
	state.account.achievements;
export const selectMeta = (state: RootState) => state.account.meta;
