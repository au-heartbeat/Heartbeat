import { VictoryChart, VictoryAxis, VictoryLine } from 'victory';
import { Box } from '@mui/material';

const VictoryDemo = () => {
  return (
    <Box sx={{ width: 800, height: 300 }}>
      <VictoryChart>
        <VictoryAxis dependentAxis={false} />
        <VictoryAxis dependentAxis={true} orientation='left' />
        <VictoryAxis dependentAxis={true} orientation='right' />
        <VictoryLine />
      </VictoryChart>
    </Box>
  );
};

export default VictoryDemo;
