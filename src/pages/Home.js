import React from 'react';
import Snowfall from 'react-snowfall';
import { Typewriter } from 'react-simple-typewriter';

import '../css/Home.css';

import AvatarImage from '../assets/avatar.jpg';
import { Tooltip } from '@mui/material';
import AnimatedPage from '../components/AnimatedPage';

const Home = () => {
    return (
        <AnimatedPage>
            <div className="home">
                <Snowfall snowflakeCount={50} />
                <div className="home-information">
                    <h1 className="home-title hover">
                        Hey, I'm{' '}
                        <span className="avatar-name hover">Alexi</span>{' '}
                        <span className="wave" role="img" aria-label="wave">
                            👋
                        </span>
                    </h1>

                    <div className="avatar-wrapper hover">
                        <img src={AvatarImage} alt="alexi" />
                    </div>

                    <div className="home-desc hover">
                        <span className="typewriter-text">
                            <Typewriter
                                words={[
                                    'Welcome to my portfolio!',
                                    'Explore the site to learn more about me!',
                                    "I'm 17 years old!",
                                    "I'm a web developer!",
                                    "I'm from the Philippines!",
                                    'I love to code!',
                                    'I love to learn!',
                                ]}
                                loop={0}
                                cursor
                                typeSpeed={75}
                                deleteSpeed={50}
                            />
                        </span>
                    </div>

                    <div className="home-social-links">
                        <div className="social-media-link">
                            <a
                                href="https://instagram.com/alexi_canamo"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/instagram.svg"
                                    alt="alexi_canamo"
                                    height="50"
                                    width="60"
                                />
                            </a>
                        </div>
                        <div className="social-media-link">
                            <a
                                href="https://twitter.com/itsalexitw"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/twitter.svg"
                                    alt="itsalexitw"
                                    height="50"
                                    width="60"
                                />
                            </a>
                        </div>
                        <div className="social-media-link">
                            <a
                                href="https://github.com/itsalexi"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/github.svg"
                                    alt="itsalexitw"
                                    height="50"
                                    width="60"
                                />
                            </a>
                        </div>
                        <div className="social-media-link">
                            <Tooltip title="itsAlexi#5450">
                                <img
                                    src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/discord.svg"
                                    alt="itsalexitw"
                                    height="50"
                                    width="60"
                                />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default Home;
