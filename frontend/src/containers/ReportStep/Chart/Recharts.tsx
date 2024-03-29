import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
  Line,
} from 'recharts';
import { Box, List, ListItem, ListItemIcon, Icon } from '@mui/material';
import Brightness1Icon from '@mui/icons-material/Brightness1';
import { useState } from 'react';
import get from 'lodash/get';

const data = [
  {
    name: '03/01-03/15',
    velocity: 12,
    throughput: 7.5,
  },
  {
    name: '03/15-03/30',
    velocity: 25,
    throughput: 12,
  },
  {
    name: '04/01-04/15',
    velocity: 13,
    throughput: 5,
  },
  {
    name: '04/15-04/30',
    velocity: 14,
    throughput: 11,
  },
  {
    name: '05/01-05/15',
    velocity: 8,
    throughput: 5,
  },
  {
    name: '05/15-05/30',
    velocity: 23,
    throughput: 4,
  },
];

const dataMultiple = [
  {
    name: '03/01-03/15',
    totalReworkTimes: 1.25,
    totalReworkCards: 4,
    reworkCardsRatio: 10,
  },
  {
    name: '03/15-03/30',
    totalReworkTimes: 5,
    totalReworkCards: 7,
    reworkCardsRatio: 22,
  },
  {
    name: '04/01-04/15',
    totalReworkTimes: 3,
    totalReworkCards: 4,
    reworkCardsRatio: 15,
  },
  {
    name: '04/15-04/30',
    totalReworkTimes: 7,
    totalReworkCards: 10,
    reworkCardsRatio: 22,
  },
  {
    name: '05/01-05/15',
    totalReworkTimes: 3,
    totalReworkCards: 4,
    reworkCardsRatio: 22,
  },
  {
    name: '05/15-05/30',
    totalReworkTimes: 8,
    totalReworkCards: 10,
    reworkCardsRatio: 20,
  },
];

const RechartsDemo = () => {
  const [legendStatus, setLegendStatus] = useState({
    velocity: {
      color: '#F2617A',
      isActive: true,
    },
    throughput: {
      color: '#003D4F',
      isActive: true,
    },
  });

  const handleFilterByLegend = (key: string, isActive: boolean) => {
    setLegendStatus({
      ...legendStatus,
      [key]: {
        ...get(legendStatus, key),
        isActive,
      },
    });
  };

  return (
    <>
      <Box sx={{ width: 800, height: 300 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart
            data={data}
            margin={{
              top: 30,
              right: 20,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='1 1' />
            <XAxis dataKey='name' />
            <YAxis yAxisId='throughput' />
            <YAxis yAxisId='velocity' orientation='right' />
            <Tooltip />
            <Legend
              content={() => {
                return (
                  <List dense sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
                    {Object.entries(legendStatus).map(([key, value]) => (
                      <ListItem
                        sx={{ color: value.color, width: 'fit-content' }}
                        key={key}
                        onClick={() => handleFilterByLegend(key, !value.isActive)}
                      >
                        <ListItemIcon sx={{ minWidth: 'auto', mr: '.5rem' }}>
                          <Brightness1Icon sx={{ color: value.color }} />
                        </ListItemIcon>
                        <Box>{key}</Box>
                      </ListItem>
                    ))}
                  </List>
                );
              }}
            />

            <Area
              type='monotone'
              dataKey={legendStatus.throughput.isActive ? 'throughput' : ''}
              stroke='#003D4F'
              fill='#003D4F'
              strokeWidth={3}
              dot={{ stroke: '#003D4F' }}
              yAxisId='throughput'
            />

            <Area
              type='monotone'
              dataKey={legendStatus.velocity.isActive ? 'velocity' : ''}
              stroke='#F2617A'
              fill='#F2617A'
              strokeWidth={3}
              dot={{ stroke: '#F2617A' }}
              yAxisId='velocity'
            />


          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ width: 800, height: 300 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <ComposedChart
            data={dataMultiple}
            margin={{
              top: 30,
              right: 20,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid stroke='#f5f5f5' />
            <XAxis dataKey='name' />
            <YAxis yAxisId='totalReworkCards' />
            <Bar dataKey='totalReworkTimes' barSize={20} fill='#003D4F' yAxisId='totalReworkCards' />
            <Bar dataKey='totalReworkCards' barSize={20} fill='#47A1AD' yAxisId='totalReworkCards' />
            <Tooltip />
            <YAxis orientation='right' yAxisId='reworkCardsRatio' />
            <Line
              dataKey='reworkCardsRatio'
              stroke='#F2617A'
              fill='#F2617A'
              strokeWidth={3}
              yAxisId='reworkCardsRatio'
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
};

export default RechartsDemo;
