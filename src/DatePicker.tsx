import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

export default function MaterialUIPickers() {
  const [trainDate, setTrainDate] = React.useState<Dayjs | null>(
    dayjs('2014-08-18T21:11:54'),
  );

  const handleTrainDateChange = (newValue: Dayjs | null) => {
    setTrainDate(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DesktopDatePicker
          label="Date desktop"
          inputFormat="MM/DD/YYYY"
          value={trainDate}
          onChange={handleTrainDateChange}
          renderInput={(params) => <TextField {...params} />}
        />
    </LocalizationProvider>
  );
}