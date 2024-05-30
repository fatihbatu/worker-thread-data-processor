import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
    paddingTop: theme.spacing(4),
  },
  button: {
    margin: theme.spacing(2),
  },
  loading: {
    marginTop: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(4),
  },
  card: {
    marginBottom: theme.spacing(2),
  },
}));

const FetchDataComponent = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState(null);
  const [series, setSeries] = useState(null);
  const [current, setCurrent] = useState("Movies");
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/movies", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setMovies(result.data);
      setError(null);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const fetchSeries = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/series", {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch series");
      }
      const result = await response.json();
      setSeries(result.data);
      setError(null);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Welcome to {current} Data Fetcher
      </Typography>
      <Button
        variant="contained"
        color="primary"
        className={classes.button}
        onClick={current === "Movies" ? fetchData : fetchSeries}
        disabled={loading}
      >
        {loading ? "Loading..." : `Fetch ${current} Data`}
      </Button>
      <Button
        variant="contained"
        color="secondary"
        className={classes.button}
        onClick={() => {
          setCurrent((prev) => (prev === "Movies" ? "Series" : "Movies"));
        }}
        disabled={loading}
      >
        {current === "movies" ? "Switch to Series" : "Switch to Movies"}
      </Button>

      {loading && <CircularProgress className={classes.loading} />}
      {error && (
        <Typography variant="body1" color="error">
          Oops! Something went wrong: {error}
        </Typography>
      )}
      {!error && movies && current === "Movies" && (
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            {current} Data Results: {movies.countries.length} countries |
            Response Time:
            {movies.responseTime} | Total Movies: {movies.count}
          </Typography>
          <Grid container spacing={2}>
            {movies.countries.map(([country, duration], index) => (
              <Grid item xs={12} sm={6} md={4} key={country}>
                <Card className={classes.card}>
                  <CardContent>
                    <div>{index + 1}</div>
                    <div>
                      <Typography variant="h6" gutterBottom>
                        {country}
                      </Typography>
                      <Typography variant="body1">
                        Average Duration: {duration} minutes
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      {!error && series && current === "Series" && (
        <Paper className={classes.paper}>
          <Typography variant="h6" gutterBottom>
            {current} Data Results: {series.countries.length} countries |
            Response Time: {series.responseTime} | Total Series: {series.count}
          </Typography>
          <Grid container spacing={2}>
            {series.countries.map(([country, duration], index) => (
              <Grid item xs={12} sm={6} md={4} key={country}>
                <Card className={classes.card}>
                  <CardContent>
                    <div>{index + 1}</div>
                    <div>
                      <Typography variant="h6" gutterBottom>
                        {country}
                      </Typography>
                      <Typography variant="body1">
                        Average Duration: {duration} minutes
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
      {!error && current === "Series" && !series && <div>NO DATA</div>}
      {!error && current === "Movies" && !movies && <div>NO DATA</div>}
    </div>
  );
};

export default FetchDataComponent;
