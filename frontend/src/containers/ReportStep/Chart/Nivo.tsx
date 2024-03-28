import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { Box } from '@mui/material';

const data = [
  {
    name: '03/01-03/15',
    totalCycleTime: 5,
    totalDevelopment: 1,
    blockTime: 1,
    waitTime: 0.5,
    reviewTime: 0.5,
  },
  {
    name: '03/15-03/30',
    totalCycleTime: 3,
    totalDevelopment: 1,
    blockTime: 0.5,
    waitTime: 1,
    reviewTime: 1,
  },
  {
    name: '04/01-04/15',
    totalCycleTime: 5,
    totalDevelopment: 1,
    blockTime: 1,
    waitTime: 1,
    reviewTime: 1,
  },
  {
    name: '04/15-04/30',
    totalCycleTime: 7.5,
    totalDevelopment: 1,
    blockTime: 1,
    waitTime: 1.5,
    reviewTime: 0.5,
  },
  {
    name: '05/01-05/15',
    totalCycleTime: 7.5,
    totalDevelopment: 1,
    blockTime: 1,
    waitTime: 1.5,
    reviewTime: 0.5,
  },
  {
    name: '05/15-05/30',
    totalCycleTime: 7.5,
    totalDevelopment: 1,
    blockTime: 1,
    waitTime: 1.5,
    reviewTime: 0.5,
  },
];

const NivoDemo = () => {
  const handleClick = (data: any, e: any) => {
    console.log(data);
  };
  return (
    <Box sx={{ width: 800, height: 400 }}>
      <ResponsiveBar
        data={data}
        keys={['totalCycleTime', 'totalDevelopment', 'blockTime', 'waitTime', 'reviewTime']}
        colors={['#003D4F', '#47A1AD', '#F2617A', '#6B9E78', '#CC850A']}
        indexBy='name'
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.75}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        enableLabel={false}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Days',
          legendPosition: 'end',
          legendOffset: -40,
          truncateTickAt: 0,
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 49,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
            onClick: handleClick,
          },
        ]}
        role='application'
        ariaLabel='Nivo bar chart demo'
      />
    </Box>
  );
};

export default NivoDemo;
