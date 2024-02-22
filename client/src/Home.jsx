import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from 'react-router-dom'

import MyModal from './MyModal'

//date range picker
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

import { addDays } from 'date-fns';
import { DateRangePicker } from 'react-date-range';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBusinessTime } from '@fortawesome/free-solid-svg-icons'
import Button from 'react-bootstrap/Button';

export default function Home(){
    const [info,setInfo]=useState({
        email: '',
        password: '',
        role:''
    })
    const[formData, setFormData]=useState({
        email: '',
        password: '',
        role: ''
    })
    const [modalShow, setModalShow] = useState(false);
    const [userModalShow, setUserModalShow] = useState(false);
    const [onTime,setOnTime]=useState(true)
    const [selectedOption, setSelectedOption] = useState();
    const [shiftStatus,setShiftStatus]=useState(false)
    const [shiftStart,setShiftStart]=useState()
    const [duration, setDuration]=useState()
    const [shiftComplete, setShiftComplete]=useState(true)
    const [showLoading, setShowLoading] = useState(true);
    const [isDlk, setIsDlk]=useState(false)
    const [calender, setCalender] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection'
        }
    ]);

    const userData=JSON.parse(sessionStorage.getItem('userData'))
    axios.defaults.withCredentials=true;
    const navigate = useNavigate()

    useEffect(()=>{
        axios.get('https://attendance-api-rouge.vercel.app/getUser/'+userData.email)
        .then(result => {setInfo(result.data)
            console.log(result.data)
        })
        .catch(err=>console.log(err))
    },[])

    useEffect(()=>{
        // const today = new Date().toISOString().split('T')[0];
        // const shiftData = {
        //     today: today,
        //     email: userData.emai
        // }
        // axios.get('https://attendance-api-rouge.vercel.app/checkShift',shiftData)
        axios.get('https://attendance-api-rouge.vercel.app/checkShift/'+userData.email)
        .then(result => {
            if(result.data.hasnt==true){
                setShiftStatus(true)
                setShiftStart(result.data.startTime)
            }else if(result.data=="complete"){
                setShiftStart(false)
                setShiftComplete(true)
            }else if(result.data=="free"){
                setOnTime(true)
                setIsDlk(true)
            }
            else{
                const currentDateTime = new Date();
                const currentHour = currentDateTime.getHours();
                const currentMinute = currentDateTime.getMinutes();

                const [startHour, startMinute] = result.data.ScheduleStart.split(":").map(Number);

                const thresholdHour = startHour;
                const thresholdMinute = startMinute + 5;

                const isOnTime = currentHour < thresholdHour || (currentHour === thresholdHour && currentMinute <= thresholdMinute);
                setOnTime(isOnTime);
            }
        })
        .catch(err=>console.log(err))
    },[])
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoading(false);
        }, 2500);
        return () => clearTimeout(timer);
        }, [setShiftStatus]);

    const startShift= () => {
        const currentDateandTime = new Date();
        const year = currentDateandTime.getFullYear();
        const month = currentDateandTime.getMonth() + 1;
        const day = currentDateandTime.getDate();
    
        const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    
        const hours = currentDateandTime.getHours();
        const minutes = currentDateandTime.getMinutes();
        const seconds = currentDateandTime.getSeconds();
    
        const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
        const requestData = {
            email: info.email,
            onTime: onTime,
            formattedDate: formattedDate,
            formattedTime: formattedTime,
            ...(selectedOption && { selectedOption: selectedOption }),
            ...(isDlk && { selectedOption: isDlk})
        };
        axios.post('https://attendance-api-rouge.vercel.app/StartShift', requestData)
        .then(result=> {
            setShiftStatus(true)
            setShiftStart(result.data.startTime)
        })
        .catch(err=>console.log(err))
    }

    const endShift = () => {
        const currentDateandTime = new Date();
        const year = currentDateandTime.getFullYear();
        const month = currentDateandTime.getMonth() + 1;
        const day = currentDateandTime.getDate();

        const formattedDate = `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;

        const hours = currentDateandTime.getHours();
        const minutes = currentDateandTime.getMinutes();
        const seconds = currentDateandTime.getSeconds();
        
        const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        const shiftInfo = {
            email: info.email,
            formattedDate: formattedDate,
            formattedTime: formattedTime,
            duration: formatTime(duration)
        };
        axios.put('https://attendance-api-rouge.vercel.app/EndShift', shiftInfo)
            .then(result => {
                setShiftStart(false)
                setShiftComplete(true)
            })
            .catch(err => console.log(err));
    };

    const requestDLK = () => {
        const requestData = {
            email: info.email,
            startDate: calender[0].startDate.toISOString().split('T')[0],
            endDate: calender[0].endDate.toISOString().split('T')[0]
        };
        console.log(requestData)
        axios.post('https://attendance-api-rouge.vercel.app/requestApprove', requestData)
        .then(result=> {
            setModalShow(false)
        })
        .catch(err=>console.log(err))
    }

    const addUser=()=>{
        axios.post('https://attendance-api-rouge.vercel.app/addUser', formData)
        .then(result=> {
            setUserModalShow(false)
        })
        .catch(err=>console.log(err))
    }

    useEffect(() => {
        let interval;
    
        if (shiftStatus && !(shiftComplete)) {
            interval = setInterval(() => {
                const currentTime = new Date();
                const startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), ...shiftStart.split(':'));
                const elapsedMilliseconds = currentTime - startTime;
                const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    
                setDuration(elapsedSeconds);
            }, 1000);
        }
    
        // Cleanup the interval when the component unmounts or when shiftStatus becomes false
        return () => clearInterval(interval);
    
    }, [shiftStatus, shiftStart]);

    const formatTime = (timeInSeconds) => {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
    
        return `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const logOut = ()=>{
        sessionStorage.removeItem('userData')
        navigate('/')
    }

    const handleChange = (e) => {
        const {name,value}=e.target;
        setFormData((prevData)=>({
            ...prevData,
            [name]:value,
        }))
    }

    const goToAttendance=()=>{
        navigate('/Attendance')
    }

    const goToOwnAttendance=()=>{
        navigate('/SelfAttendance')
    }

    return(
        <>
            <div className="d-flex vh-100 vw-100 justify-content-center align-items-center bg-secondary-subtle">
                <div className='w-50 bg-white rounded p-3'>
                    <h3>Welcome {info.email} !</h3>
                    <Button variant="primary" onClick={() => setModalShow(true)}>
                        <FontAwesomeIcon icon={faBusinessTime} /> Request DLK
                    </Button>
                    <MyModal
                        show={modalShow}
                        onHide={() => setModalShow(false)}
                        title=" Request"
                        icon={faBusinessTime}
                        onSearch={requestDLK}
                        btnSign="Request"
                    >
                        Select Date Range
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
                    <h4>Status: {onTime ? (<>On Time</>) : (<>Late</>)}</h4>
                    {!(onTime) && (
                        <select value={selectedOption} onChange={handleOptionChange}>
                            <option value="">-Select Reason-</option>
                            <option value="sd">Sakit dengan surat dokter</option>
                            <option value="tsd">Sakit tanpa surat dokter</option>
                            <option value="t1">Telat 1</option>
                            <option value="t2">Telat 2</option>
                            <option value="t3">Telat 3</option>
                            <option value="t4">Telat 4</option>
                        </select>
                    )}
                    {!(shiftStatus) && !(shiftComplete) &&(
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Shift Not Started
                                <button 
                                    className="btn btn-primary" 
                                    onClick={startShift}
                                    disabled={!onTime && (selectedOption == null||selectedOption=="")}
                                >
                                    Start Shift
                                </button>
                            </div>
                        )
                    }
                    {shiftStatus &&  !(shiftComplete) &&(
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Shift Elapsed Time: {showLoading ? (
                                    <>Loading...</>
                                ) : (
                                    <>
                                        {formatTime(duration)}
                                        <button className="btn btn-danger" onClick={endShift}>End Shift</button>
                                    </>
                                )}
                                
                            </div>
                        )
                    }
                    {shiftComplete &&(
                            <div>
                                Shift Completed! Go Home
                            </div>
                        )
                    }
                    <hr />
                    <a onClick={goToOwnAttendance}>See Own Attendance List</a> <br />
                    <a onClick={goToAttendance}>Go To Attendance List</a>
                    {(info.role=="HR")&&(
                        <>
                            <a onClick={() => setUserModalShow(true)}>
                                Add User
                            </a>
                            <MyModal
                                show={userModalShow}
                                onHide={() => setUserModalShow(false)}
                                title=" Add User"
                                icon={faBusinessTime}
                                onSearch={addUser}
                                btnSign="Add User"
                            >
                                <h1>Input User Data</h1>
                                <form>
                                <div className="form-group">
                                    <label htmlFor="email">Email:</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        id="email" 
                                        name="email"
                                        placeholder="Enter email" 
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password">Password:</label>
                                    <input 
                                        type="password" 
                                        className="form-control" 
                                        id="password" 
                                        name="password"
                                        placeholder="Enter password" 
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="role">Role:</label>
                                    <select className="form-control" id="role" name="role" value={formData.role} onChange={handleChange}>
                                        <option value="HR">HR</option>
                                        <option value="satpam">Satpam</option>
                                        <option value="free">Free</option>
                                        <option value="employee">Employee</option>
                                        <option value="ccp">CCP</option>
                                        <option value="ccm">CCM</option>
                                    </select>
                                </div>
                                </form>
                                
                            </MyModal>
                        </>
                    )}
                    <hr />
                    <button className="btn btn-danger" onClick={logOut}>Log Out</button>
                </div>
            </div>
        </>
    )
}