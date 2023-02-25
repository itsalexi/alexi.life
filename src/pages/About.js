import React, { useRef } from 'react';

import Snowfall from 'react-snowfall';
import { Tooltip } from '@mui/material';

import '../css/About.css';
import { Link } from 'react-router-dom';

import Wallpaper2 from '../assets/wallpaper2.jpg';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import AnimatedPage from '../components/AnimatedPage';

const About = () => {
    const skills = useRef();

    return (
        <AnimatedPage>
            <div className="about">
                <Parallax pages={2.15}>
                    <ParallaxLayer
                        factor={3.6}
                        style={{
                            backgroundImage: `url(${Wallpaper2})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                        className="tint"
                        speed={1.25}
                    >
                        <Snowfall snowflakeCount={100} />{' '}
                    </ParallaxLayer>
                    <ParallaxLayer
                        offset={0}
                        className="center-align"
                        speed={0.75}
                    >
                        <div className="about-information">
                            <div className="card-information">
                                <h2 className="card-title">Who am I?</h2>
                                <p className="card-desc">
                                    Hi! My name is{' '}
                                    <span className="highlight">Alexi</span>,
                                    and I'm from the{' '}
                                    <span className="highlight">
                                        Philippines
                                    </span>
                                    . As of 2023, I'm now 16 years old! I'm
                                    currently a Grade 11 STEM student, and plan
                                    to graduate with a degree in{' '}
                                    <span className="highlight">
                                        Computer Science
                                    </span>{' '}
                                    when I graduate senior high school.
                                </p>
                                <p className="card-desc">
                                    {' '}
                                    Ever since I was{' '}
                                    <span className="highlight">young</span>,
                                    I've always wanted to{' '}
                                    <span className="highlight">learn</span> how
                                    to code. It all{' '}
                                    <span className="highlight">started</span>{' '}
                                    when I was about{' '}
                                    <span className="highlight">
                                        ~7 years old
                                    </span>{' '}
                                    and I walked in to my{' '}
                                    <span className="highlight">
                                        aunts and uncles
                                    </span>{' '}
                                    working on a project and my younger self was{' '}
                                    <span className="highlight">
                                        enticed and interested
                                    </span>{' '}
                                    on what they were doing.
                                </p>
                                <p className="card-desc">
                                    Aside from coding, I also love:
                                </p>
                                <ul className="card-hobbies card-desc">
                                    <li className="card-hobby">
                                        Playing games like{' '}
                                        <span className="highlight">
                                            VALORANT
                                        </span>{' '}
                                        and{' '}
                                        <span className="highlight">
                                            Minecraft
                                        </span>
                                        !
                                    </li>
                                    <li className="card-hobby">
                                        Watching{' '}
                                        <span className="highlight">
                                            Netflix
                                        </span>
                                        /
                                        <span className="highlight">
                                            YouTube
                                        </span>
                                    </li>
                                    <li className="card-hobby">
                                        <span className="strikethrough">
                                            <span className="card-hobby">
                                                Going to{' '}
                                                <span className="highlight">
                                                    school
                                                </span>
                                                &nbsp;
                                            </span>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </ParallaxLayer>
                    <ParallaxLayer
                        offset={0.9}
                        className="center-align"
                        speed={0.75}
                    >
                        <div className="award-information">
                            <div className="card-information">
                                <h2 className="card-title">
                                    Awards and Achievements
                                </h2>
                                <p className="card-desc awards">
                                    An overview of my academic and
                                    extracurricular awards achievements during
                                    my life so far.
                                </p>
                                <ul className="card-desc">
                                    <li className="card-hobby">
                                        Consistent{' '}
                                        <span className="highlight">
                                            Honor Student
                                        </span>{' '}
                                        throughout High School.
                                    </li>
                                    <br />
                                    <li className="card-hobby">
                                        Completed{' '}
                                        <span className="highlight">
                                            Junior HS
                                        </span>{' '}
                                        and moved up to{' '}
                                        <span className="highlight">
                                            Senior HS
                                        </span>
                                        .
                                    </li>
                                    <br />
                                    <li className="card-hobby">
                                        Completed 80% of the{' '}
                                        <span className="highlight">
                                            JavaScript
                                        </span>{' '}
                                        course on{' '}
                                        <span className="highlight">
                                            <a
                                                href="https://theodinproject.com"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                TheOdinProject
                                            </a>
                                            .
                                        </span>
                                    </li>
                                    <br />
                                    <li className="card-hobby">
                                        Finished my final{' '}
                                        <span className="highlight">
                                            JavaScript Project!{' '}
                                        </span>
                                        a{' '}
                                        <a
                                            href="https://alexi.life/projects/discord-clone"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Discord Clone
                                        </a>
                                        .
                                    </li>
                                    <br />
                                    <li className="card-hobby">
                                        Built many{' '}
                                        <Link to="/projects">projects</Link>{' '}
                                        while learning{' '}
                                        <span className="highlight">
                                            how to code
                                        </span>
                                        !
                                    </li>
                                    <br />
                                    <li className="card-hobby">
                                        Received a{' '}
                                        <span className="highlight">500$</span>{' '}
                                        bounty from{' '}
                                        <a
                                            href="https://hackerone.com/riot"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Riot Games
                                        </a>{' '}
                                        for reporting a low-impact security
                                        vulnerability.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </ParallaxLayer>
                    <ParallaxLayer
                        offset={1.1}
                        className="center-align"
                        speed={0.75}
                    >
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
                            <div className="small-text">
                                and I am still learning more..
                            </div>
                        </div>{' '}
                    </ParallaxLayer>
                </Parallax>
            </div>
        </AnimatedPage>
    );
};

export default About;
