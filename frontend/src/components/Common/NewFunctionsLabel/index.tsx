import {
  NewFunctionsContent,
  NewLabel,
  NewLabelWithCustomizeMarginAndHeight,
} from '@src/components/Common/NewFunctionsLabel/style';
import { getVersion } from '@src/context/meta/metaSlice';
import { NewLabelType } from '@src/constants/commons';
import { useAppSelector } from '@src/hooks';
import React, { ReactNode } from 'react';
import semver from 'semver';

interface NewFunctionsLabelProps {
  children: ReactNode;
  initVersion: string;
  newLabelType?: NewLabelType;
}

export default function ({ children, newLabelType = NewLabelType.General, initVersion }: NewFunctionsLabelProps) {
  const version = useAppSelector(getVersion);
  const showNewLabel = () => {
    if (!semver.gt(version, initVersion)) {
      if (newLabelType === NewLabelType.CustomizeMarginAndHeight) {
        return (
          <NewLabelWithCustomizeMarginAndHeight aria-label={'new label'}>NEW</NewLabelWithCustomizeMarginAndHeight>
        );
      } else {
        return <NewLabel aria-label={'new label'}>NEW</NewLabel>;
      }
    }
  };
  return (
    <NewFunctionsContent>
      {children}
      {showNewLabel()}
    </NewFunctionsContent>
  );
}
