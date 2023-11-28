import { FormSelect } from '@src/components/Metrics/MetricsStep/CycleTime/FormSelect'
import React from 'react'
import { FormSelectPartContainer } from '@src/components/Metrics/MetricsStep/CycleTime/style'
import { useAppSelector } from '@src/hooks'
import { selectJiraColumnsWithStatuses } from '@src/context/Metrics/metricsSlice'

interface FormSelectPartProps {
  selectedOptions: { name: string; value: string }[]
  saveCycleTimeOptions: (label: string, value: string) => void
}

export const FormSelectPart = ({ selectedOptions, saveCycleTimeOptions }: FormSelectPartProps) => {
  const jiraColumns = useAppSelector(selectJiraColumnsWithStatuses)
  return (
    <FormSelectPartContainer>
      {selectedOptions.map((item) => {
        const matchingJiraColumn = jiraColumns.find((column) => column.name === item.name)
        return (
          <FormSelect
            key={item.name}
            label={`${matchingJiraColumn.name} (${matchingJiraColumn.statuses.join(', ')})`}
            defaultSelected={item.value}
            saveCycleTimeOptions={saveCycleTimeOptions}
          />
        )
      })}
    </FormSelectPartContainer>
  )
}
