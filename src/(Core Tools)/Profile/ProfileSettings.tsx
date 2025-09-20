import { importImage } from "@managers/manipulation/images";
import { DataBase } from "hollow-api";
import { ImageIcon } from "lucide-solid";
import { Accessor, createSignal, Setter } from "solid-js";
import { untrack } from "solid-js/web";

type ProfileSettingsProps = {
        card: string;
        db: DataBase;
        name: Accessor<string>;
        setName: Setter<string>;
        bio: Accessor<string>;
        setBio: Setter<string>;
        img: Accessor<string>;
        setImg: Setter<string>;
        setSettingsVisible: Setter<boolean>;
};
export default function ProfileSettings({
        card,
        db,
        name,
        setName,
        bio,
        setBio,
        img,
        setImg,
        setSettingsVisible,
}: ProfileSettingsProps) {
        const innerName = untrack(() => name());
        const innerBio = untrack(() => bio());
        const innerImg = untrack(() => img());

        const importImg = async () => {
                const image = await importImage();
                if (typeof image === "string") {
                        setImg(image);
                }
        };

        const onSave = () => {
                db.putData(card, { name: name(), bio: bio(), img: img() });
                setSettingsVisible(false);
        };

        const onCancel = () => {
                setName(innerName);
                setBio(innerBio);
                setImg(innerImg);

                setSettingsVisible(false);
        };

        return (
                <div class="bg-secondary-05 border-secondary-15 pointer-events-auto h-fit w-fit rounded-xl border-1 p-6 shadow-[0_0_35px_35px_rgba(0,0,0,0.25)] dark:shadow-[0_0_185px_285px_rgba(0,0,0,0.6)]">
                        <div class="flex flex-col gap-4">
                                <button
                                        class="button-secondary m-auto flex w-full justify-center gap-3"
                                        onclick={importImg}
                                >
                                        <ImageIcon />
                                </button>
                                <input
                                        class="input"
                                        placeholder="Name"
                                        value={name()}
                                        onchange={(e) =>
                                                setName(e.currentTarget.value)
                                        }
                                />
                                <textarea
                                        class="input resize-none"
                                        placeholder="Bio"
                                        value={bio()}
                                        onchange={(e) =>
                                                setBio(e.currentTarget.value)
                                        }
                                />
                        </div>
                        <div class="mt-6 flex justify-around gap-6">
                                <button class="button-primary" onclick={onSave}>
                                        Save
                                </button>
                                <button
                                        class="button-secondary"
                                        onclick={onCancel}
                                >
                                        Cancel
                                </button>
                        </div>
                </div>
        );
}
