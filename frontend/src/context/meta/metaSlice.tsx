import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@src/store';

import omit from 'lodash/omit';
import set from 'lodash/set';

export interface FormFieldWithMeta {
  value: string;
  error?: boolean;
  needVerify?: boolean;
  errorDetail?: number | string;
}

interface FormMetaMetricsPipeline {
  branches: FormFieldWithMeta[];
}

export interface MetaState {
  version: string;
  form: {
    metrics: {
      pipelines: Record<string, FormMetaMetricsPipeline>;
    };
  };
}

const initialFormMetaState = {
  metrics: {
    pipelines: {},
  },
};

const initialState: MetaState = {
  version: '',
  form: initialFormMetaState,
};

export const metaSlice = createSlice({
  name: 'meta',
  initialState,
  reducers: {
    saveVersion: (state, action: PayloadAction<string>) => {
      state.version = action.payload;
    },
    //singleSection/index && Header.tsx
    resetFormMeta: (state) => {
      state.form = initialFormMetaState;
    },
    //BranchSection/index
    updateFormMeta: (state, action: PayloadAction<{ path: string; data: object | string | number }>) => {
      const { path, data } = action.payload;
      set(state, `form.${path}`, data);
    },
    //BranchSection/index
    initMetricsPipelineFormMeta: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const branchesFormData = state.form.metrics.pipelines[id];

      if (!branchesFormData)
        state.form.metrics.pipelines[id] = {
          branches: [],
        };
    },
    //BranchSection
    updateMetricsPipelineBranchFormMeta: (state, action: PayloadAction<{ id: number; data: FormFieldWithMeta }>) => {
      const { id, data } = action.payload;
      const branchesFormData = state.form.metrics.pipelines[id].branches;
      const index = branchesFormData.findIndex((item) => item.value === data.value);

      if (index > -1) {
        state.form.metrics.pipelines[id].branches[index] = data;
      } else {
        state.form.metrics.pipelines[id].branches.push(data);
      }
    },
    //DeploymentFrequencySettings/index
    deleteMetricsPipelineFormMeta: (state, action: PayloadAction<number>) => {
      const deleteId = action.payload;
      const formData = state.form.metrics.pipelines;
      state.form.metrics.pipelines = omit(formData, deleteId);
    },
  },
});

export const {
  saveVersion,
  resetFormMeta,
  updateFormMeta,
  initMetricsPipelineFormMeta,
  deleteMetricsPipelineFormMeta,
  updateMetricsPipelineBranchFormMeta,
} = metaSlice.actions;

export const getVersion = (state: RootState) => state.meta.version;

export const getFormMeta = (state: RootState) => state.meta.form;

export default metaSlice.reducer;
