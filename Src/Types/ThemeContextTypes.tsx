export interface IColorProps {
  mode: "dark" | "light";
}

export interface IThemeContext {
  theme: IColorProps;
  setTheme: (theme: IColorProps) => void;
  changeTheme: () => void;
}
