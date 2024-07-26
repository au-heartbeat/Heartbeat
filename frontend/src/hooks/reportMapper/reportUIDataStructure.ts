import { ReactNode } from 'react';

export interface ReportDataWithTwoColumns {
  id: number;
  name: string | ReactNode;
  valueList: ValueWithUnits[];
}

export interface ValueWithUnits {
  value: number | string;
  unit?: string;
}

export interface ReportDataWithThreeColumns {
  id: number;
  name: string;
  totalCount?: number;
  valueList: {
    name: string;
    value: string;
  }[];
}
