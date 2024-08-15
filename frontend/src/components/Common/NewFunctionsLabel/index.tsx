import { NewFunctionsContent, NewLabel } from '@src/components/Common/NewFunctionsLabel/style';
import { getVersion } from '@src/context/meta/metaSlice';
import { useAppSelector } from '@src/hooks';
import React, { ReactNode } from 'react';

interface NewFunctionsLabelProps {
  children: ReactNode;
  style?: object;
  createVersion: string;
}

export default function ({ children, style, createVersion }: NewFunctionsLabelProps) {
  const version = useAppSelector(getVersion);

  return (
    <NewFunctionsContent>
      {children}
      {version <= createVersion && (
        <NewLabel aria-label={'new label'} style={style}>
          NEW
        </NewLabel>
      )}
    </NewFunctionsContent>
  );
}
