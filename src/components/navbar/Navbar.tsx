import React from "react";
import "./Navbar.css";


function Navbar() {

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="container-fluid">

                    <div className="collapse navbar-collapse" id="navbarNavAltMarkup">

                        <div className="navbar-nav">
                            <a className="nav-link active" aria-current="page" href="#">Home</a>
                            <a className="nav-link" href="#">About</a>
                            <a className="nav-link" href="#">Projects</a>
                            <a className="nav-link" href="#">Contact</a>
                        </div>

                    </div>
                </div>
            </nav>
        </>
    )

}

export default Navbar;

