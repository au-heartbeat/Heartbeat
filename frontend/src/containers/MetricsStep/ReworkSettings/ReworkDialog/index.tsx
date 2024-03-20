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
import { REWORK_DIALOG_NOTE, REWORK_STEPS, REWORK_STEPS_NAME } from '@src/constants/resources';
import ReworkSelectedWaitingForTest from '@src/assets/ReworkSelectedWaitingForTest.png';
import ReworkSelectedInDev from '@src/assets/ReworkSelectedInDev.png';
import StepOfExcludeJira from '@src/assets/StepOfExcludeJira.png';
import StepOfReworkJira from '@src/assets/StepOfReworkJira.png';
import CloseIcon from '@mui/icons-material/Close';
import React, { Suspense, useState } from 'react';
import { Dialog } from '@mui/material';

export const ReworkDialog = () => {
  const [activeStep, setActiveStep] = useState(REWORK_STEPS.REWORK_TO_WHICH_STATE);

  const renderContent = (selectedImg: string, jiraImg: string, explanationText: string, noteText: string) => {
    return (
      <StyledStepOfReword>
        <img src={selectedImg} alt='selected' />
        <img src={jiraImg} alt='jira' />
        <StyledNote>
          <StyledNoteTitle>Explanation: </StyledNoteTitle>
          <StyledNoteText>{explanationText}</StyledNoteText>
        </StyledNote>
        <StyledNote>
          <StyledNoteTitle>Note: </StyledNoteTitle>
          <StyledNoteText>{noteText}</StyledNoteText>
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
              {activeStep === REWORK_STEPS.REWORK_TO_WHICH_STATE &&
                renderContent(
                  ReworkSelectedInDev,
                  StepOfReworkJira,
                  REWORK_DIALOG_NOTE.REWORK_EXPLANATION,
                  REWORK_DIALOG_NOTE.REWORK_NOTE,
                )}
              {activeStep === REWORK_STEPS.EXCLUDE_WHICH_STATES &&
                renderContent(
                  ReworkSelectedWaitingForTest,
                  StepOfExcludeJira,
                  REWORK_DIALOG_NOTE.EXCLUDE_EXPLANATION,
                  REWORK_DIALOG_NOTE.EXCLUDE_NOTE,
                )}
            </Suspense>
          </StyledReworkStepper>
        </StyledDialogContent>
      </StyledDialogContainer>
    </Dialog>
  );
};
