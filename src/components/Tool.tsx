import { HandType } from "@type/HandType";
import { InfoIcon } from "lucide-solid";
import Icon from "./Icon";

type ToolProps = {
        tool: () => Omit<HandType, "cards">;
};
export default function Tool({ tool }: ToolProps) {
        //

        const showToolInfo = () => {
                //
                window.hollowManager.emit("tool-info", tool());
        };
        return (
                <div class="box-border grid h-fit w-full grid-cols-[1fr_4fr] rounded-xl px-2 font-mono">
                        <div class="mr-2 flex flex-col items-center justify-center">
                                <Icon
                                        name={tool().icon}
                                        class="border-secondary-15 h-12 w-12 rounded-xl border-2 p-2 text-neutral-950 dark:text-neutral-50"
                                />
                                <button
                                        class="button-control my-1"
                                        onClick={showToolInfo}
                                >
                                        <InfoIcon />
                                </button>
                        </div>
                        <div class="flex flex-col">
                                <h2 class="text-sm font-bold text-neutral-950 dark:text-neutral-50">
                                        {tool().title}
                                </h2>
                                <h6 class="peer line-clamp-3 text-sm font-normal text-neutral-600">
                                        {tool().description}{" "}
                                </h6>
                        </div>
                </div>
        );
}
