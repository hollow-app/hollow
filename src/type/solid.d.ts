import { JSX } from "solid-js";

declare module "solid-js" {
        namespace JSX {
                interface Directives {
                        sortable: any; // or use a more specific type if you know what type it returns
                }
        }
}
