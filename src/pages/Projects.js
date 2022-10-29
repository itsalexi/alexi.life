import React from 'react';
import Snowfall from 'react-snowfall';
import '../css/Projects.css';

const Projects = () => {
    return (
        <div className="projects">
            <Snowfall snowflakeCount={50} />
        </div>
    );
};

export default Projects;
