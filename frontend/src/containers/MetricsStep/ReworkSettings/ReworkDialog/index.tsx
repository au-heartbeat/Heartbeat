import {
  StyledDialogContent,
  StyledDialogContainer,
  StyledStepOfReword,
  StyledDialogTitle,
  StyledReworkStepper,
  StyledStepper,
  StyledStepLabel,
  StyledStep,
  StyledNote,
  StyledNoteTitle,
  StyledNoteText,
} from '@src/containers/MetricsStep/ReworkSettings/ReworkDialog/style';
import ReworkSelectedWaitingForTest from '@src/assets/ReworkSelectedWaitingForTest.png';
import { REWORK_STEPS, REWORK_STEPS_NAME } from '@src/constants/resources';
// import StpeOfExcludeJira from '@src/assets/StpeOfExcludeJira.png.png';
// import ReworkSelectedInDev from '@src/assets/ReworkSelectedInDev.png';
// import StepOfRework from '@src/assets/StepOfRework.png';
import StepOfReworkJira from '@src/assets/StepOfReworkJira.png';
import CloseIcon from '@mui/icons-material/Close';
import React, { Suspense, useState } from 'react';
import { Dialog } from '@mui/material';

export const ReworkDialog = () => {
  const [activeStep, setActiveStep] = useState(REWORK_STEPS.REWORK_TO_WHICH_STATE);

  const renderContent = () => {
    return (
      <StyledStepOfReword>
        <img src={ReworkSelectedWaitingForTest} alt='selected' />
        <img src={StepOfReworkJira} alt='jira' />
        <StyledNote>
          <StyledNoteTitle>Explanation: </StyledNoteTitle>
          <StyledNoteText>
            Rework to which state means going back to the selected state from any state after the selected state.
          </StyledNoteText>
        </StyledNote>
      </StyledStepOfReword>
    );
  };

  return (
    <Dialog open={true} maxWidth={'md'}>
      <StyledDialogContainer>
        <StyledDialogTitle>
          <p>How to setup? </p>
          <CloseIcon />
        </StyledDialogTitle>
        <StyledDialogContent>
          <StyledReworkStepper>
            <StyledStepper activeStep={activeStep}>
              {REWORK_STEPS_NAME.map((label) => (
                <StyledStep key={label}>
                  <StyledStepLabel>{label}</StyledStepLabel>
                </StyledStep>
              ))}
            </StyledStepper>
            <Suspense>
              {activeStep === REWORK_STEPS.REWORK_TO_WHICH_STATE && renderContent()}
              {activeStep === REWORK_STEPS.EXCLUDE_WHICH_STATES && renderContent()}
            </Suspense>
          </StyledReworkStepper>
        </StyledDialogContent>
      </StyledDialogContainer>
    </Dialog>
  );
};
