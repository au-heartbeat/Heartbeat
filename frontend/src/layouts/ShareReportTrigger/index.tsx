import {
  ClickAwayContent,
  LinkIconWrapper,
  LinkLine,
  PopperContentWrapper,
  PopperNotes,
  PopperSubTitle,
  PopperTitle,
  ShareIconWrapper,
} from './style';
import {
  selectReportId,
  selectReportPageFailedTimeRangeInfos,
  selectStepNumber,
} from '@src/context/stepper/StepperSlice';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { STEP_NUMBER } from '@src/constants/commons';
import ShareIcon from '@mui/icons-material/Share';
import LinkIcon from '@mui/icons-material/Link';
import { useAppSelector } from '@src/hooks';
import Popper from '@mui/material/Popper';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { useState } from 'react';

const ShareReportTrigger = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const reportId = useAppSelector(selectReportId);
  const reportPageLoadingStatus = useAppSelector(selectReportPageFailedTimeRangeInfos);
  const stepNumber = useAppSelector(selectStepNumber);

  const shareReportLink = `${window.location.host}/reports/${reportId}`;
  const isReportLoadedSuccess = Object.values(reportPageLoadingStatus)
    .map(Object.values)
    .flat()
    .every((item) => item.isLoaded && !item.isLoadedWithError);
  const canShare = reportId && isReportLoadedSuccess;
  const showShareIcon = stepNumber === STEP_NUMBER.REPORT_PAGE;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (canShare) {
      setAnchorEl(anchorEl ? null : event.currentTarget);
    }
  };

  const handleCopy = () => {
    setShowAlert(true);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
    setShowAlert(false);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  return (
    <>
      {showShareIcon && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <ClickAwayContent>
            <ShareIconWrapper title='Share' onClick={handleClick} aria-label='Share Report' disabled={!canShare}>
              <ShareIcon />
            </ShareIconWrapper>
            <Popper id={id} open={open} anchorEl={anchorEl} placement='bottom-end'>
              <PopperContentWrapper aria-label='Share Report Popper'>
                <PopperTitle>Share Report</PopperTitle>
                <PopperSubTitle>Share content: report list page & report chart page</PopperSubTitle>
                <LinkLine>
                  <LinkIconWrapper>
                    <LinkIcon />
                  </LinkIconWrapper>
                  <CopyToClipboard text={shareReportLink} onCopy={handleCopy}>
                    <Link aria-label='Copy Link'>Copy Link</Link>
                  </CopyToClipboard>
                  {showAlert && <Alert severity='success'>Link copied to clipboard</Alert>}
                </LinkLine>
                <PopperNotes>NOTE: The link is valid for 24 hours. Please regenerate it after the timeout.</PopperNotes>
              </PopperContentWrapper>
            </Popper>
          </ClickAwayContent>
        </ClickAwayListener>
      )}
    </>
  );
};

export default ShareReportTrigger;
