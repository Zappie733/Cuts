import { Option } from "./DropdownPickerTypes";

export interface MultiSelectDropdownPickerProps {
  options: Option[];
  selectedValues: string[]; // For multiple selected values
  onValuesChange: (values: string[]) => void; // Callback for multiple values
  placeHolder: string;
  iconName?: string;
  iconSource?:
    | "MaterialCommunityIcons"
    | "Octicons"
    | "Feather"
    | "Fontisto"
    | "EvilIcons";
  isInput: boolean;
  context?: string;
}
