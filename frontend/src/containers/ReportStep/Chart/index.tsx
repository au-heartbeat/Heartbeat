import { Box } from '@mui/material';
import Recharts from './Recharts';
import NivoDemo from './Nivo';

const demoChart = () => {
  return (
    <Box>
      Recharts:
      <Recharts />
      Nivo:
      <NivoDemo />
    </Box>
  );
};

export default demoChart;
