import { MetricsSettingTitle } from '@src/components/Common/MetricsSettingTitle';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { ReworkHeaderWrapper, StyledLink } from './style';
import React from 'react';

const url = 'XXX';

function ReworkSettings() {
  return (
    <ReworkHeaderWrapper>
      <MetricsSettingTitle title='Rework times settings' />
      <StyledLink underline='none' href={url} target='_blank' rel='noopener'>
        <HelpOutlineOutlinedIcon fontSize='small' />
        How to setup
      </StyledLink>
    </ReworkHeaderWrapper>
  );
}

export default ReworkSettings;
