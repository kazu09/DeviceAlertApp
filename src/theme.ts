export type AppTheme = {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    primary: string;
    onPrimary: string;
    primarySoft: string;
    text: string;
    textMuted: string;
    border: string;
    track: string;
    success: string;
    successSoft: string;
    warning: string;
    warningSoft: string;
    danger: string;
    disabledColor: string;
  };
};

export function createTheme(isDark: boolean): AppTheme {
  if (isDark) {
    return {
      isDark,
      colors: {
        background: '#09121F',
        surface: '#111E2E',
        surfaceMuted: '#17263A',
        primary: '#7EA2FF',
        onPrimary: '#09121F',
        primarySoft: '#1D3158',
        text: '#F4F7FB',
        textMuted: '#93A4B8',
        border: '#23354A',
        track: '#26374B',
        success: '#54D6A2',
        successSoft: '#173D35',
        warning: '#FFC56A',
        warningSoft: '#45351D',
        danger: '#FF8585',
        disabledColor: '#CCCCCC',
      },
    };
  }

  return {
    isDark,
    colors: {
      background: '#F4F7FB',
      surface: '#FFFFFF',
      surfaceMuted: '#F7F9FC',
      primary: '#315FD6',
      onPrimary: '#FFFFFF',
      primarySoft: '#E8EEFF',
      text: '#13243A',
      textMuted: '#68788C',
      border: '#E4EAF1',
      track: '#E8EDF3',
      success: '#138A62',
      successSoft: '#E2F5EE',
      warning: '#C77B12',
      warningSoft: '#FFF1D8',
      danger: '#D94848',
      disabledColor: '#CCCCCC',
    },
  };
}
