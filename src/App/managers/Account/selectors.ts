import { RootState } from "@app/store/types";

export const selectCharacter = (state: RootState) => state.account;
export const selectLevel = (state: RootState) => state.account.character.level;
export const selectXp = (state: RootState) => state.account.character.level.xp;
export const selectAchievements = (state: RootState) =>
	state.account.character.achievements;
// export const selectMeta = (state: RootState) => state.account.meta;
