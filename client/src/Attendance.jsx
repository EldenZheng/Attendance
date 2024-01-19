import { useState, useEffect } from "react"
import { addDays } from 'date-fns';
import { DateRangePicker } from 'react-date-range';
import axios from "axios"
import { useNavigate } from 'react-router-dom'

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button';

import MyModal from './MyModal'

export default function AttendanceList(){
    const [modalShow, setModalShow] = useState(false);
    const [shiftSchedule, setShiftSchedule]=useState([])
    const [calender, setCalender] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection'
        }
    ]);
    const navigate = useNavigate()

    useEffect(()=>{
        axios.get('http://localhost:3001')
        .then(result => setShiftSchedule(result.data))
        .catch(err=>console.log(err))
    },[])

    const returnHome=()=>{
        navigate('/Home')
    }

    return(
        <div className="d-flex vh-100 vw-100 justify-content-center align-items-center bg-secondary-subtle">
            <div className='w-50 bg-white rounded p-3'>
                <a href="" onClick={returnHome}><FontAwesomeIcon icon={faChevronLeft} />Back</a> 
                <h4>Attendance List - <a href="">Export to Excel</a></h4>
                <Button variant="primary" onClick={() => setModalShow(true)}>
                    <FontAwesomeIcon icon={faFilter} /> Filter
                </Button>
                <MyModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    title=" Search By"
                    icon={faFilter}
                >
                    Employee Name:
                    <input type="text" className="form-control"/>
                    <br />
                    <DateRangePicker
                        onChange={item => setCalender([item.selection])}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        ranges={calender}
                        direction="horizontal"
                    />
                </MyModal>

                <table className='table'>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Date</th>
                            <th>Time Start</th>
                            <th>Duration</th>
                            <th>Time End</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            shiftSchedule.map((shiftSchedule)=>{
                                return(
                                    <tr>
                                        <td>{shiftSchedule.email}</td>
                                        <td>{shiftSchedule.date}</td>
                                        <td>{shiftSchedule.startTime}</td>
                                        <td>{shiftSchedule.duration}</td>
                                        <td>{shiftSchedule.endTime}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}