import { Box } from '@mui/material';
import VictoryDemo from './Victory';
import Recharts from './Recharts';
import NivoDemo from './Nivo';

const demoChart = () => {
  return (
    <Box>
      Recharts:
      <Recharts />
      Nivo:
      <NivoDemo />
      Victory:
      <VictoryDemo />
    </Box>
  );
};

export default demoChart;
