import { KitType } from "./KitType";

export type CardInfo = {
        name: string;
        emoji: string;
        isPlaced: boolean;
        isFavored: boolean;
        CreatedDate: string;
        kit: KitType;
};
