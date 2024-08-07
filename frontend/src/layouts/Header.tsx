import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '@src/assets/Logo.svg';

import {
  IconContainer,
  LogoContainer,
  LogoImage,
  LogoTitle,
  LogoWarp,
  StyledHeaderInfo,
  StyledVersion,
} from '@src/layouts/style';
import { getVersion, resetFormMeta, saveVersion } from '@src/context/meta/metaSlice';
import { resetImportedData } from '@src/context/config/configSlice';
import { headerClient } from '@src/clients/header/HeaderClient';
import { resetStep } from '@src/context/stepper/StepperSlice';
import { useAppDispatch } from '@src/hooks/useAppDispatch';
import { PROJECT_NAME } from '@src/constants/commons';
import ShareReportTrigger from './ShareReportTrigger';
import HomeIcon from '@mui/icons-material/Home';
import { useAppSelector } from '@src/hooks';
import { useEffect } from 'react';
import { isEmpty } from 'lodash';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const version = useAppSelector(getVersion);

  const goHome = () => {
    dispatch(resetStep());
    dispatch(resetImportedData());
    dispatch(resetFormMeta());
    navigate('/');
  };

  const shouldShowHomeIcon = () => {
    return ['/metrics', '/error-page', '/report'].some((path) => location.pathname.includes(path));
  };

  useEffect(() => {
    if (isEmpty(version)) {
      headerClient.getVersion().then((res) => {
        dispatch(saveVersion(res));
      });
    }
  }, [dispatch, version]);

  return (
    <LogoWarp data-test-id={'Header'}>
      <StyledHeaderInfo>
        <LogoContainer onClick={goHome}>
          <LogoImage src={Logo} alt='logo' />
          <LogoTitle title={PROJECT_NAME}>{PROJECT_NAME}</LogoTitle>
        </LogoContainer>
        {version && <StyledVersion>v{version}</StyledVersion>}
      </StyledHeaderInfo>
      <IconContainer>
        <ShareReportTrigger />
        {shouldShowHomeIcon() && (
          // NOSONAR-NEXT-LINE
          <span title='Home' onClick={goHome} aria-label={'Home'} onKeyDown={goHome}>
            <HomeIcon />
          </span>
        )}
      </IconContainer>
    </LogoWarp>
  );
};
export default Header;
