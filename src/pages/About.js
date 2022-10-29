import React, { useRef } from 'react';
import Snowfall from 'react-snowfall';
import { Tooltip } from '@mui/material';

import '../css/About.css';

const About = () => {
    const skills = useRef();

    return (
        <div className="about">
            <Snowfall snowflakeCount={50} />
            <div className="about-information">
                <div className="card-information">
                    <h2 className="card-title">Who am I?</h2>
                    <p className="card-desc">
                        Hi! My name is <span className="highlight">Alexi</span>,
                        and I'm from the{' '}
                        <span className="highlight">Philippines</span>. I'm 15
                        years old, turning 16 this year. I'm currently a Grade
                        11 STEM student, and plan to take{' '}
                        <span className="highlight">Computer Science</span> in
                        the future.
                    </p>
                    <p className="card-desc">Aside from coding, I also love:</p>
                    <ul className="card-hobbies card-desc">
                        <li className="card-hobby">
                            Playing games like{' '}
                            <span className="highlight">VALORANT</span> and{' '}
                            <span className="highlight">Minecraft</span>!
                        </li>
                        <li className="card-hobby">
                            Watching <span className="highlight">Netflix</span>/
                            <span className="highlight">YouTube</span>
                        </li>
                        <li className="card-hobby">
                            <span
                                style={{
                                    color: 'red',
                                    'text-decoration': 'line-through',
                                }}
                            >
                                <span className="card-hobby">
                                    &nbsp;Going to{' '}
                                    <span className="highlight">school</span>
                                    &nbsp;
                                </span>
                            </span>
                        </li>
                    </ul>
                    <p
                        className="skills-scroll"
                        onClick={() => {
                            skills.current.scrollIntoView({
                                behavior: 'smooth',
                            });
                        }}
                    >
                        Click me to scroll down to skills
                    </p>
                </div>
            </div>
            <div className="skills-information" ref={skills}>
                <h2 className="card-title">My Skills</h2>
                <div className="skill-cards">
                    <Tooltip title="HTML">
                        <img
                            className="skill-card"
                            src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/FrontendDevelopment/html.svg"
                            alt="skill"
                        />
                    </Tooltip>
                    <Tooltip title="CSS">
                        <img
                            className="skill-card"
                            src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/FrontendDevelopment/css.svg"
                            alt="skill"
                        />
                    </Tooltip>
                    <Tooltip title="JavaScript">
                        <img
                            className="skill-card"
                            src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/ProgrammingLanguages/javascript.svg"
                            alt="skill"
                        />
                    </Tooltip>
                    <Tooltip title="ReactJS">
                        <img
                            className="skill-card"
                            src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/888aff31e1d26dd2a6acf6afebbc34970aeb0118/src/images/icons/MobileAppDevelopment/reactnative.svg"
                            alt="skill"
                        />
                    </Tooltip>
                    <Tooltip title="NodeJS">
                        <img
                            className="skill-card"
                            src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/888aff31e1d26dd2a6acf6afebbc34970aeb0118/src/images/icons/BackendDevelopment/nodejs.svg"
                            alt="skill"
                        />
                    </Tooltip>
                    <Tooltip title="Git">
                        <img
                            className="skill-card"
                            src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Other/git.svg"
                            alt="skill"
                        />
                    </Tooltip>
                    <Tooltip title="Firebase">
                        <img
                            className="skill-card"
                            src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/BaaS/firebase.svg"
                            alt="skill"
                        />
                    </Tooltip>
                    <Tooltip title="MongoDB">
                        <img
                            className="skill-card"
                            src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Database/mongodb.svg"
                            alt="skill"
                        />
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default About;
