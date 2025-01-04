export interface PressableOptionsProps {
  onPress: () => void;
  iconName: string;
  iconSource:
    | "MaterialIcons"
    | "MaterialCommunityIcons"
    | "Octicons"
    | "Feather"
    | "Fontisto"
    | "EvilIcons"
    | "Entypo"
    | "Ionicons"
    | "FontAwesome5";
  iconSize: number;
  text: string;
  fontSize: number;
}
