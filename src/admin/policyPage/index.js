import ReactDOM from "react-dom";
import React from "react";
import App from "./components/App/App";

jQuery(document).ready(function () {
    ReactDOM.render(
        <App />,
        document.getElementById('root')
    );
});