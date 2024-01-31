import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'

export default function SelfAttendance(){
    const [shiftSchedule, setShiftSchedule]=useState([])
    const [info,setInfo]=useState({
        email: '',
        password: '',
        role:''
    })

    const userData=JSON.parse(sessionStorage.getItem('userData'))

    const navigate = useNavigate()

    const returnHome=()=>{
        navigate('/Home')
    }

    useEffect(()=>{
        axios.get('http://localhost:3001/getUser/'+userData.email)
        .then(result => {setInfo(result.data)
            console.log(result.data)
        })
        .catch(err=>console.log(err))
    },[])

    useEffect(()=>{
        console.log(userData.email)
        axios.get('http://localhost:3001/searchByEmp/'+userData.email)
        .then(result => {
            setShiftSchedule(result.data)
        })
        .catch(err => console.log(err));
    },[])

    return(
        <div className="d-flex vh-100 vw-100 justify-content-center align-items-center bg-secondary-subtle">
            <div className='w-50 bg-white rounded p-3'>
                <a onClick={returnHome}><FontAwesomeIcon icon={faChevronLeft} />Back</a> 
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