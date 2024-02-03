import { useState, useEffect } from "react"
import { addDays } from 'date-fns';
import { DateRangePicker } from 'react-date-range';
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

//date range picker
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button';

import MyModal from './MyModal'

export default function AttendanceList(){
    const [empEmail,setEmpEmail]=useState('');
    const [modalShow, setModalShow] = useState(false);
    const [shiftSchedule, setShiftSchedule]=useState([])
    const [filteredData, setFilteredData]=useState(false);
    const [absentEmployeeNumber, setAbsentEmployeeNumber]=useState();
    const [calender, setCalender] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection'
        }
    ]);
    const navigate = useNavigate()

    const fetchData = () => {
        axios.get('http://localhost:3001')
        .then(result => {
            setShiftSchedule(result.data)
            setFilteredData(false)
        })
        .catch(err => console.log(err));
    };

    useEffect(()=>{
        fetchData();
    },[])

    useEffect(()=>{
        axios.get('http://localhost:3001/getAbsentAllEmployee')
        .then(result=>{
            setAbsentEmployeeNumber(result.data)
        })
        .catch(err => console.log(err));
    },[])

    const returnHome=()=>{
        navigate('/Home')
    }
    const filter=()=>{
        const startDate = calender[0].startDate.toISOString().split('T')[0];
        const endDate = calender[0].endDate.toISOString().split('T')[0];
        axios.get(`http://localhost:3001/searchBy?startDate=${startDate}&endDate=${endDate}&empEmail=${empEmail}`)
        .then(result => {
            setShiftSchedule(result.data)
            setModalShow(false)
            setFilteredData(true)
        })
        .catch(err=>console.log(err))
    }
    const handleChange = (e) => {
        const {value}=e.target;
        setEmpEmail(value)
    }

    const onAbsentPerEmployee = async () =>{
        const startDate = calender[0].startDate.toISOString().split('T')[0];
        const endDate = calender[0].endDate.toISOString().split('T')[0];
        const apiEndpoint = `http://localhost:3001/getAbsentEachEmployee?startDate=${startDate}&endDate=${endDate}&empEmail=${empEmail}`
        const fileName = empEmail ? `${startDate} - ${endDate} ${empEmail} Absent Report` : `${startDate} - ${endDate} Absent Report`;
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const response = await fetch(apiEndpoint);
        const apiData = await response.json();
        const ws = XLSX.utils.json_to_sheet(apiData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    const exportToCSV = async () => {
        const startDate = calender[0].startDate.toISOString().split('T')[0];
        const endDate = calender[0].endDate.toISOString().split('T')[0];
        const apiEndpoint = `http://localhost:3001/searchBy?startDate=${startDate}&endDate=${endDate}&empEmail=${empEmail}`
        const fileName = empEmail ? `${startDate} - ${endDate} ${empEmail} Attendance Report` : `${startDate} - ${endDate} Attendance Report`;
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const response = await fetch(apiEndpoint);
        const apiData = await response.json();
        const ws = XLSX.utils.json_to_sheet(apiData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    const exportData = async () =>{
        await exportToCSV();
        await onAbsentPerEmployee();
    }


    return(
        <div className="d-flex vh-100 vw-100 justify-content-center align-items-center bg-secondary-subtle">
            <div className='w-50 bg-white rounded p-3'>
                <a onClick={returnHome}><FontAwesomeIcon icon={faChevronLeft} />Back</a> 
                <h4>Attendance List{filteredData && (<> - <a onClick={exportData}>Export to Excel</a></>)}</h4>
                <Button variant="primary" onClick={() => setModalShow(true)}>
                    <FontAwesomeIcon icon={faFilter} /> Filter
                </Button>{filteredData && (<> - <a onClick={fetchData}>Show All</a></>)}
                <MyModal
                    show={modalShow}
                    onHide={() => setModalShow(false)}
                    title=" Search By"
                    icon={faFilter}
                    onSearch={filter}
                    btnSign="Search"
                >
                    Employee Email:
                    <input type="text" className="form-control" value={empEmail} onChange={handleChange}/>
                    <br />
                    <DateRangePicker
                        onChange={item => setCalender([item.selection])}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        months={2}
                        ranges={calender}
                        direction="horizontal"
                        style={{width:'270px', color:'black'}}
                    />
                </MyModal>
                <div>
                    Current Total Employee Absent This Month: {absentEmployeeNumber}
                </div>
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
                                        {shiftSchedule.duration==="0" ? (<td>On Going</td>) : (<td>{shiftSchedule.duration}</td>)}
                                        {shiftSchedule.endTime==="00:00:00"? (<td>On Going</td>) : (<td>{shiftSchedule.endTime}</td>)}
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