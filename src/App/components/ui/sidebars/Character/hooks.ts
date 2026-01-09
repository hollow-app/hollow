import { createSignal, onMount, onCleanup, Accessor, Setter } from "solid-js";
import { hollow } from "hollow";
import { manager } from "@managers/index";
import { Character } from "@type/Character";

export interface CharacterProps { }

export interface CharacterState {
    character: Accessor<Character | null>;
    setCharacter: Setter<Character | null>;
}

export interface CharacterActions {
    import_image: (key: string) => Promise<void>;
}

export interface CharacterHook {
    state: CharacterState;
    actions: CharacterActions;
}

export const useCharacter = (): CharacterHook => {
    const [character, setCharacter] = createSignal<Character | null>(null);

    onMount(() => {
        const unsub = manager.character.subscribe(
            (v) => {
                setCharacter({ ...v });
            },
            { now: true },
        );
        onCleanup(() => {
            unsub();
        });
    });

    const import_image = async (key: string) => {
        hollow.events.emit("show-vault", {
            onSelect: (image: string) => {
                setCharacter((prev) => (prev ? { ...prev, [key]: image } : null));
                manager.character.set = { [key]: image };
            },
        });
    };

    return {
        state: {
            character,
            setCharacter,
        },
        actions: {
            import_image,
        },
    };
};
