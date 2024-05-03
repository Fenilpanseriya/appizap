import React from "react";
import _ from "lodash";

export const TableRowContext = React.createContext<{
  hover: boolean;
  selected: boolean;
}>({ hover: true, selected: false });

export const TableCellContext = React.createContext<{
  isEditing: boolean;
  setIsEditing: (e: boolean) => void;
}>({ isEditing: false, setIsEditing: _.noop });
