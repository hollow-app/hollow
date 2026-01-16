import { createSortable, useDragDropContext } from "@thisbeyond/solid-dnd";
import { createSignal, For, JSX } from "solid-js";

type SortablePrpos = {
        id: string;
        children: JSX.Element;
};
const Sortable = ({ id, children }: SortablePrpos) => {
        const sortable = createSortable(id);
        const [state] = useDragDropContext();
        return (
                <div
                        use:sortable
                        class="sortable w-full"
                        classList={{
                                "opacity-25": sortable.isActiveDraggable,
                                "transition-transform":
                                        !!state.active.draggable,
                        }}
                >
                        {children}
                </div>
        );
};

export default Sortable;
