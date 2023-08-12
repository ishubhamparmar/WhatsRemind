import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [reminderMsg, setReminderMsg] = useState('');
  const [remindAt, setRemindAt] = useState(new Date()); 
  const [reminderList, setReminderList] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9000/getAllReminder').then((res) => setReminderList(res.data));
  }, []);

  const addReminder = () => {
    axios
      .post('http://localhost:9000/addReminder', { reminderMsg, remindAt })
      .then((res) => setReminderList(res.data));
    //Resetting to default value after adding reminder
    setReminderMsg('');
    setRemindAt(new Date()); 
  };

  const deleteReminder = (id) => {
    axios
      .post('http://localhost:9000/deleteReminder', { id })
      .then((res) => setReminderList(res.data));
  };

  return (
    <div className="App">
      <div className="homepage">
        <div className="homepage_header">
          <h1>Notify Me   <FontAwesomeIcon icon={faBell} /></h1>
          <input
            type="text"
            placeholder="Reminder notes here..."
            value={reminderMsg}
            onChange={(e) => setReminderMsg(e.target.value)}
          />
          <DatePicker className='datePicker' 
            selected={remindAt}
            onChange={(date) => setRemindAt(date)}
            minDate={new Date()}
            showTimeSelect
            dateFormat="Pp" 
          />
          <div className="button" onClick={addReminder}>
            Add Reminder
          </div>
        </div>

        <div className="homepage_body">
          {reminderList.map((reminder) => (
            <div className="reminder_card" key={reminder._id}>
              <h2>{reminder.reminderMsg}</h2>
              <h3>Remind Me at:</h3>
              <p>{String(new Date(reminder.remindAt.toLocaleString(undefined, { timezone: 'Asia/Kolkata' })))}</p>
              <div className="button" onClick={() => deleteReminder(reminder._id)}>
                Delete
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );



}

export default App;
