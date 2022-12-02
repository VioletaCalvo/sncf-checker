import './App.css';
import axios from "axios";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { Box, Typography, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';

dayjs.extend(dayOfYear)

const TRAIN_NUMBER = "8550";
const CIRCULATION_DATE = "2022-12-04";
const DELETED_TRAIN_TYPE = "SUPPRESSION_TOTALE";

// it's the "public" token I found inspecting the network requests
const SNCF_TOKEN =
  "YWRtaW46JDJ5JDEwJFF2eFdTUzRmNURJRlNrQW11Qm9WOU9KRzNNMmJoZWM5ZDNGMi5ZblVMQk10cHpLQXEyS1Mu";

const REFRESH_INTERVAL = 1000 * 60 * 5; // 5 minutes

export default function App() {
  const [trainAvailable, setTrainAvailable] = useState<boolean>();
  const [lastUpdate, setLastUpdate] = useState<String | null>();

  const [trainDate, setTrainDate] = useState<String | null>(
    CIRCULATION_DATE
  );
  const handleTrainDateChange = (newValue: Dayjs | null) => {
    setTrainDate(newValue?.format("YYYY-MM-DD") as string);
    checkAvailability();
  };

  const [trainNumber, setTrainNumber] = useState<string | null>(
    TRAIN_NUMBER,
  );
  const handleTrainNumberChange = (newTrainNumber: any) => {
    const trainNumberInput = newTrainNumber.target.value;
    if (trainNumberInput.toString().length === 4) {
      setTrainNumber(trainNumberInput.toString());
      checkAvailability();
    }
  };

  const url = `https://www.sncf.com/api/iv/1.0/infoVoy/rechercherListeCirculations?numero=${trainNumber}&dateCirculation=${trainDate}&codeZoneArret&typeHoraire=TEMPS_REEL&codeZoneArretDepart&codeZoneArretArrivee&compositions=1&codeCirculation&format=html`;
  const header = {
    headers: {
      authorization: `Basic ${SNCF_TOKEN}`
    }
  };
  const checkAvailability = () => {
    axios.get(url, header).then((res) => {
      console.log(res);
      console.log("Refreshing");
      setLastUpdate(Date().toString());

      const trainOrigin =
        res.data.reponseRechercherListeCirculations.reponse.listeResultats
          .resultat[0].donnees.listeCirculations.circulation[0].origine;

      if (!trainOrigin.evenement) {
        setTrainAvailable(true);
        return;
      }

      const events =
        res.data.reponseRechercherListeCirculations.reponse.listeResultats
          .resultat[0].donnees.listeCirculations.circulation[0].origine
          .evenement;

      events.forEach((event: any) => {
        if (event.type === DELETED_TRAIN_TYPE) {
          setTrainAvailable(false);
        } else {
          setTrainAvailable(true);
        }
      });
    });
  };

  useEffect(() => {
    checkAvailability();

    const interval = setInterval(() => {
      checkAvailability();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  });

  const buttonStyle = {
    color: "#fff",
    padding: "1em 1em",
    fontSize: "300%",
    fontWeight: 900,
    textTransform: "uppercase" as const,
    backgroundColor: trainAvailable ? "#28a745" : "#dc3545",
  };

  return (
    <div className="App">
      <Box sx={{ paddingTop: 7, paddingBottom: 2 }}>
        <TextField
          sx= {{ marginRight: 3 }}
          id="outlined-number"
          label="Train number"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          defaultValue={TRAIN_NUMBER}
          onChange={handleTrainNumberChange}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DesktopDatePicker
            label="Train date"
            inputFormat="YYYY/MM/DD"
            value={trainDate}
            onChange={handleTrainDateChange}
            renderInput={(params) => <TextField {...params} />}
          />
        </LocalizationProvider>
      </Box>
      <Typography variant="h4" sx={{ padding: 2 }} >
        <>Train <strong>{trainNumber}</strong> on <strong>{trainDate}</strong> is</>
      </Typography>
      <Box>      
        <Typography variant="h2" style={{ ...buttonStyle}}>
          {trainAvailable ? 'available' : 'cancelled'}
        </Typography>
        <Box sx={{ margin: 3 }}>
          <img
            alt="coyotte"
            width="400px"
            src={
              trainAvailable 
                ? "https://www.icegif.com/wp-content/uploads/trump-train-icegif-5.gif"
                : "https://img.20mn.fr/cWFyZ5pyS8SagHk09dnZeA/640x410_le-leader-de-la-cgt-philippe-martinez-lors-de-la-manifestation-du-10-decembre-2019-a-paris-bertrand"
              }
          />
        </Box>
      </Box>
      {lastUpdate &&
        <Typography variant="subtitle2">
          <>Last update : {lastUpdate}</>
        </Typography>
      }
    </div>
  );
}
