import "./styles.css";
import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [trainAvailable, setTrainAvailable] = useState<boolean>();
  const [lastUpdate, setLastUpdate] = useState<String | null>();

  const TRAIN_NUMBER = "8550";
  const CIRCULATION_DATE = "2022-12-04";
  const DELETED_TRAIN_TYPE = "SUPPRESSION_TOTALE";
  const CANCELED_TRAIN_MESSAGE = "your train is cancelled...";
  const AVAILABLE_TRAIN_MESSAGE =
    "Your train is still available! Wait for the next refresh...";

  // it's the "public" token I found inspecting the network requests
  const SNCF_TOKEN =
    "YWRtaW46JDJ5JDEwJFF2eFdTUzRmNURJRlNrQW11Qm9WOU9KRzNNMmJoZWM5ZDNGMi5ZblVMQk10cHpLQXEyS1Mu";
  const REFRESH_INTERVAL = 1000 * 60; // 1 minutes

  const url = `https://www.sncf.com/api/iv/1.0/infoVoy/rechercherListeCirculations?numero=${TRAIN_NUMBER}&dateCirculation=${CIRCULATION_DATE}&codeZoneArret&typeHoraire=TEMPS_REEL&codeZoneArretDepart&codeZoneArretArrivee&compositions=1&codeCirculation&format=html`;
  const header = {
    headers: {
      authorization: `Basic ${SNCF_TOKEN}`
    }
  };

  const buttonStyle = {
    color: "#fff",
    padding: "1em 1em",
    fontSize: "300%",
    fontWeight: 900,
    textTransform: "uppercase" as const
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
        console.log(AVAILABLE_TRAIN_MESSAGE);
        return;
      }

      const events =
        res.data.reponseRechercherListeCirculations.reponse.listeResultats
          .resultat[0].donnees.listeCirculations.circulation[0].origine
          .evenement;

      events.forEach((event: any) => {
        if (event.type === DELETED_TRAIN_TYPE) {
          setTrainAvailable(false);
          console.log(CANCELED_TRAIN_MESSAGE);
        } else {
          setTrainAvailable(true);
        }
      });
    });
  };

  useEffect(() => {
    checkAvailability();

    const interval = setInterval(() => {
      console.log("This will run every minute!");
      checkAvailability();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>
        Train {TRAIN_NUMBER} on {CIRCULATION_DATE} is
      </h1>
      {trainAvailable === true && (
        <h2 style={{ ...buttonStyle, backgroundColor: "#28a745" }}>
          available
        </h2>
      )}
      {trainAvailable === false && (
        <h2 style={{ ...buttonStyle, backgroundColor: "#dc3545" }}>
          cancelled
        </h2>
      )}
      {lastUpdate && <span>Last update : {lastUpdate}</span>}
    </div>
  );
}

export default App;
