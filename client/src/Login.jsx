import React, { useState } from 'react';
import axios from 'axios'
import { json, useNavigate } from 'react-router-dom';

export default function CreateUser(){
    const[formData, setFormData]=useState({
        email: '',
        password: ''
    })
    const navigate = useNavigate()

    const Login = (e)=>{
        e.preventDefault();
        axios.post("http://localhost:3001/Login",formData)
        .then(result =>{
            if(result.data === "success"){
                sessionStorage.setItem('userData',JSON.stringify(formData))
                navigate('/Home')
            }
            else{
                console.log(result)
            }
        })
        .catch(err=>console.log(err))
    }

    const handleChange = (e) => {
        const {name,value}=e.target;
        setFormData((prevData)=>({
            ...prevData,
            [name]:value,
        }))
    }

    return(
        <div className="d-flex vh-100 vw-100 justify-content-center align-items-center bg-secondary-subtle">
            <div className='w-50 bg-white rounded p-3'>
                <form onSubmit={Login}>
                    <h2>Login</h2>
                    <div className="mb-2">
                        <label htmlFor="">Email</label>
                        <input
                            type="text" 
                            placeholder="Enter Email" 
                            className='form-control' 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                        <div className="mb-2">
                            <label htmlFor="">Password</label>
                            <input
                                type="password" 
                                placeholder="Enter Password" 
                                className='form-control' 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    <button className="btn btn-success">Login</button>
                </form><br />
            </div>
        </div>
    )
}