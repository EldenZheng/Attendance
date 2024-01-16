import { useState, useEffect } from "react"
import axios from "axios"

export default function Home(){
    const [info,setInfo]=useState({
        email: '',
        password: ''
    })

    const [shiftStatus,setShiftStatus]=useState(false)

    const userData=JSON.parse(sessionStorage.getItem('userData'))

    useEffect(()=>{
        axios.get('http://localhost:3001/getUser/'+userData.email)
        .then(result => setInfo(result.data))
        .catch(err=>console.log(err))
    },[])

    const startShift= (id) => {
        axios.post('http://localhost:3001/StartShift', info)
        .then(result=> console.log(result))
        .catch(err=>console.log(err))
    }

    return(
        <>
            <div className="d-flex vh-100 vw-100 justify-content-center align-items-center bg-secondary-subtle">
                <div className='w-50 bg-white rounded p-3'>
                    <h3>Success! Welcome {info.email}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Shift Not Started
                        <button className="btn btn-primary" onClick={startShift}>Start Shift</button>
                    </div>
                    <div><a href="">Export to Excel</a></div>
                </div>
            </div>
        </>
    )
}