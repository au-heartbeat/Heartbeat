import { FIVE_HUNDRED } from '@src/constants/commons';
import { createTheme } from '@mui/material/styles';
import { indigo } from '@mui/material/colors';
import '@fontsource/roboto';

declare module '@mui/material/styles' {
  //eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends ThemeOptions {}

  // allow configuration using `createTheme`
  interface ThemeOptions {
    main: {
      chartTrend: {
        betterColor: string;
        worseColor: string;
      };
      doraChart: {
        barColorA: string;
        barColorB: string;
        barColorC: string;
        deploymentFrequencyChartColor: string;
        devChangeFailureRateColor: string;
        devMeanTimeToRecoveryColor: string;
        gridColor: string;
      };
      boardChart: {
        barColorA: string;
        barColorB: string;
        barColorC: string;
        barColorD: string;
        barColorE: string;
        barColorF: string;
        lineColorA: string;
        lineColorB: string;
        gridColor: string;
      };
      chart: {
        loadingColor: string;
      };
      backgroundColor: string;
      color: string;
      secondColor: string;
      boardColor: string;
      fontSize: string;
      boxShadow: string;
      cardShadow: string;
      cardBorder: string;
      font: {
        primary: string;
        secondary: string;
      };
      button: {
        borderLine: string;
        disabled: {
          backgroundColor: string;
          color: string;
        };
      };
      loading: {
        backgroundColor: string;
      };
      note: string;
      errorMessage: {
        color: string;
      };
      alert: {
        title: {
          color: string;
        };
        error: {
          iconColor: string;
          backgroundColor: string;
          borderColor: string;
        };
        success: {
          iconColor: string;
          backgroundColor: string;
          borderColor: string;
        };
        warning: {
          iconColor: string;
          backgroundColor: string;
          borderColor: string;
        };
        info: {
          iconColor: string;
          backgroundColor: string;
          borderColor: string;
        };
      };
      downloadListLabel: {
        backgroundColor: string;
      };
      contentMinWidth: string;
      contentMaxWidth: string;
    };
  }

  interface Components {
    errorMessage: {
      color: string;
      paddingBottom: string;
    };
    waringMessage: {
      color: string;
    };
    tip: {
      color: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      main: indigo[FIVE_HUNDRED],
    },
    secondary: {
      main: indigo[FIVE_HUNDRED],
      dark: '#f7f7f7',
      contrastText: '#000000A6',
    },
    info: {
      main: '#3498db',
      light: '#b9c4cc',
    },
  },
  main: {
    chartTrend: {
      betterColor: '#02C4A8',
      worseColor: '#E82107',
    },
    doraChart: {
      barColorA: '#003D4F',
      barColorB: '#47A1AD',
      barColorC: '#F2617A',
      deploymentFrequencyChartColor: '#F2617A',
      devChangeFailureRateColor: '#003D4F',
      devMeanTimeToRecoveryColor: '#634F7D',
      gridColor: '#D9D9D9',
    },
    boardChart: {
      barColorA: '#163C4D',
      barColorB: '#5F9FAB',
      barColorC: '#E16A7C',
      barColorD: '#769D7B',
      barColorE: '#C28830',
      barColorF: '#5078e6',
      lineColorA: '#163C4D',
      lineColorB: '#E16A7C',
      gridColor: '#D9D9D9',
    },
    chart: {
      loadingColor: 'rgba(255, 255, 255, 0.8)',
    },
    backgroundColor: indigo[FIVE_HUNDRED],
    color: '#fff',
    secondColor: 'black',
    boardColor: '#efefef',
    fontSize: '1rem',
    boxShadow:
      '0 0.2rem 0.1rem -0.1rem rgb(0 0 0 / 20%), 0 0.1rem 0.1rem 0 rgb(0 0 0 / 14%), 0 0.1rem 0.3rem 0 rgb(0 0 0 / 12%)',
    cardShadow: '0 0.013rem 1rem 0 rgba(0, 0, 0, 0.08);',
    cardBorder: '0.07rem solid rgba(0, 0, 0, 0.10);',
    font: {
      primary: 'Roboto',
      secondary: 'sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Arial',
    },
    button: {
      borderLine: '#D9D9D9',
      disabled: {
        backgroundColor: '#E0E0E0',
        color: '#929292',
      },
    },
    note: '#535353',
    errorMessage: {
      color: '#A2A2A2',
    },
    loading: {
      backgroundColor: 'rgba(199,199,199,0.43)',
    },
    alert: {
      title: {
        color: '#000000D9',
      },
      error: {
        iconColor: '#D74257',
        backgroundColor: '#FFE7EA',
        borderColor: '#F3B6BE',
      },
      success: {
        iconColor: '#5E9E66',
        backgroundColor: '#EFFFF1',
        borderColor: '#CFE2D1',
      },
      warning: {
        iconColor: '#D78D20',
        backgroundColor: '#FFF4E3',
        borderColor: '#F3D5A9',
      },
      info: {
        iconColor: '#4050B5',
        backgroundColor: '#E9ECFF',
        borderColor: '#939DDA',
      },
    },
    downloadListLabel: {
      backgroundColor: '#4350AF1A',
    },
    contentMinWidth: '77.5rem', // 1240/16
    contentMaxWidth: '84rem', // 1344/16
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 390,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
    keys: ['xs', 'sm', 'md', 'lg', 'xl'],
  },
  components: {
    errorMessage: {
      color: '#ff0000',
      paddingBottom: '1rem',
    },
    waringMessage: {
      color: '#cd5e32',
    },
    tip: {
      color: '#ED6D03CC',
    },
  },
});
