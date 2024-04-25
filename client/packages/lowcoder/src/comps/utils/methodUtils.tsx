import { MethodConfig } from "comps/controls/actionSelector/executeCompTypes";
import { trans } from "i18n";

export const focusMethod: MethodConfig<"focus"> = {
  name: "focus",
  description: trans("method.focus"),
  params: [],
};

export const focusWithOptions: MethodConfig<"focus"> = {
  name: "focus",
  description: trans("method.focus"),
  params: [
    {
      name: "options",
      type: "JSON",
      description: trans("method.focusOptions"),
    },
  ],
};

export const blurMethod: MethodConfig<"blur"> = {
  name: "blur",
  description: trans("method.blur"),
  params: [],
};

export const clickMethod: MethodConfig<"click"> = {
  name: "click",
  description: trans("method.click"),
  params: [],
};

export const selectMethod: MethodConfig<"select"> = {
  name: "select",
  description: trans("method.select"),
  params: [],
};

export const setSelectionRangeMethod: MethodConfig<"setSelectionRange"> = {
  name: "setSelectionRange",
  description: trans("method.setSelectionRange"),
  params: [
    {
      name: "start",
      type: "number",
      description: trans("method.selectionStart"),
    },
    { name: "end", type: "number", description: trans("method.selectionEnd") },
  ],
};

export const setRangeTextMethod: MethodConfig<"setRangeText"> = {
  name: "setRangeText",
  description: trans("method.setRangeText"),
  params: [
    {
      name: "replacement",
      type: "string",
      description: trans("method.replacement"),
    },
    {
      name: "start",
      type: "number",
      description: trans("method.replaceStart"),
    },
    { name: "end", type: "number", description: trans("method.replaceEnd") },
  ],
};

export const setVisibility: MethodConfig<"setVisibility"> = {
  name: "setVisibility",
  description: trans("method.setVisibility"),
  params: [
    { name: "value", type: "boolean", description: trans("method.value") },
  ],
};
export const setDisabled: MethodConfig<"setDisabledState"> = {
  name: "setDisabledState",
  description: "Disable", // text needs to be changed
  params: [],
};


