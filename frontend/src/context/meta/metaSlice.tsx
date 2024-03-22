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
      isTokenAccessError: boolean;
    };
  };
}

const initialFormMetaState = {
  metrics: {
    pipelines: {},
    isTokenAccessError: false,
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
    resetFormMeta: (state) => {
      state.form = initialFormMetaState;
    },
    updateFormMeta: (state, action: PayloadAction<{ path: string; data: object | string | number }>) => {
      const { path, data } = action.payload;

      set(state, `form.${path}`, data);
    },
    initMetricsPipelineFormMeta: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const branchesFormData = state.form.metrics.pipelines[id];

      if (!branchesFormData)
        state.form.metrics.pipelines[id] = {
          branches: [],
        };
      state.form.metrics.pipelines[id].branches.forEach((branch) => {
        branch.error = false;
      });
    },
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
    deleteMetricsPipelineFormMeta: (state, action: PayloadAction<number>) => {
      const deleteId = action.payload;
      const formData = state.form.metrics.pipelines;
      state.form.metrics.pipelines = omit(formData, deleteId);
    },
    updateTokenAccessError: (state, action: PayloadAction<boolean>) => {
      state.form.metrics.isTokenAccessError = action.payload;
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
  updateTokenAccessError,
} = metaSlice.actions;

export const getVersion = (state: RootState) => state.meta.version;

export const getFormMeta = (state: RootState) => state.meta.form;

export const getIsTokenAccess = (state: RootState) => state.meta.form.metrics.isTokenAccessError;

export default metaSlice.reducer;
