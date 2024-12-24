import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../App";
import Checklist from "../components/Checklist";
import useAPI from "../api/useAPI";
import {
  CleaningChecklistStep_Backend_Type,
  CleaningSchedule_Backend_Type,
  CleanlinessSurvey_Backend_Type,
} from "../types/CleaningSchedule.type";
import {
  Badge,
  Button,
  Typography,
  Modal,
  Tabs,
  Tab,
  Box,
} from "@mui/material";
import axios from "axios";
import { BACKEND_URL } from "../constants";
import { PriorityHigh, Close } from "@mui/icons-material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            p: 3,
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90vw",
  height: "80vh",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
};

const ModalContent = (props: {
  surveys: CleanlinessSurvey_Backend_Type[];
  handleClose: () => void;
}) => {
  const { surveys, handleClose } = props;
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={style}>
      <Button
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          minWidth: "auto",
        }}
        onClick={handleClose}
      >
        <Close />
      </Button>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="modal content tabs"
          variant="fullWidth"
          centered
        >
          <Tab label="CCTV" {...a11yProps(0)} />
          <Tab label="Surveys" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        CCTV
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Box
          sx={{
            height: "calc(80vh - 120px)", // Adjust height based on the modal and tabs
            overflow: "auto", // Enable scrolling
          }}
        >
          {surveys.map((survey) => (
            <div key={survey.id} style={{ marginBottom: 10 }}>
              <Typography variant="h6">Rating: {survey.rating}</Typography>
              <Typography variant="body1">Comment: {survey.comment}</Typography>
              {survey.images.map((image) => (
                <img src={image.image} alt="survey" style={{ width: 100 }} />
              ))}
              {survey.images.length == 0 && (
                <Typography variant="body1">No images provided</Typography>
              )}
            </div>
          ))}
        </Box>
      </CustomTabPanel>
    </Box>
  );
};

export default function Checklistpage() {
  const { schedule_id, number_plate } = useParams();
  const { isAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cleanDetails, setCleanDetails] =
    useState<CleaningChecklistStep_Backend_Type[]>(); // to implement when object shape is confirmed (details such as where needs to be cleaned)

  const { fetchAPI, loading, data } = useAPI<
    CleaningChecklistStep_Backend_Type[]
  >(`cleaning_schedules/${schedule_id}/checklist_steps`);

  const [schedule, setSchedule] = useState<CleaningSchedule_Backend_Type>();

  useEffect(() => {
    if (!isAuth) {
      console.log("Not authenticated");
      navigate("/login");
    }
    try {
      const fetchSchedule = async () => {
        const scheduleResponse = await axios.get(
          `${BACKEND_URL}cleaning_schedules/${schedule_id}/`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        setSchedule(scheduleResponse.data);
      };
      fetchSchedule();
      if (schedule) {
        getSurveyResults(schedule.bus.id);
      }
    } catch (error) {
      console.error(error);
    }
    fetchAPI();
    if (!loading) {
      setCleanDetails(data!);
    }
  }, [isAuth, loading]);

  // gets the survey results to be displayed in the modal and as badge number
  const [surveyResults, setSurveyResults] =
    useState<CleanlinessSurvey_Backend_Type[]>();
  const getSurveyResults = async (bus_id: number) => {
    try {
      const surveyResponse = await axios.get(
        `${BACKEND_URL?.replace("api/mobile", "spotless_survey_api")}survey/${bus_id}/get_survey_by_bus`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setSurveyResults(surveyResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  // handles updating the schedule as completed and the surveys as resolved
  const handleSubmit = async () => {
    try {
      const updateStatusResponse = await axios.patch(
        `${BACKEND_URL}cleaning_schedules/${schedule_id}/`,
        {
          status: "COMPLETED",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      const updateSurveyResponse = await axios.patch(
        `${BACKEND_URL?.replace("api/mobile", "spotless_survey_api")}survey/${schedule?.bus.id}/resolve_all_survey_by_bus`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      if (
        updateStatusResponse.status === 200 &&
        updateSurveyResponse.status === 200
      ) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Typography variant="h5">{number_plate}'s Checklist</Typography>

        <Button onClick={handleOpen}>
          <Badge
            badgeContent={surveyResults?.length}
            color="error"
            overlap="rectangular"
            showZero
          >
            <PriorityHigh style={{ color: "black" }} />
          </Badge>
        </Button>
        <Modal open={open} onClose={handleClose}>
          <ModalContent surveys={surveyResults!} handleClose={handleClose} />
        </Modal>
      </div>
      <Checklist checklist={cleanDetails!} />
      <Button
        style={{ marginTop: 10 }}
        variant={
          cleanDetails?.every((step) => step.status === "COMPLETE")
            ? "contained"
            : "outlined"
        }
        disabled={
          !cleanDetails?.every((step) => step.status === "COMPLETE") || loading
        }
        onClick={handleSubmit}
      >
        Complete Checklist
      </Button>
    </div>
  );
}
