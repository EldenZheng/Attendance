import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from 'react-router-dom'

import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file

export default function Home(){
    const [info,setInfo]=useState({
        email: '',
        password: ''
    })
    const [shiftStatus,setShiftStatus]=useState(false)
    const [shiftStart,setShiftStart]=useState()
    const [duration, setDuration]=useState()
    const [shiftComplete, setShiftComplete]=useState(false)
    const [showLoading, setShowLoading] = useState(true);

    const userData=JSON.parse(sessionStorage.getItem('userData'))

    const navigate = useNavigate()

    useEffect(()=>{
        axios.get('http://localhost:3001/getUser/'+userData.email)
        .then(result => setInfo(result.data))
        .catch(err=>console.log(err))
    },[])

    useEffect(()=>{
        axios.get('http://localhost:3001/checkShift/'+userData.email)
        .then(result => {
            if(result.data.hasnt==true){
                setShiftStatus(true)
                setShiftStart(result.data.startTime)
            }else if(result.data=="complete"){
                setShiftStart(false)
                setShiftComplete(true)
            }
            else{
            }
        })
        .catch(err=>console.log(err))
    },[])
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
        }, []);

    const startShift= () => {
        axios.post('http://localhost:3001/StartShift', info)
        .then(result=> {console.log(result),
            window.location.reload();
        })
        .catch(err=>console.log(err))
    }

    const endShift = () => {
        const shiftInfo = {
            email: info.email,
            duration: formatTime(duration)
        };
        axios.put('http://localhost:3001/EndShift', shiftInfo)
            .then(result => {
                window.location.reload();
            })
            .catch(err => console.log(err));
    };

    useEffect(() => {
        let interval;
    
        if (shiftStatus) {
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

    const goToAttendance=()=>{
        navigate('/Attendance')
    }

    return(
        <>
            <div className="d-flex vh-100 vw-100 justify-content-center align-items-center bg-secondary-subtle">
                <div className='w-50 bg-white rounded p-3'>
                    <h3>Welcome {info.email} !</h3>
                    {!(shiftStatus) && !(shiftComplete) &&(
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                Shift Not Started
                                <button className="btn btn-primary" onClick={startShift}>Start Shift</button>
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
                    <a href="" onClick={goToAttendance}>Go To Attendance List</a>
                </div>
            </div>
        </>
    )
}