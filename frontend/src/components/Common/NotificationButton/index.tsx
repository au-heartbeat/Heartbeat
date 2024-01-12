import { AlertTitleWrapper, AlertWrapper } from '@src/components/Common/NotificationButton/style';
import { useNotificationLayoutEffectInterface } from '@src/hooks/useNotificationLayoutEffect';
import { AlertColor, SvgIcon } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import React from 'react';
import { theme } from '@src/theme';

const getStyles = (type: AlertColor | undefined) => {
  switch (type) {
    case 'error':
      return {
        icon: CancelIcon,
        iconColor: theme.main.alert.error.iconColor,
        backgroundColor: theme.main.alert.error.backgroundColor,
      };
    case 'success':
      return {
        icon: CheckCircleIcon,
        iconColor: theme.main.alert.success.iconColor,
        backgroundColor: theme.main.alert.success.backgroundColor,
      };
    case 'warning':
      return {
        icon: InfoIcon,
        iconColor: theme.main.alert.warning.iconColor,
        backgroundColor: theme.main.alert.warning.backgroundColor,
      };
    case 'info':
    default:
      return {
        icon: InfoIcon,
        iconColor: theme.main.alert.info.iconColor,
        backgroundColor: theme.main.alert.info.backgroundColor,
      };
  }
};

export const Notification = ({ notificationProps, updateProps }: useNotificationLayoutEffectInterface) => {
  const handleNotificationClose = () => {
    updateProps({
      title: notificationProps.title,
      message: notificationProps.message,
      open: false,
      closeAutomatically: false,
    });
  };

  const styles = getStyles(notificationProps.type);

  return (
    <>
      {notificationProps.open && (
        <AlertWrapper
          onClose={handleNotificationClose}
          icon={<SvgIcon component={styles.icon} inheritViewBox />}
          backgroundcolor={styles.backgroundColor}
          iconcolor={styles.iconColor}
        >
          <AlertTitleWrapper>{notificationProps.title}</AlertTitleWrapper>
          {notificationProps.message}
        </AlertWrapper>
      )}
    </>
  );
};
