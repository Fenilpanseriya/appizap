import { trans } from "i18n";

// Used to declare type of values expected in a JSON field
export type stepsNode = {
  name: string;
  tooltip?: string;
  id: number;
  widgets?: string;
};

// Used to show Tooltip over a field in properties
export const StepsDataTooltip = (
  <li>
    {trans("steps.Introduction")}:
    <br />
    1. name - {trans("steps.name")}
    <br />
    2. tooltip - {trans("steps.tooltip")}
    <br />
    3. id - {trans("steps.id")}
    <br />
    4. widgets - {trans("steps.widgets")}
    <br />
  </li>
);

// Used for default data in a Property
export const stepsDefaultData=[
  { name: 'step 1', tooltip: 'some tooltip', id: 0, widget: "w1" }, 
  { name: 'step 2', tooltip: 'some tooltip', id: 1, widget: "w2" }, 
  { name: 'step 3', tooltip: 'some tooltip', id: 2, widget: "w3" }, 
  { name: 'step 4', tooltip: 'some tooltip', id: 3, widget: "w4" }, 
  { name: 'step 5', tooltip: 'some tooltip', id: 4, widget: "w5" }
]