import { BoolCodeControl, jsonControl } from "comps/controls/codeControl";
import { check } from "util/convertUtils";
import {stepsNode} from './stepsConstants'

export function convertStepsData(data: any) {
  return data === "" ? [] : checkDataNodes(data) ?? [];
}

// Used to check if Values provided in JSON are correct or not
function checkDataNodes(value: any, key?: string): stepsNode[] | undefined {
  return check(value, ["array", "undefined"], key, (node, k) => {
    check(node, ["object"], k);
    check(node["name"], ["string"], "name");
    check(node["tooltip"], ["string", "undefined"], "tooltip");
    check(node["id"], ["number"], "id");
    check(node["widgets"], ["string", "undefined"], "widgets");
    return node;
  });
}