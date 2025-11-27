import { CardProps } from ".";
import type { StateType } from "./state";
import type { LogicType } from "./logic";
import type { HelperType } from "./helper";

export const CardView = (state:StateType, logic:LogicType, props:CardProps, helper?: HelperType) => {
  return (
    <div>
      <p>{state.value}</p>
      <button onClick={logic.increment}>Increment</button>
    </div>
  );
};