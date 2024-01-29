import { FormSelectPartContainer } from '@src/components/Metrics/MetricsStep/CycleTime/style'
import { FormSelect } from '@src/components/Metrics/MetricsStep/CycleTime/FormSelect'
import React from 'react'

interface FormSelectPartProps {
  selectedOptions: string[][]
  saveCycleTimeOptions: (label: string, value: string) => void
}

export const FormSelectPart = ({ selectedOptions, saveCycleTimeOptions }: FormSelectPartProps) => (
  <FormSelectPartContainer>
    {selectedOptions.map(([boardKey, boardSupplement, state]) => {
      return (
        <FormSelect
          key={boardKey}
          label={`${boardKey} (${boardSupplement})`}
          name={`${boardKey}`}
          defaultSelected={state}
          saveCycleTimeOptions={saveCycleTimeOptions}
        />
      )
    })}
  </FormSelectPartContainer>
)
