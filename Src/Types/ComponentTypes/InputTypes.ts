export interface IInputProps {
  context: string;
  placeholder: string;
  isHidden?: boolean; //secureTextEntry property of TextInput
  setHidden?: (value: boolean) => void;
  value: string;
  updateValue: (text: string) => void;
  iconName?: string;
  iconSource?:
    | "MaterialCommunityIcons"
    | "Octicons"
    | "Feather"
    | "Fontisto"
    | "EvilIcons";
  isEditable?: boolean;
  setEditable?: (value: boolean) => void;
  isDisabled?: boolean;
}
