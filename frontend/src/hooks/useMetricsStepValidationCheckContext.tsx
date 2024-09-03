import { IPipelineConfig, ISourceControlConfig } from '@src/context/Metrics/metricsSlice';
import React, { createContext, useContext } from 'react';

interface ProviderContextType {
  getDuplicatedPipeLineIds: (pipelineSettings: IPipelineConfig[]) => number[];
  getDuplicatedSourceControlIds: (sourceControlConfigs: ISourceControlConfig[]) => number[];
}

interface ContextProviderProps {
  children: React.ReactNode;
}

export const ValidationContext = createContext<ProviderContextType>({
  getDuplicatedPipeLineIds: () => [],
  getDuplicatedSourceControlIds: () => [],
});

const getDuplicatedPipeLineIds = (pipelineSettings: IPipelineConfig[]) => {
  const errors: { [key: string]: number[] } = {};
  pipelineSettings.forEach(({ id, organization, pipelineName, step }) => {
    if (organization && pipelineName && step) {
      const errorString = `${organization}${pipelineName}${step}`;
      if (errors[errorString]) errors[errorString].push(id);
      else errors[errorString] = [id];
    }
  });
  return Object.values(errors)
    .filter((ids) => ids.length > 1)
    .flat();
};

const getDuplicatedSourceControlIds = (sourceControlConfigs: ISourceControlConfig[]) => {
  const errors: { [key: string]: number[] } = {};
  sourceControlConfigs.forEach(({ id, organization, repo }) => {
    if (organization && repo) {
      const errorString = `${organization}${repo}`;
      if (errors[errorString]) errors[errorString].push(id);
      else errors[errorString] = [id];
    }
  });
  return Object.values(errors)
    .filter((ids) => ids.length > 1)
    .flat();
};

export const ContextProvider = ({ children }: ContextProviderProps) => {
  return (
    <ValidationContext.Provider
      value={{
        getDuplicatedPipeLineIds,
        getDuplicatedSourceControlIds,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};

export const useMetricsStepValidationCheckContext = () => useContext(ValidationContext);
