import { useEffect, useState } from "react";
import { useWorkoutsContext } from "../hooks/useWorkoutsContext";
import { useAuthContext } from "../hooks/useAuthContext";

const WorkoutForm = ({ isEditing, workoutEdit, setEditing }) => {
  const { dispatch } = useWorkoutsContext();
  const { user } = useAuthContext();
  const [title, setTitle] = useState("");
  const [load, setLoad] = useState("");
  const [reps, setReps] = useState("");
  const [error, setError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);

  useEffect(() => {
    if (isEditing) {
      setTitle(workoutEdit.title);
      setLoad(workoutEdit.load);
      setReps(workoutEdit.reps);
    }
  }, [isEditing, workoutEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in");
      return;
    }

    const workout = { title, load, reps };
    let response;
    if (isEditing) {
      response = await fetch("/api/workouts/" + workoutEdit._id, {
        method: "PATCH",
        body: JSON.stringify(workout),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
    } else {
      response = await fetch("/api/workouts", {
        method: "POST",
        body: JSON.stringify(workout),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
    }
    const json = await response.json();
    if (!response.ok) {
      setError(json.error);
      setEmptyFields(json.emptyFields);
    }
    if (response.ok) {
      setTitle("");
      setLoad("");
      setReps("");
      setError(null);
      setEmptyFields([]);
      if (isEditing) {
        dispatch({ type: "UPDATE_WORKOUT", payload: json });
        setEditing(!isEditing);
      } else {
        dispatch({ type: "CREATE_WORKOUT", payload: json });
      }
    }
  };

  return (
    <div>
      <form className="create" onSubmit={handleSubmit}>
        <h3>{isEditing ? "Edit Workout" : "Add a New Workout"}</h3>
        <label htmlFor="title">Exercise Title:</label>
        <input
          type="text"
          id="title"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          className={emptyFields.includes("title") ? "error" : ""}
        />
        <label htmlFor="load">Load (in Kg):</label>
        <input
          type="number"
          id="load"
          onChange={(e) => setLoad(e.target.value)}
          value={load}
          className={emptyFields.includes("load") ? "error" : ""}
        />
        <label htmlFor="reps">Reps:</label>
        <input
          type="number"
          id="reps"
          onChange={(e) => setReps(e.target.value)}
          value={reps}
          className={emptyFields.includes("reps") ? "error" : ""}
        />
        <button>{isEditing ? "Edit Workout" : "Add Workout"}</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default WorkoutForm;
