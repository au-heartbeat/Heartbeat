import {
  LinkIconWrapper,
  LinkLine,
  PopperContentWrapper,
  PopperNotes,
  PopperSubTitle,
  PopperTitle,
  ShareIconWrapper,
} from './style';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ShareIcon from '@mui/icons-material/Share';
import LinkIcon from '@mui/icons-material/Link';
import Popper from '@mui/material/Popper';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import { useState } from 'react';

const ShareReportTrigger = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const shareReportLink = 'shareReportLink';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
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
      <ClickAwayListener onClickAway={handleClickAway}>
        <div>
          <ShareIconWrapper title='Share' onClick={handleClick} aria-label='Share Report'>
            <ShareIcon />
          </ShareIconWrapper>
          <Popper id={id} open={open} anchorEl={anchorEl} placement='bottom-end'>
            <PopperContentWrapper>
              <PopperTitle>Share Report</PopperTitle>
              <PopperSubTitle>Share content: report list page & report chart page</PopperSubTitle>
              <LinkLine>
                <LinkIconWrapper>
                  <LinkIcon />
                </LinkIconWrapper>
                <CopyToClipboard text={shareReportLink} onCopy={handleCopy}>
                  <Link>Copy Link</Link>
                </CopyToClipboard>
                {showAlert && <Alert severity='success'>Link copied to clipboard</Alert>}
              </LinkLine>
              <PopperNotes>NOTE: The link is valid for 24 hours. Please regenerate it after the timeout.</PopperNotes>
            </PopperContentWrapper>
          </Popper>
        </div>
      </ClickAwayListener>
    </>
  );
};

export default ShareReportTrigger;
