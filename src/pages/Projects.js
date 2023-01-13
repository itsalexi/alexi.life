import React from 'react';
import Snowfall from 'react-snowfall';
import Tech from '../components/Tech';
import '../css/Projects.css';
import Wallpaper3 from '../assets/wallpaper3.jpg';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import AnimatedPage from '../components/AnimatedPage';

// Project Images
import SharespaceImg from '../assets/sharespace.png';
import DiscordImg from '../assets/discord.png';
import MemoryImg from '../assets/memory.png';
import PortfolioImg from '../assets/portfolio.png';
import ResumeImg from '../assets/resume.png';
import ShoppingImg from '../assets/shopping.png';
import WeatherImg from '../assets/weather.png';

const openInNewTab = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
};

const Projects = () => {
    const projects = [
        {
            name: 'Sharespace',
            desc: 'A social media blogging platform like Medium and Dev.to! You have the ability to like, share, comment on every post!',
            tech: ['HTML', 'CSS', 'React', 'Firebase', 'NextJS'],
            image: SharespaceImg,
            live: 'https://sharespace.alexi.life',
            repo: 'https://github.com/itsalexi/Sharespace',
        },
        {
            name: 'Discord Clone',
            desc: 'A discord clone with full authentication and realtime chat messaging powered by Firebase.',
            tech: ['HTML', 'CSS', 'React', 'Firebase', 'JavaScript'],
            image: DiscordImg,
            live: 'https://alexi.life/projects/discord-clone/',
            repo: 'https://github.com/itsalexi/Discord-Clone/',
        },
        {
            name: 'Fake Shopping Website',
            desc: 'A fake shopping website populated with data from a Fake Store API to retrieve products from.',
            tech: ['HTML', 'CSS', 'React', 'JavaScript'],
            image: ShoppingImg,
            live: 'https://alexi.life/projects/Shopping-Website/',
            repo: 'https://github.com/itsalexi/Shopping-Website',
        },
        {
            name: 'Portfolio Website',
            desc: 'My personal portfolio website. The one your sitting on right now!',
            tech: ['HTML', 'CSS', 'React', 'JavaScript'],
            image: PortfolioImg,
            live: 'https://alexi.life/',
            repo: 'https://github.com/itsalexi/alexi.life/tree/source',
        },
        {
            name: 'Memory Card Game',
            desc: "A memory card game built with React! Everytime you press on a card, the board shuffles, remember the one you clicked on and don't click on it again!",
            tech: ['HTML', 'CSS', 'React', 'JavaScript'],
            image: MemoryImg,
            live: 'https://alexi.life/projects/Memory-Card/',
            repo: 'https://github.com/itsalexi/Memory-Card',
        },
        {
            name: 'Resume Builder',
            desc: 'A resume builder built with React! The document is very customizable, you can edit the information by simply pressing what you want to edit and changing it!',
            tech: ['HTML', 'CSS', 'React', 'JavaScript'],
            image: ResumeImg,
            live: 'https://alexi.life/projects/CV-Creator/',
            repo: 'https://github.com/itsalexi/CV-Creator',
        },
        {
            name: 'Weather App',
            desc: 'A weather app built with Vanilla JavaScript! It is powered by the OpenWeatherAPI, you are able to switch how the data is being displayed too!',
            tech: ['HTML', 'CSS', 'JavaScript'],
            image: WeatherImg,
            live: 'https://alexi.life/projects/Weather/',
            repo: 'https://github.com/itsalexi/Weather',
        },
    ];

    return (
        <AnimatedPage>
            <div className="projects">
                <Parallax pages="2">
                    <ParallaxLayer
                        factor={3}
                        style={{
                            backgroundImage: `url(${Wallpaper3})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                        className="tint"
                        speed={0.75}
                    >
                        <Snowfall snowflakeCount={100} />
                    </ParallaxLayer>

                    <ParallaxLayer offset={0.1} speed={1.25}>
                        <div className="projects-main-title center-align">
                            Projects
                        </div>
                        <div className="projects-list">
                            {projects.map((project) => {
                                return (
                                    <div className="project">
                                        <img
                                            className="project-image"
                                            src={project.image}
                                            alt="project"
                                        />
                                        <div className="project-box">
                                            <div className="project-info">
                                                <div className="project-title">
                                                    {project.name}
                                                </div>
                                                <div className="project-stack">
                                                    {project.tech.map(
                                                        (tech) => {
                                                            return (
                                                                <Tech
                                                                    name={tech.toLowerCase()}
                                                                />
                                                            );
                                                        }
                                                    )}
                                                </div>
                                                <div className="project-desc">
                                                    {project.desc}
                                                </div>
                                                <div className="project-buttons">
                                                    <div
                                                        className="project-button live"
                                                        onClick={() =>
                                                            openInNewTab(
                                                                project.live
                                                            )
                                                        }
                                                    >
                                                        <span
                                                            role="img"
                                                            aria-label="try"
                                                        >
                                                            📥
                                                        </span>{' '}
                                                        TRY
                                                    </div>
                                                    <div
                                                        className="project-button repo"
                                                        onClick={() =>
                                                            openInNewTab(
                                                                project.repo
                                                            )
                                                        }
                                                    >
                                                        <span
                                                            role="img"
                                                            aria-label="repo"
                                                        >
                                                            🖥️
                                                        </span>{' '}
                                                        REPO
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ParallaxLayer>
                </Parallax>
            </div>
        </AnimatedPage>
    );
};

export default Projects;
