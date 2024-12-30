export interface ISearchBarProps {
  placeHolder: string;
  input: string;
  onSearch: (text: string) => void;
  onPress?: () => void;
}
