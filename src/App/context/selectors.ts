import { RootState } from "../store/types";

// export const selectCards = (state: RootState) => state.modu.cards;
export const selectTags = (state: RootState) => state.context.tags;
export const selectIsFocus = (state: RootState) => state.context.isFocus;
export const selectCanvasConfigs = (state: RootState) =>
	state.context.canvasConfigs;
export const selectIsLiveEditor = (state: RootState) =>
	!state.context.canvasConfigs.disableDrag;
