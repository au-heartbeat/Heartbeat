import { InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import React, { useState } from 'react'
import { FormControlSelection } from '@src/components/common/FormSelect/style'

interface formSelectProps {
  label: string
  defaultSelected: string[]
  options: string[]
}

export const FormSelect = ({ label, defaultSelected, options }: formSelectProps) => {
  const [selectedCycleTime, setSelectedCycleTime] = useState([...defaultSelected])

  const handleCycleTimeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setSelectedCycleTime([...value])
  }

  return (
    <FormControlSelection variant='standard' required>
      <InputLabel id='cycletime-data-checkbox-label'>{label}</InputLabel>
      <Select
        labelId='cycletime-data-checkbox-label'
        value={selectedCycleTime}
        onChange={handleCycleTimeChange}
        renderValue={(selectedCycleTime: string[]) => selectedCycleTime}
      >
        {options.map((data) => (
          <MenuItem key={data} value={data}>
            <ListItemText primary={data} />
          </MenuItem>
        ))}
      </Select>
    </FormControlSelection>
  )
}
