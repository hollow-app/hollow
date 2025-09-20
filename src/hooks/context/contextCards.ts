import { HandType } from "@type/HandType";
import { Opthand } from "@type/Opthand";
import { Accessor, createContext, Setter } from "solid-js";

// type Stack = {
//     ;
//     setCards: Setter<HandType[]>;
// };
// TODO is this still needed? if used by less then 2 then no.
export const CardsContext = createContext<Accessor<Opthand[]>>(null);
