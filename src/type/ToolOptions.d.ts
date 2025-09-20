import { BaseOption, TypedOptionMap } from "./OptionTypes";

type ToolOptionBase = {
        value: any;
        onChange: (v: any) => void;
};

export type ToolOption =
        | (ToolOptionBase &
                  {
                          [K in keyof TypedOptionMap]: BaseOption<
                                  K,
                                  TypedOptionMap[K]
                          >;
                  }[keyof TypedOptionMap])
        | { type: "custom"; render: () => JSX.Element };

export type ToolOptions = {
        tool: string;
        card: string;
        save: () => void;
        options: ToolOption[];
};
