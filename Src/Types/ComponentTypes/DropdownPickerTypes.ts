export interface Option {
  label: string;
  value: string;
}

export interface DropdownPickerProps {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
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
