import React from 'react'
import ReactDom from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'

export default function Modal(props) {
    if (!props.isOpen) return null
    return ReactDom.createPortal(
        <div>
        <div className="modalOverlay" />
        <div className="modalStyle">
            <div className="modalHeader">
                <h1><FontAwesomeIcon icon={props.headerIcon} className="headerInfo" /> {props.headerText}</h1>
                <h2>
                    <FontAwesomeIcon
                    icon={faX}
                    onClick={props.closeModal}
                    className="closeIcon"
                    />
                </h2>
            </div>
            <hr />
            {props.children}
        </div>
    </div>,
    document.getElementById('portal')
    )
}